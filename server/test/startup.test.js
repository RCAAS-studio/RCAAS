import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('the configured database CA survives conflicting connection URL SSL parameters', async t => {
  const data = await mkdtemp(path.join(tmpdir(), 'rcaas-db-ca-'));
  t.after(() => rm(data, { recursive: true, force: true }));
  const ca = path.join(data, 'database-ca.pem');
  await writeFile(ca, 'configuration-test-ca');
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import pg from 'pg';
    const { pool } = await import('./src/db.js');
    const client = new pg.Client(pool.options);
    assert.equal(client.connectionParameters.ssl.ca, 'configuration-test-ca');
    assert.notEqual(client.connectionParameters.ssl.rejectUnauthorized, false);
    assert.equal(new URL(pool.options.connectionString).searchParams.get('sslmode'), 'verify-full');
    await pool.end();
  `], {
    cwd: path.resolve(import.meta.dirname, '..'), windowsHide: true, encoding: 'utf8',
    env: { ...process.env, DATABASE_URL: 'postgresql://fixture:fixture@database.example.test/accounts?sslmode=disable&sslrootcert=missing-file', DATABASE_CA_FILE: ca }
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});

test('production refuses an occupied port instead of silently moving the API', async t => {
  const data = await mkdtemp(path.join(tmpdir(), 'rcaas-startup-'));
  const occupied = http.createServer();
  await new Promise(resolve => occupied.listen(0, '127.0.0.1', resolve));
  let output = '';
  const child = spawn(process.execPath, ['src/index.js'], {
    cwd: path.resolve(import.meta.dirname, '..'), windowsHide: true,
    env: { ...process.env, NODE_ENV: 'production', HOST: '127.0.0.1', PORT: String(occupied.address().port),
      DATA_DIR: data, ASSET_DIR: path.join(data, 'assets'), ASSET_DRIVER: 'local', DATABASE_URL: '',
      SESSION_SECRET: 'startup-test-session-secret-32-characters', EMBED_TOKEN_SECRET: 'startup-test-embed-secret-32-characters',
      EDITOR_PASSWORD: 'startup-test-access-code', RESEND_API_KEY: '', ANTHROPIC_API_KEY: '', SMS_TOKEN: '', WHATSAPP_TOKEN: '' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.on('data', d => { output += d; });
  child.stderr.on('data', d => { output += d; });
  const exit = new Promise((resolve, reject) => { child.once('exit', resolve); child.once('error', reject); });
  t.after(async () => {
    if (child.exitCode === null) child.kill();
    await exit;
    await new Promise(resolve => occupied.close(resolve));
    await rm(data, { recursive: true, force: true });
  });
  let timer;
  const code = await Promise.race([exit, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('API did not fail on occupied production port')), 8000); })]).finally(() => clearTimeout(timer));
  assert.notEqual(code, 0);
  assert.match(output, /EADDRINUSE/);
  assert.doesNotMatch(output, /listening on|trying \d/);
});
