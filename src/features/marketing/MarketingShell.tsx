'use client';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SiteFx } from './components/SiteFx';
import { CompanyGrid } from './components/CompanyGrid';
import { RoutePath } from './types';
import { SITE_METADATA } from './data/siteData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProjectPlannerModal } from './components/ProjectPlannerModal';
import { PlaceholderRegisterModal } from './components/PlaceholderRegisterModal';
import { CaptureLidarCursor } from './components/CaptureLidarCursor';
import { withoutBase } from '../../lib/basePath';
import { MarketingActionsContext } from './routing/MarketingActions';
import { useMarketingMetadata } from './routing/useMarketingMetadata';
const withSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`) as RoutePath;

export default function MarketingShell({ children }: { children: React.ReactNode }) {
  // Next renders this on the server too, so the path comes from the router, not window.
  const router = useRouter();
  const pathname = usePathname() || '/';
  const [currentPath, setCurrentPath] = useState<RoutePath>(() => withSlash(pathname));

  // A move made by Next itself (a Link from elsewhere), not by navigateTo below.
  useEffect(() => {
    setCurrentPath((prev) => (prev.split(/[?#]/)[0] === withSlash(pathname) ? prev : withSlash(pathname)));
  }, [pathname]);

  // The page part of the path (no hash): page-change motion keys on it (SiteFx, main below).
  const pagePath = currentPath.split(/[?#]/)[0];
  const [firstPage] = useState(pagePath);
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    if (pagePath !== firstPage) setMoved(true);
  }, [pagePath, firstPage]);

  const [plannerOpen, setPlannerOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  // Sync browser history
  useEffect(() => {
    const handlePopState = () => {
      const path = withSlash(withoutBase(window.location.pathname)) + window.location.search + window.location.hash;
      setCurrentPath(path as RoutePath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: RoutePath) => {
    router.push(path);
    setCurrentPath(path);
    const hash = path.split('#')[1];
    if (hash) {
      // Wait for the new page to render before scrolling to its section.
      setTimeout(() => {
        const target = document.getElementById(hash);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Dynamic Page Title & SEO Schema.org Graph
  useMarketingMetadata(currentPath);

  // Route selector
  const showMobileBar =
    SITE_METADATA.contactConfirmed && !currentPath.startsWith('/contact') && !currentPath.startsWith('/thank-you');

  

  return (
    <MarketingActionsContext.Provider value={{ currentPath, navigateTo, openPlanner: () => setPlannerOpen(true) }}>
    <div className={`rcaas-app flex min-h-dvh flex-col bg-white text-zinc-950 ${showMobileBar ? 'pb-16 sm:pb-0' : ''}`}>
      <CompanyGrid />
      
      {/* 3D LiDAR & Capture Mark Cursor */}
      <CaptureLidarCursor />

      {/* Header */}
      <Header
        currentPath={currentPath}
        onNavigate={navigateTo}
        onOpenPlanner={() => setPlannerOpen(true)}
      />

      {/* Main Page Area */}
      <main className="flex-1">
        {/* Each move between pages: the new page rises in (not on the first load, which the server drew).
            Opacity and y only: a leftover filter or transform would trap the pages' fixed modals. */}
        <motion.div
          key={pagePath}
          initial={moved ? { opacity: 0, y: 14 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
      <SiteFx sweep={pagePath} first={!moved} />

      {/* Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenRegister={() => setRegisterOpen(true)}
      />

      {/* Mobile Sticky Action Bar: needs a confirmed WhatsApp number (Register G06), and is left off
          the contact and thank-you pages, where it would cover the form. */}
      {showMobileBar && (
        <div className="fixed bottom-0 inset-x-0 z-40 flex items-center gap-2 border-t border-line bg-white/95 px-4 py-2.5 backdrop-blur-lg sm:hidden text-zinc-900 shadow-sm">
          <button
            onClick={() => setPlannerOpen(true)}
            className="loro-btn-primary flex-1 min-h-11 px-4 text-sm font-semibold"
          >
            Plan your experience
          </button>
          <a
            href={SITE_METADATA.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="loro-btn-secondary min-h-11 px-4 text-sm font-medium flex items-center gap-1.5"
          >
            <span>WhatsApp</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}

      {/* Modals */}
      <ProjectPlannerModal
        isOpen={plannerOpen}
        onClose={() => setPlannerOpen(false)}
      />

      <PlaceholderRegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />

    </div>
    </MarketingActionsContext.Provider>
  );
}
