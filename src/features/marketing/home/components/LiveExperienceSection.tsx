'use client';

import { WithPlaceholders } from '../../components/Placeholder';
import { SplatEmbed } from '../../components/SplatEmbed';
import { eyebrowClass } from '../../components/ui';
import { CHILANCHO_VIEWER } from '../data';

export function LiveExperienceSection() {

return (<section id="live-experience" className="py-24 border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-12">
            <span className={eyebrowClass}>
              Step inside
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-ink font-display">
              Don't just look at photos. Walk through the place.
            </h2>
            <p className="mt-4 text-base text-muted leading-relaxed">
              This is Chilancho Stupa, captured by our team and available through the existing XGRIDS viewer. Move around it on your phone or laptop. No app, no download.
            </p>
          </div>

          {/* Interactive SplatEmbed */}
          <SplatEmbed initialDemo="chilancho" />

          {CHILANCHO_VIEWER && (
            <p className="mt-4 text-xs font-mono text-zinc-500">
              Chilancho Stupa, Kirtipur ·{' '}
              <a href={CHILANCHO_VIEWER} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:text-accent-strong">
                open it in the XGRIDS viewer ↗
              </a>
            </p>
          )}

          {/* Static HTML description for crawlers and accessibility */}
          <div className="mt-6 rounded-md border border-line bg-white p-4 text-xs text-zinc-600 font-mono shadow-sm">
            <p>
              <WithPlaceholders text="An interactive, photorealistic 3D model of Chilancho Stupa in Kirtipur, Kathmandu Valley, Nepal, created by RCAAS Technology." />
            </p>
            <p className="mt-2">
              Built as in-house research by RCAAS Technology, to document the stupa's form and detail for study and for the public.
            </p>
          </div>

        </div>
      </section>);
}
