'use client';

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import './planmarks.css';
import type { EditorApi } from '../../@types/app.types';
import type { PlanMarks, ScanPoint } from '../../lib/api';
import { planMarks, setPlanMarks, subscribePlanMarks } from './planMarks';

export type PlanTool = 'room' | 'door' | 'window';
type P3 = [number, number, number];
type Spot = { x: number; y: number; front: boolean };
/** A point of a mark: a corner of a traced room, an end of an opening, or one of the mark being made. */
type Ref = { k: 'room'; i: number; j: number } | { k: 'open'; i: number; end: 'a' | 'b' } | { k: 'draft'; j: number };
const keyOf = (r: Ref) => (r.k === 'room' ? `r${r.i}.${r.j}` : r.k === 'open' ? `o${r.i}${r.end}` : `d${r.j}`);

const canvasEl = () => document.querySelector<HTMLCanvasElement>('.app-root canvas');
const NAME: Record<PlanTool, string> = { room: 'Trace a room', door: 'Mark a door', window: 'Mark a window' };
const HELP: Record<PlanTool, string> = {
  room: 'Click each corner of the room in turn, on the floor or anywhere up the wall, then click the first corner again.',
  door: 'Click one side of the doorway, then the other.',
  window: 'Click one side of the window, then the other.'
};

