#!/usr/bin/env node
/**
 * A dated copy of DATA_DIR: accounts, projects, spaces, websites, bookings,
 * enquiries, stats and activity, everything people write that isn't a scan
 * (scans are in the bucket already). Keeps the last BACKUP_KEEP_DAYS (14) in
 * BACKUP_DIR (DATA_DIR's sibling "backups"). With ASSET_DRIVER=s3 each copy also
 * goes to the bucket under backups.private/, which the API can never serve,
 * because a dead VPS disk takes its own copies with it.
 *
 *   cd server && npm run backup
 *   cron on the VPS: 15 3 * * *  cd /srv/rcaas/app/server && npm run backup >> /srv/rcaas/backups/backup.log 2>&1
 *   restore:          pm2 stop all; tar -xzf <file> -C <DATA_DIR's parent folder>; pm2 start all
 *
 * Each data file is written whole (dataDir.js), so every file in the copy is
 * complete; a save made while tar runs may land in the next day's copy.
 */
import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from '../src/dataDir.js';
import { createS3Driver } from '../src/storage-s3.js';

const outDir = path.resolve(process.env.BACKUP_DIR || path.join(path.dirname(DATA_DIR), 'backups'));
const keepDays = Number(process.env.BACKUP_KEEP_DAYS) || 14;
const name = `data-${new Date().toISOString().slice(0, 10)}.tar.gz`;
const file = path.join(outDir, name);

await fs.mkdir(outDir, { recursive: true });
// a relative archive name: GNU tar reads "C:\…" as a remote host
const tar = spawnSync('tar', ['-czf', `${name}.tmp`, '-C', path.dirname(DATA_DIR), path.basename(DATA_DIR)], { cwd: outDir, stdio: 'inherit' });
if (tar.status !== 0) { console.error(`[backup] tar failed (${tar.error?.message ?? `exit ${tar.status}`})`); process.exit(1); }
await fs.rename(`${file}.tmp`, file);
const { size } = await fs.stat(file);
console.log(`[backup] ${file} (${(size / 1048576).toFixed(1)} MB)`);

for (const old of await fs.readdir(outDir)) {
  const day = old.match(/^data-(\d{4}-\d{2}-\d{2})\.tar\.gz$/)?.[1];
  if (day && Date.now() - Date.parse(day) > keepDays * 86400000) await fs.rm(path.join(outDir, old));
}

if (process.env.ASSET_DRIVER === 's3') {
  // The driver puts at <prefix><id>/<file>. A dot in the folder keeps it out of
  // the API's reach whatever S3_PREFIX is: asset ids are [a-zA-Z0-9_-] only (routes/assets.js).
  await createS3Driver({ ...process.env, S3_PREFIX: 'backups.private/' }).put('data', name, createReadStream(file), 'application/gzip');
  console.log(`[backup] copied to the bucket as backups.private/data/${name}`);
}
