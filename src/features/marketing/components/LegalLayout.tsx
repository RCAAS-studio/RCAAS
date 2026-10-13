import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import { Placeholder } from './Placeholder';
import { pageShellClass } from './GuideParts';

// Shared shell for /privacy/ and /terms/: draft notice, header, sticky contents and numbered sections.

export interface LegalSectionMeta {
  id: string;
  title: string;
  icon: LucideIcon;
}

export const legalBodyClass = 'text-sm sm:text-[15px] text-zinc-600 leading-relaxed';

export const LegalSection: React.FC<{ section: LegalSectionMeta; number: number; children: React.ReactNode }> = ({
  section,
  number,
  children,
}) => {
  const Icon = section.icon;
  return (
    <section id={section.id} className="scroll-mt-24">
      <h2 className="flex items-center gap-3 mb-4">
        <span className="w-9 h-9 rounded-lg border border-line bg-surface flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
        </span>
        <span className="text-lg sm:text-xl font-bold tracking-tight text-ink font-display">
          <span className="font-mono text-sm text-zinc-400 mr-2">{number}.</span>
          {section.title}
        </span>
      </h2>
      {children}
    </section>
  );
};

export const LegalLayout: React.FC<{
  title: string;
  onNavigate: (path: RoutePath) => void;
  draft: boolean;
  lastUpdated: string | null;
  glanceLabel: string;
  glance: { label: string; icon: LucideIcon }[];
  sections: LegalSectionMeta[];
  children: React.ReactNode;
}> = ({ title, onNavigate, draft, lastUpdated, glanceLabel, glance, sections, children }) => {
  const [activeId, setActiveId] = useState(sections[0].id);

  // Highlight the section currently in view in the contents.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const jumpTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-10 overflow-x-auto whitespace-nowrap pb-1">
          <button type="button" onClick={() => onNavigate('/')} className="hover:text-zinc-900 transition-colors">
            Home
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <span className="text-accent font-semibold" aria-current="page">
            {title}
          </span>
        </nav>

        {draft && (
          <div role="note" className="mb-8 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-5 py-3.5 text-xs font-mono text-amber-900 leading-relaxed">
            Draft for legal review · a plain-language working draft, not legal advice. Hidden from search until reviewed
            by a lawyer familiar with Nepali law.
          </div>
        )}

        {/* HEADER */}
        <header className="max-w-4xl mb-12 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-6 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>{SITE_METADATA.legalName}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display leading-[1.12]"
          >
            {title}
          </motion.h1>
          <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500">
            <CalendarClock className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            Last updated {lastUpdated ?? <Placeholder>[[TBI: date]]</Placeholder>}
          </p>

          <ul className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label={glanceLabel}>
            {glance.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
                  className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 py-3 shadow-xs"
                >
                  <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-800">{item.label}</span>
                </motion.li>
              );
            })}
          </ul>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contents */}
          <aside className="hidden lg:block lg:col-span-3">
            <nav aria-label="Contents" className="sticky top-28">
              <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-3 px-3">Contents</p>
              <ol className="space-y-0.5">
                {sections.map((section, i) => {
                  const isActive = activeId === section.id;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        onClick={jumpTo(section.id)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive ? 'bg-accent/[0.06] text-zinc-900 font-semibold' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                        }`}
                      >
                        <span className={`font-mono text-[11px] w-5 ${isActive ? 'text-accent' : 'text-zinc-400'}`}>{i + 1}</span>
                        {section.title}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>

          <article className="lg:col-span-9 max-w-3xl space-y-12">{children}</article>
        </div>
      </div>
    </div>
  );
};
