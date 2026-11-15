'use client';

import { motion } from 'framer-motion';
import { SITE_METADATA } from '../../data/siteData';
import { ChevronRight } from 'lucide-react';
import { linkHandler } from '../../components/GuideParts';
import { eyebrowClass } from '../../components/ui';
import { WHY_POINTS, WHY_FADE } from '../data';
import type { HomePageProps } from '../types';

export function WhyRcaasSection({ onNavigate, onOpenPlanner }: Pick<HomePageProps, 'onNavigate' | 'onOpenPlanner'>) {

return (<section id="why-rcaas" className="py-24 sm:py-28 border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-12">

            {/* Statement */}
            <motion.div {...WHY_FADE} className="lg:col-span-5 lg:pt-2">
              <span className={eyebrowClass}>The RCAAS Advantage</span>
              <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display leading-[1.02]">
                Why RCAAS
              </h2>
              <p className="mt-6 max-w-md text-sm sm:text-base text-muted leading-relaxed">
                {SITE_METADATA.boilerplate} RCAAS stands for Reality Capture as a Service.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                <button
                  type="button"
                  onClick={onOpenPlanner}
                  className="group inline-flex items-center gap-1 text-xs font-mono font-semibold text-accent hover:text-accent-strong transition-colors"
                >
                  Plan your experience
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </button>
                <a
                  href="/about/"
                  onClick={linkHandler(onNavigate, '/about/')}
                  className="group inline-flex items-center gap-1 text-xs font-mono font-semibold text-accent hover:text-accent-strong transition-colors"
                >
                  Meet the team
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              </div>
            </motion.div>

            {/* Reasons: one list in reading order; on wider screens it splits into two staggered columns with a hairline between. */}
            <div className="relative lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 sm:pb-20">
              <span className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-line sm:block" aria-hidden="true" />
              {WHY_POINTS.map((point, i) => {
                const Icon = point.icon;
                const left = i % 2 === 0;
                return (
                  <motion.div
                    key={point.title}
                    {...WHY_FADE}
                    transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex gap-5 py-8 border-line ${i === 0 ? '' : 'border-t'} ${
                      left ? 'sm:pr-8 lg:pr-10 sm:translate-y-20' : 'sm:pl-8 lg:pl-10'
                    } ${i >= 2 ? 'sm:border-t' : 'sm:border-t-0 sm:pt-0'}`}
                  >
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
                      <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-accent ring-2 ring-white" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-ink font-display leading-snug">{point.title}</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted">{point.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </section>);
}
