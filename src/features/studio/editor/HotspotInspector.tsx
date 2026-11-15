'use client';

import { useEffect, useState } from "react";
import { SCENE_BY_ID, visibleScenes } from "../../scene/scenes";
import { TranslationsSection } from "../ClaudeTools";
import { uploadAudio } from "../upload";
import { playClip, setMuted, stopClip, useSound } from "../../../lib/audio";
import { resolveAsset, getSiteDraft, type SiteDoc } from "../../../lib/api";
import { enableHotspotMove, hotspotMove } from "../hotspotMove";
import type { EditorApi } from "../../../@types/app.types";
import type { Hotspot, HotspotType } from "../../../@types/hotspot.types";
import { Section, Slider } from "./controls";
import { HS_TYPES, MOVE_STEPS, StepSize, Stepper } from './controls';

interface HotspotInspectorProps {
  ed: EditorApi;
  hs: Hotspot;
  activeId: string;
  onDelete: () => void;
  /** A table's "＋ Next table": another table hotspot where the dot is, selected. */
  onAddTable: () => void;
}

export function HotspotInspector({ ed, hs, activeId, onDelete, onAddTable }: HotspotInspectorProps) {
  const [moveStep, setMoveStep] = useState<number>(0.1);
  const p = hs.payload || {};
  const set = (patch: Partial<Hotspot>) => ed.updateHotspot(hs.id, patch);
  const setPayload = (patch: Hotspot['payload']) => set({ payload: { ...p, ...patch } });

  return (
    <>
      <Section title={`Hotspot · ${hs.type}`}>
        <select className="ed2-name" value={hs.type} onChange={(e) => set({ type: e.target.value as HotspotType })}>
          {HS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          className="ed2-name" style={{ marginTop: 6 }}
          value={hs.label} onChange={(e) => set({ label: e.target.value })}
        />
      </Section>

      <Section title="Placement">
        <div className="ed2-row">
          <button type="button" aria-pressed={hotspotMove.enabled}
            onClick={() => enableHotspotMove(!hotspotMove.enabled)}>
            {hotspotMove.enabled ? 'Hide move arrows' : 'Show move arrows'}
          </button>
        </div>
        <p className="ed2-muted ed2-fine">Drag X (red) or Z (blue) to move horizontally, Y (green) for height. Axes stay aligned with the space as you look around. Hold Ctrl to snap to 0.1 m; Esc cancels a drag.</p>
        <div className="ed2-xform-head">
          <span>Position</span>
          <StepSize value={moveStep} options={MOVE_STEPS} unit="m" onChange={setMoveStep} />
        </div>
        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
          <Stepper key={`${hs.id}-${axis}`} axis={axis} value={hs.position[i]} step={moveStep} digits={3} unit="m"
            onChange={(value) => {
              const position = [...hs.position] as [number, number, number];
              position[i] = value;
              set({ position });
            }} />
        ))}
        <div className="ed2-row">
          <button onClick={() => ed.placeHotspotAtCamera(hs.id)} title="Moves it onto what the dot in the middle of the view rests on">Set to current view</button>
          <button onClick={() => ed.lookAtHotspot(hs.id)}>Look at</button>
        </div>
        <p className="ed2-muted ed2-fine">Aim the dot in the middle of the view at the wall or object it&apos;s about, then Set to current view. It sits on that surface, so it stays put as visitors walk around.</p>
        <Slider label="Trigger radius" value={hs.radius} min={0.1} max={3} step={0.05} unit="m"
          onChange={(x) => set({ radius: x })} />
      </Section>

      {hs.type !== 'audio' && <Section title={hs.type === 'table' || hs.type === 'room' || hs.type === 'hall' ? 'Book now' : 'Content'}>
        {hs.type === 'text' && (
          <>
            <textarea className="ed2-name ed2-area" rows={4}
              value={p.text || ''} onChange={(e) => setPayload({ text: e.target.value })} />
            <select
              className="ed2-name" style={{ marginTop: 6 }}
              value={p.reveal ?? 'auto'}
              onChange={(e) => {
                const v = e.target.value;
                setPayload({ reveal: v === 'auto' ? undefined : (v as 'near' | 'always') });
              }}
            >
              <option value="auto">Show among the nearest few (default)</option>
              <option value="near">Show only within 1 m — won&apos;t overlap other text</option>
              <option value="always">Always show, at any distance</option>
            </select>
          </>
        )}
        {hs.type === 'image' && (
          <>
            <input className="ed2-name" placeholder="image URL"
              value={p.url || ''} onChange={(e) => setPayload({ url: e.target.value })} />
            <input className="ed2-name" style={{ marginTop: 6 }} placeholder="caption"
              value={p.caption || ''} onChange={(e) => setPayload({ caption: e.target.value })} />
          </>
        )}
        {hs.type === 'video' && (
          <input className="ed2-name" placeholder="video URL (mp4)"
            value={p.url || ''} onChange={(e) => setPayload({ url: e.target.value })} />
        )}
        {hs.type === 'link' && (
          <>
            <input className="ed2-name" placeholder="https://…"
              value={p.url || ''} onChange={(e) => setPayload({ url: e.target.value })} />
            <input className="ed2-name" style={{ marginTop: 6 }} placeholder="button text"
              value={p.text || ''} onChange={(e) => setPayload({ text: e.target.value })} />
          </>
        )}
        {hs.type === 'portal' && (
          <select className="ed2-name" value={p.sceneId || ''}
            onChange={(e) => setPayload({ sceneId: e.target.value })}>
            <option value="">— pick a scene —</option>
            {visibleScenes().filter((s) => s.id !== activeId).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
        {(hs.type === 'table' || hs.type === 'room' || hs.type === 'hall') && (
          <BookablePicker kind={hs.type} sceneId={activeId} payload={p} onChange={(patch) => setPayload(patch)} onAddTable={onAddTable} />
        )}
      </Section>}

      <AudioSection key={hs.id} hs={hs} setPayload={setPayload} />
      <TranslationsSection hs={hs} set={set} />

      <div className="ed2-row ed2-viewactions">
        <button className="ed2-del" onClick={onDelete}>🗑 Delete hotspot</button>
      </div>
    </>
  );
}

/**
 * Audio for one hotspot (§6.3): upload an .m4a, hear it, remove it, and
 * write what it says. The transcript is what a muted visitor reads.
 *
 * Remove only unlinks it. The file stays in storage: a published snapshot
 * may still point at it, and deleting it would break that live tour (§3.6).
 */
/**
 * A bookable thing in the room: a room, a hall or a table (2026-09-30).
 * Book now works with nothing else set up: what visitors see (capacity,
 * price, deposit) is typed here, and their requests land in Reservations for
 * the team to confirm or decline. Or the hotel's own booking page takes them.
 * Optionally it can stand for an item in the website's own booking instead
 * (Website → Table, Room or Event booking), for live availability.
 */
function BookablePicker({ kind, sceneId, payload, onChange, onAddTable }: {
  kind: 'table' | 'room' | 'hall'; sceneId: string; payload: Hotspot['payload'];
  onChange: (patch: Hotspot['payload']) => void;
  onAddTable: () => void;
}) {
  const pid = SCENE_BY_ID[sceneId]?.propertyId;
  const [draft, setDraft] = useState<SiteDoc | null>(null);
  useEffect(() => {
    if (!pid) return;
    getSiteDraft(pid).then((d) => setDraft(d?.draft ?? null)).catch(() => setDraft(null));
  }, [pid]);
  const pl = payload ?? {};
  const num = (v: string) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n > 0 ? Math.min(n, 10000) : undefined; };

  const places = draft ? [{ id: '', name: draft.booking.name || 'Main restaurant', tables: draft.booking.tables },
    ...draft.dining.map((o) => ({ id: o.id, name: o.name, tables: o.booking.tables }))].filter((x) => x.tables.length) : [];
  const options: [string, string][] = !draft ? [] : kind === 'table'
    ? places.flatMap((x) => x.tables.map((t): [string, string] => [`${x.id}|${t.id}`,
      `${places.length > 1 ? `${x.name} · ` : ''}${t.label || t.id} · seats ${t.seats}${t.area ? ` · ${t.area}` : ''}`]))
    : kind === 'room'
      ? draft.stays.rooms.map((r): [string, string] => [r.id, [r.label, r.price && `${r.price} ${r.per}`.trim(), r.deposit && `deposit ${r.deposit}`].filter(Boolean).join(' · ')])
      : draft.events.halls.map((h): [string, string] => [h.id, [h.label, h.seated && `seats ${h.seated}`, h.price].filter(Boolean).join(' · ')]);
  const value = kind === 'table' ? (pl.tableId ? `${pl.outlet ?? ''}|${pl.tableId}` : '') : kind === 'room' ? pl.roomId ?? '' : pl.hallId ?? '';
  const pick = (v: string) => {
    if (kind === 'table') { const [outlet, tableId] = v.split('|'); onChange({ outlet: outlet || undefined, tableId: tableId ?? '' }); }
    else onChange(kind === 'room' ? { roomId: v } : { hallId: v });
  };
  const holds = kind === 'table' ? 'Seats' : kind === 'room' ? 'Sleeps' : 'Seated';

  return (
    <>
      {!pid && <p className="ed2-warn ed2-fine">Put this space in a project first: bookings belong to a project.</p>}
      <input className="ed2-name" value={pl.text ?? ''} maxLength={120}
        placeholder={kind === 'table' ? 'A line about it, e.g. Best sunset view' : kind === 'room' ? 'A line about it, e.g. Our quietest room' : 'A line about it, e.g. Weddings up to 400 guests'}
        onChange={(e) => onChange({ text: e.target.value })} />
      <div className="ed2-row" style={{ marginTop: 6 }}>
        <input className="ed2-name" type="number" min={1} aria-label={holds} placeholder={holds} value={pl.capacity ?? ''}
          onChange={(e) => onChange({ capacity: num(e.target.value) })} />
        {kind === 'hall' && (
          <input className="ed2-name" type="number" min={1} aria-label="Standing" placeholder="Standing" value={pl.standing ?? ''}
            onChange={(e) => onChange({ standing: num(e.target.value) })} />
        )}
        {kind === 'room' && (
          <input className="ed2-name" type="number" min={1} max={999} aria-label="Rooms of this kind" placeholder="Rooms of this kind (1)" value={pl.rooms ?? ''}
            onChange={(e) => onChange({ rooms: num(e.target.value) })} />
        )}
      </div>
      {kind === 'table' && (
        <div className="ed2-seg-mini" role="group" aria-label="Usual table sizes">
          {[2, 4, 6, 8].map((n) => (
            <button key={n} className={pl.capacity === n ? 'on' : ''} aria-pressed={pl.capacity === n} onClick={() => onChange({ capacity: n })}>{n} seats</button>
          ))}
        </div>
      )}
      {kind !== 'table' && (
        <>
          <input className="ed2-name" style={{ marginTop: 6 }} value={pl.price ?? ''} maxLength={40} aria-label="Price"
            placeholder={kind === 'room' ? 'Price, e.g. Rs 9,500 / night' : 'Price, e.g. Rs 1,500 per plate'} onChange={(e) => onChange({ price: e.target.value })} />
          <input className="ed2-name" style={{ marginTop: 6 }} value={pl.deposit ?? ''} maxLength={60} aria-label="Deposit"
            placeholder="Deposit, e.g. Rs 2,000 when we confirm" onChange={(e) => onChange({ deposit: e.target.value })} />
        </>
      )}
      <input className="ed2-name" style={{ marginTop: 6 }} value={pl.bookUrl ?? ''} maxLength={300} aria-label="Your own booking page"
        placeholder="Your own booking page (optional): https://…" onChange={(e) => onChange({ bookUrl: e.target.value.trim() || undefined })} />
      {kind === 'room' && (
        <>
          <input className="ed2-name" style={{ marginTop: 6 }} value={pl.availabilityUrl ?? ''} maxLength={300} aria-label="Availability from your booking engine"
            placeholder="Availability from your booking engine (optional): https://…" onChange={(e) => onChange({ availabilityUrl: e.target.value.trim() || undefined })} />
          <p className="ed2-muted ed2-fine">
            Nights you mark booked in Reservations are struck out for visitors. With your engine&apos;s availability link (it can use {'{checkin}'} {'{checkout}'} {'{guests}'}, and
            answers {'{ "booked": [nights] }'}), the nights taken there are too. To try it: /api/demo-engine/availability?checkin={'{checkin}'}&amp;checkout={'{checkout}'}&amp;room=deluxe
          </p>
        </>
      )}
      {kind === 'table' ? (
        <>
          <p className="ed2-muted ed2-fine">
            Put one on every table guests can book: name it above and set its seats. Visitors press Reserve this table, pick a day and a time,
            and can switch to any other table in this room. A table is never asked for twice at one sitting. Times follow the hours under
            Website → Table booking (9:00 to 21:30 until you set them). Requests come to Reservations for you to confirm; publish to put them live.
          </p>
          <div className="ed2-row" style={{ marginTop: 6 }}>
            <button onClick={onAddTable} title="Aim the dot in the middle of the view at the next table first">＋ Next table, where the dot is</button>
          </div>
        </>
      ) : (
        <p className="ed2-muted ed2-fine">
          Visitors who open it see this and press Book now. Their request comes to Reservations, where you confirm or decline it and the guest is told.
          With your own booking page, Book now sends them there with their dates filled in ({'{checkin}'} {'{checkout}'} {'{guests}'} in the link).
        </p>
      )}
      {options.length > 0 && (
        <label className="ed2-fine" style={{ display: 'grid', gap: 4, marginTop: 8 }}>
          <span className="ed2-muted">Or take it through the website’s {kind === 'hall' ? 'event' : kind} booking, with live availability:</span>
          <select className="ed2-name" value={value} onChange={(e) => pick(e.target.value)}>
            <option value="">— no, use Book now above —</option>
            {options.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </label>
      )}
    </>
  );
}

function AudioSection({ hs, setPayload }: { hs: Hotspot; setPayload: (patch: Hotspot['payload']) => void }) {
  const p = hs.payload || {};
  const [upload, setUpload] = useState<{ sent: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const sound = useSound();
  const url = resolveAsset(p.audio);
  const playing = !!url && sound.playing === url;
  const mb = (n: number) => `${(n / 1048576).toFixed(2)} MB`;

  useEffect(() => () => stopClip(), []); // leaving this hotspot stops its preview

  const pick = (file?: File) => {
    if (!file) return;
    setError('');
    setUpload({ sent: 0, total: file.size });
    uploadAudio(file, (pr) => setUpload({ sent: pr.bytesSent, total: pr.bytesTotal }))
      .then((ref) => setPayload({ audio: ref }))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'The upload failed. Try again.'))
      .finally(() => setUpload(null));
  };

  return (
    <Section title="Audio">
      {p.audio ? (
        <>
          <p className="ed2-pose">{p.audio.split('/').pop()}</p>
          <div className="ed2-row">
            <button onClick={() => {
              if (playing) { stopClip(); return; }
              if (sound.muted) setMuted(false);
              if (url) playClip(url);
            }}>{playing ? '■ Stop' : sound.loading === url ? 'Loading…' : '▶ Play'}</button>
            <button onClick={() => { stopClip(); setPayload({ audio: undefined }); }}>Remove</button>
          </div>
        </>
      ) : upload ? (
        <p className="ed2-pose">Uploading {mb(upload.sent)} of {mb(upload.total)}</p>
      ) : (
        <label className="ed2-filepick">
          <input type="file" accept=".m4a,audio/mp4" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
          <span>＋ Add audio (.m4a)</span>
        </label>
      )}
      {error && <p className="ed2-warn ed2-fine">{error}</p>}
      {p.audio && sound.error && <p className="ed2-warn ed2-fine">{sound.error}</p>}

      <textarea
        className="ed2-name ed2-area" rows={3} style={{ marginTop: 8 }}
        placeholder="Transcript — what the audio says"
        value={p.transcript ?? ''} onChange={(e) => setPayload({ transcript: e.target.value })}
      />
      {p.audio && !p.transcript?.trim() && (
        <p className="ed2-warn ed2-fine">Add a transcript. Many visitors never turn sound on, and they miss everything it says.</p>
      )}
      <p className="ed2-muted ed2-fine">Plays when a visitor opens this hotspot with sound on. AAC .m4a, mono, 96 kbps, 2 MB at most.</p>
    </Section>
  );
}
