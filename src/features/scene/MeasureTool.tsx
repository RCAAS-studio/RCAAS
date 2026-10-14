'use client';

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { useT } from '../../lib/i18n';
import './measure.css';
import type { EditorApi } from '../../@types/app.types';

type P3 = [number, number, number];
type Spot = { x: number; y: number; front: boolean };
type Line = { id: number; a: P3; b: P3 | null };
type End = 'a' | 'b';

const canvasEl = () => document.querySelector<HTMLCanvasElement>('.app-root canvas');
/** The scan's surface under a point of the window, or null. */
function pickAt(editor: EditorApi, x: number, y: number): P3 | null {
  const r = canvasEl()?.getBoundingClientRect();
  return r ? editor.surfaceAt(x - r.left, y - r.top) : null;
}
const letter = (i: number) => String.fromCharCode(65 + (i % 26));
const m2 = (m: number) => `${m.toFixed(2)} m`;
/** 2.34 m → 7′ 8″ */
function feet(m: number) {
  const inches = Math.round(m / 0.0254);
  return `${Math.floor(inches / 12)}′ ${inches % 12}″`;
}

/**
 * Measure in 3D (2026-10-13; lines and dragging 2026-10-14): click two points
 * on the scan for a line and read its length, then click again for more lines.
 * Drag either end of a line to move it (the grip keeps its offset from the
 * pointer, so a finger doesn't hide the point). In the tour and the studio.
 * Points are found on the scan's collision surface (EditorApi.surfaceAt) and
 * drawn over the view every frame; a drag of the view still looks around.
 * The selected line also reads its vertical and horizontal parts and feet.
 * `onCalibrate` (studio only): type the real length of the selected line to
 * correct the space's scale. Distances are in metres through unitScale.
 */
