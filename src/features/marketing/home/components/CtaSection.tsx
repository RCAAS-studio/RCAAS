'use client';

import { SITE_METADATA } from '../../data/siteData';
import type { HomePageProps } from '../types';

export function CtaSection({ onOpenPlanner }: Pick<HomePageProps, 'onOpenPlanner'>) {

return (<section id="cta" className="py-24 border-t border-line bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display">
            Have a place with a story to tell?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted leading-relaxed">
            Tell us about your place and what you want people to do after they've seen it. We'll suggest the right experience and send a clear proposal.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenPlanner}
              className="loro-btn-primary w-full sm:w-auto px-8 py-3.5 text-sm font-semibold"
            >
              Plan your experience &rarr;
            </button>
            <a
              href={SITE_METADATA.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="loro-btn-secondary w-full sm:w-auto px-7 py-3.5 text-sm font-medium"
            >
              <span>Chat on WhatsApp</span>
              <span className="ml-1 text-zinc-500">↗</span>
            </a>
          </div>

        </div>
      </section>);
}
