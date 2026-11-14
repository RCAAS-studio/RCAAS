import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { crc32, deflateRawSync } from 'node:zlib';
import { startFakeS3 } from './fakeS3.js';

async function fixture(t, driver, options = {}) {
  const data = await mkdtemp(path.join(os.tmpdir(), 'rcaas-private-assets-'));
  const port = await new Promise(resolve => {
    const probe = http.createServer().listen(0, '127.0.0.1', () => {
      const { port } = probe.address(); probe.close(() => resolve(port));
    });
  });
  const cloud = driver === 's3' ? await startFakeS3({ bucket: 'private-assets', accessKeyId: 'fixture-key', secretAccessKey: 'fixture-secret', failRequest: options.failRequest }) : null;
  const secret = randomBytes(32).toString('hex');
  const base = `http://127.0.0.1:${port}`;
  let output = '';
  const server = spawn(process.execPath, ['src/index.js'], {
    cwd: path.resolve(import.meta.dirname, '..'), windowsHide: true,
    env: { ...process.env, NODE_ENV: 'production', HOST: '127.0.0.1', PORT: String(port),
      DATA_DIR: data, ASSET_DIR: path.join(data, 'assets'), ASSET_DRIVER: driver, DATABASE_URL: '', DATABASE_CA_FILE: '',
      SESSION_SECRET: secret, EMBED_TOKEN_SECRET: secret, EDITOR_PASSWORD: secret, SHARED_TEAM_LOGIN: '0',
      CLIENT_ORIGIN: 'https://example.test', STUDIO_URL: '', TOURS_URL: '', SITES_DOMAIN: '', AUTH_RATE_MAX: '100',
      RESEND_API_KEY: '', SMS_TOKEN: '', WHATSAPP_TOKEN: '', ANTHROPIC_API_KEY: '',
      UPLOAD_MAX_BYTES: '10737418240', UPLOAD_MAX_FILE_BYTES: '4294967296', UPLOAD_MAX_FILES: '10000', ...options.env,
      ...(cloud ? { S3_ENDPOINT: cloud.url, S3_BUCKET: 'private-assets', S3_REGION: 'auto', S3_ACCESS_KEY_ID: 'fixture-key', S3_SECRET_ACCESS_KEY: 'fixture-secret' } : {}) },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  server.stdout.on('data', data => { output += data; }); server.stderr.on('data', data => { output += data; });
  const exited = new Promise(resolve => server.once('exit', resolve));
  t.after(async () => { if (server.exitCode === null) server.kill(); await exited; await cloud?.close(); await rm(data, { recursive: true, force: true }); });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error(`API startup timeout: ${output}`)), 10000);
    server.stdout.on('data', data => { if (/listening/.test(data)) { clearTimeout(timer); resolve(); } });
    server.once('error', reject); server.once('exit', code => { clearTimeout(timer); reject(Error(`API exited ${code}: ${output}`)); });
  });
  const request = async (method, url, body, cookie = '', headers = {}) => {
    const raw = Buffer.isBuffer(body);
    const res = await fetch(base + url, { method, headers: { Cookie: cookie, 'Content-Type': raw ? 'application/octet-stream' : 'application/json', ...headers },
      body: body === undefined ? undefined : raw ? body : JSON.stringify(body), signal: AbortSignal.timeout(10000) });
    return { status: res.status, json: await res.json().catch(() => null), cookie: res.headers.get('set-cookie')?.split(';')[0], headers: res.headers };
  };
  const signup = async email => {
    const r = await request('POST', '/api/auth/signup', { name: email.split('@')[0], email, password: 'Fixture account password', accessCode: secret });
    assert.equal(r.status, 201); return { cookie: r.cookie, id: r.json.user.id, email };
  };
  const read = (id, file, cookie = '', headers = {}) => fetch(`${base}/api/assets/${id}/${file}`, { headers: { Cookie: cookie, ...headers } });
  const upload = async (cookie, files) => {
    const created = await request('POST', '/api/assets', { files: files.map(([relPath, bytes]) => ({ relPath, bytes: bytes.length })) }, cookie); assert.equal(created.status, 200);
    const id = created.json.assetId;
    for (const [file, bytes] of files) assert.equal((await request('PUT', `/api/assets/${id}/files/chunk?relPath=${encodeURIComponent(file)}&offset=0`, bytes, cookie)).status, 200);
    const finalized = await request('POST', `/api/assets/${id}/finalize`, {}, cookie); assert.equal(finalized.status, 200, JSON.stringify(finalized.json));
    return id;
  };
  return { data, base, request, signup, read, upload };
}

