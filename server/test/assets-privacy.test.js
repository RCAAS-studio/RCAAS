import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { startFakeS3 } from './fakeS3.js';

async function fixture(t, driver) {
  const data = await mkdtemp(path.join(os.tmpdir(), 'rcaas-private-assets-'));
  const port = await new Promise(resolve => {
    const probe = http.createServer().listen(0, '127.0.0.1', () => {
      const { port } = probe.address(); probe.close(() => resolve(port));
    });
  });
  const cloud = driver === 's3' ? await startFakeS3({ bucket: 'private-assets', accessKeyId: 'fixture-key', secretAccessKey: 'fixture-secret' }) : null;
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
    const created = await request('POST', '/api/assets', {}, cookie); assert.equal(created.status, 200);
    const id = created.json.assetId;
    for (const [file, bytes] of files) assert.equal((await request('PUT', `/api/assets/${id}/files/chunk?relPath=${encodeURIComponent(file)}&offset=0`, bytes, cookie)).status, 200);
    const finalized = await request('POST', `/api/assets/${id}/finalize`, {}, cookie); assert.equal(finalized.status, 200, JSON.stringify(finalized.json));
    return id;
  };
  return { data, request, signup, read, upload };
}

const chunk = Buffer.from('A complete test scan chunk');
const scanFiles = () => [['scan.lcc2', Buffer.from(JSON.stringify({ root: { splatFiles: ['chunk.bin', 'tile%20literal.bin', 'tile with spaces.bin'] } }))], ['chunk.bin', chunk], ['tile%20literal.bin', chunk], ['tile with spaces.bin', chunk]];
const doc = (id, project, asset) => ({ id, version: 2, title: id, propertyId: project,
  splat: { format: 'lcc2', variants: { high: { assetId: asset, meta: 'scan.lcc2' } } },
  spawn: { position: [1, 1.7, 3], yaw: 0, eyeHeight: 1.65 }, hotspots: [], tracks: [] });

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
