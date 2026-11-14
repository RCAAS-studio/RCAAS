/**
 * Step-by-step undo and redo in the scene editor (2026-09-28), next to the
 * version history's save points. After each change settles (0.4 s: a whole
 * gizmo drag is one step), a snapshot of what the studio edits in the open
 * space — hotspots, collision boxes, camera tracks, the model's placement, the start view,
 * Book now — goes on its undo stack. Undo puts the one before back into the
 * stores; nothing is saved until "Save space", as with any other edit.
 * Per space, up to 100 steps, for as long as the tab is open.
 */
import { bookingFor, collidersFor, docLoaded, hotspotsFor, sceneDocFor, setBookingOutright, setColliders, setHotspots, subscribeDoc, subscribeDraftReset, setLook, DEFAULT_LOOK, setUnitScale } from '../scene/sceneDoc';
import { loadTracks, subscribeViewpoints } from '../scene/viewpoints';
import { loadTransform, subscribeTransform, transformFor } from '../scene/transform';
import { setSessionSpawn, spawnFor, subscribeSpawn, renameScene, setNight, setPlace } from '../scene/scenes';
import type { Hotspot } from '../../@types/hotspot.types';
import type { Booking, Collider, Track, SceneLook } from '../../@types/scene.types';

interface Snap { hotspots: Hotspot[]; colliders: Collider[]; tracks: Track[]; transform: ReturnType<typeof transformFor>; spawn: ReturnType<typeof spawnFor>; booking: Booking | null;
  title: string; night: string | null; building: string; floor: string; look: SceneLook | null; unitScale: number }

const MAX = 100;
const past: Record<string, string[]> = {};
const future: Record<string, string[]> = {};
const groups = new Set<string>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());
export const subscribeHistory = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

const snapOf = (sceneId: string) => {
  const doc = sceneDocFor(sceneId);
  return JSON.stringify({
    hotspots: hotspotsFor(sceneId), colliders: collidersFor(sceneId), tracks: doc.tracks, transform: transformFor(sceneId),
    spawn: spawnFor(sceneId), booking: bookingFor(sceneId), title: doc.title, night: doc.night ?? null,
    building: doc.building ?? '', floor: doc.floor ?? '', look: doc.look ?? null, unitScale: doc.unitScale
  } satisfies Snap);
};

/** A confirmed server reload becomes the new undo baseline. */
export function resetHistory(sceneId: string) {
  groups.delete(sceneId);
  past[sceneId] = docLoaded(sceneId) ? [snapOf(sceneId)] : [];
  future[sceneId] = [];
  emit();
}
subscribeDraftReset(resetHistory);

/** Note the space as it is now, if it changed. The first note, once its draft is read, is where undo stops. */
export function record(sceneId: string) {
  if (groups.has(sceneId) || !docLoaded(sceneId)) return;
  const s = snapOf(sceneId);
  const stack = (past[sceneId] ??= []);
  if (stack[stack.length - 1] === s) return;
  stack.push(s);
  if (stack.length > MAX) stack.shift();
  future[sceneId] = [];
  emit();
}

/** Keep a continuous pointer gesture in one undo step, including pauses mid-drag. */
export function beginHistoryGroup(sceneId: string): () => void {
  record(sceneId);
  groups.add(sceneId);
  let ended = false;
  return () => {
    if (ended) return;
    ended = true;
    groups.delete(sceneId);
    record(sceneId);
  };
}

function apply(sceneId: string, json: string) {
  const s = JSON.parse(json) as Snap;
  setHotspots(sceneId, s.hotspots);
  setColliders(sceneId, s.colliders ?? []);
  loadTracks(sceneId, s.tracks, { replace: true });
  loadTransform(sceneId, s.transform);
  setSessionSpawn(sceneId, s.spawn.spawn, s.spawn.yaw);
  setBookingOutright(sceneId, s.booking);
  renameScene(sceneId, s.title);
  setNight(sceneId, s.night);
  setPlace(sceneId, { building: s.building, floor: s.floor });
  setLook(sceneId, s.look ?? DEFAULT_LOOK);
  setUnitScale(sceneId, s.unitScale);
}

export const canUndo = (sceneId: string) => (past[sceneId]?.length ?? 0) > 1;
export const canRedo = (sceneId: string) => (future[sceneId]?.length ?? 0) > 0;

export function undo(sceneId: string) {
  if (groups.has(sceneId)) return;
  record(sceneId); // a change still settling counts as a step
  if (!canUndo(sceneId)) return;
  (future[sceneId] ??= []).push(past[sceneId].pop()!);
  apply(sceneId, past[sceneId][past[sceneId].length - 1]);
  emit();
}

export function redo(sceneId: string) {
  if (groups.has(sceneId)) return;
  if (!canRedo(sceneId)) return;
  const s = future[sceneId].pop()!;
  past[sceneId].push(s);
  apply(sceneId, s);
  emit();
}

/** Keep the open space's history: note each change once it settles; Ctrl/⌘+Z undo, Ctrl+Y or Ctrl/⌘+Shift+Z redo
 *  (typing in a box keeps the browser's own undo). Returns the cleanup. */
export function watchHistory(sceneId: string): () => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  const settle = () => { clearTimeout(t); t = setTimeout(() => record(sceneId), 400); };
  const offs = [subscribeDoc(settle), subscribeViewpoints(settle), subscribeTransform(settle), subscribeSpawn(settle)];
  record(sceneId); // capture the initial state before the first quick edit
  const keys = (e: KeyboardEvent) => {
    if (!(e.ctrlKey || e.metaKey) || (e.target as HTMLElement)?.closest?.('input, textarea, select, [contenteditable]')) return;
    const k = e.key.toLowerCase();
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(sceneId); }
    else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redo(sceneId); }
  };
  window.addEventListener('keydown', keys);
  return () => { clearTimeout(t); offs.forEach((off) => off()); window.removeEventListener('keydown', keys); };
}
