import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { mkdtemp, readFile, writeFile, rm, stat } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

async function fixture(t) {
  const data = await mkdtemp(path.join(os.tmpdir(), 'rcaas-security-'));
  const port = await new Promise(resolve => {
    const probe = http.createServer().listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
  const secret = randomBytes(32).toString('hex');
  let output = '';
  const server = spawn(process.execPath, ['src/index.js'], {
    cwd: path.resolve(import.meta.dirname, '..'), windowsHide: true,
    env: {
      ...process.env, NODE_ENV: 'production', HOST: '127.0.0.1', PORT: String(port), DATA_DIR: data,
      ASSET_DIR: path.join(data, 'assets'), ASSET_DRIVER: 'local', DATABASE_URL: '',
      SESSION_SECRET: secret, EMBED_TOKEN_SECRET: secret, EDITOR_PASSWORD: secret,
      CLIENT_ORIGIN: 'https://example.test', AUTH_RATE_MAX: '100',
      RESEND_API_KEY: '', SMS_TOKEN: '', WHATSAPP_TOKEN: '', ANTHROPIC_API_KEY: ''
    }, stdio: ['ignore', 'pipe', 'pipe']
  });
  const exited = new Promise(resolve => server.once('exit', resolve));
  server.stderr.on('data', d => { output += d; });
  t.after(async () => {
    if (server.exitCode === null) server.kill();
    await exited;
    await rm(data, { recursive: true, force: true });
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`API did not start: ${output}`)), 10000);
    server.stdout.on('data', d => { if (/listening/.test(d)) { clearTimeout(timer); resolve(); } });
    server.once('exit', code => { clearTimeout(timer); reject(new Error(`API exited ${code}: ${output}`)); });
    server.once('error', reject);
  });
  const request = async (method, url, body, cookie = '', headers = {}) => {
    const raw = Buffer.isBuffer(body);
    const res = await fetch(`http://127.0.0.1:${port}${url}`, {
      method, headers: { cookie, 'Content-Type': raw ? 'application/octet-stream' : 'application/json', ...headers },
      body: body === undefined ? undefined : raw ? body : JSON.stringify(body), signal: AbortSignal.timeout(5000)
    });
    return { status: res.status, cookie: res.headers.get('set-cookie')?.split(';')[0], revision: res.headers.get('X-Draft-Revision'), json: await res.json().catch(() => null) };
  };
  const signup = async email => {
    const r = await request('POST', '/api/auth/signup', { name: 'Test account', email, password: 'Test account password', accessCode: secret });
    assert.equal(r.status, 201);
    return r;
  };
  return { data, server, request, signup };
}

test('account read errors return 500 without killing session or admin endpoints', async t => {
  const { data, server, request, signup } = await fixture(t);
  const email = 'admin@example.test';
  const { cookie } = await signup(email);
  const file = path.join(data, 'users', `${createHash('sha256').update(email).digest('hex')}.json`);
  const original = await readFile(file, 'utf8');
  await writeFile(file, '{"broken":');
  for (const endpoint of ['/api/auth/session', '/api/team']) {
    const r = await request('GET', endpoint, undefined, cookie);
    assert.equal(r.status, 500);
    assert.match(r.json.error, /Something went wrong/);
    assert.equal(server.exitCode, null);
    assert.equal((await request('GET', '/api/health')).status, 200);
  }
  await writeFile(file, original);
  assert.equal((await request('GET', '/api/auth/session', undefined, cookie)).json.authenticated, true);
  assert.equal((await request('GET', '/api/team', undefined, cookie)).status, 200);
});

test('only an upload creator can stage or finalize it; simultaneous retries cannot overwrite chunks', async t => {
  const { data, request, signup } = await fixture(t);
  const owner = (await signup('owner@example.test')).cookie;
  const other = (await signup('other@example.test')).cookie;
  const project = await request('POST', '/api/properties', { title: 'Upload test' }, owner);
  const invite = await request('POST', `/api/properties/${project.json.id}/members`, { email: 'staff@example.test', name: 'Host', as: 'staff' }, owner);
  const token = new URL(invite.json.invite.path, 'https://example.test').searchParams.get('reset');
  const staff = (await request('POST', '/api/auth/reset', { token, password: 'Staff account password' })).cookie;
  const { json: { assetId } } = await request('POST', '/api/assets', {}, owner);
  const audio = Buffer.alloc(32);
  audio.write('ftyp', 4);
  const fileUrl = `/api/assets/${assetId}/files`;
  const chunkUrl = `/api/assets/${assetId}/files/chunk?relPath=voice.m4a&offset=0`;
  assert.equal((await request('POST', '/api/assets', {}, staff)).status, 403);
  for (const cookie of [staff, other]) {
    assert.equal((await request('POST', fileUrl, { relPath: 'voice.m4a' }, cookie)).status, 403);
    assert.equal((await request('PUT', chunkUrl, audio, cookie)).status, 403);
    assert.equal((await request('POST', `/api/assets/${assetId}/finalize?kind=audio`, {}, cookie)).status, 403);
  }
  const unknown = '/api/assets/ast_not_created/files/chunk?relPath=file.bin&offset=0';
  assert.equal((await request('PUT', unknown, audio, owner)).status, 404);
  await assert.rejects(stat(path.join(data, 'uploads-staging', 'ast_not_created')), { code: 'ENOENT' });

  const replies = await Promise.all([request('PUT', chunkUrl, audio, owner), request('PUT', chunkUrl, Buffer.alloc(32, 9), owner)]);
  assert.deepEqual(replies.map(r => r.status).sort(), [200, 409]);
  const expected = replies[0].status === 200 ? audio : Buffer.alloc(32, 9);
  assert.deepEqual(await readFile(path.join(data, 'uploads-staging', assetId, 'voice.m4a')), expected);
  assert.equal((await request('POST', fileUrl, { relPath: 'voice.m4a' }, owner)).json.bytesReceived, 32);
  // A separate valid upload checks that owner checks do not break finalization.
  const good = (await request('POST', '/api/assets', {}, owner)).json.assetId;
  assert.equal((await request('PUT', `/api/assets/${good}/files/chunk?relPath=voice.m4a&offset=0`, audio, owner)).status, 200);
  assert.equal((await request('POST', `/api/assets/${good}/finalize?kind=audio`, {}, owner)).status, 200);
  assert.equal((await request('PUT', `/api/assets/${good}/files/chunk?relPath=voice.m4a&offset=0`, audio, owner)).status, 404, 'completed upload IDs cannot be reused');
});

