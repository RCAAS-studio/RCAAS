import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';

registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && context.parentURL?.includes('/src/')) {
    const ts = new URL(`${specifier}.ts`, context.parentURL);
    if (existsSync(ts)) return next(ts.href, context);
  }
  return next(specifier, context);
} });
globalThis.window = new EventTarget();
const doc = await import('../src/features/scene/sceneDoc.ts');
const scenes = await import('../src/features/scene/scenes.ts');
const history = await import('../src/features/studio/history.ts');
const actions = await import('../src/features/studio/draftActions.ts');
const { ApiError } = await import('../src/lib/api.ts');

async function fixture(t, id) {
  const source = { ...doc.blankSceneDoc(id, 'Original lobby', { high: { assetId: 'ast_fixture', meta: 'scan.lcc2' } }, 'project'),
    hotspots: [{ id: 'welcome', type: 'text', label: 'Welcome', position: [1, 2, 3], radius: 0.4, payload: { text: 'Original' } }],
    building: 'Main', floor: 'Ground', night: null };
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(source), { headers: { 'X-Draft-Revision': 'original' } }));
  await actions.reloadDraft(id);
  return source;
}

test('undo/redo includes scene title, place, night link, colour and calibration from the first edit', async t => {
  const id = 'history-fields';
  await fixture(t, id);
  const before = structuredClone(doc.sceneDocFor(id));
  const stop = history.watchHistory(id);
  try {
    scenes.renameScene(id, 'Renamed lobby');
    scenes.setPlace(id, { building: 'Annex', floor: '2' });
    scenes.setNight(id, 'night-room');
    doc.setLook(id, { brightness: 1.25, saturation: 0.8 });
    doc.setUnitScale(id, 2);
    const changed = structuredClone(doc.sceneDocFor(id));
    history.undo(id); // no wait for the 400 ms debounce
    assert.deepEqual(doc.sceneDocFor(id), before);
    assert.equal(doc.hasUnsavedChanges(id), false);
    history.redo(id);
    assert.deepEqual(doc.sceneDocFor(id), changed);
    assert.equal(doc.hasUnsavedChanges(id), true);
  } finally { stop(); }
});

test('edits made while a save is in flight remain dirty, including nested hotspot payloads', async t => {
  const id = 'pending-save';
  await fixture(t, id);
  doc.updateHotspot(id, 'welcome', { label: 'First edit' });
  let finish, sent;
  const started = new Promise(resolve => t.mock.method(globalThis, 'fetch', async (_url, options) => {
    sent = JSON.parse(options.body); resolve();
    return new Promise(done => { finish = () => done(new Response('{}', { headers: { 'X-Draft-Revision': 'saved' } })); });
  }));
  const saving = actions.saveDraft(id);
  await started;
  doc.updateHotspot(id, 'welcome', { label: 'Newer edit', payload: { text: 'Typed during save' } });
  finish(); await saving;
  assert.equal(sent.hotspots[0].label, 'First edit');
  assert.equal(doc.sceneDocFor(id).hotspots[0].label, 'Newer edit');
  assert.equal(doc.hasUnsavedChanges(id), true);
});

test('conflicts retain a downloadable local draft; failed reload preserves it and successful reload resets history', async t => {
  const id = 'conflict-recovery';
  const original = await fixture(t, id);
  scenes.renameScene(id, 'My local work');
  doc.setUnitScale(id, 3);
  history.record(id);
  const backup = actions.draftBackup(id);
  t.mock.method(globalThis, 'fetch', async () => new Response('{"error":"Changed elsewhere"}', { status: 409 }));
  await assert.rejects(actions.saveDraft(id), error => error instanceof ApiError && error.status === 409);
  assert.equal(actions.draftBackup(id), backup);
  await assert.rejects(actions.reloadDraft(id), /could not be loaded/);
  assert.equal(actions.draftBackup(id), backup);
  assert.equal(history.canUndo(id), true);
  const remote = { ...original, title: 'Other editor', building: 'North', floor: 'First', unitScale: 0.5,
    night: 'remote-night', spawn: { position: [4, 5, 6], yaw: 0.8, eyeHeight: 1.65 }, look: { brightness: 0.9, contrast: 1, saturation: 1 } };
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(remote), { headers: { 'X-Draft-Revision': 'remote' } }));
  await actions.reloadDraft(id);
  const loaded = doc.sceneDocFor(id);
  for (const key of ['title', 'building', 'floor', 'night', 'unitScale', 'look', 'spawn']) assert.deepEqual(loaded[key], remote[key]);
  assert.equal(doc.hasUnsavedChanges(id), false);
  assert.equal(history.canUndo(id), false);
  assert.equal(history.canRedo(id), false);
  history.undo(id);
  assert.equal(doc.sceneDocFor(id).title, 'Other editor', 'old local work cannot reappear through stale undo');
  assert.equal(JSON.parse(backup).title, 'My local work');
});

test('saving without a loaded baseline refuses an unavailable draft and never sends a blind PUT', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    calls.push(options.method ?? 'GET');
    return new Response('{"error":"No access"}', { status: 403 });
  });
  await assert.rejects(actions.saveDraft('never-loaded'), /could not be loaded/);
  assert.deepEqual(calls, ['GET']);
});

test('hierarchy search combines words across labels, types and locations without changing content', () => {
  assert.equal(actions.matchesHierarchy('GROUND lobby', 'Lobby', 'Main block', 'Ground floor'), true);
  assert.equal(actions.matchesHierarchy('audio स्वागत', 'स्वागत', 'audio'), true);
  assert.equal(actions.matchesHierarchy('夜景', '夜景大厅', 'room'), true);
  assert.equal(actions.matchesHierarchy('hall rooftop', 'Hall', 'Ground floor'), false);
  assert.equal(actions.matchesHierarchy('  ', undefined, ''), true);
});
