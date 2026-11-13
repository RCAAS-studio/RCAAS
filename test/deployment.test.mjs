import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes, createHash } from 'node:crypto';
import { parseEnv } from 'node:util';
import { checkConfig } from '../deploy/check-config.mjs';
import { readFileAccounts, importAccounts } from '../server/scripts/import-users-data.js';

const repo = path.resolve(import.meta.dirname, '..');
const worker = path.join(repo, 'deploy/backup-files.mjs');
const valid = () => ({
  web: { NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://tours.business.test', NEXT_PUBLIC_API_URL: 'https://tours.business.test' },
  api: { NODE_ENV: 'production', CLIENT_ORIGIN: 'https://tours.business.test', HOST: '127.0.0.1', PORT: '4000',
    DATA_DIR: 'C:/RCAAS/data', ASSET_DIR: 'C:/RCAAS/assets', ASSET_DRIVER: 'local',
    ...Object.fromEntries(['SESSION_SECRET', 'EMBED_TOKEN_SECRET', 'EDITOR_PASSWORD'].map(key => [key, randomBytes(32).toString('hex')])) }
});

test('deployment gate rejects shipped placeholders and mismatched or unsafe production settings', async () => {
  const web = parseEnv(await readFile(path.join(repo, 'deploy/web.env.example'), 'utf8'));
  const api = parseEnv(await readFile(path.join(repo, 'deploy/api.env.example'), 'utf8'));
  assert.ok(checkConfig(web, api).errors.length >= 4);
  const good = valid();
  assert.deepEqual(checkConfig(good.web, good.api).errors, []);
  for (const change of [
    { HOST: '0.0.0.0' }, { CLIENT_ORIGIN: 'https://different.test' }, { DATA_DIR: './server/src/data' },
    { SESSION_SECRET: 'change-me' }, { EMBED_TOKEN_SECRET: good.api.SESSION_SECRET }, { ASSET_DRIVER: 's3' }
  ]) assert.ok(checkConfig(good.web, { ...good.api, ...change }).errors.length);
  assert.ok(checkConfig({ ...good.web, NEXT_OUTPUT_EXPORT: '1' }, good.api).errors.length);
});

test('backup archives restore all data and separate assets and refuse destructive destinations', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'rcaas-backup-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const data = path.join(root, 'data'), assets = path.join(root, 'assets'), output = path.join(root, 'snapshot');
  await mkdir(path.join(data, 'users'), { recursive: true });
  await mkdir(path.join(assets, 'ast_test'), { recursive: true });
  const user = '{"id":"fixture-owner","role":"admin"}\n';
  const bytes = randomBytes(4096);
  await writeFile(path.join(data, 'users/account.json'), user);
  await writeFile(path.join(assets, 'ast_test/chunk.bin'), bytes);
  const env = { ...process.env, DATA_DIR: data, ASSET_DIR: assets, ASSET_DRIVER: 'local', DATABASE_URL: '' };
  const backup = dest => spawnSync(process.execPath, [worker, dest], { env, encoding: 'utf8', windowsHide: true });
  assert.equal(backup(path.join(data, 'bad')).status, 1);
  const result = backup(output);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(await readFile(path.join(output, 'manifest.json'), 'utf8'));
  assert.equal(manifest.accounts, 'files');
  for (const [file, hash] of Object.entries(manifest.files)) {
    assert.equal(createHash('sha256').update(await readFile(path.join(output, file))).digest('hex'), hash);
  }
  const restore = path.join(root, 'restore');
  await mkdir(restore);
  for (const name of ['data', 'assets']) {
    const target = path.join(restore, name);
    await mkdir(target);
    // Relative, forward-slash paths: GNU tar (Git Bash) reads an absolute C: path as a remote host; bsdtar takes either.
    const archive = path.relative(target, path.join(output, `${name}.tar.gz`)).split(path.sep).join('/');
    const extraction = spawnSync('tar', ['-xzf', archive], { cwd: target, encoding: 'utf8', windowsHide: true });
    assert.equal(extraction.status, 0, extraction.stderr);
  }
  assert.equal(await readFile(path.join(restore, 'data/users/account.json'), 'utf8'), user);
  assert.deepEqual(await readFile(path.join(restore, 'assets/ast_test/chunk.bin')), bytes);
  assert.equal(backup(output).status, 1);
  assert.equal(await readFile(path.join(data, 'users/account.json'), 'utf8'), user);
  const failed = path.join(root, 'failed');
  const pgFailure = spawnSync(process.execPath, [worker, failed], {
    env: { ...env, DATABASE_URL: 'postgresql://private-secret@invalid.test/test', PG_DUMP_EXE: path.join(root, 'absent-pg-dump') },
    encoding: 'utf8', windowsHide: true
  });
  assert.equal(pgFailure.status, 1);
  assert.ok(!pgFailure.stderr.includes('private-secret'));
  assert.ok(!(await readdir(failed)).includes('manifest.json'));
});

