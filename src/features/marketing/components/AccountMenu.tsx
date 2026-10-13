import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LayoutDashboard, LogOut, Settings, User, X } from 'lucide-react';
import { logout, ROLE_NAME, type SessionUser } from '../../../lib/api';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { PasswordChange } from '../../auth/PasswordChange';

/* The signed-in person's menu in the header (the earlier site's AccountMenu,
 * in this site's look): their name opens Open studio, Profile, Settings
 * (change password) and Log out; Profile and Settings slide in a drawer. */

const item =
  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-ink';

export const AccountMenu: React.FC<{ user: SessionUser; onSignedOut: () => void; compact?: boolean }> = ({ user, onSignedOut, compact }) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  // The header's backdrop-filter would trap a fixed drawer inside it: render it on .rcaas instead.
  const [host, setHost] = useState<Element | null>(null);
  useEffect(() => setHost(menuRef.current?.closest('.rcaas') ?? document.body), []);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'profile' | 'settings' | null>(null);

  const close = () => {
    setOpen(false);
    setView(null);
  };
  useClickOutside([menuRef, panelRef], close);

  const signOut = () => {
    close();
    logout()
      .catch(() => {})
      .finally(onSignedOut);
  };

  const initials =
    user.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('').slice(0, 2) || 'U';
  const avatar = (
    <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white font-mono">
      {initials}
    </span>
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white py-1 pl-1 pr-2.5 text-xs font-semibold text-ink transition-colors hover:border-line-strong"
      >
        {avatar}
        <span className={`${compact ? 'hidden' : 'hidden sm:inline'} max-w-[10rem] truncate`}>{user.name}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && !view && (
          <motion.div
            role="menu"
            aria-label="Account"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-60 rounded-lg border border-line bg-white p-1.5 shadow-xl"
          >
            <div className="px-3 pb-2 pt-1.5 border-b border-line mb-1">
              <p className="truncate text-sm font-bold text-ink font-display">{user.name}</p>
              <p className="truncate text-[11px] font-mono text-zinc-500">{user.email}</p>
            </div>
            {/* plain <a>: the studio is its own app and needs a full page load */}
            <a href="/studio" role="menuitem" className={item}>
              <LayoutDashboard className="h-4 w-4 text-accent" aria-hidden="true" />
              Open studio
            </a>
            <button type="button" role="menuitem" className={item} onClick={() => setView('profile')}>
              <User className="h-4 w-4 text-zinc-500" aria-hidden="true" />
              Profile
            </button>
            <button type="button" role="menuitem" className={item} onClick={() => setView('settings')}>
              <Settings className="h-4 w-4 text-zinc-500" aria-hidden="true" />
              Settings
            </button>
            <button type="button" role="menuitem" className={`${item} text-accent-strong hover:text-accent-strong`} onClick={signOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {host &&
        createPortal(
          <AnimatePresence>
            {view && (
              <motion.div
                ref={panelRef}
                onClick={close}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
              >
                <motion.aside
                  role="dialog"
                  aria-modal="true"
                  aria-label={view === 'profile' ? 'Profile' : 'Settings'}
                  onClick={(e) => e.stopPropagation()}
                  initial={{ x: 48, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 48, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                  className="flex h-full w-full max-w-md flex-col border-l border-line bg-white shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-line px-6 py-5">
                    <div className="flex items-center gap-3">
                      {avatar}
                      <div>
                        <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-accent">
                          {view === 'profile' ? 'Profile' : 'Settings'}
                        </p>
                        <p className="text-xs font-mono text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                    <button type="button" onClick={close} aria-label="Close" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-ink">
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    {view === 'profile' ? (
                      <dl className="divide-y divide-line rounded-lg border border-line">
                        {[
                          ['Name', user.name],
                          ['Email', user.email],
                          ['Role', ROLE_NAME[user.role] ?? user.role],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-4 px-4 py-3">
                            <dt className="text-xs font-mono text-zinc-500">{k}</dt>
                            <dd className="truncate text-sm font-semibold text-ink">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <PasswordChange cls="site" email={user.email} />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
                    <a href="/studio" className="loro-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs">
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      Open studio
                    </a>
                    <button type="button" onClick={signOut} className="loro-btn-secondary px-4 py-2 text-xs font-semibold text-accent-strong">
                      Log out
                    </button>
                  </div>
                </motion.aside>
              </motion.div>
            )}
          </AnimatePresence>,
          host
        )}
    </div>
  );
};
