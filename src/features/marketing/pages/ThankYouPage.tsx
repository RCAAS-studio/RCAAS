import React from 'react';
import { IMG } from '../data/images';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import { Placeholder } from '../components/Placeholder';
import { linkHandler, pageShellClass, primaryButtonClass, secondaryButtonClass } from '../components/GuideParts';

interface ThankYouPageProps {
  onNavigate: (path: RoutePath) => void;
}

const WORK_PREVIEWS = [
  { name: 'Chilancho Stupa', image: IMG['thank-you/nepathya-school-and-college'] },
  { name: 'Basera Boutique Hotel', image: IMG['thank-you/chilancho-stupa'] },
  { name: 'Nepathya School and College', image: IMG['thank-you/basera-boutique-hotel'] },
];

// /thank-you/ is noindex, follow (set in App).
export const ThankYouPage: React.FC<ThankYouPageProps> = ({ onNavigate }) => {
  const goToLink = (path: RoutePath) => linkHandler(onNavigate, path);

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          className="relative mx-auto mb-8 flex w-20 h-20 rounded-full bg-emerald-500 items-center justify-center shadow-[0_0_0_10px_rgba(16,185,129,0.12)]"
        >
          <Check className="w-9 h-9 text-white" strokeWidth={3} aria-hidden="true" />
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display text-balance mb-6 leading-[1.12]"
        >
          Thank you. <span className="text-accent">We've got your message.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto"
        >
          We'll reply within {SITE_METADATA.responseTime ?? <Placeholder>[[TBI: response time]]</Placeholder>}. In the
          meantime, step inside some of our work.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button type="button" onClick={() => onNavigate('/work/')} className={primaryButtonClass}>
            <span>Explore our work</span>
            <span className="ml-2 font-mono" aria-hidden="true">→</span>
          </button>
          {SITE_METADATA.contactConfirmed ? (
            <a href={SITE_METADATA.whatsappUrl} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
              <span>Chat on WhatsApp</span>
              <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className={`${secondaryButtonClass} cursor-default`}>
              <span>Chat on WhatsApp</span>
              <Placeholder>[[TBI: wa.me link]]</Placeholder>
            </span>
          )}
        </motion.div>

        {/* A glimpse of the work */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {WORK_PREVIEWS.map((work, i) => (
            <motion.a
              key={work.name}
              href="/work/"
              onClick={goToLink('/work/')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 + i * 0.1 }}
              className="group relative block aspect-[4/3] rounded-2xl overflow-hidden border border-line bg-zinc-900"
            >
              <img loading="lazy" decoding="async" src={work.image} alt={`3D view of ${work.name}`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-white font-display">{work.name}</span>
                <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};
