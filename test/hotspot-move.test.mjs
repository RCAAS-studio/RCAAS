import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { getEventListeners } from 'node:events';
import { PerspectiveCamera, Scene, Vector3, Object3D } from 'three';
import { createHotspotControls } from '../src/features/studio/hotspotControls.ts';

// The application uses bundler-style extensionless TypeScript imports.
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && context.parentURL?.includes('/src/')) {
    const ts = new URL(`${specifier}.ts`, context.parentURL);
    if (existsSync(ts)) return next(ts.href, context);
  }
  return next(specifier, context);
} });

globalThis.window = new EventTarget();
globalThis.document = Object.assign(new EventTarget(), { pointerLockElement: null, visibilityState: 'visible' });

class Canvas extends EventTarget {
  style = {};
  ownerDocument = document;
  captures = new Set();
  getBoundingClientRect() { return { left: 0, top: 0, width: 1000, height: 800 }; }
  setPointerCapture(id) { this.captures.add(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
}

const close = (actual, expected) => actual.forEach((n, i) => assert.ok(Math.abs(n - expected[i]) < 1e-6, `${actual} != ${expected}`));
function fixture(offset = [6, 4, 8]) {
  const scene = new Scene();
  const scan = new Object3D();
  scan.position.set(8, -3, 11);
  scan.rotation.set(0.5, 1.2, -0.3);
  scan.scale.setScalar(3);
  scene.add(scan);
  const camera = new PerspectiveCamera(60, 1.25, 0.01, 1000);
  camera.position.fromArray([1, 2, 3]).add(new Vector3(...offset));
  camera.lookAt(1, 2, 3);
  camera.updateMatrixWorld();
  const entries = [{ id: 'a', position: [1, 2, 3] }, { id: 'b', position: [-4, 5, 2] }];
  let selected = 'a', busy = false, starts = 0, ends = 0;
  const element = new Canvas();
  const handles = createHotspotControls({
    scene, camera, element,
    target: () => entries.find(h => h.id === selected) ?? null,
    write: (id, position) => { const h = entries.find(h => h.id === id); if (h) h.position = [...position]; handles.sync(); },
    begin: () => { starts++; return () => { ends++; }; },
    dragging: value => { busy = value; },
  });
  scene.updateMatrixWorld(true);
  const pointer = (point, button) => { const p = point.clone().project(camera); return { x: p.x, y: p.y, button }; };
  const grab = axis => {
    scene.updateMatrixWorld(true);
    const direction = new Vector3().setComponent('XYZ'.indexOf(axis), 1);
    const scale = camera.position.distanceTo(handles.controls.object.position) * 1.9 * Math.tan(Math.PI / 6) * 0.9 / 4;
    let start;
    // Either end of the arrow can face the camera; use a visible shaft/tip.
    for (const fraction of [0.45, -0.45, 0.55, -0.55]) {
      start = handles.controls.object.position.clone().addScaledVector(direction, fraction * scale);
      handles.controls.pointerHover(pointer(start, 0));
      if (handles.controls.axis === axis) break;
    }
    assert.equal(handles.controls.axis, axis, 'the visible arrow is actually pickable');
    scene.updateMatrixWorld(true);
    handles.controls.pointerDown(pointer(start, 0));
    assert.equal(busy, true);
    return delta => handles.controls.pointerMove(pointer(start.clone().addScaledVector(direction, delta), -1));
  };
  return { scene, camera, scan, entries, element, handles, grab,
    select: id => { selected = id; handles.sync(); },
    status: () => ({ busy, starts, ends }),
  };
}

test('real arrow picking and dragging change only the chosen world axis from eight viewing directions', () => {
  for (const offset of [[6,4,8],[-6,4,8],[6,4,-8],[-6,4,-8],[2,10,2],[-2,-10,2],[10,2,2],[2,2,-10]]) {
    for (const [i, axis] of [...'XYZ'].entries()) {
      const f = fixture(offset);
      try {
        const scanBefore = f.scan.matrix.toArray();
        const cameraBefore = f.camera.matrixWorld.toArray();
        const move = f.grab(axis);
        move(0.37);
        const expected = [1,2,3]; expected[i] += 0.37;
        close(f.entries[0].position, expected);
        f.handles.controls.pointerUp({button:0});
        assert.deepEqual(f.status(), {busy:false, starts:1, ends:1});
        assert.deepEqual(f.entries[1].position, [-4,5,2]);
        assert.deepEqual(f.scan.matrix.toArray(), scanBefore);
        assert.deepEqual(f.camera.matrixWorld.toArray(), cameraBefore);
      } finally { f.handles.dispose(); }
    }
  }
});

test('Ctrl snapping and Escape restore the complete starting position', () => {
  const f = fixture();
  try {
    const move = f.grab('X');
    window.dispatchEvent(Object.assign(new Event('keydown'), {key:'Control', ctrlKey:true}));
    move(0.37);
    close(f.entries[0].position, [1.4,2,3]);
    const esc = Object.assign(new Event('keydown', {cancelable:true}), {key:'Escape', ctrlKey:false});
    window.dispatchEvent(esc);
    assert.equal(esc.defaultPrevented, true);
    close(f.entries[0].position, [1,2,3]);
    assert.deepEqual(f.status(), {busy:false, starts:1, ends:1});
    move(1);
    close(f.entries[0].position, [1,2,3]);
  } finally { f.handles.dispose(); }
});

test('camera orbiting never changes the saved point; exact end-on axes remain stable and coordinates still work', () => {
  const f = fixture();
  try {
    for (const [axisIndex, axis] of [...'XYZ'].entries()) {
      for (const sign of [-1, 1]) {
        f.camera.position.fromArray(f.entries[0].position).setComponent(axisIndex, f.entries[0].position[axisIndex] + sign * 10);
        f.camera.lookAt(...f.entries[0].position);
        f.camera.updateMatrixWorld();
        f.scene.updateMatrixWorld(true);
        close(f.entries[0].position, [1,2,3]);
        const visibleAxis = [];
        f.handles.controls.traverseVisible(o => { if (o.name === axis && o.isMesh) visibleAxis.push(o); });
        assert.equal(visibleAxis.length, 0, 'an axis aimed straight at the camera is hidden instead of jumping');
      }
    }
    f.entries[0].position = [4,-2,8];
    f.handles.sync();
    close(f.handles.controls.object.position.toArray(), [4,-2,8]);
    assert.deepEqual(f.status(), {busy:false, starts:0, ends:0});
  } finally { f.handles.dispose(); }
});

test('blur, pointer cancellation, lost capture and disposal release the drag and restore the hotspot', () => {
  for (const reason of ['blur','pointercancel','lostpointercapture','dispose']) {
    const f = fixture();
    f.grab('Z')(0.5);
    if (reason === 'dispose') f.handles.dispose();
    else {
      (reason === 'blur' ? window : f.element).dispatchEvent(new Event(reason));
      f.handles.dispose();
    }
    close(f.entries[0].position, [1,2,3]);
    assert.deepEqual(f.status(), {busy:false, starts:1, ends:1});
    assert.deepEqual(f.scene.children, [f.scan], 'no leftover gizmo or pivot');
    assert.equal(getEventListeners(window, 'keydown').length, 0);
  }
});

test('switching selection or removing a hotspot cannot move the next hotspot or resurrect a deleted one', () => {
  const f = fixture();
  try {
    f.grab('X')(0.5);
    f.select('b');
    close(f.entries[0].position, [1,2,3]);
    close(f.handles.controls.object.position.toArray(), [-4,5,2]);
    f.select('a');
    f.grab('Y')(0.5);
    f.entries.shift();
    f.handles.sync();
    assert.equal(f.handles.controls.enabled, false);
    assert.equal(f.handles.controls.object, undefined);
    assert.equal(f.entries.length, 1);
    close(f.entries[0].position, [-4,5,2]);
    assert.equal(f.status().busy, false);
  } finally { f.handles.dispose(); }
});

test('a paused drag is one undo step and exported coordinates preserve the rest of the scene', async t => {
  const doc = await import('../src/features/scene/sceneDoc.ts');
  const history = await import('../src/features/studio/history.ts');
  const id = 'hotspot-move-test';
  const hotspot = { id:'test', type:'text', label:'Keep my label', position:[1,2,3], radius:0.4, payload:{text:'Keep my content'} };
  const saved = doc.blankSceneDoc(id, 'Move test', {}, 'project');
  doc.setHotspots(id, [hotspot]);
  doc.markSaved(id, saved);
  const before = structuredClone(doc.sceneDocFor(id));
  history.record(id);
  t.mock.timers.enable({apis:['setTimeout']});
  const stop = history.watchHistory(id);
  try {
    const end = history.beginHistoryGroup(id);
    doc.updateHotspot(id, 'test', {position:[2,2,3]});
    t.mock.timers.tick(500);
    doc.updateHotspot(id, 'test', {position:[3,2,3]});
    t.mock.timers.tick(500);
    history.undo(id); // ignored while the pointer still owns the move
    close(doc.hotspotsFor(id)[0].position, [3,2,3]);
    end();
    const after = structuredClone(doc.sceneDocFor(id));
    const expected = structuredClone(before);
    expected.hotspots[0].position = [3,2,3];
    assert.deepEqual(after, expected);
    history.undo(id);
    close(doc.hotspotsFor(id)[0].position, [1,2,3]);
    assert.equal(history.canUndo(id), false);
    history.redo(id);
    close(doc.hotspotsFor(id)[0].position, [3,2,3]);
    t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(after), {status:200}));
    doc.updateHotspot(id, 'test', {position:[99,99,99]});
    await doc.loadSceneDoc(id, 'draft', {force:true});
    assert.deepEqual(doc.hotspotsFor(id), after.hotspots, 'saved hotspot coordinates and payload survive a reload');
  } finally { stop(); }
});
