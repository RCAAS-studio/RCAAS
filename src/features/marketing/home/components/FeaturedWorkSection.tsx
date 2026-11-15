'use client';

import { RoutePath } from '../../types';
import { CASE_STUDY_CONTENT } from '../../content/work';
import { CaseStudyShowcase } from '../../components/CaseStudyShowcase';
import { HOME_CARD_COPY } from '../data';
import type { HomePageProps } from '../types';

export function FeaturedWorkSection({ onNavigate }: Pick<HomePageProps, 'onNavigate'>) {

return (<section id="work" className="py-24 sm:py-28 bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-wider text-accent-soft font-semibold">
                Case Studies
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-white font-display">
                Stories we've told
              </h2>
              <p className="mt-3 text-base text-zinc-400">
                Real places, real clients, each with a clear goal.
              </p>
            </div>
            <div>
              <button
                onClick={() => onNavigate('/work/')}
                className="text-xs font-mono font-semibold text-accent-soft hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>See all our work</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          <CaseStudyShowcase
            onNavigate={onNavigate}
            studies={CASE_STUDY_CONTENT.map((study) => ({
              slug: study.slug,
              title: study.name,
              image: study.image,
              imageAlt: study.imageAlt,
              tag: HOME_CARD_COPY[study.slug].tag,
              line: HOME_CARD_COPY[study.slug].line,
              location: study.location ?? 'Location to be confirmed',
              path: `/work/${study.slug}/` as RoutePath,
            }))}
          />

        </div>
      </section>);
}
