/* The author's marks on a space's floor plan (2026-10-14): rooms traced
 * corner by corner and doors and windows side to side, in the scan's own
 * frame (server floorplan.js markUp follows them on the next redraw). One
 * space's marks at a time, shared by the Floor plan section (the list) and
 * PlanMarker (the 3D tool). Every change is saved whole, straight away.
 * The store pattern of sceneDoc.ts: module state + emit + subscribe. */
import { assetUrl, saveFloorPlanMarks, type PlanMarks } from '../../lib/api';

const EMPTY: PlanMarks = { rooms: [], openings: [] };
const state = { assetId: '', marks: EMPTY, error: '', changed: false };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const planMarks = () => state;
export const subscribePlanMarks = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

/** This space's marks, from its asset (none yet: empty). */
export async function loadPlanMarks(assetId: string) {
  if (state.assetId === assetId) return;
  Object.assign(state, { assetId, marks: EMPTY, error: '', changed: false });
  emit();
  try {
    const r = await fetch(`${assetUrl(assetId, 'floorplan/marks.json')}?v=${Date.now()}`);
    const m = r.ok ? ((await r.json()) as PlanMarks) : EMPTY;
    if (state.assetId === assetId) { state.marks = { rooms: m.rooms ?? [], openings: m.openings ?? [] }; emit(); }
  } catch { /* none yet */ }
}

/** Change the marks and save them; `changed` until the plan is redrawn. */
export async function setPlanMarks(next: PlanMarks) {
  const assetId = state.assetId;
  Object.assign(state, { marks: next, changed: true, error: '' });
  emit();
  try {
    await saveFloorPlanMarks(assetId, next);
  } catch (e) {
    if (state.assetId === assetId) { state.error = (e as Error).message; emit(); }
  }
}

/** After a redraw: the plan follows the marks again. */
export const planMarksDrawn = () => { state.changed = false; emit(); };
