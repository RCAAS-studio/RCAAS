import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircleQuestion } from 'lucide-react';
import { RoutePath } from '../types';
import { PUBLISHED_GUIDES } from '../data/guides';
import { ComparisonGuidePage, READING_MINUTES as COMPARISON_MINUTES } from './ComparisonGuidePage';
import { GaussianGuidePage, READING_MINUTES as GAUSSIAN_MINUTES } from './GaussianGuidePage';
import { CostGuidePage, READING_MINUTES as COST_MINUTES } from './CostGuidePage';
import { SpotlightCard } from '../components/SpotlightCard';
import { Placeholder } from '../components/Placeholder';
import { buttonClass } from '../components/ui';

interface LearnPageProps {
  currentPath: RoutePath;
  onNavigate: (path: RoutePath) => void;
  onOpenPlanner: () => void;
}


// Reading times worked out from each guide's own text.
const AUTO_READING_TIMES: Partial<Record<RoutePath, string>> = {
  '/learn/3d-virtual-tour-vs-360-tour-vs-video/': `${COMPARISON_MINUTES} min read`,
  '/learn/what-is-gaussian-splatting/': `${GAUSSIAN_MINUTES} min read`,
  '/learn/planning-a-3d-experience-cost-and-timeline/': `${COST_MINUTES} min read`,
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45 },
};

const LearnHub: React.FC<{ onNavigate: (path: RoutePath) => void }> = ({ onNavigate }) => {
  const goToLink = (path: RoutePath) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="py-14 sm:py-20 md:py-24 bg-white text-ink relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-10 overflow-x-auto whitespace-nowrap pb-1">
          <button type="button" onClick={() => onNavigate('/')} className="hover:text-zinc-900 transition-colors">
            Home
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <span className="text-accent font-semibold" aria-current="page">
            Learn
          </span>
        </nav>

        {/* 1. INTRO */}
        <section className="max-w-3xl mb-14 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-6 shadow-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-semibold text-zinc-900">Guides</span>
            <span className="text-zinc-400">·</span>
            <span>Written from real projects</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display mb-6 leading-[1.12]"
          >
            Learn
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl"
          >
            Straight answers to the questions people ask us most, written by our team from real projects. No jargon
            unless we explain it.
          </motion.p>
        </section>

        {/* 2. GUIDES */}
        <section aria-label="Guides" className="mb-20 sm:mb-28">
          <div className={`grid grid-cols-1 gap-6 ${PUBLISHED_GUIDES.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {PUBLISHED_GUIDES.map((guide, i) => (
              <motion.div key={guide.path} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.1 }}>
                <a href={guide.path} onClick={goToLink(guide.path)} className="block h-full group">
                  <SpotlightCard className="h-full" contentClassName="h-full flex flex-col">
                    <div className="relative h-52 overflow-hidden bg-zinc-900">
                      <img loading="lazy" decoding="async"
                        src={guide.image}
                        alt={guide.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute top-4 left-4 bg-white/95 border border-line px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-900 shadow-xs">
                        Guide {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <article className="p-6 sm:p-8 flex flex-col flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 font-display mb-3 group-hover:text-accent transition-colors">
                        {guide.title}
                      </h2>
                      <p className="text-sm text-zinc-600 leading-relaxed mb-6">{guide.line}</p>

                      <div className="mt-auto pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-zinc-500">
                          <span>{guide.author ?? <Placeholder>[[TBI: author]]</Placeholder>}</span>
                          <span className="text-zinc-400" aria-hidden="true">·</span>
                          <span>{guide.readingTime ?? AUTO_READING_TIMES[guide.path] ?? <Placeholder>[[TBI: reading time]]</Placeholder>}</span>
                          <span className="text-zinc-400" aria-hidden="true">·</span>
                          <span>Updated {guide.updated ?? <Placeholder>[[TBI: date]]</Placeholder>}</span>
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-accent">
                          Read the guide
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                      </div>
                    </article>
                  </SpotlightCard>
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. CALL TO ACTION BAND */}
        <motion.section
          {...fadeUp}
          className="rounded-2xl border border-line bg-surface p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="max-w-2xl mx-auto">
            <span className="mx-auto mb-6 w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-sm">
              <MessageCircleQuestion className="w-5 h-5 text-white" aria-hidden="true" />
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-4 text-balance">
              Have a question we haven't answered?
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 mb-8 leading-relaxed">
              Ask us. If it's useful to others, it may become our next guide.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/contact/?type=question' as RoutePath)}
              className={buttonClass('primary', 'lg', 'w-full sm:w-auto')}
            >
              <span>Ask a question</span>
              <span className="ml-2 font-mono" aria-hidden="true">→</span>
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export const LearnPage: React.FC<LearnPageProps> = ({ currentPath, onNavigate }) => {
  const isComparison = currentPath.includes('3d-virtual-tour-vs-360-tour-vs-video');
  const isGaussian = currentPath.includes('what-is-gaussian-splatting');
  const isCost = currentPath.includes('planning-a-3d-experience-cost-and-timeline');

  if (isComparison) {
    return <ComparisonGuidePage onNavigate={onNavigate} />;
  }

  if (isGaussian) {
    return <GaussianGuidePage onNavigate={onNavigate} />;
  }

  // Drafts still render at their URL for review; they are kept off the hub and out of search.
  if (isCost) {
    return <CostGuidePage onNavigate={onNavigate} />;
  }

  return <LearnHub onNavigate={onNavigate} />;
};