const chunk = Buffer.from('A complete test scan chunk');
const scanFiles = () => [['scan.lcc2', Buffer.from(JSON.stringify({ root: { splatFiles: ['chunk.bin', 'tile%20literal.bin', 'tile with spaces.bin'] } }))], ['chunk.bin', chunk], ['tile%20literal.bin', chunk], ['tile with spaces.bin', chunk]];
const doc = (id, project, asset) => ({ id, version: 2, title: id, propertyId: project,
  splat: { format: 'lcc2', variants: { high: { assetId: asset, meta: 'scan.lcc2' } } },
  spawn: { position: [1, 1.7, 3], yaw: 0, eyeHeight: 1.65 }, hotspots: [], tracks: [] });

/** Small real deflated ZIP, with explicit entry metadata for hostile fixtures. */
function zip(files) {
  const local = [], central = [];
  let offset = 0;
  for (const [name, body, mode = 0] of files) {
    const filename = Buffer.from(name), compressed = deflateRawSync(body);
    const header = Buffer.alloc(30), record = Buffer.alloc(46);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(8, 8);
    header.writeUInt32LE(crc32(body), 14); header.writeUInt32LE(compressed.length, 18);
    header.writeUInt32LE(body.length, 22); header.writeUInt16LE(filename.length, 26);
    record.writeUInt32LE(0x02014b50); record.writeUInt16LE(0x0314, 4); record.writeUInt16LE(20, 6);
    record.writeUInt16LE(8, 10); record.writeUInt32LE(crc32(body), 16);
    record.writeUInt32LE(compressed.length, 20); record.writeUInt32LE(body.length, 24);
    record.writeUInt16LE(filename.length, 28); record.writeUInt32LE((mode * 65536) >>> 0, 38);
    record.writeUInt32LE(offset, 42);
    local.push(header, filename, compressed); central.push(record, filename);
    offset += header.length + filename.length + compressed.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

for (const driver of ['local', 's3']) test(`incomplete declared upload stays private, resumes and rejects extra bytes (${driver})`, async t => {
  const f = await fixture(t, driver), owner = await f.signup('resume@example.test');
  const files = scanFiles();
  const created = await f.request('POST', '/api/assets', { files: files.map(([relPath, bytes]) => ({ relPath, bytes: bytes.length })) }, owner.cookie);
  assert.equal(created.status, 200);
  const id = created.json.assetId;
  for (const [file, bytes] of files) {
    const part = file === 'chunk.bin' ? bytes.subarray(0, 5) : bytes;
    assert.equal((await f.request('PUT', `/api/assets/${id}/files/chunk?relPath=${encodeURIComponent(file)}&offset=0`, part, owner.cookie)).status, 200);
  }
  assert.equal((await f.request('POST', `/api/assets/${id}/finalize`, {}, owner.cookie)).status, 409);
  assert.equal((await f.read(id, 'scan.lcc2', owner.cookie)).status, 404);
  const progress = await f.request('POST', `/api/assets/${id}/files`, { relPath: 'chunk.bin' }, owner.cookie);
  assert.equal(progress.json.bytesReceived, 5);
  const retry = await f.request('PUT', `/api/assets/${id}/files/chunk?relPath=chunk.bin&offset=0`, chunk.subarray(0, 5), owner.cookie);
  assert.equal(retry.status, 409); assert.equal(retry.json.bytesReceived, 5);
  assert.equal((await f.request('PUT', `/api/assets/${id}/files/chunk?relPath=extra.bin&offset=0`, chunk, owner.cookie)).status, 400);
  assert.equal((await f.request('PUT', `/api/assets/${id}/files/chunk?relPath=chunk.bin&offset=5`, chunk, owner.cookie)).status, 400);
  assert.equal((await f.request('PUT', `/api/assets/${id}/files/chunk?relPath=chunk.bin&offset=5`, chunk.subarray(5), owner.cookie)).status, 200);
  assert.equal((await f.request('POST', `/api/assets/${id}/finalize`, {}, owner.cookie)).status, 200);
  assert.equal(await (await f.read(id, 'chunk.bin', owner.cookie)).text(), chunk.toString());
});

test('ZIP expansion limits and unsafe entries fail closed; a valid ZIP survives a cloud outage', async t => {
  let outage = false;
  const f = await fixture(t, 's3', { env: { UPLOAD_MAX_BYTES: '4096', UPLOAD_MAX_FILE_BYTES: '4096', UPLOAD_MAX_FILES: '8' },
    failRequest: (method, key) => outage && method === 'PUT' && key.endsWith('/scan.lcc2') });
  const owner = await f.signup('zip@example.test');
  const stage = async (files, corrupt = false) => {
    const archive = zip(files);
    if (corrupt) archive.writeUInt32LE(0, archive.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02])) + 16);
    const created = await f.request('POST', '/api/assets', { files: [{ relPath: 'scan.zip', bytes: archive.length }] }, owner.cookie);
    assert.equal(created.status, 200);
    const id = created.json.assetId;
    assert.equal((await f.request('PUT', `/api/assets/${id}/files/chunk?relPath=scan.zip&offset=0`, archive, owner.cookie)).status, 200);
    return id;
  };
  for (const [files, status] of [
    [[['huge.bin', Buffer.alloc(4097)]], 413],
    [Array.from({ length: 9 }, (_, i) => [`${i}.bin`, Buffer.from('x')]), 413],
    [[['../outside.bin', chunk]], 400],
    [[['same.bin', chunk], ['SAME.bin', chunk]], 400],
    [[['scan.zip', chunk]], 400],
    [[['link.bin', chunk, 0xa000]], 400],
    [[['NUL.bin', chunk]], 400]
  ]) {
    const id = await stage(files);
    assert.equal((await f.request('POST', `/api/assets/${id}/finalize`, {}, owner.cookie)).status, status);
    assert.equal((await f.read(id, 'huge.bin', owner.cookie)).status, 404);
    assert.equal((await f.request('POST', `/api/assets/${id}/files`, { relPath: 'scan.zip' }, owner.cookie)).status, 404);
  }
  const corrupt = await stage(scanFiles(), true);
  assert.equal((await f.request('POST', `/api/assets/${corrupt}/finalize`, {}, owner.cookie)).status, 400, 'ZIP CRC detects changed bytes even when lengths match');
  const id = await stage(scanFiles());
  outage = true;
  assert.equal((await f.request('POST', `/api/assets/${id}/finalize`, {}, owner.cookie)).status, 502);
  assert.equal((await f.read(id, 'chunk.bin', owner.cookie)).status, 404);
  outage = false;
  const finished = await f.request('POST', `/api/assets/${id}/finalize`, {}, owner.cookie);
  assert.equal(finished.status, 200, JSON.stringify(finished.json));
  assert.equal(await (await f.read(id, 'chunk.bin', owner.cookie)).text(), chunk.toString());
});