test('environment runner treats values literally and returns the child exit code', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'rcaas-env-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const file = path.join(root, 'settings.env');
  await writeFile(file, 'LITERAL_TEST="hello $world `whoami`"\n');
  const result = spawnSync(process.execPath, [path.join(repo, 'deploy/with-env.mjs'), file, '--', process.execPath,
    '-e', 'if (process.env.LITERAL_TEST !== "hello $world `whoami`") process.exit(99); process.exit(7);'],
  { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 7, result.stderr);
});

const account = (id, email) => ({ id, email, name: 'Fixture account', role: 'editor',
  passwordHash: `${'a'.repeat(32)}:${'b'.repeat(128)}`, createdAt: '2026-01-01T00:00:00.000Z' });
function accountDatabase(initial = []) {
  let saved = structuredClone(initial), transaction;
  const calls = [];
  return {
    calls, records: () => saved,
    connect: async () => ({
      async query(sql, values) {
        calls.push(sql);
        if (sql === 'begin') transaction = structuredClone(saved);
        else if (sql === 'commit') saved = transaction;
        else if (sql === 'rollback') transaction = undefined;
        else if (sql.startsWith('select id, email')) return { rows: transaction.filter(row => row.id === values[0] || row.email === values[1]) };
        else if (sql.startsWith('insert into')) transaction.push({ id: values[0], email: values[2], values });
        else assert.match(sql, /^lock table app\.users /);
        return { rows: [], rowCount: 1 };
      },
      release: () => calls.push('release')
    })
  };
}

test('account import preserves identities and reset state, skips matching users, and rolls back conflicts', async () => {
  const first = account('11111111-1111-4111-8111-111111111111', 'first@example.test');
  first.passwordChangedAt = 0;
  first.reset = { hash: 'c'.repeat(64), expires: 1800000000000 };
  const second = account('22222222-2222-4222-8222-222222222222', 'second@example.test');
  const db = accountDatabase();
  assert.deepEqual(await importAccounts(db, [first, second]), { added: 2, skipped: 0 });
  assert.equal(db.records()[0].values[5].getTime(), 0);
  assert.equal(db.records()[0].values[7], first.reset.hash);
  assert.equal(db.records()[0].values[8].getTime(), first.reset.expires);
  assert.deepEqual(await importAccounts(db, [first, second]), { added: 0, skipped: 2 });
  const conflict = accountDatabase([{ id: '33333333-3333-4333-8333-333333333333', email: second.email }]);
  await assert.rejects(importAccounts(conflict, [first, second]), /conflicting ID or email/);
  assert.equal(conflict.records().length, 1, 'The earlier insert must roll back with the later conflict');
  assert.equal(conflict.calls.at(-2), 'rollback');
  assert.equal(conflict.calls.at(-1), 'release');
  const invalid = accountDatabase();
  await assert.rejects(importAccounts(invalid, [first, first]), /duplicate source account/);
  assert.equal(invalid.calls.length, 0, 'Source validation must finish before opening a database transaction');
});

test('account import refuses missing, empty, invalid and unreadable source data', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'rcaas-import-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await assert.rejects(readFileAccounts(path.join(root, 'missing')), { code: 'ENOENT' });
  await assert.rejects(readFileAccounts(root), /No file accounts found/);
  const file = path.join(root, 'account.json');
  await writeFile(file, '{broken');
  await assert.rejects(readFileAccounts(root), SyntaxError);
  await writeFile(file, JSON.stringify(account('11111111-1111-4111-8111-111111111111', 'first@example.test')));
  assert.equal((await readFileAccounts(root)).length, 1);
  await mkdir(path.join(root, 'directory.json'));
  await assert.rejects(readFileAccounts(root));
});

test('Windows backup restarts after success/failure and respects an intentionally stopped API', { skip: process.platform !== 'win32' }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'rcaas-backup-service-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File',
    path.join(repo, 'test/fixtures/backup-service.ps1'), '-Root', root, '-Deploy', path.join(repo, 'deploy')],
  { encoding: 'utf8', windowsHide: true, timeout: 30000 });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  assert.match(result.stdout, /success\/failure checks passed/);
});
