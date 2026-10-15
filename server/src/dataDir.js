/**
 * Where every file-backed store keeps its data. Defaults to src/data; the
 * integration tests point DATA_DIR at a temp folder so they never touch real
 * scenes, users or leads. ASSET_DIR (storage.js) still overrides assets alone.
 * Every store writes through writeFileWhole.
 */
import path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(here, 'data');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * A data file written whole (2026-10-14): to a temporary name beside it
 * (`<file>.<uuid>.tmp`: every listing reads *.json only), then renamed over
 * it, so a read at the same moment gets the old file or the new one, never
 * half of one. Before, a plain writeFile (truncate, then write) let a read
 * meet half a file: a lead list failed, and reservations.js, which reads an
 * unreadable file as no bookings, could save a project's bookings away.
 * `{ flag: 'wx' }` keeps writeFile's meaning, refusing a file that's there
 * (EEXIST): a hard link, then the temporary name goes. Windows can refuse a
 * rename for a moment while another program (an antivirus) has the file
 * open, so that's tried again a few times.
 */
export async function writeFileWhole(file, text, { flag } = {}) {
  const tmp = `${file}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, text);
  try {
    for (let i = 0; ; i++) {
      try {
        if (flag === 'wx') await fs.link(tmp, file);
        else await fs.rename(tmp, file);
        break;
      } catch (err) {
        if (i >= 5 || !['EPERM', 'EACCES', 'EBUSY'].includes(err.code)) throw err;
        await wait(20 * (i + 1));
      }
    }
  } catch (err) {
    await fs.unlink(tmp).catch(() => {});
    throw err;
  }
  if (flag === 'wx') await fs.unlink(tmp).catch(() => {});
}
