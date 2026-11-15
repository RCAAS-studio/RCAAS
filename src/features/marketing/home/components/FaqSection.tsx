'use client';

import { HOME_FAQS } from '../../content/faq';
import { FaqList } from '../../components/GuideParts';
import { eyebrowClass } from '../../components/ui';
import type { HomePageProps } from '../types';

export function FaqSection({ onNavigate }: Pick<HomePageProps, 'onNavigate'>) {

return (<section id="faq" className="py-24 border-t border-line bg-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className={eyebrowClass}>
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-ink font-display">
              Questions people ask first
            </h2>
          </div>

          <FaqList items={HOME_FAQS} firstOpen={false} />

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('/faq/')}
              className="text-xs font-mono font-semibold text-accent hover:text-accent-strong transition-colors"
            >
              More questions &rarr;
            </button>
          </div>

        </div>
      </section>);
}
