import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { RoutePath } from '../types';
import { linkHandler } from './GuideParts';

export interface ShowcaseStudy {
  slug: string;
  title: string;
  image: string;
  imageAlt: string;
  tag: string;
  line: string;
  location: string;
  path: RoutePath;
}

interface CaseStudyShowcaseProps {
  studies: ShowcaseStudy[];
  onNavigate: (path: RoutePath) => void;
}

// How long each story stays on the screen before the next one plays.
const STORY_MS = 6500;

// A "screening room": one story plays large on the stage while the reel beside it lists every story.
// All titles and lines stay in the HTML; only the visible stage image changes.
export const CaseStudyShowcase: React.FC<CaseStudyShowcaseProps> = ({ studies, onNavigate }) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const autoPlay = !reduceMotion && !paused && studies.length > 1;

  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % studies.length), STORY_MS);
    return () => window.clearTimeout(timer);
  }, [active, autoPlay, studies.length]);

  if (!studies.length) return null;
  const current = studies[active];

  return (
    <div
      className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Stage */}
      <motion.a
        href={current.path}
        onClick={linkHandler(onNavigate, current.path)}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        aria-label={`${current.title}: view the story`}
        className="group relative block aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-zinc-900 ring-1 ring-white/10 lg:order-2 lg:col-span-7 lg:aspect-auto lg:min-h-[32rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {studies.map((study, i) => (
          <img
            key={study.slug}
            src={study.image}
            alt={i === active ? study.imageAlt : ''}
            aria-hidden={i === active ? undefined : true}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover saturate-[0.85] brightness-105 transition-[opacity,transform,filter] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:saturate-100 ${
              i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.04]'
            }`}
          />
        ))}
        {/* Light mask: keeps the photograph bright while the words on it lead. */}
        <div className="absolute inset-0 bg-ink/15 transition-opacity duration-500 group-hover:opacity-0" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" aria-hidden="true" />

        <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
          {current.tag}
        </span>

        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5 sm:p-7">
          <p className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/80">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {current.location}
          </p>
          <span className="inline-flex items-center gap-3 rounded-full bg-white py-2 pl-5 pr-2 text-sm font-semibold text-ink transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
            Explore in 3D
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white group-hover:text-accent">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </span>
        </div>
      </motion.a>

      {/* Reel */}
      <ol className="lg:order-1 lg:col-span-5 border-t border-white/10">
        {studies.map((study, i) => {
          const isActive = i === active;
          return (
            <li key={study.slug} className="relative border-b border-white/10">
              {/* Progress line for the story on screen */}
              <span className="absolute left-0 top-[-1px] h-px w-full overflow-hidden" aria-hidden="true">
                {isActive && (
                  <span
                    key={`${active}-${autoPlay}`}
                    className="block h-full bg-accent"
                    style={
                      autoPlay
                        ? { animation: `story-progress ${STORY_MS}ms linear forwards` }
                        : { width: '100%' }
                    }
                  />
                )}
              </span>

              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className="group/item flex w-full items-baseline gap-5 py-5 text-left"
              >
                <span
                  className={`w-7 shrink-0 font-mono text-xs font-semibold tracking-[0.2em] transition-colors ${
                    isActive ? 'text-accent' : 'text-zinc-500 group-hover/item:text-zinc-300'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">{study.tag}</span>
                  <span
                    className={`mt-1 block font-display text-xl font-bold tracking-tight transition-colors sm:text-2xl ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover/item:text-white'
                    }`}
                  >
                    {study.title}
                  </span>
                </span>
              </button>

              {/* Line and link: always in the HTML, opened for the story on screen */}
              <div
                className={`grid pl-12 transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-sm leading-relaxed text-zinc-400">{study.line}</p>
                  <a
                    href={study.path}
                    onClick={linkHandler(onNavigate, study.path)}
                    tabIndex={isActive ? 0 : -1}
                    className="mt-3 mb-5 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent-soft hover:text-white transition-colors"
                  >
                    View story <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
