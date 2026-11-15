'use client';

import { WithPlaceholders } from '../../components/Placeholder';
import { SpotlightCard } from '../../components/SpotlightCard';
import { eyebrowClass } from '../../components/ui';
import type { HomePageProps } from '../types';

export function HowItWorksSection({ onNavigate }: Pick<HomePageProps, 'onNavigate'>) {

return (<section id="how-it-works" className="py-24 border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <div>
              <span className={eyebrowClass}>
                How it works
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-ink font-display">
                From real place to finished experience
              </h2>
            </div>
            <div>
              <button
                onClick={() => onNavigate('/how-we-work/')}
                className="text-xs font-mono font-semibold text-accent hover:underline flex items-center gap-1.5"
              >
                <span>See how we work</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Discover',
                desc: 'We start with your goal, your audience and what you want them to do.',
              },
              {
                step: '02',
                title: 'Capture',
                desc: 'Our team scans the place on the ground, and from the air where approvals allow, quickly and without touching anything.',
              },
              {
                step: '03',
                title: 'Create',
                desc: 'Engineers build an accurate 3D model. Game developers shape it into an experience. Together we design the story.',
              },
              {
                step: '04',
                title: 'Launch',
                desc: 'We publish it and help you place it where your audience is: your website, social media, events and QR codes.',
              },
              {
                step: '05',
                title: 'Measure',
                desc: 'When your place changes, we can capture the changes and update your experience under an agreed scope.',
              },
            ].map((s) => (
              <SpotlightCard
                key={s.step}
                className="p-6 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-2xl font-bold text-accent">
                    {s.step}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-ink font-display">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    <WithPlaceholders text={s.desc} />
                  </p>
                </div>
              </SpotlightCard>
            ))}
          </div>

        </div>
      </section>);
}