test('website saves and publishing retain concurrent review comments; corruption refuses a replacement', async t => {
  const { data, request, signup } = await fixture(t);
  const { cookie } = await signup('website@example.test');
  const pid = (await request('POST', '/api/properties', { title: 'Concurrent website' }, cookie)).json.id;
  await request('PUT', `/api/sites/${pid}/draft`, { hero: { title: 'Before' } }, cookie);
  const key = (await request('POST', `/api/sites/${pid}/review`, {}, cookie)).json.key;
  const results = await Promise.all([
    request('PUT', `/api/sites/${pid}/draft`, { hero: { title: 'After' } }, cookie),
    request('POST', `/api/sites/${pid}/publish`, {}, cookie),
    ...Array.from({ length: 8 }, (_, i) => request('POST', `/api/sites/${pid}/review/comments?key=${key}`, { name: 'Reviewer', text: `Comment ${i}` }))
  ]);
  for (const r of results) assert.ok([200, 201].includes(r.status), JSON.stringify(r));
  const saved = (await request('GET', `/api/sites/${pid}/draft`, undefined, cookie)).json;
  assert.equal(saved.draft.hero.title, 'After');
  assert.ok(saved.publishedAt);
  const feedback = (await request('GET', `/api/sites/${pid}/review/feedback`, undefined, cookie)).json;
  assert.equal(feedback.key, key);
  assert.equal(feedback.comments.length, 8);
  assert.equal(new Set(feedback.comments.map(c => c.text)).size, 8);
  const file = path.join(data, 'sites', `${pid}.json`);
  await writeFile(file, '{"broken":');
  assert.equal((await request('PUT', `/api/sites/${pid}/draft`, { hero: { title: 'Replacement' } }, cookie)).status, 500);
  assert.equal(await readFile(file, 'utf8'), '{"broken":');
});

test('stale website tabs cannot overwrite, publish, schedule or share a newer draft', async t => {
  const { request, signup } = await fixture(t);
  const { cookie } = await signup('revisions@example.test');
  const pid = (await request('POST', '/api/properties', { title: 'Revision website' }, cookie)).json.id;
  const url = `/api/sites/${pid}`;
  const first = await request('GET', `${url}/draft`, undefined, cookie);
  assert.ok(first.revision);
  const headers = { 'X-Expected-Revision': first.revision };
  const writes = await Promise.all(['First tab', 'Second tab'].map(title => request('PUT', `${url}/draft`, { ...first.json.draft, hero: { title } }, cookie, headers)));
  assert.deepEqual(writes.map(r => r.status).sort(), [200, 409]);
  const winner = writes.find(r => r.status === 200);
  for (const [action, body] of [['publish', {}], ['schedule', { at: new Date(Date.now() + 86400000).toISOString() }], ['review', {}]]) {
    assert.equal((await request('POST', `${url}/${action}`, body, cookie, headers)).status, 409);
  }
  const latest = await request('GET', `${url}/draft`, undefined, cookie);
  assert.equal(latest.json.draft.hero.title, winner.json.draft.hero.title);
  assert.equal(latest.revision, winner.revision);
  assert.equal((await request('POST', `${url}/publish`, {}, cookie, { 'X-Expected-Revision': latest.revision })).status, 200);
  assert.equal((await request('GET', `${url}/draft`, undefined, cookie)).revision, latest.revision, 'publishing does not invalidate unchanged draft text');
});

test('stale scene saves/publishing and concurrent creation are rejected without replacing newer content', async t => {
  const { request, signup } = await fixture(t);
  const { cookie } = await signup('scene-revisions@example.test');
  const url = '/api/scenes/revision-scene';
  const doc = { id: 'revision-scene', version: 2, title: 'Original', hotspots: [], tracks: [],
    splat: { format: 'lcc2', variants: { high: { assetId: 'fixture', meta: 'meta.lcc2' } } }, spawn: { position: [1, 2, 3], yaw: 0 } };
  assert.equal((await request('PUT', url, doc, cookie, { 'If-None-Match': '*' })).status, 200);
  assert.equal((await request('PUT', url, { ...doc, title: 'Collision' }, cookie, { 'If-None-Match': '*' })).status, 409);
  const first = await request('GET', url, undefined, cookie);
  const headers = { 'X-Expected-Revision': first.revision };
  const results = await Promise.all(['Tab one', 'Tab two'].map(title => request('PUT', url, { ...first.json, title }, cookie, headers)));
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  assert.equal((await request('POST', `${url}/publish`, {}, cookie, headers)).status, 409);
  const latest = await request('GET', url, undefined, cookie);
  assert.equal(latest.json.title, results.find(r => r.status === 200).json.title);
  assert.equal(latest.revision, results.find(r => r.status === 200).revision);
  assert.equal((await request('POST', `${url}/publish`, {}, cookie, { 'X-Expected-Revision': latest.revision })).status, 200);
  assert.equal((await request('GET', url, undefined, cookie)).revision, latest.revision);
});
