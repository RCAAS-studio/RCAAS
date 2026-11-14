// writeFileWhole: data files are written whole, never seen half-written.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { promises as fs } from 'node:fs';
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

test('temporary Windows sharing failures retry without deleting the old file; permanent failures preserve it', async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rcaas-sharing-'));
  const file = path.join(dir, 'p.json');
  const rename = fs.rename;
  let failures = 6;
  await writeFile(file, '{"previous":true}');
  const mocked = t.mock.method(fs, 'rename', async (from, to) => {
    if (to === file && failures-- > 0) {
      assert.equal(await readFile(file, 'utf8'), '{"previous":true}', 'old data remains available during retry');
      throw Object.assign(new Error('Simulated Windows file sharing conflict'), { code: 'EPERM' });
    }
    return rename(from, to);
  });
  try {
    await writeFileWhole(file, '{"replacement":true}');
    assert.equal(await readFile(file, 'utf8'), '{"replacement":true}');
    mocked.mock.mockImplementation(async () => { throw Object.assign(new Error('Persistent permission failure'), { code: 'EACCES' }); });
    await assert.rejects(writeFileWhole(file, '{"mustNotReplace":true}'), { code: 'EACCES' });
    assert.equal(await readFile(file, 'utf8'), '{"replacement":true}');
    assert.deepEqual(await readdir(dir), ['p.json'], 'failed replacement leaves no temporary file');
  } finally { mocked.mock.restore(); await rm(dir, { recursive: true, force: true }); }
});
