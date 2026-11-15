'use client';

import { sqft } from "../../../lib/area";
import { ask } from "../../../components/ui/Ask";
import { useEffect, useRef, useState } from "react";
import { SCENE_BY_ID } from "../../scene/scenes";
import { type PlanTool } from "../PlanMarker";
import { loadPlanMarks, planMarks, planMarksDrawn, setPlanMarks, subscribePlanMarks } from "../planMarks";
import { assetUrl, buildFloorPlan, uploadFloorPlan, removeFloorPlan, renameFloorPlanRooms } from "../../../lib/api";
import { forgetPlan } from "../../tour/floorMapData";
import { Section } from "./controls";

/**
 * The space's floor plan: drawn by the server from the scan's own collision
 * mesh (server/src/floorplan.js) — on upload, or here for older scans — and,
 * beside it, your own: an architect's drawing or a fire plan, uploaded as an
 * image (PNG, JPEG or WebP). Uploading again replaces yours; the drawn one
 * always stays.
 */
export function FloorPlanSection({ sceneId, onPlanTool }: { sceneId: string; onPlanTool: (t: PlanTool) => void }) {
  const assetId = SCENE_BY_ID[sceneId]?.assetId;
  const [view, setView] = useState<'plan' | '3d' | 'mine'>('3d');
  const [status, setStatus] = useState<'loading' | 'ready' | 'none' | 'building'>('loading');
  const [error, setError] = useState('');
  const [bust, setBust] = useState(0);
  const [mine, setMine] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => { setStatus('loading'); setError(''); }, [assetId]);
  const [marksChanged, setMarksChanged] = useState(false);
  useEffect(() => subscribePlanMarks(() => setMarksChanged(planMarks().changed)), []);
  // Yours, if this space has one — its type is in its name, so try each.
  useEffect(() => {
    setMine(null);
    if (!assetId || assetId.startsWith('local:')) return;
    let off = false;
    (async () => {
      for (const ext of ['png', 'jpg', 'webp']) {
        const rel = `floorplan/uploaded.${ext}`;
        const found = await new Promise<boolean>((done) => {
          const im = new Image();
          im.onload = () => done(true);
          im.onerror = () => done(false);
          im.src = assetUrl(assetId, rel);
        });
        if (off) return;
        if (found) { setMine(rel); setView('mine'); return; }
      }
    })();
    return () => { off = true; };
  }, [assetId]);
  if (!assetId || assetId.startsWith('local:')) return null;

  const v = bust ? `?v=${bust}` : '';
  const drawnSrc = (w: 'plan' | '3d') => `${assetUrl(assetId, `floorplan/${w}.svg`)}${v}`;
  const drawn = status !== 'none' && status !== 'building';
  const showing = view === 'mine' ? (mine ? `${assetUrl(assetId, mine)}${v}` : null) : drawn ? drawnSrc(view) : null;
  const name = SCENE_BY_ID[sceneId]?.name ?? 'this space';

  const build = async () => {
    setStatus('building');
    setError('');
    try {
      await buildFloorPlan(assetId, SCENE_BY_ID[sceneId]?.name || 'Floor plan');
      planMarksDrawn();
      forgetPlan(assetId);
      setBust(Date.now());
      setStatus('loading');
      setView('3d');
    } catch (e) {
      setError((e as Error).message);
      setStatus('none');
    }
  };
  const upload = async (file: File | undefined) => {
    if (!file) return;
    setSending(true);
    setError('');
    try {
      const r = await uploadFloorPlan(assetId, file);
      if (r) { setMine(r.path); setView('mine'); setBust(Date.now()); }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };
  const removeMine = async () => {
    if (!(await ask({ title: 'Remove your uploaded floor plan?', body: 'The one drawn from the scan stays.', action: 'Remove it', danger: true }))) return;
    setError('');
    try {
      await removeFloorPlan(assetId);
      setMine(null);
      setView('3d');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Section title="Floor plan">
      {(drawn || mine) && (
        <div className="ed2-row">
          {([...(drawn ? ['3d', 'plan'] : []), ...(mine ? ['mine'] : [])] as ('3d' | 'plan' | 'mine')[]).map((v) => (
            <button key={v} className="ed2-export" style={{ flex: 1, marginTop: 0, fontWeight: view === v ? 700 : 400 }}
              aria-pressed={view === v} onClick={() => setView(v)}>{v === '3d' ? '3D' : v === 'plan' ? '2D plan' : 'Yours'}</button>
          ))}
        </div>
      )}
      {showing && (
        <a href={showing} target="_blank" rel="noreferrer" title="Open full size to save or print">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={showing} alt={`Floor plan of ${name}`}
            style={{ width: '100%', marginTop: 10, borderRadius: 8, display: view === 'mine' || status === 'ready' ? 'block' : 'none' }}
            onLoad={() => { if (view !== 'mine') setStatus('ready'); }}
            onError={() => { if (view !== 'mine') setStatus('none'); }} />
        </a>
      )}
      {status === 'ready' && view !== 'mine' && (
        <RoomNames assetId={assetId} bust={bust} onSaved={() => { forgetPlan(assetId); setBust(Date.now()); }} />
      )}
      {status === 'ready' && view !== 'mine' && <PlanMarksBlock assetId={assetId} onPlanTool={onPlanTool} />}
      {showing && (view === 'mine' || status === 'ready') && (
        // the client deliverable: a title sheet around the plan shown above, saved from the print dialog
        <button className="ed2-export" onClick={() => window.open(
          `/studio/${encodeURIComponent(SCENE_BY_ID[sceneId]?.propertyId ?? 'unfiled')}/plan/${encodeURIComponent(sceneId)}` +
          `?img=${encodeURIComponent(view === 'mine' && mine ? mine : `floorplan/${view}.svg`)}`, '_blank', 'noopener')}>
          Download as PDF…
        </button>
      )}
      {status === 'none' && !mine && <p className="ed2-muted ed2-fine">No plan yet for this space.</p>}
      {error && <p className="ed2-muted ed2-fine" role="alert">{error}</p>}
      <button className="ed2-export" onClick={build} disabled={status === 'building'}>
        {status === 'building' ? 'Drawing the plan…' : status === 'ready' ? (marksChanged ? 'Redraw with your marks' : 'Redraw from the scan') : 'Draw from the scan'}
      </button>
      <input
        ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden
        onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }}
      />
      <button className="ed2-export" onClick={() => fileRef.current?.click()} disabled={sending}>
        {sending ? 'Uploading…' : mine ? 'Replace your plan…' : 'Upload your own plan…'}
      </button>
      {mine && <button className="ed2-export" onClick={removeMine}>Remove yours</button>}
      <p className="ed2-muted ed2-fine">
        Yours: an architect&apos;s drawing or a fire plan, as a PNG, JPEG or WebP up to 15 MB (a PDF: export the page as PNG).
        {(status === 'ready' || mine) && ' Click a plan to open it full size, to save or print.'}
      </p>
    </Section>
  );
}

