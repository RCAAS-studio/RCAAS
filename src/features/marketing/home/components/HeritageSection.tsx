'use client';

import { HeritageMotionBackdrop } from '../../components/HeritageMotionBackdrop';
import type { HomePageProps } from '../types';

export function HeritageSection({ onNavigate }: Pick<HomePageProps, 'onNavigate'>) {

return (<section id="heritage" className="relative py-28 border-t border-line bg-surface overflow-hidden">
        {/* Active Heritage Aerial Point Cloud & Radar Motion Backdrop */}
        <HeritageMotionBackdrop />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-wider text-accent-strong font-semibold">
              Lasting impact
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-ink font-display">
              Nepal's heritage, recorded for the next generation.
            </h2>
            <p className="mt-4 text-base text-muted leading-relaxed">
              Temples, stupas and historic towns change with weather, earthquakes and time. We document them in 3D, measurable for conservators and explorable for everyone, so they can be studied, cared for and shared long after today.
            </p>
            <div className="mt-8">
              <button
                onClick={() => onNavigate('/industries/heritage-culture/')}
                className="loro-btn-primary px-6 py-3 text-xs"
              >
                Discover digital heritage &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>);
}
