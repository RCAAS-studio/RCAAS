'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createProperty, deleteProperty, claimProperty, getProperties, getScenes, moveSceneToProperty, renameProperty,
  setProjectStatus, getSession, LAST_PROJECT_KEY, getGallery, apiUrl, type SessionUser
} from '../../lib/api';
import { useStudioSession } from '../../features/auth/useStudioSession';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { NewProjectDialog } from '../../features/studio/NewProjectDialog';
import { TeamDialog } from '../../features/studio/TeamDialog';
import { ShareDialog, BrandingDialog, EnquiriesDialog } from '../../features/studio/ProjectDialogs';
import type { ApiScene, ProjectStatus, Property } from '../../@types/scene.types';
import '../../features/studio/editor.css';

/** Only its owner can rename, delete, rebrand or share it (an admin too sees
 *  only their own projects). The shared team password, with no account, can. */
const canManage = (p: Property, me: SessionUser | null) => !me || p.ownerId === me.id;

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
/** "In progress since 3 Oct 2026", "Delivered 12 Oct 2026", "Archived …" (store.js PROJECT_STATUSES). */
function statusLine(p: Property) {
  const status = p.status ?? 'in-progress';
  const at = p.statusAt ?? p.createdAt;
  const word = { 'in-progress': 'In progress', delivered: 'Delivered', archived: 'Archived' }[status];
  return !at ? word : status === 'in-progress' ? `${word} since ${day(at)}` : `${word} ${day(at)}`;
}
/** "2 booking requests · 1 enquiry this week", or nothing when nothing waits. */
function waitingLine(p: Property) {
  const { bookings = 0, enquiries = 0 } = p.waiting ?? {};
  return [
    bookings && `${bookings} booking ${bookings === 1 ? 'request' : 'requests'}`,
    enquiries && `${enquiries} ${enquiries === 1 ? 'enquiry' : 'enquiries'} this week`
  ].filter(Boolean).join(' · ');
}

/**
 * The studio's front door: one card per client project (a "property" in the
 * code and schema, §0.2). Each project keeps its own spaces, so Basera's
 * rooms and Nepathya College's classrooms never share a list. Spaces made
 * before projects existed, or whose project was deleted, wait in "Not in a
 * project yet" until someone files them.
 *
 * Links here are plain <a>, not <Link>: the editor behind each card holds a
 * page-singleton renderer (LCCRender), and only a full page load gives every
 * project a clean one.
 */
