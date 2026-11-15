import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';

// upload.ts imports without extensions, as Next resolves them (same hook as studio-drafts.test.mjs)
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && context.parentURL?.includes('/src/')) {
    const ts = new URL(`${specifier}.ts`, context.parentURL);
    if (existsSync(ts)) return next(ts.href, context);
  }
  return next(specifier, context);
} });
const { uploadAudio, rememberedUpload, uploadFingerprint } = await import('../src/features/studio/upload.ts');

/** A fake API holding staged bytes per upload, driving the studio's real upload code. */
function fakeApi(t) {
  const uploads = new Map(), log = [];
  let next = 0, finalizeStatus = 200;
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
  t.mock.method(globalThis, 'fetch', async (url, options = {}) => {
    const { pathname, searchParams } = new URL(String(url), 'http://studio.test');
    const method = options.method ?? 'GET';
    log.push(`${method} ${pathname}`);
    if (method === 'POST' && pathname === '/api/assets') { const id = `ast_fake${++next}`; uploads.set(id, 0); return json({ assetId: id }); }
    const id = pathname.split('/')[3];
    if (!uploads.has(id)) return json({ error: 'This upload is no longer available. Start the upload again.' }, 404);
    if (pathname.endsWith('/files')) return json({ relPath: JSON.parse(options.body).relPath, bytesReceived: uploads.get(id) });
    if (pathname.endsWith('/files/chunk')) {
      if (Number(searchParams.get('offset')) !== uploads.get(id)) return json({ bytesReceived: uploads.get(id) }, 409);
      uploads.set(id, uploads.get(id) + options.body.size);
      return json({ bytesReceived: uploads.get(id) });
    }
    if (pathname.endsWith('/finalize')) {
      if (finalizeStatus !== 200) return json({ error: 'Storage upload failed (ServiceUnavailable).' }, finalizeStatus);
      uploads.delete(id);
      return json({ assetId: id, file: 'narration.m4a' });
    }
    return json({ error: 'unexpected' }, 500);
  });
  return { uploads, log, failFinalize: (status) => { finalizeStatus = status; } };
}

test('an upload picked again after a reload resumes, retries finalize, and restarts when the server removed it', async t => {
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)) };
  t.after(() => { delete globalThis.localStorage; });
  const api = fakeApi(t);
  const file = new File([new Uint8Array(300_000).fill(5)], 'narration.m4a', { lastModified: 1_700_000_000_000 });
  const print = await uploadFingerprint([{ relPath: 'narration.m4a', file }]);

  api.failFinalize(502);
  await assert.rejects(uploadAudio(file, () => {}), /ServiceUnavailable/);
  assert.equal(rememberedUpload(print), 'ast_fake1', 'a failed finalize keeps the upload to resume');

  api.failFinalize(200);
  const sent = [];
  api.log.length = 0;
  assert.equal(await uploadAudio(file, p => sent.push(p.bytesSent)), 'asset://ast_fake1/narration.m4a');
  assert.ok(!api.log.includes('POST /api/assets'), 'no new upload is created');
  assert.ok(!api.log.some(l => l.endsWith('/files/chunk')), 'no byte is sent twice');
  assert.deepEqual(sent, [300_000]);
  assert.equal(rememberedUpload(print), null, 'a finished upload is forgotten');

  api.failFinalize(502);
  await assert.rejects(uploadAudio(file, () => {}));
  api.uploads.delete(rememberedUpload(print)); // removed on the server (Storage → idle uploads)
  api.failFinalize(200);
  assert.equal(await uploadAudio(file, () => {}), 'asset://ast_fake3/narration.m4a', 'a removed upload starts afresh');

  const changed = new File([new Uint8Array(300_000).fill(5)], 'narration.m4a', { lastModified: 1_700_000_999_000 });
  assert.notEqual(await uploadFingerprint([{ relPath: 'narration.m4a', file: changed }]), print, 'an edited file never resumes old bytes');
});
