import { test } from 'node:test';
import assert from 'node:assert/strict';
import { knownMarketingPath } from '../src/features/marketing/routeMatch.ts';
import { ROUTES } from '../src/features/marketing/types/index.ts';
import { getScene, saveScene, publishSceneNow, getSiteDraft, saveSiteDraft, publishSite, uploadAssetChunk, assetUrl, assetPathUrl, studioAssetContext } from '../src/lib/api.ts';

test('studio asset URLs keep host-only cookies on the studio origin; public URLs keep the public API', t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const settings = { studio: process.env.NEXT_PUBLIC_STUDIO_URL, base: process.env.NEXT_PUBLIC_BASE_PATH };
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'window', previous); else delete globalThis.window;
    for (const [name, value] of [['NEXT_PUBLIC_STUDIO_URL', settings.studio], ['NEXT_PUBLIC_BASE_PATH', settings.base]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  });
  const at = (pathname, origin = 'https://rcaas.test') => Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { pathname, origin } } });
  delete process.env.NEXT_PUBLIC_BASE_PATH;
  at('/gallery'); const publicUrl = assetUrl('ast_fixture', 'scan.lcc2'); assert.match(publicUrl, /^https?:/);
  at('/studio/project/edit'); assert.equal(assetUrl('ast_fixture', 'scan.lcc2'), '/api/assets/ast_fixture/scan.lcc2');
  assert.equal(assetPathUrl('site_project/image.png?v=1'), '/api/assets/site_project/image.png?v=1');
  process.env.NEXT_PUBLIC_STUDIO_URL = 'https://studio.rcaas.test';
  at('/', 'https://studio.rcaas.test'); assert.equal(studioAssetContext(), true);
  process.env.NEXT_PUBLIC_BASE_PATH = '/repo';
  at('/repo/studio/project'); assert.equal(assetUrl('ast_fixture', 'scan.lcc2'), '/repo/api/assets/ast_fixture/scan.lcc2');
  at('/repo/gallery'); assert.equal(assetUrl('ast_fixture', 'scan.lcc2'), publicUrl);
});

test('marketing routes accept every listed page but reject unknown descendants', () => {
  for (const path of ROUTES) {
    assert.equal(knownMarketingPath(path, ROUTES, false), true, path);
    assert.equal(knownMarketingPath(path.replace(/\/$/, ''), ROUTES, false), true, path);
    assert.equal(knownMarketingPath(`${path}?campaign=test#section`, ROUTES, false), true, path);
    assert.equal(knownMarketingPath(`${path}not-a-real-page/`, ROUTES, false), false, path);
  }
  assert.equal(knownMarketingPath('/blog/real-post/', ROUTES, true), true);
  assert.equal(knownMarketingPath('/blog/missing/', ROUTES, false), false);
  assert.equal(knownMarketingPath('/about/extra/', ROUTES, true), false);
});

test('a dropped chunk response retries the same offset and accepts server resumption', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) throw new TypeError('Response lost after upload');
    return new Response(JSON.stringify({ bytesReceived: 3 }), { status: 409 });
  });
  assert.deepEqual(await uploadAssetChunk('fixture', 'file.bin', 0, new Blob(['abc'])), { ok: false, bytesReceived: 3 });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, calls[1].url);
  assert.equal(calls[0].options.body, calls[1].options.body);
});

test('upload retries are bounded and authorization/progress errors fail immediately', async t => {
  let calls = 0, status = 503;
  t.mock.method(globalThis, 'fetch', async () => { calls++; return new Response(JSON.stringify({ error: 'Upload unavailable' }), { status }); });
  await assert.rejects(uploadAssetChunk('fixture', 'file.bin', 0, new Blob(['abc'])), /Upload unavailable/);
  assert.equal(calls, 4);
  calls = 0; status = 403;
  await assert.rejects(uploadAssetChunk('fixture', 'file.bin', 0, new Blob(['abc'])), /Upload unavailable/);
  assert.equal(calls, 1);
  calls = 0; status = 200;
  await assert.rejects(uploadAssetChunk('fixture', 'file.bin', 0, new Blob(['abc'])), /invalid progress/);
  assert.equal(calls, 1);
});

test('the frontend sends the loaded revision and does not advance it after a conflict', async t => {
  const calls = [];
  let conflict = false;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    if (conflict) return new Response(JSON.stringify({ error: 'Draft changed elsewhere' }), { status: 409, headers: { 'X-Draft-Revision': 'other-tab' } });
    return new Response(JSON.stringify({ draft: {}, published: true }), { status: 200, headers: { 'X-Draft-Revision': options.method ? 'saved' : 'loaded' } });
  });
  await getScene('audit-revision');
  await saveScene('audit-revision', {});
  assert.equal(calls.at(-1).options.headers['X-Expected-Revision'], 'loaded');
  conflict = true;
  await assert.rejects(saveScene('audit-revision', {}), /Draft changed elsewhere/);
  await assert.rejects(publishSceneNow('audit-revision'), /Draft changed elsewhere/);
  assert.equal(calls.at(-1).options.headers['X-Expected-Revision'], 'saved');
  conflict = false;
  await getSiteDraft('audit-site');
  await saveSiteDraft('audit-site', {});
  assert.equal(calls.at(-1).options.headers['X-Expected-Revision'], 'loaded');
  await publishSite('audit-site');
  assert.equal(calls.at(-1).options.headers['X-Expected-Revision'], 'saved');
  await saveScene('brand-new-audit-scene', {}, { createOnly: true });
  // request() normalises header names through Headers (lower case); HTTP names are case-insensitive.
  const sent = new Headers(calls.at(-1).options.headers);
  assert.equal(sent.get('If-None-Match'), '*');
  assert.equal(sent.get('Content-Type'), 'application/json');
});
