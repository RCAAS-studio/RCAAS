'use client';
/**
 * What kind of place a project is (2026-11-03): one card per starter in
 * siteTemplates.ts, with the places it suits, and under the chosen one exactly
 * what it sets up. A radio group: Tab lands on the chosen card, the arrow keys
 * (and Home/End) move the choice. Used by the New project dialog and the
 * project home's "Kind of place".
 */
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { toast } from '../../components/ui/Ask';
import { getSiteDraft, saveSiteDraft, setProjectKind, type SiteDoc } from '../../lib/api';
import type { Property } from '../../@types/scene.types';
import { TEMPLATES, starterAdds, starterParts, templateFor, type PlaceKind } from './siteTemplates';

const NEXT: Record<string, (i: number, n: number) => number> = {
  ArrowRight: (i) => i + 1, ArrowDown: (i) => i + 1, ArrowLeft: (i) => i - 1, ArrowUp: (i) => i - 1,
  Home: () => 0, End: (_i, n) => n - 1
};

export function PlaceKindPicker({ value, onChange, disabled }: { value: PlaceKind | null; onChange: (k: PlaceKind) => void; disabled?: boolean }) {
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const at = TEMPLATES.findIndex((t) => t.kind === value);
  const key = (e: React.KeyboardEvent, i: number) => {
    const to = NEXT[e.key];
    if (!to) return;
    e.preventDefault();
    const n = TEMPLATES.length;
    const j = (to(i, n) + n) % n;
    onChange(TEMPLATES[j].kind);
    cards.current[j]?.focus();
  };
  return (
    <div className="np-kinds" role="radiogroup" aria-label="Kind of place">
      {TEMPLATES.map((t, i) => (
        <button key={t.kind} ref={(el) => { cards.current[i] = el; }} type="button" role="radio" aria-checked={value === t.kind}
          tabIndex={i === (at < 0 ? 0 : at) ? 0 : -1} disabled={disabled}
          className={`np-kind${value === t.kind ? ' is-on' : ''}`} onClick={() => onChange(t.kind)} onKeyDown={(e) => key(e, i)}>
          <Icon name={t.icon} className="np-kind-ic" />
          <b>{t.label}</b>
          <small>{t.who}</small>
        </button>
      ))}
    </div>
  );
}

/** Exactly what a new project of this kind starts with. */
export function StarterSummary({ kind }: { kind: PlaceKind }) {
  const t = templateFor(kind);
  const parts = starterParts(t);
  return (
    <div className="np-kind-note" aria-live="polite">
      <b>{t.label} starts with</b>
      <ul>
        {parts.length ? parts.map((p) => <li key={p}>{p}</li>) : <li>A blank website: no booking sections to fill in.</li>}
        <li>Its first space is named “{t.firstSpace}” if you upload a capture and leave the name blank.</li>
      </ul>
      <small>Nothing goes live until you publish. You can change the kind later from the project’s home.</small>
    </div>
  );
}

/**
 * The project home's "Kind of place" (owner only): pick another kind and see,
 * before anything is saved, exactly which website sections it adds to the draft
 * (only ones the draft hasn't got) and which it keeps. Feature switches are never
 * flipped here; the notes say when one of them matters.
 */
export function ChangePlaceKind({ project, owner, onChanged }: { project: Property; owner: boolean; onChanged: () => void }) {
  const now = project.kind ?? null;
  const f = project.features;
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<PlaceKind | null>(now);
  const [draft, setDraft] = useState<SiteDoc | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || draft || f?.website === false) return;
    let live = true;
    getSiteDraft(project.id).then((d) => { if (live && d) setDraft(d.draft); }).catch((e: Error) => live && setError(`The website draft didn’t load (${e.message}), so what it adds can’t be shown yet.`));
    return () => { live = false; };
  }, [open, draft, project.id, f?.website]);

  const cur = now ? templateFor(now) : null;
  const t = pick ? templateFor(pick) : null;
  const siteOn = f?.website !== false;
  const plan = t && draft && siteOn ? starterAdds(draft, t) : null;
  const booksSomething = !!t?.site && ['stays', 'booking', 'events'].some((k) => k in (t.site ?? {}));

  const apply = async () => {
    if (!t || !pick) return;
    setBusy(true);
    setError('');
    try {
      // the sections first: if they fail, the kind stays as it was and nothing has changed
      if (plan && draft && Object.keys(plan.patch).length) await saveSiteDraft(project.id, { ...draft, ...plan.patch });
      await setProjectKind(project.id, pick);
      const n = plan ? Object.keys(plan.patch).length : 0;
      toast(n ? `Now a ${t.label.toLowerCase()}: ${n} section${n === 1 ? '' : 's'} added to the website draft.` : `Now a ${t.label.toLowerCase()}. The website already had what it uses.`);
      setOpen(false);
      setDraft(null);
      onChanged();
    } catch (e) {
      setError(`That didn’t save (${e instanceof Error ? e.message : 'unknown error'}). Nothing was changed; try again.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="ph-block" aria-labelledby="ph-kind">
      <h2 className="ph-h" id="ph-kind">Kind of place</h2>
      {cur
        ? <p className="ph-kind-now"><Icon name={cur.icon} /> <b>{cur.label}</b> <span className="pl-sub">{cur.who}</span></p>
        : <p className="pl-sub">Not chosen yet. Choosing one adds the website sections that kind of place uses.</p>}
      {!open && (owner
        ? <span className="ph-links"><button className="pl-btn" onClick={() => { setPick(now); setOpen(true); }}>{cur ? 'Change the kind…' : 'Choose a kind…'}</button></span>
        : <p className="pl-sub">Only the owner can change it.</p>)}
      {open && (
        <div className="ph-kind-pick">
          <PlaceKindPicker value={pick} onChange={setPick} disabled={busy} />
          {t && pick !== now && (
            <div className="np-kind-note" aria-live="polite">
              {!siteOn && <p>The website is switched off for this project, so no website sections are added. Switch Website on under “What this project uses”, then change the kind again to add them.</p>}
              {siteOn && !plan && !error && <p className="pl-sub">Reading the website draft…</p>}
              {plan && (plan.adds.length
                ? <><b>Changing to {t.label} adds to the website draft</b><ul>{plan.adds.map((a) => <li key={a}>{a}</li>)}</ul></>
                : <p>Nothing to add: the website already has every section {t.label.toLowerCase()} uses.</p>)}
              {plan && plan.keeps.length > 0 && <ul className="is-kept">{plan.keeps.map((k) => <li key={k}>{k}</li>)}</ul>}
              {t.features?.reservations === false && f?.reservations !== false && <p>Bookings stay switched on. Switch off Bookings under “What this project uses” if this place doesn’t take them.</p>}
              {booksSomething && f?.reservations === false && <p>Bookings is switched off for this project, so its booking sections stay hidden until you switch it on under “What this project uses”.</p>}
              <small>Nothing is removed, and nothing goes live until you publish the website.</small>
            </div>
          )}
          {error && <p className="ph-kind-err" role="alert">{error}</p>}
          <span className="ph-links">
            <button className="pl-btn pl-btn-main" disabled={!t || pick === now || busy || (siteOn && !plan)} onClick={apply}>
              {busy ? 'Saving…' : t && pick !== now ? `Change to ${t.label}` : 'Choose a different kind'}
            </button>
            <button className="pl-btn" disabled={busy} onClick={() => { setOpen(false); setError(''); }}>Cancel</button>
          </span>
        </div>
      )}
    </section>
  );
}