export default function StudioPage() {
  const ok = useStudioSession('/studio');
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [scenes, setScenes] = useState<ApiScene[]>([]);
  const [error, setError] = useState('');
  const [last, setLast] = useState<string | null>(null);
  const [me, setMe] = useState<SessionUser | null>(null);
  const [team, setTeam] = useState(false);

  useEffect(() => {
    try { setLast(localStorage.getItem(LAST_PROJECT_KEY)); } catch { /* private mode */ }
  }, []);

  useEffect(() => { getSession().then((s) => setMe(s?.user ?? null)).catch(() => {}); }, []);

  // Each project's picture: its first published space's view (the public gallery list).
  const [pics, setPics] = useState<Record<string, string>>({});
  useEffect(() => {
    getGallery().then((list) => {
      const out: Record<string, string> = {};
      for (const g of list ?? []) if (g.propertyId && g.thumb && !out[g.propertyId]) out[g.propertyId] = apiUrl(g.thumb) ?? '';
      setPics(out);
    }).catch(() => {}); // no pictures: the letter tiles stay
  }, []);

  const load = useCallback(() => {
    setError('');
    Promise.all([getProperties(), getScenes()])
      .then(([p, s]) => { setProperties(p ?? []); setScenes(s ?? []); })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : '';
        // A 404 here means the API process predates projects: it's running
        // old code, not missing data. Say so instead of a bare status line.
        setError(/^404\b/.test(msg)
          ? 'The studio server is running an older version without projects. Restart it: cd server && npm run dev (it reloads itself after that).'
          : msg || 'The studio server isn’t answering.');
      });
  }, []);
  useEffect(() => { if (ok) load(); }, [ok, load]);

  if (!ok) return <div className="ed2-boot">Checking your session…</div>;

  const known = new Set((properties ?? []).map((p) => p.id));
  const loose = scenes.filter((s) => !s.propertyId || !known.has(s.propertyId));
  // Last opened first, so the project you're working on is the first card.
  const ordered = [...(properties ?? [])].sort((a, b) => Number(b.id === last) - Number(a.id === last));
  // Archived projects stay on record, folded away at the foot of the list.
  const active = ordered.filter((p) => p.status !== 'archived');
  const archived = ordered.filter((p) => p.status === 'archived');

  return (
    <div className="ed2">
      <main className="pl">
        <header className="pl-top">
          <span className="pl-brand">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the studio’s 3D renderer is a page singleton: leave with a full page load */}
            <a href="/" className="ed2-home" aria-label="Home" title="Home">
              {/* the RCAAS mark: a viewfinder with a dot, as in the site's logo */}
              <svg viewBox="0 0 24 24" aria-hidden><path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" /><circle cx="12" cy="12" r="3.4" /></svg>
            </a>
            <span className="pl-brand-word">RCAAS <span>Studio</span></span>
          </span>
          <span className="pl-top-actions">
            {me?.role === 'admin' && <button className="pl-btn" onClick={() => setTeam(true)}>Team</button>}
            <ThemeToggle className="ed2-theme" />
          </span>
        </header>
        {team && <TeamDialog onClose={() => setTeam(false)} />}

        <section className="pl-body">
          <div className="pl-head">
            <div>
              <h1>Projects</h1>
              <p className="pl-sub">One per client: a hotel, a college, a campus. Each keeps its own spaces.</p>
            </div>
            {properties && me?.role !== 'staff' && <NewProjectButton />}
          </div>

          {error && (
            <div className="pl-empty">
              <p>{error}</p>
              <button className="pl-btn" onClick={load}>Try again</button>
            </div>
          )}
          {!properties && !error && <p className="pl-sub">Loading projects…</p>}

          {properties && properties.length === 0 && !loose.length && (
            <div className="pl-empty">
              <p>No projects yet. Add your first client with <b>New project</b>.</p>
            </div>
          )}

          {active.length > 0 && (
            <div className="pl-grid">
              {active.map((p) => (
                <ProjectCard key={p.id} project={p} current={p.id === last} me={me} onChanged={load} pic={pics[p.id]} />
              ))}
            </div>
          )}

          {archived.length > 0 && (
            <details className="pl-archived">
              <summary><h2>Archived</h2><span className="pl-card-meta">{archived.length}</span></summary>
              <p className="pl-sub">Finished or dropped projects, kept with their spaces, website and history. Their published tours stay up. Restore one from its ⋯ menu.</p>
              <div className="pl-grid">
                {archived.map((p) => (
                  <ProjectCard key={p.id} project={p} current={false} me={me} onChanged={load} pic={pics[p.id]} />
                ))}
              </div>
            </details>
          )}

          {/* Always shown when there are unfiled spaces — with no projects at
           *  all, this is the only way back to them. */}
          {properties && loose.length > 0 && (
            <div className="pl-loose">
              <div className="pl-loose-head">
                <div>
                  <h2>Not in a project yet</h2>
                  <p className="pl-sub">
                    {loose.length === 1 ? '1 space' : `${loose.length} spaces`} made before projects, or left when a project was deleted.
                    Group them into a project to open them, or move each one into its client.
                  </p>
                </div>
                <GroupLoose spaces={loose} onDone={load} />
              </div>
              {loose.map((s) => (
                <LooseSpace key={s.id} scene={s} properties={properties} onMoved={load} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/** One project: its picture, name, where it stands and what waits on it; the
 *  card opens its home, where its tools are. The ⋯ menu (its owner only) holds
 *  what changes the project itself: rename, share, branding, status, delete. */
function ProjectCard({ project, current, me, onChanged, pic }: { project: Property; current: boolean; me: SessionUser | null; onChanged: () => void; pic?: string }) {
  const [menu, setMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [branding, setBranding] = useState(false);
  const [leads, setLeads] = useState(false);
  const [draft, setDraft] = useState(project.title);
  const [error, setError] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const count = project.spaceCount ?? 0;
  const mine = canManage(project, me);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menu]);

  const saveName = async () => {
    const next = draft.trim();
    if (!next || next === project.title) { setRenaming(false); setDraft(project.title); return; }
    try {
      await renameProperty(project.id, next);
      setRenaming(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not rename it. Try again.');
    }
  };

  // A project from before accounts: its name only, until someone claims it.
  if (project.claimable) {
    const claim = async () => {
      if (!window.confirm(`Claim "${project.title}"?

It becomes yours: from then on only you, and whoever you share it with, can see it.`)) return;
      try { await claimProperty(project.id); onChanged(); } catch (e) { setError(e instanceof Error ? e.message : 'Could not claim it. Try again.'); }
    };
    return (
      <div className="pl-card pl-card-unclaimed">
        <span className="pl-card-tile" aria-hidden>{project.title.trim()[0]}</span>
        <span className="pl-card-txt">
          <span className="pl-card-title">{project.title}</span>
          <span className="pl-card-meta">From before accounts · {count === 1 ? '1 space' : `${count} spaces`}</span>
          {error && <span className="ed2-warn ed2-fine">{error}</span>}
        </span>
        <button className="pl-btn" onClick={claim}>Claim</button>
      </div>
    );
  }

  // What the project uses (its features, set on its home): what it doesn't isn't offered.
  const f = project.features ?? { enquiries: true, reservations: true, website: true, report: true, activity: true };

  // The client's staff: its enquiries, reservations and report, nothing to edit.
  if (project.access === 'staff') {
    const base = `/studio/${encodeURIComponent(project.id)}`;
    return (
      <div className="pl-card pl-card-staff">
        <span className="pl-card-tile" aria-hidden>{project.title.trim()[0]}</span>
        <span className="pl-card-txt">
          <a className="pl-card-title pl-card-link" href={`${base}/reservations`}>{project.title}</a>
          <span className="pl-card-meta"><span className="pl-tag">Staff</span> Enquiries, reservations and the report</span>
        </span>
        <span className="pl-staff-links">
          {f.enquiries && <button className="pl-btn" onClick={() => setLeads(true)}>Enquiries</button>}
          {f.reservations && <a className="pl-btn" href={`${base}/reservations`}>Reservations</a>}
          {f.report && <a className="pl-btn" href={`${base}/report`} target="_blank" rel="noopener">Report ↗</a>}
        </span>
        {leads && <EnquiriesDialog project={project} canEdit={false} onClose={() => setLeads(false)} />}
      </div>
    );
  }

  const remove = async () => {
    setMenu(false);
    const spaces = count === 1 ? 'Its 1 space moves' : `Its ${count} spaces move`;
    if (!window.confirm(`Delete the project "${project.title}"?\n\n${count ? `${spaces} to "Not in a project yet" and published tours keep working, but ` : ''}its website, photos and logo are deleted. To keep it on record, archive it instead.`)) return;
    try {
      await deleteProperty(project.id);
      try { if (localStorage.getItem(LAST_PROJECT_KEY) === project.id) localStorage.removeItem(LAST_PROJECT_KEY); } catch { /* private mode */ }
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete it. Try again.');
    }
  };

  const status = project.status ?? 'in-progress';
  const setStatus = async (next: ProjectStatus) => {
    setMenu(false);
    setError('');
    try { await setProjectStatus(project.id, next); onChanged(); } catch (e) { setError(e instanceof Error ? e.message : 'Could not change it. Try again.'); }
  };
  const waiting = waitingLine(project);

  return (
    <div className={`pl-card ${current ? 'is-current' : ''} ${status === 'archived' ? 'is-archived' : ''}`}>
      {pic
        // a published space's picture, from the API (next/image isn't set up for it)
        // eslint-disable-next-line @next/next/no-img-element
        ? <img className="pl-card-pic" src={pic} alt="" loading="lazy" />
        : <span className="pl-card-tile" aria-hidden>{project.title.trim()[0]}</span>}
      <span className="pl-card-txt">
        {renaming ? (
          <input
            className="pl-rename" value={draft} autoFocus maxLength={80} aria-label="Project name"
            onChange={(e) => setDraft(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              else if (e.key === 'Escape') { setDraft(project.title); setRenaming(false); }
            }}
          />
        ) : (
          // The whole card opens the project; the menu button sits above this link.
          <a className="pl-card-title pl-card-link" href={`/studio/${project.id}`}>{project.title}</a>
        )}
        <span className="pl-card-meta">
          {count === 1 ? '1 space' : `${count} spaces`}
          {current && <span className="pl-tag">Last opened</span>}
        </span>
        <span className={`pl-status is-${status}`}>{statusLine(project)}</span>
        {waiting && <span className="pl-card-wait">{waiting}</span>}
        {error && <span className="ed2-warn ed2-fine">{error}</span>}
      </span>

      {mine && (
        <div className="pl-menu" ref={menuRef}>
          <button className="pl-menu-btn" aria-label={`More actions for ${project.title}`} aria-expanded={menu} onClick={() => setMenu((v) => !v)}>⋯</button>
          {menu && (
            <div className="pl-menu-list" role="menu">
              <button role="menuitem" onClick={() => { setMenu(false); setError(''); setDraft(project.title); setRenaming(true); }}>Rename</button>
              <button role="menuitem" onClick={() => { setMenu(false); setSharing(true); }}>Share…</button>
              <button role="menuitem" onClick={() => { setMenu(false); setBranding(true); }}>Branding…</button>
              {status === 'in-progress' && <button role="menuitem" onClick={() => setStatus('delivered')}>Mark delivered</button>}
              {status === 'delivered' && <button role="menuitem" onClick={() => setStatus('in-progress')}>Mark in progress</button>}
              {status === 'archived'
                ? <button role="menuitem" onClick={() => setStatus('in-progress')}>Restore</button>
                : <button role="menuitem" onClick={() => setStatus('archived')}>Archive</button>}
              <button role="menuitem" className="is-danger" onClick={remove}>Delete project</button>
            </div>
          )}
        </div>
      )}
      {sharing && <ShareDialog project={project} onClose={() => setSharing(false)} />}
      {branding && <BrandingDialog project={project} onClose={() => { setBranding(false); onChanged(); }} />}
    </div>
  );
}

function NewProjectButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="pl-btn pl-btn-main" onClick={() => setOpen(true)}>＋ New project</button>
      {open && <NewProjectDialog onClose={() => setOpen(false)} />}
    </>
  );
}

/** Put every unfiled space into one new project (named "Demo project" unless
 *  changed), then open it. The way back to the pre-projects studio. */
function GroupLoose({ spaces, onDone }: { spaces: ApiScene[]; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const group = async () => {
    const name = window.prompt(`Name the project for these ${spaces.length} spaces:`, 'Demo project');
    if (!name?.trim()) return;
    setBusy(true);
    setError('');
    try {
      const p = await createProperty(name);
      if (!p) throw new Error('The server did not confirm the project. Try again.');
      for (const s of spaces) await moveSceneToProperty(s.id, p.id);
      location.assign(`/studio/${p.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not group them. Try again.');
      setBusy(false);
      onDone();
    }
  };
  return (
    <div className="pl-group">
      <button className="pl-btn pl-btn-main" disabled={busy} onClick={group}>{busy ? 'Grouping…' : 'Group into a project'}</button>
      {error && <p className="ed2-warn ed2-fine">{error}</p>}
    </div>
  );
}

function LooseSpace({ scene, properties, onMoved }: { scene: ApiScene; properties: Property[]; onMoved: () => void }) {
  const [error, setError] = useState('');
  return (
    <div className="pl-row">
      <span className="pl-row-name">{scene.title ?? scene.id}</span>
      <select
        className="pl-select" value="" aria-label={`Move ${scene.title ?? scene.id} to a project`}
        onChange={(e) => {
          const to = e.target.value;
          if (!to) return;
          setError('');
          moveSceneToProperty(scene.id, to)
            .then(onMoved)
            .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not move it. Try again.'));
        }}
      >
        <option value="">Move to…</option>
        {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
      </select>
      {error && <p className="ed2-warn ed2-fine">{error}</p>}
    </div>
  );
}