/** Square metres inside a traced outline (the scan's frame is in metres). */
const area = (c: ScanPoint[]) => Math.abs(c.reduce((s, p, i) => { const q = c[(i + 1) % c.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;

/**
 * Marks for the floor plan, in 3D (2026-10-14): trace a room corner by
 * corner, or mark a door or a window by both its sides, and the next redraw
 * follows them (server floorplan.js markUp: your outline, snapped onto the
 * scanned walls). Click the point on the scan, or aim the centre dot at it
 * and press Enter ("record where I am", for walking the space and marking as
 * you go: the dot, not the camera, which keeps clear of the walls). Points
 * land on the scan's surface (EditorApi.surfaceAt), are kept in the scan's
 * own frame (toScan) and drawn over the view every frame; drag any of them
 * to move it. A drag of the view still looks around. Studio only.
 */
export function PlanMarker({ editor, mode, onMode, onClose }: {
  editor: EditorApi;
  mode: PlanTool;
  onMode: (m: PlanTool) => void;
  onClose: () => void;
}) {
  const [marks, setMarks] = useState<PlanMarks>(planMarks().marks);
  const [draft, setDraft] = useState<ScanPoint[]>([]);
  const [spots, setSpots] = useState<Record<string, Spot>>({});
  const [miss, setMiss] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const marksRef = useRef(marks);
  marksRef.current = marks;
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const spotsRef = useRef(spots);
  spotsRef.current = spots;
  // the point being dragged, and where the pointer wants it (picked once a frame)
  const grab = useRef<{ ref: Ref; dx: number; dy: number; x0: number; y0: number } | null>(null);
  const want = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => subscribePlanMarks(() => { if (!grab.current) setMarks(planMarks().marks); }), []);

  // a point of the scan, in its own frame, under a point of the window (or the centre dot)
  const pick = (x?: number, y?: number): ScanPoint | null => {
    const r = canvasEl()?.getBoundingClientRect();
    if (!r) return null;
    const p = editor.surfaceAt(x === undefined ? r.width / 2 : x - r.left, y === undefined ? r.height / 2 : y - r.top);
    const s = p && editor.toScan(p);
    setMiss(!s);
    return s ? (s.map((n) => Math.round(n * 1000) / 1000) as ScanPoint) : null;
  };
  const closeRoom = () => {
    const corners = draftRef.current;
    if (corners.length < 3) return;
    setPlanMarks({ ...marksRef.current, rooms: [...marksRef.current.rooms, { corners }] });
    setDraft([]);
  };
  const add = (p: ScanPoint | null) => {
    if (!p) return;
    const d = draftRef.current, m = modeRef.current;
    if (m === 'room') { setDraft([...d, p]); return; }
    if (!d.length) { setDraft([p]); return; }
    if (Math.hypot(p[0] - d[0][0], p[1] - d[0][1]) < 0.2) return; // a double click, not the other side
    setPlanMarks({ ...marksRef.current, openings: [...marksRef.current.openings, { kind: m, a: d[0], b: p }] });
    setDraft([]);
  };
  const addRef = useRef(add);
  addRef.current = add;
  const closeRef = useRef(closeRoom);
  closeRef.current = closeRoom;
  // going on to doors (or Done) with a room's corners down keeps the room; fewer than 3 are dropped
  const finish = () => { if (modeRef.current === 'room' && draftRef.current.length >= 3) closeRoom(); else setDraft([]); };
  const shown = useRef(mode);
  useEffect(() => {
    if (shown.current === mode) return;
    if (shown.current === 'room' && draftRef.current.length >= 3) closeRef.current();
    else setDraft([]);
    shown.current = mode;
  }, [mode]);
  const pickRef = useRef(pick);
  pickRef.current = pick;

  // clicks on the 3D view add points (a click on the first corner closes the
  // room); a drag (looking around) doesn't. Enter: the point under the dot.
  useEffect(() => {
    const canvas = canvasEl();
    if (!canvas) return;
    canvas.style.cursor = 'crosshair';
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => { down = e.button === 0 ? { x: e.clientX, y: e.clientY } : null; };
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const first = spotsRef.current.d0;
      if (modeRef.current === 'room' && draftRef.current.length >= 3 && first?.front && Math.hypot(e.clientX - first.x, e.clientY - first.y) < 14) {
        closeRef.current();
        return;
      }
      addRef.current(pickRef.current(e.clientX, e.clientY));
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'Enter') { e.preventDefault(); addRef.current(pickRef.current()); }
      else if (e.key === 'Backspace') { e.preventDefault(); setDraft((d) => d.slice(0, -1)); }
      else if (e.key === 'Escape') { if (draftRef.current.length) setDraft([]); else onClose(); }
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKey);
    return () => {
      canvas.style.cursor = '';
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onKey);
    };
  }, [editor, onClose]);

  // each frame: move a dragged point to the surface under the pointer, and
  // follow every point on screen as the camera moves
  useEffect(() => {
    let raf = 0, last = '';
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const g = grab.current, w = want.current;
      if (g && w) {
        want.current = null;
        const p = pickRef.current(w.x, w.y);
        if (p) {
          const r = g.ref;
          if (r.k === 'draft') setDraft((d) => d.map((q, j) => (j === r.j ? p : q)));
          else setMarks((m) => (r.k === 'room'
            ? { ...m, rooms: m.rooms.map((x, i) => (i === r.i ? { corners: x.corners.map((q, j) => (j === r.j ? p : q)) } : x)) }
            : { ...m, openings: m.openings.map((x, i) => (i === r.i ? { ...x, [r.end]: p } : x)) }));
        }
      }
      const rect = canvasEl()?.getBoundingClientRect();
      const next: Record<string, Spot> = {};
      let sig = '';
      const put = (ref: Ref, p: ScanPoint) => {
        const world = editor.fromScan(p);
        if (!world) return;
        const s = editor.toScreen(world as P3);
        const at = { x: s.x + (rect?.left ?? 0), y: s.y + (rect?.top ?? 0), front: s.front };
        const k = keyOf(ref);
        next[k] = at;
        sig += `${k}${at.x.toFixed(0)},${at.y.toFixed(0)},${at.front};`;
      };
      marksRef.current.rooms.forEach((r, i) => r.corners.forEach((p, j) => put({ k: 'room', i, j }, p)));
      marksRef.current.openings.forEach((o, i) => { put({ k: 'open', i, end: 'a' }, o.a); put({ k: 'open', i, end: 'b' }, o.b); });
      draftRef.current.forEach((p, j) => put({ k: 'draft', j }, p));
      if (sig !== last) { last = sig; setSpots(next); }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [editor]);

  const grip = (ref: Ref, s: Spot) => ({
    onPointerDown: (e: RPointerEvent<SVGCircleElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      grab.current = { ref, dx: s.x - e.clientX, dy: s.y - e.clientY, x0: e.clientX, y0: e.clientY };
      setGrabbing(true);
    },
    onPointerMove: (e: RPointerEvent<SVGCircleElement>) => {
      const g = grab.current;
      if (g) want.current = { x: e.clientX + g.dx, y: e.clientY + g.dy };
    },
    onPointerUp: (e: RPointerEvent<SVGCircleElement>) => letGo(e),
    onLostPointerCapture: () => letGo()
  });
  const letGo = (e?: { clientX: number; clientY: number }) => {
    const g = grab.current;
    if (!g) return;
    grab.current = null;
    setGrabbing(false);
    // a click, not a drag, on the first corner closes the room (its grip is on top of it)
    const click = e && Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < 5;
    if (click && g.ref.k === 'draft' && g.ref.j === 0 && modeRef.current === 'room' && draftRef.current.length >= 3) { closeRef.current(); return; }
    if (g.ref.k !== 'draft' && marksRef.current !== planMarks().marks) setPlanMarks(marksRef.current); // saved when let go, not every frame
  };

  const seg = (a: Spot | undefined, b: Spot | undefined, cls: string, key: string) =>
    a?.front && b?.front ? <line key={key} className={cls} x1={a.x} y1={a.y} x2={b.x} y2={b.y} /> : null;
  const dot = (ref: Ref, cls: string) => {
    const s = spots[keyOf(ref)];
    return s?.front ? (
      <g key={keyOf(ref)}>
        <circle className={`pm-dot ${cls}`} cx={s.x} cy={s.y} r={5} />
        <circle className="pm-grip" cx={s.x} cy={s.y} r={16} {...grip(ref, s)} />
      </g>
    ) : null;
  };
  const tag = (a: Spot | undefined, b: Spot | undefined, text: string, key: string) =>
    a?.front && b?.front ? <span key={key} className="pm-tag" style={{ left: (a.x + b.x) / 2, top: (a.y + b.y) / 2 }}>{text}</span> : null;
  const len = (a: ScanPoint, b: ScanPoint) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  return (
    <>
      <svg className={`pm-layer${grabbing ? ' is-grabbing' : ''}`} aria-hidden>
        {marks.rooms.map((r, i) => r.corners.map((_, j) => seg(spots[`r${i}.${j}`], spots[`r${i}.${(j + 1) % r.corners.length}`], 'pm-room', `rs${i}.${j}`)))}
        {marks.openings.map((o, i) => seg(spots[`o${i}a`], spots[`o${i}b`], `pm-${o.kind}`, `os${i}`))}
        {draft.map((_, j) => (j ? seg(spots[`d${j - 1}`], spots[`d${j}`], `pm-draft pm-${mode}`, `ds${j}`) : null))}
        {marks.rooms.map((r, i) => r.corners.map((_, j) => dot({ k: 'room', i, j }, 'pm-room')))}
        {marks.openings.map((o, i) => (['a', 'b'] as const).map((end) => dot({ k: 'open', i, end }, `pm-${o.kind}`)))}
        {draft.map((_, j) => dot({ k: 'draft', j }, `pm-draft pm-${mode}${j === 0 ? ' is-first' : ''}`))}
      </svg>
      {marks.openings.map((o, i) => tag(spots[`o${i}a`], spots[`o${i}b`], `${o.kind === 'door' ? 'Door' : 'Window'} ${len(o.a, o.b).toFixed(2)} m`, `ot${i}`))}
      {marks.rooms.map((r, i) => {
        const pts = r.corners.map((_, j) => spots[`r${i}.${j}`]).filter((s) => s?.front);
        if (pts.length < 3) return null;
        const c = { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length, front: true };
        return tag(c, c, `Room · ${area(r.corners).toFixed(1)} m²`, `rt${i}`);
      })}
      <div className="pm-panel" role="dialog" aria-label={NAME[mode]}>
        <div className="pm-modes" role="group" aria-label="What to mark">
          {(Object.keys(NAME) as PlanTool[]).map((m) => (
            <button key={m} type="button" aria-pressed={m === mode} onClick={() => onMode(m)}>{m === 'room' ? 'Room' : m === 'door' ? 'Door' : 'Window'}</button>
          ))}
        </div>
        <p className="pm-help">
          {mode === 'room' && draft.length >= 3 ? 'Click the first corner again, or Close the room.' : mode !== 'room' && draft.length === 1 ? 'Now the other side.' : HELP[mode]}
        </p>
        <p className="pm-note">Or aim the centre dot at the point and press Enter. Drag any point to move it.</p>
        {miss && <p className="pm-note">Nothing there. Aim at a wall, the floor or a door frame.</p>}
        <div className="pm-actions">
          <button type="button" className="pm-quiet" onClick={() => add(pick())}>Add the point under the dot</button>
          {draft.length > 0 && <button type="button" className="pm-quiet" onClick={() => setDraft((d) => d.slice(0, -1))}>Undo point</button>}
          {mode === 'room' && draft.length >= 3 && <button type="button" onClick={closeRoom}>Close the room</button>}
          <button type="button" onClick={() => { finish(); onClose(); }}>Done</button>
        </div>
      </div>
    </>
  );
}
