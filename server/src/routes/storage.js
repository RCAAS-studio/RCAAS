/**
 * Storage, for admins: what's stored and by which project, finished uploads
 * nothing uses, and uploads that never finished. The one thing it deletes is
 * an unfinished upload idle for days, and only when an admin asks: its staging
 * folder, its upload record and any partial copy in storage. Finished files
 * are never removed here (whole-asset delete in routes/assets.js does that,
 * after its own reference check).
 *
 * Runs inside the API on purpose: removal holds the same locks as saves,
 * publication and uploads (`documents`, then `upload:<id>`), so it can't race
 * a resumed chunk or a draft that starts using the asset.
 */
import { Router } from 'express';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { requireAdmin } from '../middleware/auth.js';
import { DATA_DIR } from '../dataDir.js';
import { withWriteLock } from '../writeQueue.js';
import { assetGraph } from '../assetAccess.js';
import { assetRecord, allAssetRecords, removeAssetRecord } from '../assetCatalog.js';
import { assetsChanged } from '../assetChanges.js';
import { listUsers } from '../usersStore.js';
import * as storage from '../storage.js';
import { aiUsage } from '../claude.js';

export const STAGING_DIR = path.join(DATA_DIR, 'uploads-staging');
export const OWNERS_DIR = path.join(DATA_DIR, 'upload-owners');
const DAY = 86400000;

/** Size and last write of one staging folder (chunks bump their file's mtime). */
async function staged(id) {
  const walk = async (dir) => {
    const info = await fs.lstat(dir);
    if (!info.isDirectory()) return { bytes: info.size, lastAt: info.mtimeMs };
    let bytes = 0, lastAt = info.mtimeMs;
    for (const name of await fs.readdir(dir)) {
      const sub = await walk(path.join(dir, name));
      bytes += sub.bytes; lastAt = Math.max(lastAt, sub.lastAt);
    }
    return { bytes, lastAt };
  };
  try { return await walk(path.join(STAGING_DIR, id)); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

const ownerOf = async (id) => {
  try { return JSON.parse(await fs.readFile(path.join(OWNERS_DIR, `${id}.json`), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
};

/** One unfinished upload, or null if it finished or is gone. */
async function unfinished(id, record, stored) {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  const files = await staged(id);
  if (!files && record?.status !== 'staging') return null;
  const owner = await ownerOf(id);
  const declared = owner?.files ? Object.values(owner.files).reduce((sum, bytes) => sum + (Number(bytes) || 0), 0) : null;
  const created = Date.parse(record?.createdAt ?? '') || 0;
  return {
    id,
    ownerId: record?.ownerId ?? owner?.ownerId ?? null,
    startedAt: record?.createdAt ?? null,
    lastActivityAt: new Date(Math.max(files?.lastAt ?? 0, created)).toISOString(),
    stagedBytes: files?.bytes ?? 0,
    // a cloud copy that failed half-way: stored objects not yet readable
    partialBytes: record?.status === 'staging' ? (stored.get(id)?.bytes ?? 0) : 0,
    declaredBytes: declared,
    finished: record?.status === 'ready' // finished, but its staging folder was left behind
  };
}

export async function storageReport() {
  const [graph, stored, records, users] = await Promise.all([assetGraph(), storage.inventory(), allAssetRecords(), listUsers()]);
  const names = new Map(users.map((u) => [u.id, u.name || u.email]));
  const projects = new Map();
  const projectEntry = (id) => {
    if (!projects.has(id)) projects.set(id, { id, title: id ? (graph.properties.get(id)?.title ?? id) : null, assets: 0, bytes: 0 });
    return projects.get(id);
  };
  const unused = [];
  let totalBytes = 0, totalFiles = 0;
  for (const [id, { files, bytes }] of stored) {
    if (records.get(id)?.status === 'staging') continue; // listed under unfinished
    totalBytes += bytes; totalFiles += files;
    const sources = graph.references.get(id) ?? [];
    const using = new Set(sources.map((s) => s.propertyId ?? ''));
    const own = /^(?:site|brand)_(.+)$/.exec(id)?.[1];
    if (own && graph.properties.has(own)) using.add(own);
    if (!using.size) {
      const record = records.get(id);
      unused.push({ id, files, bytes, uploadedAt: record?.createdAt ?? null, uploadedBy: record?.ownerId ? (names.get(record.ownerId) ?? null) : null });
    }
    // an asset two projects share counts in both; the total counts it once
    for (const p of using) { const entry = projectEntry(p); entry.assets += 1; entry.bytes += bytes; }
  }
  const ids = new Set([
    ...(await fs.readdir(STAGING_DIR).catch((e) => { if (e.code === 'ENOENT') return []; throw e; })),
    ...[...records.values()].filter((r) => r.status === 'staging').map((r) => r.assetId)
  ]);
  const uploads = [];
  for (const id of ids) {
    const item = await unfinished(id, records.get(id), stored);
    if (item) uploads.push({ ...item, ownerName: item.ownerId ? (names.get(item.ownerId) ?? null) : null });
  }
  const bySize = (a, b) => b.bytes - a.bytes;
  return {
    driver: storage.DRIVER,
    totalBytes, totalFiles,
    projects: [...projects.values()].sort(bySize),
    unused: unused.sort(bySize),
    unfinished: uploads.sort((a, b) => a.lastActivityAt.localeCompare(b.lastActivityAt)),
    ai: await aiUsage() // Claude tokens this month (claude.js)
  };
}

/** Remove unfinished uploads idle for at least `idleDays`. Each is checked
 *  again inside its locks, and one a document points at is kept. */
export async function removeIdleUploads(idleDays, now = Date.now()) {
  const cutoff = now - idleDays * DAY;
  const { unfinished: candidates } = await storageReport();
  const removed = [], kept = [];
  for (const { id } of candidates) {
    await withWriteLock('documents', () => withWriteLock(`upload:${id}`, async () => {
      const record = await assetRecord(id);
      const item = await unfinished(id, record, new Map());
      if (!item || Date.parse(item.lastActivityAt) > cutoff) return;
      if ((await assetGraph()).references.get(id)?.length) { kept.push({ id, reason: 'A draft, published version or website points at it.' }); return; }
      await fs.rm(path.join(STAGING_DIR, id), { recursive: true, force: true });
      await fs.rm(path.join(OWNERS_DIR, `${id}.json`), { force: true });
      if (record?.status === 'staging') { await storage.remove(id); await removeAssetRecord(id); }
      console.log(`[storage] removed unfinished upload ${id} (idle since ${item.lastActivityAt})`);
      removed.push({ id, bytes: item.stagedBytes });
    }));
  }
  if (removed.length) assetsChanged();
  return { removed, kept };
}

export const storageRouter = Router();

// Admin: stored bytes per project, finished uploads nothing uses, unfinished uploads.
storageRouter.get('/', requireAdmin, (req, res, next) => storageReport().then((r) => res.json(r), next));

// Admin: remove unfinished uploads idle for `idleDays` (1–365, default 7). Finished files are never touched.
storageRouter.post('/remove-idle-uploads', requireAdmin, (req, res, next) => {
  const idleDays = req.body?.idleDays ?? 7;
  if (!Number.isInteger(idleDays) || idleDays < 1 || idleDays > 365) return res.status(400).json({ error: 'idleDays must be a whole number of days from 1 to 365.' });
  removeIdleUploads(idleDays).then((r) => res.json(r), next);
});
