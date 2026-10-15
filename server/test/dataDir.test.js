// writeFileWhole: data files are written whole, never seen half-written.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { writeFileWhole } from '../src/dataDir.js';

test('a data file is replaced whole, a create-only one is never overwritten, and nothing is left behind', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rcaas-whole-'));
  try {
    const file = path.join(dir, 'p.json');
    await writeFileWhole(file, '{"v":1}');
    await writeFileWhole(file, '{"v":2}');
    assert.equal(await readFile(file, 'utf8'), '{"v":2}');

    // readers racing a stream of writes only ever see a whole file
    const big = (n) => JSON.stringify({ n, pad: 'x'.repeat(200000) });
    let torn = 0;
    const writes = (async () => { for (let n = 0; n < 40; n++) await writeFileWhole(file, big(n)); })();
    const reads = (async () => {
      for (let i = 0; i < 200; i++) { try { JSON.parse(await readFile(file, 'utf8')); } catch { torn++; } }
    })();
    await Promise.all([writes, reads]);
    assert.equal(torn, 0, 'no read met half a file');

    const once = path.join(dir, 'new.json');
    await writeFileWhole(once, 'first', { flag: 'wx' });
    await assert.rejects(writeFileWhole(once, 'second', { flag: 'wx' }), { code: 'EEXIST' });
    assert.equal(await readFile(once, 'utf8'), 'first');

    await writeFile(path.join(dir, 'other.txt'), '');
    assert.deepEqual((await readdir(dir)).filter((f) => f.endsWith('.tmp')), [], 'no temporary files left');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
