'use client';

import { useEffect, useRef, useState } from 'react';
import { walkerCfg } from './walkerConfig';
import { useT } from '../../lib/i18n';
import './measure.css';
import type { EditorApi } from '../../@types/app.types';

type P3 = [number, number, number];
type Spot = { x: number; y: number; front: boolean };

/**
 * Measure in 3D (2026-10-13): click two points on the scan, read the distance
 * between them. In the tour and the studio. Points are found on the scan's own
 * collision surface (EditorApi.surfaceAt) and drawn over the view every frame.
 * While it's open the tour drags to look instead of capturing the mouse
 * (walkerCfg.measuring), so a click picks a point. `onCalibrate` (studio only):
 * type the real length of what was measured to correct the space's scale.
 * Distances are in metres through the space's unitScale.
 */
export function MeasureTool({ editor, unitScale, onClose, onCalibrate }: {
  editor: EditorApi;
  unitScale: number;
  onClose: () => void;
  onCalibrate?: (unitScale: number) => void;
}) {
  const [pts, setPts] = useState<P3[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [miss, setMiss] = useState(false);
  const [real, setReal] = useState('');
  const tr = useT();
  const ptsRef = useRef(pts);
  ptsRef.current = pts;

  // clicks on the 3D view pick points; a drag (looking around) doesn't
  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('.app-root canvas');
    if (!canvas) return;
    walkerCfg.measuring = true;
    canvas.style.cursor = 'crosshair';
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => { down = e.button === 0 ? { x: e.clientX, y: e.clientY } : null; };
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const r = canvas.getBoundingClientRect();
      const p = editor.surfaceAt(e.clientX - r.left, e.clientY - r.top);
      setMiss(!p);
      if (p) setPts((l) => (l.length >= 2 ? [p] : [...l, p]));
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKey);
    return () => {
      walkerCfg.measuring = false;
      canvas.style.cursor = '';
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onKey);
    };
  }, [editor, onClose]);

  // follow the points on screen as the camera moves
  useEffect(() => {
    let raf = 0, last = '';
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const next = ptsRef.current.map((p) => editor.toScreen(p));
      const sig = next.map((s) => `${s.x.toFixed(0)},${s.y.toFixed(0)},${s.front}`).join(';');
      if (sig !== last) { last = sig; setSpots(next); }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [editor]);

  const units = pts.length === 2 ? Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1], pts[0][2] - pts[1][2]) : 0;
  const metres = units / (unitScale || 1);
  const shown = spots.filter((s) => s.front);
  const realM = Number(real.replace(',', '.'));

  return (
    <>
      <svg className="ms-layer" aria-hidden>
        {shown.length === 2 && <line x1={shown[0].x} y1={shown[0].y} x2={shown[1].x} y2={shown[1].y} />}
        {shown.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={5} />)}
      </svg>
      {units > 0 && shown.length === 2 && (
        <span className="ms-tag" style={{ left: (shown[0].x + shown[1].x) / 2, top: (shown[0].y + shown[1].y) / 2 }}>
          {metres.toFixed(2)} m
        </span>
      )}
      <div className="ms-panel" role="dialog" aria-label={tr('Measure')}>
        <p className="ms-read">
          {units > 0 ? <b>{metres.toFixed(2)} m</b> : pts.length === 1 ? tr('Now click the second point.') : tr('Click two points on the space to measure between them.')}
        </p>
        {miss && <p className="ms-note">{tr('Nothing there to measure. Click on a wall, the floor or an object.')}</p>}
        <p className="ms-note">{tr('Measured from the scan: allow a few centimetres. Check critical sizes on site.')}</p>
        {onCalibrate && units > 0 && (
          <form className="ms-cal" onSubmit={(e) => { e.preventDefault(); if (realM > 0) { onCalibrate(units / realM); setReal(''); } }}>
            <label>
              Its real length
              <input inputMode="decimal" value={real} onChange={(e) => setReal(e.target.value)} placeholder="e.g. 0.90" aria-label="Real length in metres" />
              m
            </label>
            <button type="submit" disabled={!(realM > 0)}>Correct the scale</button>
          </form>
        )}
        <button type="button" className="ms-close" onClick={onClose}>{tr('Done')}</button>
      </div>
    </>
  );
}