test('upload limits also apply to legacy chunks and invalid LCC indexes never become ready', async t => {
  const f = await fixture(t, 'local', { env: { UPLOAD_MAX_BYTES: '512', UPLOAD_MAX_FILE_BYTES: '256', UPLOAD_MAX_FILES: '4' } });
  const owner = await f.signup('limits@example.test');
  const create = body => f.request('POST', '/api/assets', body, owner.cookie);
  assert.equal((await create({ files: [{ relPath: 'too-big.bin', bytes: 257 }] })).status, 413);
  assert.equal((await create({ files: [{ relPath: '../escape', bytes: 1 }] })).status, 400);
  assert.equal((await create({ files: [{ relPath: 'A.bin', bytes: 1 }, { relPath: 'a.bin', bytes: 1 }] })).status, 400);
  const id = (await create({})).json.assetId;
  assert.equal((await f.request('PUT', `/api/assets/${id}/files/chunk?relPath=tile.bin&offset=0`, Buffer.alloc(257), owner.cookie)).status, 413);
  for (const index of [{}, { root: {} }, { root: { splatFiles: ['../escape'] } }]) {
    const bad = (await create({})).json.assetId;
    await f.request('PUT', `/api/assets/${bad}/files/chunk?relPath=scan.lcc2&offset=0`, Buffer.from(JSON.stringify(index)), owner.cookie);
    assert.equal((await f.request('POST', `/api/assets/${bad}/finalize`, {}, owner.cookie)).status, 400);
    assert.equal((await f.read(bad, 'scan.lcc2', owner.cookie)).status, 404);
  }
});

