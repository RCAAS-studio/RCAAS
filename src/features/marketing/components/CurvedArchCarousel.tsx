import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IMG } from '../data/images';
import { motion } from 'framer-motion';
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
    subtitle: 'Sacred UNESCO-Zone Monument',
    category: 'Heritage & Preservation',
    location: 'Kirtipur, Kathmandu',
    metric: '±5mm sub-centimetre precision',
    image: IMG['curved-arch-carousel/sacred-unesco-zone-monument'],
    link: '/work/chilancho-stupa-digital-heritage/',
    deliverables: ['3D Gaussian Splat', 'Point Cloud Archive', '4K Aerial Film'],
  },
  {
    id: 'basera',
    number: '02',
    title: 'Basera Boutique Hotel',
    subtitle: 'Heritage Courtyard & Deluxe Suites',
    category: 'Hospitality & Tourism',
    location: 'Kathmandu, Nepal',
    metric: '100% direct booking embed',
    image: IMG['curved-arch-carousel/heritage-courtyard-deluxe-suites'],
    link: '/work/basera-boutique-hotel-3d-experience/',
    deliverables: ['Photorealistic 3D Tour', 'VR Showroom', 'Ad Video Cuts'],
  },
  {
    id: 'nepathya',
    number: '03',
    title: 'Nepathya School & College',
    subtitle: 'Comprehensive 4-Block Campus',
    category: 'Education & Academics',
    location: 'Kathmandu Valley',
    metric: 'Admissions walkthrough portal',
    image: IMG['curved-arch-carousel/comprehensive-4-block-campus'],
    link: '/work/nepathya-school-college-3d-campus-tour/',
    deliverables: ['Interactive Campus Map', 'STEM Lab Waypoints', 'Fly-Through Story'],
  },
  {
    id: 'madan-ashrit',
    number: '04',
    title: 'Madan Ashrit Polytechnic',
    subtitle: '12 Technical Engineering Bays',
    category: 'Vocational & Technical',
    location: 'Nepal',
    metric: 'Equipment-level digital twin',
    image: IMG['curved-arch-carousel/12-technical-engineering-bays'],
    link: '/work/madan-ashrit-polytechnic-3d-campus-tour/',
    deliverables: ['Workshop Digital Twin', 'CAD Floor Plans', 'Equipment Tags'],
  },
  {
    id: 'laser-field',
    number: '05',
    title: 'Field SLAM LiDAR Survey',
    subtitle: 'Real-Time Precision Geomatics',
    category: 'Digital Twins & Survey',
    location: 'Alpine & Urban Sites, Nepal',
    metric: '200k pts/sec real-time registration',
    image: IMG['curved-arch-carousel/real-time-precision-geomatics'],
    link: '/services/digital-twins/3d-laser-scanning/',
    deliverables: ['SLAM LiDAR Scans', 'RTK Drone Mapping', 'BIM-Ready Geometry'],
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

  // Autoplay with pause on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative w-full overflow-hidden select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
              <motion.div
                key={card.id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_e, info) => {
                  if (info.offset.x > 50) {
                    handlePrev();
                  } else if (info.offset.x < -50) {
                    handleNext();
                  }
                }}
                animate={{
                  x: translateX,
                  y: translateY,
                  z: translateZ,
                  rotateY: rotateY,
                  scale: scale,
                  opacity: opacity,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => {
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
                className={`absolute w-[280px] sm:w-[340px] h-[410px] sm:h-[450px] rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300 touch-pan-y ${
                  isCurrent
                    ? 'ring-2 ring-accent shadow-2xl shadow-rose-950/20'
                    : 'shadow-lg hover:shadow-xl opacity-80 hover:opacity-100'
                }`}
              >
                {/* Background Image with Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-zinc-900">
                  <img
                    src={card.image}
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

                  <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white mb-1 drop-shadow-sm">
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
              </motion.div>
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
              className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                idx === activeIndex
                  ? 'w-7 h-2 bg-accent'
                  : 'w-2 h-2 bg-zinc-300 hover:bg-zinc-400'
              }`}
              aria-label={`Jump to ${card.title}`}
            />
          ))}
        </div>
        <span className="text-[10px] font-mono text-zinc-400 sm:hidden">
          Swipe left/right or tap to flip projects
        </span>
      </div>
    </div>
  );
};
