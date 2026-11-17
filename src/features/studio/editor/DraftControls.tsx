'use client';

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SCENE_BY_ID } from "../../scene/scenes";
import { loadTracks } from "../../scene/viewpoints";
import { saveDraft, updateDestinationDraft } from "../draftActions";
import { DraftRecovery } from "../DraftRecovery";
import { hotspotsFor, sceneDocFor, hasUnsavedChanges, setHotspots, copyHotspotId } from "../../scene/sceneDoc";
import { ApiError } from "../../../lib/api";
import { HotspotIcon } from "../../hotspots/HotspotIcon";

/**
 * Copy this space's hotspots and camera tracks into other spaces of the
 * project: 20 identical hotel rooms get the same "Minibar" and "Bathroom"
 * hotspots and the same walk-through in one go. The copies land at the same
 * coordinates, so they fit spaces scanned alike; move any that don't. Each
 * space is saved as it's copied into (its draft only: publish as usual).
 */
export function CopyToSpaces({ sceneId, propertyId, onClose }: { sceneId: string; propertyId: string | null; onClose: () => void }) {
  const hotspots = hotspotsFor(sceneId);
  const tracks = sceneDocFor(sceneId).tracks;
  const others = Object.values(SCENE_BY_ID).filter((x) => x.id !== sceneId && (x.propertyId ?? null) === propertyId);
  const [pickHs, setPickHs] = useState(() => new Set(hotspots.map((h) => h.id)));
  const [pickTr, setPickTr] = useState(() => new Set<string>());
  const [to, setTo] = useState(() => new Set<string>());
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');
  const flip = (set: Set<string>, id: string) => { const n = new Set(set); if (n.has(id)) n.delete(id); else n.add(id); return n; };

  const copy = async () => {
    setBusy(true); setError('');
    let n = 0;
    try {
      for (const target of to) {
        await updateDestinationDraft(target, () => {
          const newHs = hotspots.filter((h) => pickHs.has(h.id)).map((h) => ({ ...structuredClone(h), id: copyHotspotId(target) }));
          setHotspots(target, [...hotspotsFor(target), ...newHs]);
          const newTr = tracks.filter((t) => pickTr.has(t.id)).map((t) => ({ ...structuredClone(t), id: `${t.id}-${target}-${Date.now().toString(36)}` }));
          if (newTr.length) loadTracks(target, [...sceneDocFor(target).tracks, ...newTr], { replace: true });
        });
        n += 1;
      }
      setDone(`Copied into ${n} space${n === 1 ? '' : 's'} and saved their drafts. Open each to check the spots, then publish.`);
      setTo(new Set());
    } catch (e) {
      setError(`${n ? `Copied into ${n}, then: ` : ''}${e instanceof Error ? e.message : 'the copy failed.'}`);
    } finally { setBusy(false); }
  };

  return createPortal(
    <div className="np-scrim" onClick={onClose}>
      <div className="pl-dialog pl-dialog-wide" role="dialog" aria-modal="true" aria-label="Copy to other spaces" onClick={(e) => e.stopPropagation()}>
        <header className="np-head">
          <h2>Copy to other spaces</h2>
          <button className="np-x" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="pl-dialog-body ed2-copy">
          <p className="pl-sub">For spaces scanned alike, such as identical rooms: the copies land at the same spots. Move any that don’t fit.</p>
          <div className="ed2-copy-cols">
            <fieldset>
              <legend>What</legend>
              {hotspots.map((h) => (
                <label key={h.id}><input type="checkbox" checked={pickHs.has(h.id)} onChange={() => setPickHs(flip(pickHs, h.id))} /> <HotspotIcon type={h.type} /> {h.label}</label>
              ))}
              {tracks.map((t) => (
                <label key={t.id}><input type="checkbox" checked={pickTr.has(t.id)} onChange={() => setPickTr(flip(pickTr, t.id))} /> ▸ {t.label} <small>track</small></label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Into</legend>
              {others.length ? others.map((x) => (
                <label key={x.id}><input type="checkbox" checked={to.has(x.id)} onChange={() => setTo(flip(to, x.id))} /> {x.name}</label>
              )) : <p className="pl-sub">No other spaces in this project yet.</p>}
              {others.length > 1 && (
                <button type="button" className="pl-btn" onClick={() => setTo(to.size === others.length ? new Set() : new Set(others.map((x) => x.id)))}>
                  {to.size === others.length ? 'None' : 'All'}
                </button>
              )}
            </fieldset>
          </div>
          {done && <p className="pl-sub" role="status">{done}</p>}
          {error && <p className="ed2-warn ed2-fine">{error}</p>}
          <button className="pl-btn pl-btn-main" disabled={busy || !to.size || !(pickHs.size || pickTr.size)} onClick={copy}>
            {busy ? 'Copying…' : `Copy ${pickHs.size + pickTr.size} into ${to.size} space${to.size === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>,
    // inside the editor, whose colours the dialog uses
    document.querySelector('.ed2') ?? document.body
  );
}

/** Explicitly saves the open draft through the signed-in Studio session. */
export function SaveToServerButton({ sceneId }: { sceneId: string }) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [conflict, setConflict] = useState(false);
  const [lastSaved, setLastSaved] = useState<{ at: Date; summary: string } | null>(null);
  const dirty = hasUnsavedChanges(sceneId);

  useEffect(() => { setLastSaved(null); setStatus('idle'); }, [sceneId]);
  useEffect(() => {
    if (!lastSaved) return;
    const t = setTimeout(() => setLastSaved(null), 6000);
    return () => clearTimeout(t);
  }, [lastSaved]);

  const save = async () => {
    setStatus('saving'); setConflict(false);
    try {
      // Read the saved doc first: saving blind would overwrite fields the
      // studio doesn't edit (uploaded variants, transform, status).
      const sent = await saveDraft(sceneId);
      const n = (k: number, one: string) => `${k} ${one}${k === 1 ? '' : 's'}`;
      setLastSaved({
        at: new Date(),
        summary: `"${sent.title}": ${n(sent.tracks.length, 'camera track')}, ${n(sent.hotspots.length, 'hotspot')}, ${n(sent.colliders?.length ?? 0, 'collision box').replace(/xs$/, 'xes')}, start view, name`
      });
      setStatus('idle');
    } catch (err) {
      setConflict(err instanceof ApiError && err.status === 409);
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Save failed.');
    }
  };

  return (
    <div className="ed2-save">
      <span
        className={`ed2-save-state ${dirty ? 'is-dirty' : 'is-clean'}`}
        title="Saves only the space that's open. Other spaces keep their changes until you open and save them."
      >
        <span className="ed2-save-dot" aria-hidden />
        {dirty ? 'Unsaved changes' : 'All changes saved'}
      </span>
      <button className="ed2-savebtn" onClick={save} disabled={status === 'saving' || !dirty}>
        {status === 'saving' ? 'Saving…' : 'Save space'}
      </button>
      {(lastSaved || status === 'error') && (
        <div className={`ed2-save-toast ${status === 'error' ? 'is-err' : ''}`}>
          <p role="status">{status === 'error'
            ? `Not saved: ${message}`
            : `Saved at ${lastSaved!.at.toLocaleTimeString()}. ${lastSaved!.summary}.`}</p>
          {status === 'error' && <DraftRecovery sceneId={sceneId} conflict={conflict} onReload={() => { setStatus('idle'); setConflict(false); setLastSaved(null); }} />}
        </div>
      )}
    </div>
  );
}
