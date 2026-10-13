import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Home, Layers, Mail } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RoutePath } from '../types';
import { SpotlightCard } from '../components/SpotlightCard';
import { linkHandler, pageShellClass } from '../components/GuideParts';

interface NotFoundPageProps {
  onNavigate: (path: RoutePath) => void;
}

const LINKS: { label: string; path: RoutePath; icon: LucideIcon }[] = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'What we create', path: '/services/', icon: Layers },
  { label: 'Our work', path: '/work/', icon: Briefcase },
  { label: 'Contact', path: '/contact/', icon: Mail },
];

// Decorative: a dashed outline being scanned, with points appearing behind the scan line.
const UncapturedScan: React.FC = () => (
  <svg viewBox="0 0 320 180" className="w-full max-w-md mx-auto h-auto" aria-hidden="true">
    <defs>
      <clipPath id="nf-scan">
        <motion.rect
          x="0"
          y="0"
          width="320"
          height="180"
          style={{ transformBox: 'fill-box', transformOrigin: 'left' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 1, 1, 0] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.5, 0.8, 1], ease: 'easeInOut' }}
        />
      </clipPath>
    </defs>
    {/* Outline of a building, not yet captured */}
    <path
      d="M60 150 L60 90 L100 60 L140 90 L140 150 Z M140 150 L140 70 L200 40 L260 70 L260 150 Z M30 150 L290 150"
      fill="none"
      stroke="#D4D4D8"
      strokeWidth="2"
      strokeDasharray="6 6"
    />
    {/* Points revealed by the scan */}
    <g clipPath="url(#nf-scan)">
      {Array.from({ length: 90 }).map((_, i) => {
        const x = 40 + ((i * 53) % 230);
        const y = 50 + ((i * 37) % 100);
        return <circle key={i} cx={x} cy={y} r="1.6" fill="#E11D48" opacity={0.35 + (i % 5) * 0.12} />;
      })}
    </g>
    <motion.line
      y1="20"
      y2="165"
      stroke="#E11D48"
      strokeWidth="2"
      animate={{ x1: [0, 320, 320, 0], x2: [0, 320, 320, 0], opacity: [1, 1, 0, 0] }}
      transition={{ duration: 5, repeat: Infinity, times: [0, 0.5, 0.8, 1], ease: 'easeInOut' }}
    />
  </svg>
);

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  const goToLink = (path: RoutePath) => linkHandler(onNavigate, path);

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="mb-8">
          <UncapturedScan />
          <p className="mt-2 font-mono text-xs text-zinc-400 tracking-widest">404</p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display text-balance mb-6 leading-[1.12]"
        >
          This place hasn't been <span className="text-accent">captured yet.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto"
        >
          The page you're looking for doesn't exist or has moved. Try one of these instead:
        </motion.p>

        <nav aria-label="Suggested pages" className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          {LINKS.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.path}
                href={link.path}
                onClick={goToLink(link.path)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.07 }}
                className="block group"
              >
                <SpotlightCard className="h-full" contentClassName="p-5 flex flex-col gap-4">
                  <span className="w-10 h-10 rounded-lg border border-line bg-surface flex items-center justify-center transition-colors group-hover:bg-accent group-hover:border-accent">
                    <Icon className="w-4.5 h-4.5 text-accent transition-colors group-hover:text-white" aria-hidden="true" />
                  </span>
                  <span className="flex items-center justify-between gap-2 text-sm font-bold text-zinc-900 font-display group-hover:text-accent transition-colors">
                    {link.label}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </SpotlightCard>
              </motion.a>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
