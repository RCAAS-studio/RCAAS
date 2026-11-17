/** Opt-in R2/S3 check. No dotenv, ordinary S3 settings, bookings or client assets. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { createS3Driver } from '../server/src/storage-s3.js';

export function stagingStorageConfig(env) {
  if (env.RCAAS_STAGING_CONFIRMED !== 'isolated-disposable') throw Error('Explicit isolated staging designation required.');
  const config = {};
  for (const key of ['ENDPOINT', 'BUCKET', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY']) {
    if (!env[`STAGING_S3_${key}`]) throw Error(`Missing STAGING_S3_${key}.`);
    config[`S3_${key}`] = env[`STAGING_S3_${key}`];
  }
  let url;
  try { url = new URL(config.S3_ENDPOINT); } catch { throw Error('Invalid staging endpoint.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw Error('Staging endpoint must be an HTTPS origin.');
  if (env.STAGING_EXPECTED_BUCKET !== config.S3_BUCKET || env.STAGING_EXPECTED_ENDPOINT !== config.S3_ENDPOINT) throw Error('Independently confirmed staging endpoint and bucket must match.');
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(config.S3_BUCKET)) throw Error('Invalid staging bucket name.');
  return { ...config, S3_REGION: env.STAGING_S3_REGION || 'auto', S3_PREFIX: 'rcaas-acceptance/' };
}

export async function exerciseStorage(driver, onCreated = () => {}) {
  const assetId = `ast_acceptance_${randomUUID()}`;
  const rel = 'probe.txt';
  const bytes = Buffer.from('RCAAS disposable storage acceptance\n');
  const read = async stream => { const chunks = []; for await (const chunk of stream) chunks.push(Buffer.from(chunk)); return Buffer.concat(chunks); };
  // Report only the random cleanup key, never credentials or endpoints.
  onCreated(assetId);
  try {
    await driver.put(assetId, rel, Readable.from([bytes]), 'text/plain');
    assert.equal((await driver.stat(assetId, rel)).bytes, bytes.length);
    assert.deepEqual(await read(driver.get(assetId, rel)), bytes);
    assert.deepEqual(await read(driver.get(assetId, rel, { range: { start: 0, end: 4 } })), bytes.subarray(0, 5));
    assert.deepEqual(await driver.list(assetId), [rel]);
  } finally {
    // Delete only this exact generated object, never a bucket or broad prefix.
    await driver.remove(assetId, rel);
  }
  assert.equal(await driver.exists(assetId), false);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const config = stagingStorageConfig(process.env);
    await exerciseStorage(createS3Driver(config), id => console.log(`Disposable cleanup key: rcaas-acceptance/${id}/probe.txt`));
    console.log('PASS: put, stat, full/range bytes, listing and exact-object cleanup. API authorization and public bucket exposure require separate acceptance.');
  } catch {
    console.error('FAIL: staging storage check. Verify designation/settings and inspect the reported disposable key for cleanup. Provider error details are suppressed to protect credentials.');
    process.exitCode = 1;
  }
}
