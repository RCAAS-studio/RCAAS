'use client';

import { ask } from "../../../components/ui/Ask";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { canRedo, canUndo, redo, undo } from "../history";
import { hasUnsavedChanges } from "../../scene/sceneDoc";
import { uiConfig, setUiConfig } from "../../../lib/uiConfig";
import { logout, getProperties, ROLE_NAME } from "../../../lib/api";
import { ThemeToggle } from "../../../components/ui/ThemeToggle";
import { PasswordChange } from "../../auth/PasswordChange";
import { useSession } from "../../auth/useSession";
import { useClickOutside } from "../../../hooks/useClickOutside";
import type { Property } from "../../../@types/scene.types";
import { PublishButton } from "../publishing/PublishButton";
import { SaveToServerButton } from './DraftControls';

/** The tour at a phone's size (2026-10-13): this editor page in a 390×844 window,
 *  opened straight into Preview (App reads ?preview=phone), so the phone layout's
 *  media queries apply. It loads the saved draft, so unsaved edits aren't in it. */
async function openPhonePreview(sceneId: string) {
  if (hasUnsavedChanges(sceneId) && !(await ask({ title: 'Preview without your unsaved changes?', body: 'The phone preview opens the saved version of this space. Save first to see your latest edits in it.', action: 'Open the preview' }))) return;
  const u = new URL(location.href);
  u.searchParams.set('space', sceneId);
  u.searchParams.set('preview', 'phone');
  window.open(u.toString(), 'rcaas-phone-preview', 'popup,width=390,height=844');
}

export function TopBar({ onPreview, onMeasure, sceneId, property }: { onPreview: () => void; onMeasure: () => void; sceneId: string; property?: Property }) {
  return (
    <div className="ed2-top">
      {/* A plain <a>, not <Link>: leaving the editor must tear the renderer
       *  down (LCCRender is a page singleton), which only a full load does. */}
      {property && (
        <nav className="ed2-crumb" aria-label="Breadcrumb">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the studio’s 3D renderer is a page singleton: leave with a full page load */}
          <a href="/studio">Projects</a>
          <span aria-hidden>/</span>
          <ProjectSwitcher property={property} />
        </nav>
      )}
      <div className="ed2-brand">
        <a href={property ? `/studio/${encodeURIComponent(property.id)}` : '/studio'} className="ed2-home" aria-label="Project home" title="Project home">
          {/* the RCAAS mark: a viewfinder with a dot, as in the site's logo */}
          <svg viewBox="0 0 24 24" aria-hidden><path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" /><circle cx="12" cy="12" r="3.4" /></svg>
        </a>
        <input
          className="ed2-proj"
          defaultValue={uiConfig.brand}
          onChange={(e) => setUiConfig({ brand: e.target.value })}
        />
      </div>
      <button className="ed2-preview" onClick={onPreview}>▶ Preview</button>
      <button className="ed2-phone" onClick={() => openPhonePreview(sceneId)} title="Preview at phone size, in its own window (the saved version)" aria-label="Preview at phone size">
        <svg viewBox="0 0 24 24" aria-hidden><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></svg>
      </button>
      <button className="ed2-phone" onClick={onMeasure} title="Measure a distance (M); correct the space's scale" aria-label="Measure">
        <svg viewBox="0 0 24 24" aria-hidden><path d="M3 15.5 15.5 3l5.5 5.5L8.5 21z" /><path d="M7 12l2 2M10 9l2 2M13 6l2 2" /></svg>
      </button>
      <span className="ed2-undo">
        <button onClick={() => undo(sceneId)} disabled={!canUndo(sceneId)} title="Undo (Ctrl+Z)" aria-label="Undo">↶</button>
        <button onClick={() => redo(sceneId)} disabled={!canRedo(sceneId)} title="Redo (Ctrl+Y)" aria-label="Redo">↷</button>
      </span>
      <SaveToServerButton sceneId={sceneId} />
      <PublishButton sceneId={sceneId} />
      <ThemeToggle className="ed2-theme" />
      <Account />
    </div>
  );
}

/** The browser's own "Leave site?" prompt while the open space has unsaved
 *  edits — switching project, the breadcrumb and a reload are all full page
 *  loads, and each would otherwise drop them silently. */
export function LeaveGuard({ dirty }: { dirty: boolean }) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  return null;
}

/**
 * The project you're in, always visible in the top bar. Click it to see every
 * project and jump to another. A plain <a> each: a project switch must be a
 * full page load so the renderer (a page singleton) starts clean.
 */
