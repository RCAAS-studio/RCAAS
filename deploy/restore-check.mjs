// Restore drill (Phase 03, 2026-11-13): proves a snapshot made by backup-files.mjs can be restored
// and that what comes back is whole. Read-only on the snapshot; writes only into an EMPTY drill folder.
//
//   node deploy/restore-check.mjs <snapshot-dir> <empty-drill-dir> [--assets <dir>] [--live <DATA_DIR>]
//
// 1. every file in manifest.json matches its SHA-256 (and nothing unlisted sits beside it);
// 2. data.tar.gz (and assets.tar.gz) extract into <drill>/data and <drill>/assets;
// 3. every JSON store file parses, every activity line parses;
// 4. every published space has its snapshot file, and every scan a published snapshot needs is present
//    (in the restored assets, or --assets <dir> when assets live elsewhere, e.g. R2 synced to disk);
// 5. --live <DATA_DIR>: lists what differs from the live data (run right after a backup: nothing should).
// Problems that break a restore exit 1. Known data debts (a project whose owner account is gone,
// a draft whose scan is missing) are listed as warnings.
import { mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const assetsOpt = opt('--assets'), live = opt('--live');
const [snapshotArg, drillArg] = args;
const errors = [], warnings = [], counts = {};
const exists = (p) => stat(p).then(() => true, () => false);
const sha256 = async (file) => { const h = createHash('sha256'); for await (const c of createReadStream(file)) h.update(c); return h.digest('hex'); };
const within = (parent, child) => { const rel = path.relative(parent, child); return !rel || (!rel.startsWith('..') && !path.isAbsolute(rel)); };

async function walk(dir, base = dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p, base)); else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}

function extract(archive, target) {
  // Relative, forward-slash archive path from inside the target: GNU tar (Git Bash) reads "C:\…" as a host.
  const rel = path.relative(target, archive).split(path.sep).join('/');
  const r = spawnSync('tar', ['-xzf', rel], { cwd: target, encoding: 'utf8', windowsHide: true });
  if (r.error || r.status !== 0) throw new Error(`tar could not extract ${path.basename(archive)}`);
}

