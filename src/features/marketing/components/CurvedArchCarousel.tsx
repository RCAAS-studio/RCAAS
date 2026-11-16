import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IMG, srcSetFor } from '../data/images';
import { motion, useReducedMotion } from 'framer-motion';
import { withBase } from '../../../lib/basePath';
import { RoutePath } from '../types';

export interface ArchCardItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  location: string;
  metric: string;
  image: string;
  link: RoutePath;
  deliverables: string[];
}

const DEFAULT_CARDS: ArchCardItem[] = [
  {
    id: 'chilancho',
    number: '01',
    title: 'Chilancho Stupa',
    subtitle: 'Historic Buddhist chaitya complex',
    category: 'Heritage & Preservation',
    location: 'Kirtipur, Kathmandu Valley',
    metric: 'In-house research · October 2025',
    image: IMG['curved-arch-carousel/sacred-unesco-zone-monument'],
    link: '/work/chilancho-stupa-digital-heritage/',
    deliverables: ['Web-based 3D visualisation'],
  },
  {
    id: 'basera',
    number: '02',
    title: 'Basera Boutique Hotel',
    subtitle: 'Boutique hotel in Babar Mahal',
    category: 'Hospitality & Tourism',
    location: 'Babar Mahal, Kathmandu',
    metric: 'Look around before you book',
    image: IMG['curved-arch-carousel/heritage-courtyard-deluxe-suites'],
    link: '/work/basera-boutique-hotel-3d-experience/',
    deliverables: ['Photorealistic 3D experience', 'Shareable link'],
  },
  {
    id: 'nepathya',
    number: '03',
    title: 'Nepathya School & College',
    subtitle: 'Gamified virtual campus tour',
    category: 'Education & Academics',
    location: 'Tilottama, Rupandehi',
    metric: 'Explore the campus from home · August 2026',
    image: IMG['curved-arch-carousel/comprehensive-4-block-campus'],
    link: '/work/nepathya-school-college-3d-campus-tour/',
    deliverables: ['Gamified virtual tour', 'Web link'],
  },
  {
    id: 'madan-ashrit',
    number: '04',
    title: 'Madan Ashrit Memorial Polytechnic',
    subtitle: 'Gamified tour of workshops and labs',
    category: 'Vocational & Technical',
    location: 'Kadaghari, Kathmandu',
    metric: 'Hands-on learning, made visible · June 2026',
    image: IMG['curved-arch-carousel/12-technical-engineering-bays'],
    link: '/work/madan-ashrit-polytechnic-3d-campus-tour/',
    deliverables: ['Gamified virtual tour', 'Web link'],
  },
  {
    id: 'laser-field',
    number: '05',
    title: 'ITECO Nepal Road Survey',
    subtitle: 'Mugling–Narayanghat road, 35 km',
    category: 'Digital Twins & Survey',
    location: 'Chitwan',
    metric: 'Handheld SLAM LiDAR · February 2026',
    image: IMG['curved-arch-carousel/real-time-precision-geomatics'],
    link: '/services/digital-twins/3d-laser-scanning/',
    deliverables: ['3D documentation', 'Utilities mapping'],
  },
];

interface CurvedArchCarouselProps {
  onNavigate: (path: RoutePath) => void;
  className?: string;
}