test('an 8 MiB tile resumes after a socket disconnect during the next chunk', async t => {
  const f = await fixture(t, 'local'), owner = await f.signup('disconnect@example.test');
  const first = 8 * 1024 ** 2, tile = Buffer.alloc(first + 128, 0x5a);
  const index = Buffer.from(JSON.stringify({ root: { splatFiles: ['tile.bin'] } }));
  const created = await f.request('POST', '/api/assets', { files: [
    { relPath: 'scan.lcc2', bytes: index.length }, { relPath: 'tile.bin', bytes: tile.length }
  ] }, owner.cookie);
  const id = created.json.assetId;
  assert.equal((await f.request('PUT', `/api/assets/${id}/files/chunk?relPath=scan.lcc2&offset=0`, index, owner.cookie)).status, 200);
  assert.equal((await f.request('PUT', `/api/assets/${id}/files/chunk?relPath=tile.bin&offset=0`, tile.subarray(0, first), owner.cookie)).status, 200);
  await new Promise(resolve => {
    const request = http.request(`${f.base}/api/assets/${id}/files/chunk?relPath=tile.bin&offset=${first}`, {
      method: 'PUT', headers: { Cookie: owner.cookie, 'Content-Type': 'application/octet-stream', 'Content-Length': '128' }
    });
    request.on('error', () => {});
    request.on('close', resolve);
    request.write(tile.subarray(first, first + 64), () => setTimeout(() => request.destroy(), 40));
  });
  const progress = await f.request('POST', `/api/assets/${id}/files`, { relPath: 'tile.bin' }, owner.cookie);
  assert.equal(progress.json.bytesReceived, first, 'An aborted raw request appends no partial chunk');
  assert.equal((await f.request('POST', `/api/assets/${id}/finalize`, {}, owner.cookie)).status, 409);
  assert.equal((await f.request('PUT', `/api/assets/${id}/files/chunk?relPath=tile.bin&offset=${first}`, tile.subarray(first), owner.cookie)).status, 200);
  assert.equal((await f.request('POST', `/api/assets/${id}/finalize`, {}, owner.cookie)).status, 200);
  const metadata = await f.request('GET', `/api/assets/${id}`, undefined, owner.cookie);
  assert.equal(metadata.json.files['tile.bin'].sha256, createHash('sha256').update(tile).digest('hex'));
  const range = await f.read(id, 'tile.bin', owner.cookie, { Range: `bytes=${first}-` });
  assert.equal(range.status, 206); assert.equal((await range.arrayBuffer()).byteLength, 128);
});