export function MeasureTool({ editor, unitScale, onClose, onCalibrate }: {
  editor: EditorApi;
  unitScale: number;
  onClose: () => void;
  onCalibrate?: (unitScale: number) => void;
}) {
  const [lines, setLines] = useState<Line[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [spots, setSpots] = useState<Record<string, Spot>>({});
  const [miss, setMiss] = useState(false);
  const [real, setReal] = useState('');
  const [grabbing, setGrabbing] = useState(false);
  const tr = useT();
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const selRef = useRef(sel);
  selRef.current = sel;
  const nextId = useRef(1);
  // the end being dragged, and where the pointer wants it (picked once a frame)
  const grab = useRef<{ line: number; end: End; dx: number; dy: number } | null>(null);
  const want = useRef<{ x: number; y: number } | null>(null);

  const remove = (id: number | null) => {
    if (id === null) return;
    setLines((l) => l.filter((x) => x.id !== id));
    setSel(null);
  };

  // clicks on the 3D view pick points; a drag (looking around) doesn't
  useEffect(() => {
    const canvas = canvasEl();
    if (!canvas) return;
    canvas.style.cursor = 'crosshair';
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => { down = e.button === 0 ? { x: e.clientX, y: e.clientY } : null; };
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const p = pickAt(editor, e.clientX, e.clientY);
      setMiss(!p);
      if (!p) return;
      const last = linesRef.current.at(-1);
      if (last && !last.b) {
        setLines((l) => l.map((x) => (x.id === last.id ? { ...x, b: p } : x)));
        setSel(last.id);
      } else {
        const id = nextId.current++;
        setLines((l) => [...l, { id, a: p, b: null }]);
        setSel(id);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'Escape') {
        // a half-made line goes first, then the tool
        if (linesRef.current.at(-1)?.b === null) setLines((l) => l.slice(0, -1));
        else onClose();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        remove(selRef.current);
      }
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

  // each frame: move a dragged end to the surface under the pointer, and
  // follow every point on screen as the camera moves
  useEffect(() => {
    let raf = 0, last = '';
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const g = grab.current, w = want.current;
      if (g && w) {
        want.current = null;
        const p = pickAt(editor, w.x, w.y);
        if (p) setLines((l) => l.map((x) => (x.id === g.line ? { ...x, [g.end]: p } : x)));
      }
      const r = canvasEl()?.getBoundingClientRect();
      const next: Record<string, Spot> = {};
      let sig = '';
      for (const l of linesRef.current) {
        for (const end of ['a', 'b'] as const) {
          const p = l[end];
          if (!p) continue;
          const s = editor.toScreen(p);
          const at = { x: s.x + (r?.left ?? 0), y: s.y + (r?.top ?? 0), front: s.front };
          next[`${l.id}${end}`] = at;
          sig += `${l.id}${end}${at.x.toFixed(0)},${at.y.toFixed(0)},${at.front};`;
        }
      }
      if (sig !== last) { last = sig; setSpots(next); }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [editor]);

  const grip = (line: number, end: End, s: Spot) => ({
    onPointerDown: (e: RPointerEvent<SVGCircleElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      grab.current = { line, end, dx: s.x - e.clientX, dy: s.y - e.clientY };
      setSel(line);
      setGrabbing(true);
    },
    onPointerMove: (e: RPointerEvent<SVGCircleElement>) => {
      const g = grab.current;
      if (g) want.current = { x: e.clientX + g.dx, y: e.clientY + g.dy };
    },
    onPointerUp: () => { grab.current = null; setGrabbing(false); },
    onLostPointerCapture: () => { grab.current = null; setGrabbing(false); },
  });

  const u = unitScale || 1;
  const lengthOf = (l: Line) => (l.b ? Math.hypot(l.a[0] - l.b[0], l.a[1] - l.b[1], l.a[2] - l.b[2]) : 0);
  const cur = lines.find((l) => l.id === sel) ?? null;
  const curUnits = cur ? lengthOf(cur) : 0;
  const half = lines.at(-1)?.b === null;
  const done = lines.filter((l) => l.b);
  const realM = Number(real.replace(',', '.'));

  return (
    <>
      <svg className={`ms-layer${grabbing ? ' is-grabbing' : ''}`} aria-hidden>
        {lines.map((l) => {
          const a = spots[`${l.id}a`], b = spots[`${l.id}b`];
          return (
            <g key={l.id} className={l.id === sel ? 'is-sel' : undefined}>
              {a?.front && b?.front && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />}
              {([['a', a], ['b', b]] as const).map(([end, s]) => s?.front && (
                <g key={end}>
                  <circle className="ms-dot" cx={s.x} cy={s.y} r={5} />
                  <circle className="ms-grip" cx={s.x} cy={s.y} r={18} {...grip(l.id, end, s)} />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      {lines.map((l, i) => {
        const a = spots[`${l.id}a`], b = spots[`${l.id}b`];
        if (!l.b || !a?.front || !b?.front) return null;
        return (
          <button
            key={l.id} type="button" className={`ms-tag${l.id === sel ? ' is-sel' : ''}`}
            style={{ left: (a.x + b.x) / 2, top: (a.y + b.y) / 2 }} onClick={() => setSel(l.id)}
          >
            {lines.length > 1 && <i>{letter(i)}</i>}{m2(lengthOf(l) / u)}
          </button>
        );
      })}
      <div className="ms-panel" role="dialog" aria-label={tr('Measure')}>
        <p className="ms-read">
          {cur && curUnits > 0 ? (
            <>
              <b>{m2(curUnits / u)}</b> <span className="ms-ft">{feet(curUnits / u)}</span>
              <span className="ms-parts">
                {tr('Vertical')} {m2(Math.abs(cur.a[1] - cur.b![1]) / u)} · {tr('Horizontal')}{' '}
                {m2(Math.hypot(cur.a[0] - cur.b![0], cur.a[2] - cur.b![2]) / u)}
              </span>
            </>
          ) : half ? tr('Now click the second point.') : tr('Click two points on the space to measure between them.')}
        </p>
        {done.length > 0 && !half && <p className="ms-note">{tr('Drag a point to move it. Click the space to start another line.')}</p>}
        {miss && <p className="ms-note">{tr('Nothing there to measure. Click on a wall, the floor or an object.')}</p>}
        {lines.length > 1 && (
          <ul className="ms-list">
            {lines.map((l, i) => (
              <li key={l.id}>
                <button type="button" aria-pressed={l.id === sel} onClick={() => setSel(l.id)}>
                  <i>{letter(i)}</i>{l.b ? m2(lengthOf(l) / u) : '…'}
                </button>
                <button type="button" className="ms-x" aria-label={`${tr('Delete line')} ${letter(i)}`} onClick={() => remove(l.id)}>×</button>
              </li>
            ))}
          </ul>
        )}
        <p className="ms-note">{tr('Measured from the scan: allow a few centimetres. Check critical sizes on site.')}</p>
        {onCalibrate && curUnits > 0 && (
          <form className="ms-cal" onSubmit={(e) => { e.preventDefault(); if (realM > 0) { onCalibrate(curUnits / realM); setReal(''); } }}>
            <label>
              Its real length
              <input inputMode="decimal" value={real} onChange={(e) => setReal(e.target.value)} placeholder="e.g. 0.90" aria-label="Real length in metres" />
              m
            </label>
            <button type="submit" disabled={!(realM > 0)}>Correct the scale</button>
          </form>
        )}
        <div className="ms-actions">
          {cur && <button type="button" className="ms-quiet" onClick={() => remove(cur.id)}>{tr('Delete line')}</button>}
          {lines.length > 1 && <button type="button" className="ms-quiet" onClick={() => { setLines([]); setSel(null); }}>{tr('Clear all')}</button>}
          <button type="button" onClick={onClose}>{tr('Done')}</button>
        </div>
      </div>
    </>
  );
}