export const CurvedArchCarousel: React.FC<CurvedArchCarouselProps> = ({
  onNavigate,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressPointerClick = useRef(false);
  const totalCards = DEFAULT_CARDS.length;

  // Window resize handler to calculate responsive arch spacing
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
  }, [totalCards]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  const reducedMotion = useReducedMotion();
  // Pause both for deliberate interaction and reduced-motion preferences.
  useEffect(() => {
    if (isPaused || reducedMotion) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, reducedMotion, handleNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.target !== e.currentTarget) {
      requestAnimationFrame(() => containerRef.current?.querySelector<HTMLAnchorElement>('a[data-carousel-card][tabindex="0"]')?.focus());
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative w-full overflow-hidden select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={(e) => setIsPaused(e.currentTarget.contains(document.activeElement))}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsPaused(false); }}
      role="region"
      aria-label="Interactive project showcase arch carousel"
    >
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-accent font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Curated Deployments ({totalCards} Sites)
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500">
            Interactive reality capture delivered for heritage, education, and hospitality in Nepal.
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 bg-white hover:border-accent hover:text-accent text-zinc-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20"
            aria-label="Previous project"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="px-3 font-mono text-xs font-semibold text-zinc-700 bg-zinc-100/80 rounded-md py-1.5 border border-zinc-200/60 tabular-nums">
            {String(activeIndex + 1).padStart(2, '0')} / {String(totalCards).padStart(2, '0')}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 bg-white hover:border-accent hover:text-accent text-zinc-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20"
            aria-label="Next project"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 3D Curved / Fan Arch Stage */}
      <div className="relative h-[440px] sm:h-[500px] w-full flex items-center justify-center perspective-[1200px]">
        {/* Subtle radial floor shadow */}
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-zinc-400/20 blur-2xl rounded-full pointer-events-none" 
          aria-hidden="true" 
        />

        <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
          {DEFAULT_CARDS.map((card, index) => {
            // Calculate circular offset relative to active card
            let offset = index - activeIndex;
            if (offset > totalCards / 2) offset -= totalCards;
            if (offset < -totalCards / 2) offset += totalCards;

            const isCurrent = offset === 0;
            const isFar = Math.abs(offset) >= 2;

            // Mathematical Arch positioning tailored for mobile vs desktop:
            const spacingX = isMobile ? 180 : 260;
            const translateX = offset * spacingX;
            const translateY = Math.abs(offset) * (isMobile ? 14 : 20);
            const translateZ = -Math.abs(offset) * (isMobile ? 70 : 110);
            const rotateY = offset * (isMobile ? -10 : -14);
            const scale = Math.max(isMobile ? 0.82 : 0.78, 1 - Math.abs(offset) * 0.12);
            const opacity = isFar && Math.abs(offset) > 2 ? 0 : Math.max(0.2, 1 - Math.abs(offset) * 0.35);
            const zIndex = 30 - Math.abs(offset) * 5;

            return (
              <motion.a
                key={card.id}
                href={withBase(card.link)}
                draggable={false}
                data-carousel-card=""
                tabIndex={isCurrent ? 0 : -1}
                aria-label={`Explore ${card.title}`}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onPointerDown={(e) => {
                  if (!e.isPrimary || e.button !== 0) return;
                  suppressPointerClick.current = false;
                  pointerStart.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerUp={(e) => {
                  const start = pointerStart.current;
                  if (!start || start.id !== e.pointerId) return;
                  pointerStart.current = null;
                  const dx = e.clientX - start.x;
                  const dy = e.clientY - start.y;
                  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                    suppressPointerClick.current = true;
                    if (dx > 0) handlePrev(); else handleNext();
                  }
                }}
                onPointerCancel={() => { pointerStart.current = null; }}
                animate={{
                  x: translateX,
                  y: translateY,
                  z: translateZ,
                  rotateY: rotateY,
                  scale: scale,
                  opacity: opacity,
                }}
                transition={{
                  duration: reducedMotion ? 0 : 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={(e) => {
                  if (e.detail !== 0 && suppressPointerClick.current) {
                    e.preventDefault();
                    suppressPointerClick.current = false;
                    return;
                  }
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  if (isCurrent) {
                    onNavigate(card.link);
                  } else {
                    setActiveIndex(index);
                  }
                }}
                style={{
                  zIndex,
                  transformStyle: 'preserve-3d',
                }}
                className={`absolute w-[280px] sm:w-[340px] h-[410px] sm:h-[450px] rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300 touch-pan-y focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                  isCurrent
                    ? 'ring-2 ring-accent shadow-2xl shadow-rose-950/20'
                    : 'shadow-lg hover:shadow-xl opacity-80 hover:opacity-100'
                }`}
              >
                {/* Background Image with Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-zinc-900">
                  <img
                    src={card.image} srcSet={srcSetFor(card.image)}
                    alt={card.title}
                    className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05] transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                  {/* High contrast gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-transparent" />
                </div>

                {/* Card Top: Circular Icon & Number Badge */}
                <div className="relative z-10 p-5 sm:p-6 flex items-center justify-between">
                  {/* Circular Top Icon Emblem */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/30 border border-white/20 text-white shadow-inner">
                    <span className="font-mono text-xs font-bold text-accent">
                      {card.number}
                    </span>
                  </div>

                  {/* Status / Category Tag */}
                  <div className="px-2.5 py-1 rounded-full bg-black/75 border border-white/15 text-[10px] font-mono uppercase tracking-wider text-white/90">
                    {card.category}
                  </div>
                </div>

                {/* Card Bottom: Content & Outcomes */}
                <div className="absolute bottom-0 inset-x-0 z-10 p-5 sm:p-6 text-white">
                  <div className="text-[11px] font-mono text-rose-300 font-medium mb-1">
                    {card.location}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold font-display tracking-tight text-white mb-1 drop-shadow-sm">
                    {card.title}
                  </h3>

                  <p className="text-xs text-zinc-300 line-clamp-1 mb-2.5">
                    {card.subtitle}
                  </p>

                  {/* Result Metric Banner */}
                  <div className="p-2.5 rounded-lg bg-white/30 border border-white/15 mb-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                    <span className="font-mono text-[11px] text-zinc-100 font-medium">
                      {card.metric}
                    </span>
                  </div>

                  {/* Deliverable Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    {card.deliverables.slice(0, 2).map((del) => (
                      <span
                        key={del}
                        className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-mono text-zinc-300 border border-white/10"
                      >
                        {del}
                      </span>
                    ))}
                  </div>

                  {/* Direct Action Link */}
                  <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-white/15 text-white group">
                    <span className="group-hover:text-rose-300 transition-colors">
                      {isCurrent ? 'Explore case study' : 'Click to view'}
                    </span>
                    <span className="font-mono text-rose-400 group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>

      {/* Pagination Dot Indicators & Gesture Hint */}
      <div className="flex flex-col items-center justify-center gap-2 mt-4">
        <div className="flex items-center justify-center gap-2">
          {DEFAULT_CARDS.map((card, idx) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="group flex h-8 w-10 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label={`Jump to ${card.title}`}
              aria-current={idx === activeIndex ? 'true' : undefined}
            >
              <span aria-hidden="true" className={`h-2 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${idx === activeIndex ? 'w-7 bg-accent' : 'w-2 bg-zinc-300 group-hover:bg-zinc-400'}`} />
            </button>
          ))}
        </div>
        <span className="text-[10px] font-mono text-zinc-500 sm:hidden">
          Swipe left/right or tap to flip projects
        </span>
      </div>
    </div>
  );
};
