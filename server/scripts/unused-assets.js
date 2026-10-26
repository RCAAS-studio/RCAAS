#!/usr/bin/env node
/**
 * Lists uploads nothing points at, with their sizes. Deletes nothing: check
 * the list, then remove what you're sure of by hand.
 *
 *   cd server && npm run assets:unused
 *
 * In use means the asset's id appears anywhere in any JSON under DATA_DIR
 * (drafts, published versions, projects, websites, bookings), or it is the
 * logo or photo folder (brand_/site_<project>) of a project that exists;
 * inside a website's photo folder, each photo must appear as "site_x/file".
 * So a stray mention can keep something "in use", but nothing used is ever
 * listed as unused. The usual finds: a deleted space's scan, replaced photos.
 */
import 'dotenv/config';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from '../src/dataDir.js';
import { ASSET_DIR, DRIVER } from '../src/storage.js';

// ponytail: this PC's disk only; with ASSET_DRIVER=s3 it needs a bucket listing (storage-s3.js listKeys) first.
if (DRIVER !== 'local') { console.error('[unused] reads the local asset folder only; run it where ASSET_DRIVER is local.'); process.exit(1); }

async function files(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await files(full)));
    else out.push({ full, bytes: (await fs.stat(full)).size });
  }
  return out;
}

const assetRoot = path.resolve(ASSET_DIR);
const data = (await files(DATA_DIR)).filter((f) => f.full.endsWith('.json') && !path.resolve(f.full).startsWith(assetRoot + path.sep));
const text = (await Promise.all(data.map((f) => fs.readFile(f.full, 'utf8')))).join('\n');
const projects = new Set((await fs.readdir(path.join(DATA_DIR, 'properties')).catch(() => [])).map((f) => f.replace(/\.json$/, '')));

const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
const unused = [];
for (const id of await fs.readdir(assetRoot)) {
  const inside = await files(path.join(assetRoot, id));
  const own = id.match(/^(brand|site)_(.+)$/)?.[2];
  if (!text.includes(id) && !(own && projects.has(own))) {
    unused.push([id, inside.reduce((a, f) => a + f.bytes, 0)]);
  } else if (id.startsWith('site_')) {
    for (const f of inside) {
      const rel = path.relative(path.join(assetRoot, id), f.full).split(path.sep).join('/');
      if (!text.includes(`${id}/${rel}`)) unused.push([`${id}/${rel}`, f.bytes]);
    }
  }
}

console.log(`[unused] read ${data.length} data files under ${DATA_DIR}`);
for (const [what, bytes] of unused) console.log(`  ${what}  ${mb(bytes)}`);
console.log(unused.length ? `[unused] ${unused.length} unused, ${mb(unused.reduce((a, [, b]) => a + b, 0))} in all. Nothing was deleted.` : '[unused] every upload is in use.');
