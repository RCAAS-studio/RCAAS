import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DATA_DIR, writeFileWhole } from './dataDir.js';
import { validAssetId } from './assetReferences.js';

const directory = path.join(DATA_DIR, 'asset-records');
const fileOf = id => {
  if (!validAssetId(id)) throw Object.assign(new Error('Invalid asset id.'), { status: 400 });
  return path.join(directory, `${id}.json`);
};
export async function assetRecord(id) {
  try {
    const record = JSON.parse(await fs.readFile(fileOf(id), 'utf8'));
    if (!record || record.assetId !== id || !Object.hasOwn(record, 'ownerId') || !['staging', 'ready'].includes(record.status)) throw new Error('Invalid asset ownership record.');
    return record;
  } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
export async function createAssetRecord(id, ownerId) {
  await fs.mkdir(directory, { recursive: true });
  await writeFileWhole(fileOf(id), JSON.stringify({ version: 1, assetId: id, ownerId, createdAt: new Date().toISOString(), status: 'staging' }), { flag: 'wx' });
}
export async function completeAssetRecord(id, files) {
  const record = await assetRecord(id);
  if (!record) throw new Error('Upload ownership record is missing.');
  await writeFileWhole(fileOf(id), JSON.stringify({ ...record, status: 'ready', completedAt: new Date().toISOString(), files }));
}
export const removeAssetRecord = id => fs.rm(fileOf(id), { force: true });
