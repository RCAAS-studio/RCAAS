'use client';

import { srcSetFor } from '../../data/images';
import { motion } from 'framer-motion';
import { RoutePath } from '../../types';
import { PILLARS } from '../../data/siteData';
import { ChevronRight } from 'lucide-react';
import { linkHandler } from '../../components/GuideParts';
import { eyebrowClass } from '../../components/ui';
import { PILLAR_VISUALS } from '../data';
import type { HomePageProps } from '../types';

export function ServicesSection({ onNavigate }: Pick<HomePageProps, 'onNavigate'>) {

return (<section id="what-we-create" className="py-24 border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-16">
            <span className={eyebrowClass}>
              Four Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-ink font-display">
              What we create
            </h2>
            <p className="mt-4 text-base text-muted leading-relaxed">
              Every project starts with a real place and ends with something people can experience, share and act on.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {PILLARS.map((pillar, i) => {
              const visual = PILLAR_VISUALS[pillar.id];
              return (
                <motion.a
                  key={pillar.id}
                  href={pillar.link}
                  onClick={linkHandler(onNavigate, pillar.link as RoutePath)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex flex-col sm:flex-row gap-5 sm:gap-7 rounded-[1.75rem] bg-surface p-3 sm:p-4 transition-shadow duration-500 hover:shadow-[0_18px_50px_-24px_rgba(9,9,11,0.25)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {/* Image panel */}
                  <div className="relative shrink-0 overflow-hidden rounded-[1.25rem] bg-zinc-200 aspect-16/10 sm:aspect-auto sm:w-[44%] sm:min-h-88">
                    <img
                      src={visual?.image} srcSet={srcSetFor(visual?.image)}
                      alt={visual?.alt ?? ''}
                      width={1376}
                      height={768}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover saturate-50 transition-[transform,filter] duration-700 group-hover:saturate-100 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                    {/* Mask: mutes the busy photography so the pillar title stays the focus; it lifts on hover. */}
                    <div className="absolute inset-0 bg-ink/40 transition-opacity duration-500 group-hover:opacity-0" aria-hidden="true" />
                    <div className="absolute inset-0 bg-linear-to-t from-ink/60 via-ink/10 to-transparent" aria-hidden="true" />
                    <span className="absolute left-4 bottom-4 font-mono text-[11px] font-semibold tracking-[0.2em] text-white/90">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Copy */}
                  <div className="flex flex-1 flex-col px-2 pb-3 sm:px-0 sm:py-3 sm:pr-4">
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                      {pillar.promise}
                    </span>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink font-display transition-colors group-hover:text-accent-strong">
                      {pillar.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted">{pillar.body}</p>

                    <span className="mt-auto pt-7 inline-flex items-center gap-2.5 text-sm font-semibold text-accent-strong">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white transition-transform duration-300 group-hover:translate-x-1">
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      Explore {pillar.title.toLowerCase()}
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </div>

        </div>
      </section>);
}