function ProjectSwitcher({ property }: { property: Property }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Property[] | null>(null);
  const [error, setError] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    getProperties()
      .then((l) => setList(l ?? []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load projects.'));
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const spaces = (n = 0) => (n === 1 ? '1 space' : `${n} spaces`);

  return (
    <div className="ed2-switch" ref={ref}>
      <button
        className="ed2-crumb-here ed2-switch-btn" onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu" aria-expanded={open} title="Switch project"
      >
        <span className="ed2-switch-name">{property.title}</span>
        <svg viewBox="0 0 20 20" className={`ed2-caret ${open ? 'open' : ''}`} aria-hidden>
          <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="ed2-switch-menu" role="menu" aria-label="Projects">
          <p className="ed2-switch-lbl">Projects</p>
          {!list && !error && <p className="ed2-muted ed2-fine">Loading…</p>}
          {error && <p className="ed2-warn ed2-fine">{error}</p>}
          {list?.map((p) => (p.id === property.id ? (
            <span key={p.id} className="ed2-switch-item is-current" aria-current="page">
              <span className="ed2-switch-tick" aria-hidden>✓</span>
              <span className="ed2-switch-name">{p.title}</span>
              <span className="ed2-switch-n">{spaces(p.spaceCount)}</span>
            </span>
          ) : (
            <a key={p.id} className="ed2-switch-item" href={`/studio/${p.id}`} role="menuitem">
              <span className="ed2-switch-tick" aria-hidden />
              <span className="ed2-switch-name">{p.title}</span>
              <span className="ed2-switch-n">{spaces(p.spaceCount)}</span>
            </a>
          )))}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the studio’s 3D renderer is a page singleton: leave with a full page load */}
          <a className="ed2-switch-all" href="/studio" role="menuitem">All projects</a>
        </div>
      )}
    </div>
  );
}

/** §7.5: publish snapshots the saved draft; visitors only ever see a
 *  published version, so editing never changes a live tour. */


/** Compact account menu on the editor top bar. Profile / Settings open a side
 *  panel, while Log out keeps the close action in the same menu surface. */
function Account() {
  const [user, setUser] = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailView, setDetailView] = useState<'profile' | 'settings' | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = () => {
    setMenuOpen(false);
    setDetailView(null);
  };
  useClickOutside([menuRef], closeMenu);

  const openDetail = (view: 'profile' | 'settings') => {
    setMenuOpen(false);
    setDetailView(view);
  };

  const handleLogout = async () => {
    closeMenu();
    await logout().catch(() => {});
    setUser(null);
    location.assign('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('').slice(0, 2)
    : 'U';

  if (!user) return null;

  return (
    <div className="ed2-account" ref={menuRef}>
      <button
        type="button"
        className="ed2-user-trigger"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <span className="ed2-avatar" aria-hidden>{initials}</span>
        <span className="ed2-user-name">{user.name}</span>
        <svg viewBox="0 0 20 20" className={menuOpen ? 'ed2-caret open' : 'ed2-caret'} aria-hidden>
          <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {menuOpen && !detailView && (
          <motion.div
            className="ed2-user-menu"
            role="menu"
            aria-label="User account menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          >
            <button type="button" className="ed2-user-option" onClick={() => openDetail('profile')}>Profile</button>
            <button type="button" className="ed2-user-option" onClick={() => openDetail('settings')}>Settings</button>
            <button type="button" className="ed2-user-option ed2-user-option-danger" onClick={handleLogout}>Log out</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailView && (
          <motion.div
            className="ed2-account-backdrop"
            onClick={closeMenu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.aside
              className="ed2-account-drawer open"
              role="dialog"
              aria-modal="true"
              aria-label={detailView === 'profile' ? 'Profile panel' : 'Settings panel'}
              onClick={(event) => event.stopPropagation()}
              initial={{ x: 42, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 42, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <div className="ed2-account-drawer-header">
                <div className="ed2-account-drawer-meta">
                  <span className="ed2-avatar" aria-hidden>{initials}</span>
                  <div>
                    <div className="ed2-account-label">{detailView === 'profile' ? 'Profile' : 'Settings'}</div>
                    <div className="ed2-account-email">{user.email}</div>
                  </div>
                </div>
                <button type="button" className="ed2-account-close" onClick={closeMenu} aria-label="Close panel">×</button>
              </div>

              <div className="ed2-account-drawer-body">
                <div className="ed2-sheet-card">
                  <div className="ed2-sheet-kicker">{detailView === 'profile' ? 'Account' : 'Preferences'}</div>
                  <h3>{detailView === 'profile' ? user.name : 'Studio settings'}</h3>
                  <p>
                    {detailView === 'profile'
                      ? user.email
                      : 'Your theme, and your password.'}
                  </p>
                </div>

                {detailView === 'profile' ? (
                  <div className="ed2-sheet-list">
                    <div><span>Name</span><strong>{user.name}</strong></div>
                    <div><span>Email</span><strong>{user.email}</strong></div>
                    <div><span>Role</span><strong>{ROLE_NAME[user.role] ?? user.role}</strong></div>
                  </div>
                ) : (
                  <>
                    <div className="ed2-sheet-list">
                      <div><span>Theme</span><ThemeToggle className="ed2-theme" /></div>
                    </div>
                    <PasswordChange cls="ed2" email={user.email} />
                  </>
                )}
              </div>

              <div className="ed2-account-drawer-footer">
                <button type="button" className="ed2-account-dismiss" onClick={closeMenu}>Close</button>
                <button type="button" className="ed2-user-option ed2-user-option-danger" onClick={handleLogout}>Log out</button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
