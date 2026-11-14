/** Bounded upload validation. Limits apply before storage receives any files. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cleanAssetPath } from './assetReferences.js';

const limit = (name, fallback) => {
  const value = process.env[name] === undefined || process.env[name] === '' ? fallback : Number(process.env[name]);
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${name} must be a positive safe integer.`);
  return value;
};
export const UPLOAD_MAX_BYTES = limit('UPLOAD_MAX_BYTES', 10 * 1024 ** 3);
export const UPLOAD_MAX_FILE_BYTES = limit('UPLOAD_MAX_FILE_BYTES', 4 * 1024 ** 3);
export const UPLOAD_MAX_FILES = limit('UPLOAD_MAX_FILES', 10000);
export const LCC_INDEX_MAX_BYTES = 16 * 1024 ** 2;
export const uploadError = (message, status = 400) => Object.assign(new Error(message), { status });

/** Windows and object storage must interpret every uploaded path identically. */
export function uploadPath(value) {
  const rel = cleanAssetPath(value);
  if (!rel || rel.split('/').some(part => /[. ]$|[<>"|?*\x00-\x1f]/.test(part)
    || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part))) return null;
  return rel;
}

export function checkUploadSize(bytes, count, largest) {
  if (bytes > UPLOAD_MAX_BYTES || count > UPLOAD_MAX_FILES || largest > UPLOAD_MAX_FILE_BYTES) {
    throw uploadError('This upload exceeds the configured file count or storage size limit.', 413);
  }
}

/** Optional for older API clients; the studio declares every file before sending bytes. */
export function uploadManifest(value) {
  if (value === undefined) return null;
  if (!Array.isArray(value) || !value.length) throw uploadError('Send a non-empty files list with relPath and bytes.');
  const files = Object.create(null), names = new Set();
  let total = 0;
  for (const item of value) {
    const rel = uploadPath(item?.relPath), bytes = item?.bytes;
    if (!rel || !Number.isSafeInteger(bytes) || bytes < 1) throw uploadError('Every file needs a safe relative path and a positive byte length.');
    if (names.has(rel.toLowerCase())) throw uploadError('Duplicate upload paths are not allowed.');
    names.add(rel.toLowerCase()); files[rel] = bytes; total += bytes;
    checkUploadSize(total, names.size, bytes);
  }
  return files;
}

export async function stagedInventory(root) {
  const files = new Map();
  let total = 0;
  async function walk(dir) {
    for (const item of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) await walk(full);
      else {
        if (!item.isFile()) throw uploadError('Only regular files may be uploaded.');
        const { size } = await fs.stat(full);
        files.set(path.relative(root, full).split(path.sep).join('/'), size);
        total += size;
        checkUploadSize(total, files.size, size);
      }
    }
  }
  await walk(root);
  return { files, total };
}

export async function verifyUpload(root, expected) {
  const inventory = await stagedInventory(root);
  if (expected) {
    if (inventory.files.size !== Object.keys(expected).length
      || Object.entries(expected).some(([rel, bytes]) => inventory.files.get(rel) !== bytes)) {
      throw uploadError('The upload is incomplete. Resume the remaining files before finalizing.', 409);
    }
  }
  return inventory;
}