/** Help the plan (2026-10-14): what the scan can't tell, marked in the 3D
 *  view (PlanMarker): rooms traced by their corners, doors and windows by
 *  both sides. Listed here to remove; the next redraw follows them, snapped
 *  to the scanned walls (server floorplan.js markUp). */
function PlanMarksBlock({ assetId, onPlanTool }: { assetId: string; onPlanTool: (t: PlanTool) => void }) {
  const [, bump] = useState(0);
  useEffect(() => subscribePlanMarks(() => bump((n) => n + 1)), []);
  useEffect(() => { loadPlanMarks(assetId); }, [assetId]);
  const { marks, error, changed } = planMarks();
  const areaOf = (c: [number, number, number][]) => Math.abs(c.reduce((t, p, i) => { const q = c[(i + 1) % c.length]; return t + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  return (
    <div style={{ marginTop: 12 }}>
      <div className="ed2-lbl">Help the plan</div>
      <p className="ed2-muted ed2-fine">
        Where the scan can&apos;t tell: in the 3D view, trace a room by its corners and mark doors and windows by both
        sides. The next redraw follows them, snapped onto the scanned walls.
      </p>
      <div className="ed2-row">
        <button onClick={() => onPlanTool('room')}>Trace a room</button>
        <button onClick={() => onPlanTool('door')}>Mark a door</button>
        <button onClick={() => onPlanTool('window')}>Mark a window</button>
      </div>
      {marks.rooms.map((r, i) => (
        <div key={`r${i}`} className="ed2-row" style={{ flexWrap: 'nowrap', marginTop: 6 }}>
          <span style={{ flex: 1 }}>Room {i + 1} · {r.corners.length} corners · {areaOf(r.corners).toFixed(1)} m² · {sqft(areaOf(r.corners))} sq ft</span>
          <button aria-label={`Remove traced room ${i + 1}`} onClick={() => setPlanMarks({ ...marks, rooms: marks.rooms.filter((_, j) => j !== i) })}>✕</button>
        </div>
      ))}
      {marks.openings.map((o, i) => (
        <div key={`o${i}`} className="ed2-row" style={{ flexWrap: 'nowrap', marginTop: 6 }}>
          <span style={{ flex: 1 }}>{o.kind === 'door' ? 'Door' : 'Window'} · {Math.hypot(o.a[0] - o.b[0], o.a[1] - o.b[1]).toFixed(2)} m</span>
          <button aria-label={`Remove ${o.kind} ${i + 1}`} onClick={() => setPlanMarks({ ...marks, openings: marks.openings.filter((_, j) => j !== i) })}>✕</button>
        </div>
      ))}
      {error && <p className="ed2-muted ed2-fine" role="alert">{error}</p>}
      {changed && <p className="ed2-muted ed2-fine" role="status">Saved. Redraw the plan to use your marks.</p>}
    </div>
  );
}

/** The rooms found on a plan drawn from the scan, each named here ("Lobby",
 *  "Banquet hall") instead of "Room 1". Names go on every copy of the plan,
 *  the print sheet and the tour's map, and survive a redraw. */
function RoomNames({ assetId, bust, onSaved }: { assetId: string; bust: number; onSaved: () => void }) {
  const [rooms, setRooms] = useState<{ id: string; name: string; named?: boolean; area: number }[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  useEffect(() => {
    let off = false;
    fetch(`${assetUrl(assetId, 'floorplan/plan.json')}?v=${bust}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (off || !Array.isArray(p?.rooms)) return;
        setRooms(p.rooms);
        setNames(Object.fromEntries(p.rooms.map((r: { id: string; name: string; named?: boolean }) => [r.id, r.named ? r.name : ''])));
      })
      .catch(() => {});
    return () => { off = true; };
  }, [assetId, bust]);
  if (!rooms.length) return null;
  const dirty = rooms.some((r) => (names[r.id] ?? '') !== (r.named ? r.name : ''));
  const save = async () => {
    setSaving(true);
    setNote('');
    try {
      await renameFloorPlanRooms(assetId, names);
      onSaved();
      setNote('Saved. The plan, the print sheet and the tour map use these names.');
    } catch (e) {
      setNote((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div style={{ marginTop: 12 }}>
      <div className="ed2-lbl">Rooms</div>
      {rooms.map((r, i) => (
        <div key={r.id} className="ed2-row" style={{ flexWrap: 'nowrap', marginTop: 6 }}>
          <input className="ed2-name" style={{ flex: 1, minWidth: 0 }} aria-label={`Name of room ${i + 1}`} maxLength={40}
            placeholder={`Room ${i + 1}`} value={names[r.id] ?? ''} onChange={(e) => setNames({ ...names, [r.id]: e.target.value })} />
          <span className="ed2-muted ed2-fine" style={{ whiteSpace: 'nowrap' }}>{r.area} m² · {sqft(r.area)} sq ft</span>
        </div>
      ))}
      <button className="ed2-export" onClick={save} disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save room names'}</button>
      {note && <p className="ed2-muted ed2-fine" role="status">{note}</p>}
    </div>
  );
}
