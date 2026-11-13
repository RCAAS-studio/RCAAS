import { Object3D, type Camera, type Scene } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

type Position = [number, number, number];
interface Target { id: string; position: Position }

/** World-space translation only. The pivot is a scene sibling, never a child of the scan. */
export function createHotspotControls({ camera, scene, element, target, write, begin, dragging }: {
  camera: Camera;
  scene: Scene;
  element: HTMLElement;
  target: () => Target | null;
  write: (id: string, position: Position) => void;
  begin: () => () => void;
  dragging: (active: boolean) => void;
}) {
  const pivot = new Object3D();
  const controls = new TransformControls(camera, element);
  controls.setMode('translate');
  controls.setSpace('world');
  controls.setSize(0.9);
  // Render above the scan, including splat renderers that do not write depth.
  controls.traverse((object) => { object.renderOrder = 1001; });
  scene.add(pivot, controls);

  let move: { id: string; start: Position; end: () => void } | null = null;
  let pointerId: number | null = null;
  const finish = (cancel = false) => {
    const previous = move;
    move = null;
    controls.dragging = false;
    controls.axis = null;
    if (previous) {
      if (cancel) write(previous.id, previous.start);
      previous.end();
      dragging(false);
    }
    if (pointerId !== null && element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
    pointerId = null;
  };
  const sync = () => {
    const selected = target();
    if (move && selected?.id !== move.id) finish(true);
    if (!selected) {
      controls.detach();
      controls.enabled = false;
      return;
    }
    if (!move) pivot.position.fromArray(selected.position);
    if (controls.object !== pivot) controls.attach(pivot);
    controls.enabled = true;
    pivot.updateMatrixWorld(true);
  };
  const onDragging = (event: { value: unknown }) => {
    if (event.value) {
      const selected = target();
      if (!selected) { controls.dragging = false; return; }
      move = { id: selected.id, start: [...selected.position], end: begin() };
      dragging(true);
    } else if (move) {
      finish();
    }
  };
  const onChange = () => {
    if (!move) return;
    const position = pivot.position.toArray() as Position;
    if (position.every(Number.isFinite)) write(move.id, position);
  };
  const onDown = (event: PointerEvent) => {
    if (controls.dragging) pointerId = event.pointerId;
  };
  const cancel = () => { finish(true); sync(); };
  const onKey = (event: KeyboardEvent) => {
    controls.setTranslationSnap(event.ctrlKey ? 0.1 : null);
    if (event.type === 'keydown' && event.key === 'Escape' && move) {
      event.preventDefault();
      event.stopImmediatePropagation();
      cancel();
    }
  };
  const onHidden = () => { if (document.visibilityState === 'hidden') cancel(); };
  controls.addEventListener('dragging-changed', onDragging);
  controls.addEventListener('objectChange', onChange);
  element.addEventListener('pointerdown', onDown);
  element.addEventListener('pointercancel', cancel);
  element.addEventListener('lostpointercapture', cancel);
  window.addEventListener('blur', cancel);
  window.addEventListener('keydown', onKey, { capture: true });
  window.addEventListener('keyup', onKey, { capture: true });
  document.addEventListener('visibilitychange', onHidden);
  sync();

  return {
    controls,
    sync,
    dispose() {
      cancel();
      controls.removeEventListener('dragging-changed', onDragging);
      controls.removeEventListener('objectChange', onChange);
      element.removeEventListener('pointerdown', onDown);
      element.removeEventListener('pointercancel', cancel);
      element.removeEventListener('lostpointercapture', cancel);
      window.removeEventListener('blur', cancel);
      window.removeEventListener('keydown', onKey, { capture: true });
      window.removeEventListener('keyup', onKey, { capture: true });
      document.removeEventListener('visibilitychange', onHidden);
      controls.detach();
      controls.dispose();
      scene.remove(controls, pivot);
    },
  };
}