for (const driver of ['local', 's3']) test(`private files, publication, reference protection and revocation (${driver})`, async t => {
  const f = await fixture(t, driver);
  const owner = await f.signup('owner@example.test'), other = await f.signup('other@example.test');
  const project = (await f.request('POST', '/api/properties', { title: 'Private asset project' }, owner.cookie)).json.id;
  const otherProject = (await f.request('POST', '/api/properties', { title: 'Other project' }, other.cookie)).json.id;
  const asset = await f.upload(owner.cookie, scanFiles());
  assert.equal((await f.read(asset, 'chunk.bin')).status, 404, 'A guessed upload ID must not reveal a draft');
  assert.equal((await f.read(asset, 'chunk.bin', other.cookie)).status, 404);
  const privateRead = await f.read(asset, 'chunk.bin', owner.cookie);
  assert.equal(privateRead.status, 200);
  assert.equal((await f.read(asset, 'tile%2520literal.bin', owner.cookie)).status, 200, 'Express-decoded filenames are not decoded a second time');
  assert.equal((await f.read(asset, 'tile%20with%20spaces.bin', owner.cookie)).status, 200);
  assert.match(privateRead.headers.get('cache-control'), /private.*no-store/);
  assert.match(privateRead.headers.get('vary'), /Cookie/i);
  const metadata = await f.request('GET', `/api/assets/${asset}`, undefined, owner.cookie);
  assert.equal(metadata.status, 200);
  assert.equal(metadata.json.status, 'ready');
  assert.equal(metadata.json.files['chunk.bin'].sha256, createHash('sha256').update(chunk).digest('hex'));
  assert.equal((await f.request('GET', `/api/assets/${asset}`, undefined, other.cookie)).status, 403);

  assert.equal((await f.request('PUT', '/api/scenes/stolen', doc('stolen', otherProject, asset), other.cookie)).status, 403,
    'Saving a foreign asset ID must not grant access or make it publishable');
  assert.equal((await f.request('PUT', '/api/scenes/owner-room', doc('owner-room', project, asset), owner.cookie)).status, 200);
  assert.equal((await f.read(asset, 'scan.lcc2')).status, 404);
  assert.equal((await f.request('POST', '/api/scenes/owner-room/publish', {}, owner.cookie)).status, 200);
  const publicRead = await f.read(asset, 'chunk.bin', '', { Range: 'bytes=-4' });
  assert.equal(publicRead.status, 206);
  assert.deepEqual(Buffer.from(await publicRead.arrayBuffer()), chunk.subarray(-4));
  assert.doesNotMatch(publicRead.headers.get('cache-control'), /immutable/);
  assert.equal((await f.read(asset, 'chunk.bin', '', { Range: 'bytes=0-' })).status, 206);
  assert.equal((await f.read(asset, 'chunk.bin', '', { Range: 'bytes=-' })).status, 416);

  const replacement = await f.upload(owner.cookie, scanFiles());
  assert.equal((await f.request('PUT', '/api/scenes/owner-room', doc('owner-room', project, replacement), owner.cookie)).status, 200);
  assert.equal((await f.read(replacement, 'chunk.bin')).status, 404, 'A newer draft is not the live snapshot');
  assert.equal((await f.read(asset, 'chunk.bin')).status, 200);
  assert.equal((await f.request('POST', '/api/scenes/owner-room/publish', {}, owner.cookie)).status, 200);
  assert.equal((await f.read(asset, 'chunk.bin')).status, 404, 'Old retained versions are private');
  assert.equal((await f.request('DELETE', `/api/assets/${asset}`, undefined, owner.cookie)).status, 409, 'History must remain restorable');
  assert.equal((await f.request('POST', '/api/scenes/owner-room/unpublish', {}, owner.cookie)).status, 200);
  assert.equal((await f.read(replacement, 'chunk.bin')).status, 404);
  await f.request('POST', `/api/properties/${project}/members`, { email: other.email, as: 'member' }, owner.cookie);
  assert.equal((await f.read(replacement, 'chunk.bin', other.cookie)).status, 200, 'Project collaborators can preview');
  const collaboratorAsset = await f.upload(other.cookie, scanFiles());
  assert.equal((await f.request('PUT', '/api/scenes/collaborator-room', doc('collaborator-room', project, collaboratorAsset), other.cookie)).status, 200);
  await f.request('DELETE', `/api/properties/${project}/members/${other.id}`, undefined, owner.cookie);
  assert.equal((await f.read(replacement, 'chunk.bin', other.cookie)).status, 404, 'Membership revocation applies immediately');
  assert.equal((await f.read(collaboratorAsset, 'chunk.bin', other.cookie)).status, 404, 'The original uploader loses project-bound access after removal');
  assert.equal((await f.read(collaboratorAsset, 'chunk.bin', owner.cookie)).status, 200);

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3foAAAAASUVORK5CYII=', 'base64');
  const photo = async () => { const r = await f.request('POST', `/api/sites/${project}/images`, png, owner.cookie); assert.equal(r.status, 200); return r.json.path; };
  const publishedPhoto = await photo(), draftPhoto = await photo();
  assert.notEqual(publishedPhoto, draftPhoto);
  await f.request('PUT', `/api/sites/${project}/draft`, { hero: { image: publishedPhoto } }, owner.cookie);
  await f.request('POST', `/api/sites/${project}/publish`, {}, owner.cookie);
  const [photoAsset, ...publicPath] = publishedPhoto.split('/'), privatePath = draftPhoto.split('/').slice(1).join('/');
  assert.equal((await f.read(photoAsset, publicPath.join('/'))).status, 200);
  assert.equal((await f.read(photoAsset, privatePath)).status, 404, 'Publishing one image must not expose every draft image in its folder');
  assert.equal((await f.read(photoAsset, privatePath, owner.cookie)).status, 200);

  const oldCookie = owner.cookie;
  const password = await f.request('POST', '/api/auth/password', { current: 'Fixture account password', password: 'Replacement fixture password' }, owner.cookie);
  assert.equal(password.status, 200); owner.cookie = password.cookie;
  assert.equal((await f.read(replacement, 'chunk.bin', oldCookie)).status, 404, 'Password change revokes private asset reads too');
  assert.equal((await f.read(replacement, 'chunk.bin', owner.cookie)).status, 200);
  // Simulate an operator removing all retained content in this disposable
  // fixture. The existing product has no individual-space deletion endpoint.
  for (const name of ['owner-room.json', 'owner-room@1.json', 'owner-room@2.json']) await rm(path.join(f.data, 'scenes', name));
  await new Promise(resolve => setTimeout(resolve, 1100));
  assert.equal((await f.request('DELETE', `/api/assets/${asset}`, undefined, owner.cookie)).status, 204);
  assert.equal((await f.request('DELETE', `/api/assets/${replacement}`, undefined, owner.cookie)).status, 204);

  const pending = (await f.request('POST', '/api/assets', {}, owner.cookie)).json.assetId;
  for (const [file, bytes] of scanFiles()) await f.request('PUT', `/api/assets/${pending}/files/chunk?relPath=${file}&offset=0`, bytes, owner.cookie);
  await writeFile(path.join(f.data, 'uploads-staging', pending, 'empty.bin'), '');
  assert.equal((await f.request('POST', `/api/assets/${pending}/finalize`, {}, owner.cookie)).status, 400);
  assert.equal((await f.read(pending, 'scan.lcc2', owner.cookie)).status, 404, 'A rejected upload must not expose a partially copied package');
});
