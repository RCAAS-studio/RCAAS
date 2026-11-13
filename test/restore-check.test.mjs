// Restore drill (deploy/restore-check.mjs) against snapshots made by deploy/backup-files.mjs: Phase 03.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile, cp, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';

const repo = path.resolve(import.meta.dirname, '..');
const node = (script, args, env = {}) => spawnSync(process.execPath, [path.join(repo, script), ...args], { env: { ...process.env, ...env }, encoding: 'utf8', windowsHide: true });
const check = (...args) => { const r = node('deploy/restore-check.mjs', args); return { status: r.status, ...JSON.parse(r.stdout) }; };
const scene = (id, extra) => ({ id, propertyId: 'p', splat: { format: 'lcc2', variants: { high: { assetId: 'ast_a', meta: 'scan/m.lcc2' } } }, ...extra });

async function fixture(root, tweak = () => {}) {
  const data = path.join(root, 'data'), assets = path.join(root, 'assets');
  const files = {
    'users/u1.json': { id: 'u1', role: 'admin' },
    'properties/p.json': { id: 'p', ownerId: 'u1' },
    'properties/q.json': { id: 'q', ownerId: 'gone-account' },
    'scenes/s.json': scene('s', { status: 'published', publishedVersion: 2 }),
    'scenes/s@1.json': scene('s', { status: 'published', publishedVersion: 1 }),
    'scenes/s@2.json': scene('s', { status: 'published', publishedVersion: 2 }),
    'scenes/d.json': { ...scene('d'), splat: { variants: { high: { assetId: 'ast_gone', meta: 'x.lcc2' } } } },
    'sites/p.json': { draft: {} },
    'reservations/p.json': []
  };
  tweak(files);
  for (const [f, v] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(data, f)), { recursive: true });
    await writeFile(path.join(data, f), typeof v === 'string' ? v : JSON.stringify(v));
  }
  await mkdir(path.join(data, 'activity'), { recursive: true });
  await writeFile(path.join(data, 'activity/p.jsonl'), '{"a":1}\n{"a":2}\n');
  await mkdir(path.join(assets, 'ast_a/scan'), { recursive: true });
  await writeFile(path.join(assets, 'ast_a/scan/m.lcc2'), 'scan bytes');
  const snap = path.join(root, 'snapshot');
  const r = node('deploy/backup-files.mjs', [snap], { DATA_DIR: data, ASSET_DIR: assets, ASSET_DRIVER: 'local', DATABASE_URL: '' });
  assert.equal(r.status, 0, r.stderr);
  return { data, assets, snap };
}

test('a clean snapshot restores whole: checksums, every store parses, published spaces have their snapshot and scan', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'rcaas-drill-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const { data, snap } = await fixture(root);
  const r = check(snap, path.join(root, 'drill'), '--live', data);
  assert.equal(r.status, 0, JSON.stringify(r.errors));
  assert.equal(r.ok, true);
  assert.equal(r.files.scenes, 4);
  assert.equal(r.files['(differs from live)'], 0);
  assert.ok(r.warnings.some((w) => w.includes('gone-account')), 'orphaned owner is reported');
  assert.ok(r.warnings.some((w) => w.includes('space d (draft)')), 'a draft missing its scan is a warning');
  assert.equal(await readFile(path.join(root, 'drill/assets/ast_a/scan/m.lcc2'), 'utf8'), 'scan bytes');
  // Never over existing files, never inside the snapshot.
  assert.equal(check(snap, path.join(root, 'drill')).status, 1);
  assert.equal(check(snap, path.join(snap, 'inner')).status, 1);
  // Data changed after the backup shows up as a difference.
  await writeFile(path.join(data, 'properties/p.json'), '{"id":"p","ownerId":"u1","title":"later"}');
  const later = check(snap, path.join(root, 'drill2'), '--live', data);
  assert.ok(later.warnings.includes('changed since backup: properties/p.json'));
});

test('a tampered archive is refused before anything is extracted', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'rcaas-drill-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const { snap } = await fixture(root);
  const bad = path.join(root, 'tampered');
  await cp(snap, bad, { recursive: true });
  const archive = path.join(bad, 'data.tar.gz');
  const bytes = await readFile(archive); bytes[bytes.length - 5] ^= 0xff; await writeFile(archive, bytes);
  await writeFile(path.join(bad, 'extra.bin'), 'x');
  const r = check(bad, path.join(root, 'drill'));
  assert.equal(r.status, 1);
  assert.ok(r.errors.includes('checksum mismatch: data.tar.gz'));
  assert.ok(r.errors.includes('not in manifest: extra.bin'));
  assert.deepEqual(await readdir(root).then((l) => l.includes('drill')), false);
});

test('broken data fails the drill: missing published snapshot, missing published scan, unreadable JSON', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'rcaas-drill-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const { snap } = await fixture(root, (files) => {
    files['scenes/nosnap.json'] = scene('nosnap', { status: 'published', publishedVersion: 3 });
    files['scenes/noscan.json'] = { ...scene('noscan', { status: 'published', publishedVersion: 1 }) };
    files['scenes/noscan@1.json'] = { ...scene('noscan'), splat: { variants: { high: { assetId: 'ast_a', meta: 'scan/absent.lcc2' } } } };
    files['properties/broken.json'] = '{"id":';
  });
  const r = check(snap, path.join(root, 'drill'));
  assert.equal(r.status, 1);
  assert.ok(r.errors.includes('space nosnap: published version 3 has no snapshot file'));
  assert.ok(r.errors.includes('space noscan (published): scan file missing: ast_a/scan/absent.lcc2'));
  assert.ok(r.errors.includes('does not parse: properties/broken.json'));
});
