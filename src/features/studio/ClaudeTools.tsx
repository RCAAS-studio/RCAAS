'use client';

import { useState } from 'react';
import { suggestHotspots, translateHotspots } from '../../lib/api';
import { hotspotsFor } from '../scene/sceneDoc';
import { walkerCfg } from '../scene/walkerConfig';
import type { EditorApi } from '../../@types/app.types';
import type { Hotspot } from '../../@types/hotspot.types';

/**
 * Claude in the studio (2026-10-13; server routes/studioAi.js). Everything it
 * gives is a draft for the author: suggestions are added only when ticked, and
 * translations land in each hotspot's "In other languages" to check. Nothing is
 * saved until the author saves.
 */

type Pose = { x: number; y: number; z: number; yaw: number };
type Found = { title: string; tagline: string; pose: Pose; hotspots: { label: string; text: string; x: number; y: number; pick: boolean }[] };

/** The view as a JPEG at most `max` px across: enough for Claude to see, small to send. */
function shrink(url: string, max = 1280): Promise<string> {
  return new Promise((ok) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      if (k === 1) return ok(url);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      ok(c.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => ok(url);
    img.src = url;
  });
}

const moved = (a: Pose, b: Pose | null) => !b || Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) > 0.05 * (walkerCfg.unitScale || 1) || Math.abs(a.yaw - b.yaw) > 0.03;

export function ClaudeSection({ ed, sceneId, pose, onRename }: { ed: EditorApi; sceneId: string; pose: Pose | null; onRename: (title: string) => void }) {
  const [busy, setBusy] = useState<'' | 'suggest' | 'translate'>('');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [found, setFound] = useState<Found | null>(null);

  const run = async (what: 'suggest' | 'translate', fn: () => Promise<void>) => {
    setBusy(what); setError(''); setNote('');
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : 'That didn’t work. Try again.'); } finally { setBusy(''); }
  };

  const suggest = () => run('suggest', async () => {
    const shot = ed.snapshot();
    if (!shot) throw new Error('Couldn’t take a picture of the view. Wait for the space to load.');
    const at = ed.getPose();
    const r = await suggestHotspots(sceneId, await shrink(shot));
    if (!r?.hotspots.length) { setNote('Claude found nothing to point out in this view. Try another one.'); return; }
    setFound({ ...r, pose: at, hotspots: r.hotspots.map((h) => ({ ...h, pick: true })) });
  });

  // Each ticked one goes on the surface under its place in the picture, a little towards the camera.
  const add = () => {
    if (!found) return;
    const rect = document.querySelector('.app-root canvas')?.getBoundingClientRect();
    const cam = ed.getPose();
    const u = walkerCfg.unitScale || 1;
    let n = 0;
    for (const h of found.hotspots.filter((x) => x.pick)) {
      const made = ed.addHotspot('text');
      if (!made) continue;
      const p = rect ? ed.surfaceAt(h.x * rect.width, h.y * rect.height) : null;
      let position = made.position;
      if (p) {
        const d = Math.hypot(cam.x - p[0], cam.y - p[1], cam.z - p[2]) || 1;
        const k = Math.min(0.05 * u, d / 2) / d;
        position = [p[0] + (cam.x - p[0]) * k, p[1] + (cam.y - p[1]) * k, p[2] + (cam.z - p[2]) * k].map((v) => Math.round(v * 1000) / 1000) as [number, number, number];
      }
      ed.updateHotspot(made.id, { label: h.label, payload: { ...made.payload, text: h.text }, position });
      n++;
    }
    setFound(null);
    setNote(`Added ${n === 1 ? '1 hotspot' : `${n} hotspots`}. Check where each sits and what it says, then save.`);
  };

  const translate = () => run('translate', async () => {
    const list = hotspotsFor(sceneId).filter((h) => h.label?.trim());
    if (!list.length) throw new Error('There is nothing to translate yet: give the hotspots names first.');
    const r = await translateHotspots(sceneId, list.map((h) => ({
      id: h.id, label: h.label, ...(h.payload?.text ? { text: h.payload.text } : {}), ...(h.payload?.caption ? { caption: h.payload.caption } : {})
    })));
    for (const t of r?.items ?? []) {
      const h = list.find((x) => x.id === t.id);
      if (h) ed.updateHotspot(t.id, { i18n: { ...h.i18n, ne: t.ne, zh: t.zh } });
    }
    const n = r?.items.length ?? 0;
    setNote(`Translated ${n === 1 ? '1 hotspot' : `${n} hotspots`} into Nepali and Chinese. Check them under each hotspot’s “In other languages”, then save.`);
  });

  return (
    <details className="ed2-adv ed2-claude">
      <summary>With Claude</summary>
      <div className="ed2-row">
        <button onClick={suggest} disabled={!!busy}>{busy === 'suggest' ? 'Looking…' : 'Suggest hotspots for this view'}</button>
        <button onClick={translate} disabled={!!busy}>{busy === 'translate' ? 'Translating…' : 'Translate hotspots (नेपाली, 中文)'}</button>
      </div>
      {busy === 'suggest' && <p className="ed2-muted ed2-fine">Keep the view still while Claude looks: the hotspots are placed from it.</p>}
      {found && (
        <div className="ed2-suggest">
          {found.title && (
            <p className="ed2-fine">
              A name for the space: <b>{found.title}</b>{' '}
              <button className="ed2-linkbtn" onClick={() => { onRename(found.title); setFound({ ...found, title: '' }); }}>Use it</button>
              {found.tagline && <><br /><span className="ed2-muted">{found.tagline}</span></>}
            </p>
          )}
          <ul>
            {found.hotspots.map((h, i) => (
              <li key={i}>
                <label>
                  <input type="checkbox" checked={h.pick} onChange={() => setFound({ ...found, hotspots: found.hotspots.map((x, j) => (j === i ? { ...x, pick: !x.pick } : x)) })} />
                  <span><b>{h.label}</b> {h.text}</span>
                </label>
              </li>
            ))}
          </ul>
          {moved(found.pose, pose) && <p className="ed2-warn ed2-fine">The view has moved since Claude looked, so these would land in the wrong places. Go back, or suggest again from here.</p>}
          <div className="ed2-row">
            <button onClick={add} disabled={!found.hotspots.some((h) => h.pick)}>Add {found.hotspots.filter((h) => h.pick).length} hotspots</button>
            <button onClick={() => setFound(null)}>Discard</button>
          </div>
        </div>
      )}
      {note && <p className="ed2-muted ed2-fine">{note}</p>}
      {error && <p className="ed2-warn ed2-fine">{error}</p>}
      <p className="ed2-muted ed2-fine">Claude writes only from what it can see or what you wrote: check every word before you publish.</p>
    </details>
  );
}