async function main() {
  if (!snapshotArg || !drillArg) throw new Error('Usage: restore-check.mjs <snapshot-dir> <empty-drill-dir> [--assets <dir>] [--live <DATA_DIR>]');
  const snapshot = path.resolve(snapshotArg), drill = path.resolve(drillArg);
  if (within(snapshot, drill)) throw new Error('The drill folder must be outside the snapshot.');
  if (live && within(path.resolve(live), drill)) throw new Error('The drill folder must be outside the live data.');
  if ((await exists(drill)) && (await readdir(drill)).length) throw new Error('The drill folder must be empty (never restore over data).');

  // 1. checksums
  const manifest = JSON.parse(await readFile(path.join(snapshot, 'manifest.json'), 'utf8'));
  for (const [name, hash] of Object.entries(manifest.files ?? {})) {
    if (!(await exists(path.join(snapshot, name)))) errors.push(`missing from snapshot: ${name}`);
    else if (await sha256(path.join(snapshot, name)) !== hash) errors.push(`checksum mismatch: ${name}`);
  }
  for (const name of await readdir(snapshot)) if (name !== 'manifest.json' && !(name in (manifest.files ?? {}))) errors.push(`not in manifest: ${name}`);
  if (!manifest.files?.['data.tar.gz']) errors.push('snapshot has no data.tar.gz');
  if (errors.length) return; // never extract an archive that failed its checksum

  // 2. extract
  const data = path.join(drill, 'data'), assetsOut = path.join(drill, 'assets');
  await mkdir(data, { recursive: true });
  extract(path.join(snapshot, 'data.tar.gz'), data);
  let assets = assetsOpt ? path.resolve(assetsOpt) : null;
  if (manifest.files['assets.tar.gz']) { await mkdir(assetsOut, { recursive: true }); extract(path.join(snapshot, 'assets.tar.gz'), assetsOut); assets = assetsOut; }
  if (manifest.files['accounts.dump']) warnings.push('accounts are in accounts.dump: restore it into a new empty database with pg_restore (deploy/README.md §7) and check sign-in there');

  // 3. every store file parses
  const files = await walk(data);
  for (const f of files) {
    const store = f.includes('/') ? f.split('/')[0] : '(root)';
    counts[store] = (counts[store] ?? 0) + 1;
    if (f.endsWith('.tmp')) { warnings.push(`left-over temporary file: ${f}`); continue; }
    const text = f.endsWith('.json') || f.endsWith('.jsonl') ? await readFile(path.join(data, f), 'utf8') : null;
    if (text === null) continue;
    try {
      if (f.endsWith('.json')) JSON.parse(text);
      else text.split('\n').filter((l) => l.trim()).forEach((l) => JSON.parse(l));
    } catch { errors.push(`does not parse: ${f}`); }
  }

  // 4. references
  const read = async (f) => { try { return JSON.parse(await readFile(path.join(data, f), 'utf8')); } catch { return null; } };
  const has = (f) => files.includes(f);
  const userIds = new Set();
  for (const f of files.filter((f) => /^users\/[^/]+\.json$/.test(f))) { const u = await read(f); if (u?.id) userIds.add(u.id); }
  for (const f of files.filter((f) => /^properties\/[^/]+\.json$/.test(f))) {
    const p = await read(f);
    if (p?.ownerId && manifest.accounts !== 'postgresql' && !userIds.has(p.ownerId)) warnings.push(`project ${p.id}: owner account ${p.ownerId} is not in users/`);
  }
  const scanOk = async (doc) => {
    if (!assets) return true;
    for (const v of Object.values(doc?.splat?.variants ?? {})) {
      if (v?.assetId && v?.meta && !(await exists(path.join(assets, v.assetId, v.meta)))) return `${v.assetId}/${v.meta}`;
    }
    return true;
  };
  for (const f of files.filter((f) => /^scenes\/[^/@]+\.json$/.test(f))) {
    const s = await read(f);
    if (!s) continue;
    if (s.propertyId && !has(`properties/${s.propertyId}.json`)) warnings.push(`space ${s.id}: project ${s.propertyId} is missing`);
    if (s.status === 'published' && s.publishedVersion) {
      const snapFile = `scenes/${s.id}@${s.publishedVersion}.json`;
      if (!has(snapFile)) { errors.push(`space ${s.id}: published version ${s.publishedVersion} has no snapshot file`); continue; }
      const missing = await scanOk(await read(snapFile));
      if (missing !== true) errors.push(`space ${s.id} (published): scan file missing: ${missing}`);
    } else {
      const missing = await scanOk(s);
      if (missing !== true) warnings.push(`space ${s.id} (draft): scan file missing: ${missing}`);
    }
  }
  for (const f of files.filter((f) => /^(sites|reservations)\/[^/]+\.json$/.test(f))) {
    const id = path.basename(f, '.json');
    if (!has(`properties/${id}.json`)) warnings.push(`${f}: no project ${id}`);
  }
  if (!assets) warnings.push('scan files not checked: no assets in the snapshot (ASSET_DRIVER=s3); pass --assets <dir> to check them');

  // 5. compare with live data
  if (live) {
    const liveFiles = (await walk(path.resolve(live))).filter((f) => !f.endsWith('.tmp'));
    const restored = new Set(files);
    const diff = [];
    for (const f of liveFiles) {
      if (!restored.has(f)) diff.push(`only live: ${f}`);
      else if (await sha256(path.join(path.resolve(live), f)) !== await sha256(path.join(data, f))) diff.push(`changed since backup: ${f}`);
    }
    for (const f of files) if (!liveFiles.includes(f) && !f.endsWith('.tmp')) diff.push(`only in backup: ${f}`);
    counts['(differs from live)'] = diff.length;
    warnings.push(...diff.slice(0, 20), ...(diff.length > 20 ? [`… and ${diff.length - 20} more differences`] : []));
  }
}

try { await main(); } catch (e) { errors.push(e.message); }
console.log(JSON.stringify({ ok: !errors.length, files: counts, errors, warnings }, null, 2));
process.exitCode = errors.length ? 1 : 0;
