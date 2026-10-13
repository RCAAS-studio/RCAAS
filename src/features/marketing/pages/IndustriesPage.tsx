import React from 'react';
import { motion } from 'framer-motion';
import { RoutePath } from '../types';
import { INDUSTRIES, CASE_STUDIES, SITE_METADATA } from '../data/siteData';
import { SpotlightCard } from '../components/SpotlightCard';
import { findIndustryContent } from '../content/industries';
import { IndustryPage } from './IndustryPage';
import { pageShellClass } from '../components/ui';

interface IndustriesPageProps {
  currentPath: RoutePath;
  onNavigate: (path: RoutePath) => void;
  onOpenPlanner: () => void;
}

export const IndustriesPage: React.FC<IndustriesPageProps> = ({ currentPath, onNavigate, onOpenPlanner }) => {
  // Industries with final copy use the IndustryPage template (src/content/industries).
  const industryContent = findIndustryContent(currentPath.split(/[?#]/)[0]);
  if (industryContent) {
    return <IndustryPage key={industryContent.slug} industry={industryContent} onNavigate={onNavigate} />;
  }

  const currentIndustry = INDUSTRIES.find((i) => currentPath === i.link) || null;


  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-8 sm:mb-12">
          <button 
            onClick={() => onNavigate('/')} 
            className="hover:text-zinc-900 transition-colors"
          >
            Home
          </button>
          <span className="text-zinc-400">›</span>
          <button 
            onClick={() => onNavigate('/industries/')} 
            className={`transition-colors ${!currentIndustry ? 'text-zinc-900 font-semibold' : 'hover:text-zinc-900'}`}
          >
            Industries
          </button>
          {currentIndustry && (
            <>
              <span className="text-zinc-400">›</span>
              <span className="text-accent font-semibold">{currentIndustry.title}</span>
            </>
          )}
        </nav>

        {(
          /* ==============================================================
             INDUSTRIES HUB VIEW (/industries/) - SPEC §6.5
             ============================================================== */
          <div>
            {/* 1. INTRO */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mb-14 sm:mb-16"
            >
              <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold block mb-2">
                Industries Hub
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display">
                Built for your goal
              </h1>
              <p className="mt-5 text-base sm:text-xl text-muted leading-relaxed">
                A hotel wants bookings. A college wants applications. A conservator wants a record that lasts. We start with what you need people to do, then choose the experience, the story and the data that will help them do it.
              </p>
              <div className="mt-8">
                <button
                  onClick={() => onNavigate('/contact/')}
                  className="loro-btn-primary px-6 py-3 text-xs tracking-wider uppercase"
                >
                  Plan your experience →
                </button>
              </div>
            </motion.div>

            {/* 2. INDUSTRY CARDS */}
            <section aria-label="Industries" className="mb-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {INDUSTRIES.map((ind) => (
                  <SpotlightCard
                    key={ind.id}
                    onClick={() => onNavigate(ind.link as RoutePath)}
                    className="cursor-pointer p-7 flex flex-col justify-between group hover:border-zinc-400 transition-colors"
                  >
                    <div>
                      {/* Card Header: Sector & Who it's for */}
                      <div className="flex items-start justify-between gap-3 text-xs font-mono">
                        <span className="text-ink font-semibold tracking-tight">{ind.title}</span>
                        <span className="text-zinc-500 text-[10px] bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 rounded shrink-0">
                          {ind.badge}
                        </span>
                      </div>

                      {/* Who it's for */}
                      {ind.whoItsFor && (
                        <p className="mt-2 text-[11px] font-mono text-zinc-500">
                          {ind.whoItsFor}
                        </p>
                      )}

                      {/* Goal Headline */}
                      <h2 className="mt-4 text-xl font-bold text-ink font-display group-hover:text-accent transition-colors leading-snug">
                        {ind.goalHeadline}
                      </h2>

                      {/* Line */}
                      <p className="mt-3 text-xs sm:text-sm text-muted leading-relaxed">
                        {ind.summary}
                      </p>
                    </div>

                    {/* Footer: Proof (if available) + Link */}
                    <div className="mt-6 pt-4 border-t border-zinc-200/80 flex items-center justify-between text-xs">
                      {ind.proof ? (
                        <span className="text-[11px] font-mono text-zinc-600 truncate max-w-[200px]" title={ind.proof}>
                          Proof: {ind.proof}
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-zinc-400">
                          Explore solutions
                        </span>
                      )}
                      <span className="text-accent font-semibold group-hover:translate-x-0.5 transition-transform">
                        &rarr;
                      </span>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </section>

            {/* 3. CLOSING CTA BAND */}
            <section className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-8 sm:p-12 shadow-xs">
              <div className="max-w-2xl">
                <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold block mb-2">
                  Tailored Recommendation
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink font-display tracking-tight">
                  Not sure which experience fits your goal?
                </h2>
                <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
                  Tell us what you want people to do after they see your place. We'll recommend the right mix of tour, film and data.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => onNavigate('/contact/')}
                    className="loro-btn-primary px-6 py-3 text-xs uppercase tracking-wider"
                  >
                    Talk with us →
                  </button>
                  <a
                    href={SITE_METADATA.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 text-xs uppercase tracking-wider font-mono font-medium rounded border border-zinc-300 text-zinc-800 hover:border-zinc-900 hover:bg-white transition-colors inline-flex items-center gap-2"
                  >
                    Message on WhatsApp →
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
  );
};