const LANGS = [['ne', 'नेपाली · Nepali'], ['zh', '中文 · Chinese']] as const;

/** A hotspot's words in the tour's other languages: what Translate filled in, to check and edit. */
export function TranslationsSection({ hs, set }: { hs: Hotspot; set: (patch: Partial<Hotspot>) => void }) {
  const done = LANGS.filter(([l]) => hs.i18n?.[l]?.label).length;
  const edit = (l: 'ne' | 'zh', k: 'label' | 'text' | 'caption', v: string) => set({ i18n: { ...hs.i18n, [l]: { ...hs.i18n?.[l], [k]: v } } });
  return (
    <details className="ed2-adv ed2-i18n">
      <summary>In other languages{done ? ` (${done} of 2)` : ''}</summary>
      {LANGS.map(([l, name]) => (
        <div key={l} className="ed2-i18n-lang">
          <p className="ed2-muted ed2-fine">{name}</p>
          <input className="ed2-name" placeholder={hs.label} value={hs.i18n?.[l]?.label ?? ''} onChange={(e) => edit(l, 'label', e.target.value)} aria-label={`Name in ${name}`} />
          {!!hs.payload?.text && (
            <textarea className="ed2-name ed2-area" rows={3} placeholder={hs.payload.text} value={hs.i18n?.[l]?.text ?? ''} onChange={(e) => edit(l, 'text', e.target.value)} aria-label={`Text in ${name}`} />
          )}
          {!!hs.payload?.caption && (
            <input className="ed2-name" placeholder={hs.payload.caption} value={hs.i18n?.[l]?.caption ?? ''} onChange={(e) => edit(l, 'caption', e.target.value)} aria-label={`Caption in ${name}`} />
          )}
        </div>
      ))}
      <p className="ed2-muted ed2-fine">Visitors who pick that language in the tour read these; an empty one shows the English. “Translate hotspots” in the Scene pane fills them for every hotspot.</p>
    </details>
  );
}
