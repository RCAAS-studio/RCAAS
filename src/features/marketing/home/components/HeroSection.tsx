'use client';

import { motion } from 'framer-motion';
import { SITE_METADATA } from '../../data/siteData';
import { TypewriterHeroPhrase } from '../../components/TypewriterHeroPhrase';
import type { HomePageProps } from '../types';

export function HeroSection({ onOpenPlanner }: Pick<HomePageProps, 'onOpenPlanner'>) {
const scrollToLive = () => {
    const el = document.getElementById('live-experience');
    el?.scrollIntoView({ behavior: 'smooth' });
  };
return (<section id="hero" className="relative pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-4xl text-center"
          >
            
            {/* Loro Technical Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-6 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></span>
              <span>Reality Capture as a Service · Kathmandu, Nepal</span>
            </div>

            {/* H1 Tagline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-6xl lg:text-7xl font-display leading-[1.12] sm:leading-[1.08] text-balance">
              {/* Full sentence for Google, AI assistants, and screen readers */}
              <span className="sr-only">{SITE_METADATA.tagline}</span>

              {/* Animated visual layer with laser-square typewriter effect */}
              <span aria-hidden="true">
                <span>Turn real places into experiences that </span>
                <TypewriterHeroPhrase />
              </span>
            </h1>

            {/* Subhead */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl leading-relaxed text-muted text-balance max-w-3xl mx-auto">
              We capture your hotel, campus, property or heritage site in photorealistic 3D, then turn it into tours, VR, AR and stories that help people decide to book, enrol, invest or visit.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenPlanner}
                className="loro-btn-primary w-full sm:w-auto px-8 py-3.5 text-sm font-semibold"
              >
                Plan your experience &rarr;
              </button>
              
              <button
                onClick={scrollToLive}
                className="loro-btn-secondary w-full sm:w-auto px-7 py-3.5 text-sm font-medium"
              >
                <span>Explore a live tour</span>
                <span className="text-zinc-500 ml-1.5">&darr;</span>
              </button>
            </div>

            {/* Trust Line */}
            <div className="mt-7 text-xs text-zinc-500 font-mono flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
              <span>Geomatics engineers and game developers, based in Kathmandu.</span>
            </div>

          </motion.div>

        </div>
      </section>);
}
