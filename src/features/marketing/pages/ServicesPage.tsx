import React, { useState } from 'react';
import { IMG } from '../data/images';
import { motion, AnimatePresence } from 'framer-motion';
import { RoutePath } from '../types';
import { SITE_METADATA, TOOLKIT } from '../data/siteData';
import { SpotlightCard } from '../components/SpotlightCard';
import { ValueChainGraphic } from '../components/ValueChainGraphic';
import { CurvedArchCarousel } from '../components/CurvedArchCarousel';
import { OneCaptureMultiUseVisualizer } from '../components/OneCaptureMultiUseVisualizer';
import { eyebrowClass, pageShellClass } from '../components/ui';

interface ServicesPageProps {
  currentPath: RoutePath;
  onNavigate: (path: RoutePath) => void;
  onOpenPlanner: () => void;
}

interface PillarDetail {
  id: string;
  number: string;
  slug: string;
  title: string;
  promise: string;
  body: string;
  helpsYou: string;
  image: string;
  badge: string;
  iconSvg: React.ReactNode;
  includes: Array<{ label: string; href: string; isRoute: boolean }>;
  exploreLink: RoutePath;
  exploreLabel: string;
}

const PILLARS_COPY: PillarDetail[] = [
  {
    id: 'immersive-experiences',
    number: '01',
    slug: 'immersive-experiences',
    title: 'Immersive Experiences',
    promise: 'Let people step inside.',
    body: 'Photorealistic 3D tours that open from a link, VR that puts visitors on site, and interactive experiences built with game-engine tools.',
    helpsYou: 'Win bookings, applications, sales enquiries and visits.',
    image: IMG['services/immersive-experiences'],
    badge: 'Web 3D & VR',
    iconSvg: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="9" strokeWidth="1.75" />
        <ellipse cx="12" cy="12" rx="4" ry="9" strokeWidth="1.5" />
        <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1.5" />
      </svg>
    ),
    includes: [
      {
        label: '3D virtual tours',
        href: '/services/immersive-experiences/3d-virtual-tours/',
        isRoute: true,
      },
      {
        label: 'VR experiences',
        href: '/services/immersive-experiences/#vr',
        isRoute: true,
      },
      {
        label: 'AR experiences',
        href: '/services/immersive-experiences/#ar',
        isRoute: true,
      },
      {
        label: 'Interactive experiences',
        href: '/services/immersive-experiences/#interactive',
        isRoute: true,
      },
    ],
    exploreLink: '/services/immersive-experiences/',
    exploreLabel: 'Explore immersive experiences',
  },
  {
    id: 'visual-storytelling',
    number: '02',
    slug: 'visual-storytelling',
    title: 'Visual Storytelling',
    promise: 'Turn your place into a story.',
    body: 'Guided tours, cinematic fly-through films and social content made from your 3D capture, shaped around what you want your audience to feel and do.',
    helpsYou: 'Run campaigns, raise awareness, attract funding and engage the public.',
    image: IMG['services/visual-storytelling'],
    badge: 'Films & guided tours',
    iconSvg: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.75" />
        <line x1="3" y1="10" x2="21" y2="10" strokeWidth="1.5" />
        <polygon points="10,12 15,14.5 10,17" fill="currentColor" strokeWidth="0" />
      </svg>
    ),
    includes: [
      {
        label: 'Guided and narrated tours',
        href: '/services/visual-storytelling/#guided-tours',
        isRoute: true,
      },
      {
        label: 'Fly-through films and renders',
        href: '/services/visual-storytelling/#films',
        isRoute: true,
      },
      {
        label: 'Social content',
        href: '/services/visual-storytelling/#social',
        isRoute: true,
      },
      {
        label: 'Exhibition and event content',
        href: '/services/visual-storytelling/#exhibitions',
        isRoute: true,
      },
    ],
    exploreLink: '/services/visual-storytelling/',
    exploreLabel: 'Explore visual storytelling',
  },
  {
    id: 'digital-twins',
    number: '03',
    slug: 'digital-twins',
    title: 'Digital Twins & Survey',
    promise: 'Measure, design and plan from reality.',
    body: 'Accurate 3D records of buildings, sites and landscapes, captured with advanced laser and aerial scanning, ready for design, planning and preservation.',
    helpsYou: 'Design with confidence, cut repeat site visits, plan better and preserve what matters.',
    image: IMG['services/digital-twins-survey'],
    badge: 'Laser & aerial capture',
    iconSvg: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="9" strokeWidth="1.75" />
        <polygon points="12,6 15,12 12,10 9,12" fill="currentColor" strokeWidth="0" />
        <polygon points="12,18 9,12 12,14 15,12" fill="currentColor" opacity="0.4" strokeWidth="0" />
      </svg>
    ),
    includes: [
      {
        label: '3D laser scanning',
        href: '/services/digital-twins/3d-laser-scanning/',
        isRoute: true,
      },
      {
        label: 'Drone mapping and aerial survey',
        href: '/services/digital-twins/drone-mapping/',
        isRoute: true,
      },
      {
        label: 'As-built drawings and CAD/BIM-ready data',
        href: '/services/digital-twins/#as-built',
        isRoute: true,
      },
      {
        label: 'Survey and GIS',
        href: '/services/digital-twins/#survey-gis',
        isRoute: true,
      },
    ],
    exploreLink: '/services/digital-twins/',
    exploreLabel: 'Explore digital twins',
  },
  {
    id: 'game-worlds-assets',
    number: '04',
    slug: 'game-worlds-assets',
    title: 'Game Worlds & Assets',
    promise: 'Real places. Ready to play.',
    body: 'Real locations, objects and heritage sites captured as Gaussian splats and turned into game-ready environments and props for Unreal, Unity and real-time experiences.',
    helpsYou: 'Build game worlds, assets and real-time scenes from places players recognise.',
    image: IMG['services/game-worlds-assets'],
    badge: 'Unreal & Unity',
    iconSvg: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="7" width="18" height="10" rx="5" strokeWidth="1.75" />
        <line x1="8" y1="10" x2="8" y2="14" strokeWidth="1.5" />
        <line x1="6" y1="12" x2="10" y2="12" strokeWidth="1.5" />
        <circle cx="15.5" cy="11" r="1" fill="currentColor" strokeWidth="0" />
        <circle cx="17.5" cy="13" r="1" fill="currentColor" strokeWidth="0" />
      </svg>
    ),
    includes: [
      { label: '3D asset generation', href: '/services/game-worlds-assets/', isRoute: true },
      { label: 'Game development', href: '/services/game-worlds-assets/', isRoute: true },
      { label: 'Gaussian splat assets', href: '/services/game-worlds-assets/', isRoute: true },
      { label: 'Real-time scenes', href: '/services/game-worlds-assets/', isRoute: true },
    ],
    exploreLink: '/services/game-worlds-assets/',
    exploreLabel: 'Explore game worlds & assets',
  },
];

interface GoalMatch {
  goal: string;
  bestFit: string;
  example: string;
  primaryPillarId: string;
  sectorTag: 'bookings' | 'education' | 'property' | 'architecture' | 'heritage' | 'planning' | 'games';
}

const GOALS_MATRIX: GoalMatch[] = [
  {
    goal: 'More bookings or visits',
    bestFit: 'Immersive Experiences',
    example: 'A 3D tour on your website and booking page',
    primaryPillarId: 'immersive-experiences',
    sectorTag: 'bookings',
  },
  {
    goal: 'More applications or enrolments',
    bestFit: 'Immersive Experiences + Visual Storytelling',
    example: 'A campus tour and a short film for admissions campaigns',
    primaryPillarId: 'immersive-experiences',
    sectorTag: 'education',
  },
  {
    goal: 'Sell or lease property',
    bestFit: 'Immersive Experiences + Visual Storytelling',
    example: 'A 3D walkthrough of a show flat and fly-through clips for ads',
    primaryPillarId: 'visual-storytelling',
    sectorTag: 'property',
  },
  {
    goal: 'Design, renovate or fit out',
    bestFit: 'Digital Twins & Survey',
    example: 'A measured 3D scan and drawings for your design software',
    primaryPillarId: 'digital-twins',
    sectorTag: 'architecture',
  },
  {
    goal: 'Preserve heritage',
    bestFit: 'Digital Twins & Survey + Immersive Experiences',
    example: 'A measured record for conservators and a public 3D experience',
    primaryPillarId: 'digital-twins',
    sectorTag: 'heritage',
  },
  {
    goal: 'Plan or engage the public',
    bestFit: 'Digital Twins & Survey + Visual Storytelling',
    example: '3D base data for planning and visuals residents understand',
    primaryPillarId: 'digital-twins',
    sectorTag: 'planning',
  },
  {
    goal: 'Build game worlds or assets',
    bestFit: 'Game Worlds & Assets',
    example: 'Game-ready environments and props made from a real captured place',
    primaryPillarId: 'game-worlds-assets',
    sectorTag: 'games',
  },
];

interface StarterPackage {
  number: string;
  name: string;
  forWho: string;
  includes: string;
  from: string;
  popular?: boolean;
}

const STARTER_PACKAGES: StarterPackage[] = [
  {
    number: '01',
    name: 'Tour',
    forWho: 'Showing one place online',
    includes: 'Capture, photorealistic 3D tour, hosting, shareable link',
    from: 'Custom quote',
  },
  {
    number: '02',
    name: 'Tour + Story',
    forWho: 'Campaigns and launches',
    includes: 'Everything in Tour, plus a fly-through film and social clips',
    from: 'Custom quote',
    popular: true,
  },
  {
    number: '03',
    name: 'Immersive',
    forWho: 'Events, exhibitions and flagship projects',
    includes: 'Tour + Story, plus VR or an interactive experience',
    from: 'Custom quote',
  },
];

export const ServicesPage: React.FC<ServicesPageProps> = ({ currentPath, onNavigate }) => {
  const isImmersive = currentPath.includes('/immersive-experiences');
  const is3DTours = currentPath.includes('/3d-virtual-tours');
  const isStorytelling = currentPath.includes('/visual-storytelling');
  const isDigitalTwins = currentPath.includes('/digital-twins');
  const isLaserScanning = currentPath.includes('/3d-laser-scanning');
  const isDroneMapping = currentPath.includes('/drone-mapping');

  const [activeGoalFilter, setActiveGoalFilter] = useState<string>('all');
  const [highlightedPillar, setHighlightedPillar] = useState<string | null>(null);

  const filteredGoals = activeGoalFilter === 'all' 
    ? GOALS_MATRIX 
    : GOALS_MATRIX.filter((g) => g.bestFit.toLowerCase().includes(activeGoalFilter));

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb: Home › What we create */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-10">
          <button 
            type="button" 
            onClick={() => onNavigate('/')} 
            className="hover:text-zinc-900 transition-colors"
          >
            Home
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <button
            type="button"
            onClick={() => onNavigate('/services/')}
            className={`transition-colors ${
              currentPath === '/services/' ? 'text-ink font-semibold' : 'hover:text-zinc-900'
            }`}
          >
            What we create
          </button>
          {isImmersive && (
            <>
              <span className="text-zinc-400" aria-hidden="true">›</span>
              <span className="text-accent font-semibold">
                {is3DTours ? '3D Virtual Tours' : 'Immersive Experiences'}
              </span>
            </>
          )}
          {isStorytelling && (
            <>
              <span className="text-zinc-400" aria-hidden="true">›</span>
              <span className="text-accent font-semibold">Visual Storytelling</span>
            </>
          )}
          {isDigitalTwins && (
            <>
              <span className="text-zinc-400" aria-hidden="true">›</span>
              <span className="text-accent font-semibold">
                {isLaserScanning
                  ? '3D Laser Scanning'
                  : isDroneMapping
                  ? 'Drone Mapping'
                  : 'Digital Twins & Survey'}
              </span>
            </>
          )}
        </nav>

        {/* 1. Hero + intro */}
        <div className="max-w-4xl mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-6 shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span>Services Hub · Reality Capture as a Service</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl font-bold tracking-tight text-ink font-display text-balance"
          >
            What we create
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-base sm:text-lg text-muted leading-relaxed max-w-3xl text-balance"
          >
            Every project starts with a real place and a clear goal: more bookings, more applications, a better design, a lasting record. From one visit to your site, we can create three kinds of work. Most clients combine them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              type="button"
              onClick={() => onNavigate('/contact/')}
              className="loro-btn-primary px-7 py-3 text-xs font-semibold uppercase tracking-wider"
            >
              Plan your experience &rarr;
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('choose');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="loro-btn-secondary px-6 py-3 text-xs font-medium"
            >
              Which is right for you? &darr;
            </button>
          </motion.div>
        </div>

        {/* 2. The four pillars */}
        <section id="pillars" className="mb-24 sm:mb-32">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className={eyebrowClass}>
                Core Capabilities
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-ink font-display">
                The four pillars
              </h2>
            </div>
            <span className="hidden sm:inline-block text-xs font-mono text-zinc-400">
              01 · 02 · 03 · 04
            </span>
          </div>

          {/* Optimized Pillar Cards with Circular Top Icons, Index Badges, and Gradient Shading */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {PILLARS_COPY.map((pillar, idx) => {
              const isHoveredOrTargeted = highlightedPillar === pillar.id;
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={() => setHighlightedPillar(pillar.id)}
                  onMouseLeave={() => setHighlightedPillar(null)}
                >
                  <SpotlightCard
                    className={`overflow-hidden h-full flex flex-col justify-between border-zinc-200 bg-gradient-to-b from-white via-white to-zinc-50/60 shadow-sm transition-all duration-300 ${
                      isHoveredOrTargeted
                        ? 'shadow-xl border-zinc-300 ring-1 ring-accent/20 -translate-y-1'
                        : 'hover:shadow-lg hover:border-zinc-300'
                    }`}
                  >
                    <div>
                      {/* Top Image Preview Header with Circular Top Icon and Index Badge */}
                      <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                        <img
                          src={pillar.image}
                          alt={pillar.title}
                          className="w-full h-full object-cover object-center filter brightness-[0.9] contrast-[1.05] transition-transform duration-700 hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
                        
                        {/* Top Overlay Badges */}
                        <div className="absolute top-4 inset-x-4 flex items-center justify-between">
                          {/* Circular Top Icon */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/95 border border-white/20 shadow-md">
                            {pillar.iconSvg}
                          </div>

                          {/* Index Counter Badge */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-white/20 font-mono text-[11px] text-white font-bold">
                            <span>PILLAR</span>
                            <span className="text-accent">{pillar.number}</span>
                          </div>
                        </div>

                        {/* Bottom overlay inside image: Promise & Badge */}
                        <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-white">
                          <span className="text-xs font-mono font-semibold text-rose-300">
                            {pillar.promise}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/30 text-white">
                            {pillar.badge}
                          </span>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-6 sm:p-7">
                        <h2 className="text-2xl font-bold text-ink font-display">
                          {pillar.title}
                        </h2>

                        <p className="mt-3 text-sm text-muted leading-relaxed">
                          {pillar.body}
                        </p>

                        {/* Helps you callout */}
                        <div className="mt-5 rounded-lg bg-zinc-50 border border-zinc-200/90 p-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            Helps you
                          </div>
                          <p className="text-xs text-ink font-medium leading-relaxed">
                            {pillar.helpsYou}
                          </p>
                        </div>

                        {/* Includes list with capability links */}
                        <div className="mt-6">
                          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-3">
                            Includes:
                          </div>
                          <ul className="space-y-2.5 text-xs">
                            {pillar.includes.map((inc) => (
                              <li key={inc.label} className="flex items-center gap-2.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                                {inc.isRoute ? (
                                  <button
                                    type="button"
                                    onClick={() => onNavigate(inc.href as RoutePath)}
                                    className="text-zinc-700 hover:text-accent hover:underline font-mono transition-colors text-left"
                                  >
                                    {inc.label} &rarr;
                                  </button>
                                ) : (
                                  <span className="text-zinc-600 font-mono">
                                    {inc.label}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Card footer CTA link */}
                    <div className="p-6 sm:p-7 pt-0 border-t border-zinc-100 mt-2">
                      <button
                        type="button"
                        onClick={() => onNavigate(pillar.exploreLink)}
                        className="flex items-center justify-between w-full pt-4 text-xs font-semibold text-ink hover:text-accent transition-colors group"
                      >
                        <span>{pillar.exploreLabel}</span>
                        <span className="transform group-hover:translate-x-1 transition-transform font-mono text-base">&rarr;</span>
                      </button>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 3. One visit, many uses #one-capture */}
        <section id="one-capture" className="mb-24 sm:mb-32 rounded-2xl border border-line bg-gradient-to-b from-surface to-white p-6 sm:p-12 shadow-sm">
          <div className="max-w-3xl mb-10">
            <span className={eyebrowClass}>
              The Reality Advantage
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display text-balance">
              One capture, many uses
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed text-balance">
              We capture your place once, carefully and accurately. From that single capture we can build a 3D tour for your website, a VR version for events, a film for social media and measured data for your architect. You get more from one visit, and everything stays consistent.
            </p>
          </div>

          {/* Visual: ValueChain graphic: Capture → Create → Tell → Deliver → Measure */}
          <div className="mb-12">
            <ValueChainGraphic />
          </div>

          {/* Interactive Single Site Capture -> 4 High-Value Deliverables Engine */}
          <div className="mt-10">
            <OneCaptureMultiUseVisualizer onNavigate={onNavigate} />
          </div>
        </section>

        {/* 4. Which is right for you? #choose */}
        <section id="choose" className="mb-24 sm:mb-32">
          <div className="max-w-3xl mb-8">
            <span className={eyebrowClass}>
              Decision Guide
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display text-balance">
              Which is right for you?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted">
              Start with your goal. We'll recommend the mix.
            </p>
          </div>

          {/* Interactive Goal Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-mono text-zinc-400 mr-2">Filter by sector:</span>
            {[
              { id: 'all', label: 'All Goals' },
              { id: 'immersive', label: 'Immersive Experiences' },
              { id: 'storytelling', label: 'Visual Storytelling' },
              { id: 'survey', label: 'Digital Twins & Survey' },
              { id: 'game', label: 'Game Worlds & Assets' },
            ].map((f) => {
              const isActive = activeGoalFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveGoalFilter(f.id)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeGoalFilterTab"
                      className="absolute inset-0 bg-ink rounded-full z-0"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-line bg-zinc-50/80 text-zinc-600 font-mono text-xs">
                    <th className="py-3.5 px-5 font-semibold">Your goal</th>
                    <th className="py-3.5 px-5 font-semibold">Best fit</th>
                    <th className="py-3.5 px-5 font-semibold">Example of what you get</th>
                    <th className="py-3.5 px-5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredGoals.map((item) => (
                    <tr
                      key={item.goal}
                      className="hover:bg-zinc-50/60 transition-colors"
                    >
                      <td className="py-4 px-5 font-semibold text-ink">
                        {item.goal}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-accent-strong bg-rose-50/70 px-2.5 py-1 rounded border border-rose-200/60">
                          <span className="h-1 w-1 rounded-full bg-accent" />
                          {item.bestFit}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-zinc-600 leading-relaxed">
                        {item.example}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onNavigate('/contact/')}
                          className="font-mono text-xs font-semibold text-accent hover:underline"
                        >
                          Plan this &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. Ways to start #ways-to-start */}
        <section id="ways-to-start" className="mb-24 sm:mb-32">
          <div className="max-w-3xl mb-10">
            <span className={eyebrowClass}>
              Project Starters
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display text-balance">
              Ways to start
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-mono">
              Starter packages tailored to your project scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {STARTER_PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.name}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className={`relative flex flex-col justify-between rounded-xl border p-6 sm:p-8 transition-all duration-300 ${
                  pkg.popular
                    ? 'border-accent bg-gradient-to-b from-white to-rose-50/30 shadow-md ring-1 ring-accent/30'
                    : 'border-line bg-gradient-to-b from-white to-zinc-50/50 shadow-sm hover:border-zinc-300 hover:shadow-md'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 right-6 bg-accent text-white text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Circular Top Icon & Index Counter Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-11 h-11 rounded-full border border-zinc-200 bg-white shadow-sm">
                      <span className="font-mono text-xs font-bold text-accent">
                        {pkg.number}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded bg-zinc-100 text-zinc-700">
                      {pkg.from}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-ink font-display">
                    {pkg.name}
                  </h3>

                  <div className="mt-2 text-xs font-mono text-accent-strong font-medium">
                    For: {pkg.forWho}
                  </div>

                  <div className="mt-5 pt-4 border-t border-zinc-100">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                      Includes
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {pkg.includes}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => onNavigate('/contact/')}
                    className={`w-full text-center text-xs font-semibold py-3 px-4 rounded-lg transition-colors ${
                      pkg.popular
                        ? 'loro-btn-primary'
                        : 'border border-zinc-300 bg-white hover:border-accent hover:text-accent'
                    }`}
                  >
                    Ask for a quote &rarr;
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-5 text-xs text-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p>
              <strong className="text-zinc-900 font-semibold">Note:</strong> Every project is quoted to its size and goal. Prices shown are starting points.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/contact/')}
              className="text-xs font-semibold text-accent hover:underline whitespace-nowrap self-start sm:self-auto"
            >
              Ask for a quote &rarr;
            </button>
          </div>
        </section>

        {/* Toolkit reference (§12 Verification) */}
        <div id="toolkit" className="rounded-xl border border-line bg-white p-6 sm:p-8 mb-24 sm:mb-32 shadow-sm">
          <div className="max-w-2xl mb-8">
            <span className={eyebrowClass}>
              Rigor &amp; Tooling
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-ink font-display">
              Field &amp; Studio Toolkit
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted">
              Every tool in our kit serves a distinct phase in the reality-capture value chain.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-zinc-500 font-mono">
                  <th className="pb-3 font-medium">Domain / Phase</th>
                  <th className="pb-3 font-medium">What It Does For You</th>
                  <th className="pb-3 font-medium">Representative Tools &amp; Hardware</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
                {TOOLKIT.map((t) => (
                  <tr key={t.category} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3.5 font-bold text-ink">{t.category}</td>
                    <td className="py-3.5 text-zinc-600 font-sans">{t.whatItDoesForYou}</td>
                    <td className="py-3.5 text-accent-strong">{t.examples.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Proof with CurvedArchCarousel ("See it in action") */}
        <section id="proof" className="mb-24 sm:mb-32 rounded-2xl border border-line bg-gradient-to-b from-surface to-white p-6 sm:p-12 shadow-sm">
          <div className="max-w-2xl mb-8">
            <span className={eyebrowClass}>
              Delivered Work
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-ink font-display text-balance">
              See it in action
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed text-balance">
              Explore projects we've delivered for heritage sites, schools, colleges and hotels.
            </p>
          </div>

          {/* Curved Arch / Fan 3D Ribbon Showcase Visualisation */}
          <div className="my-6">
            <CurvedArchCarousel onNavigate={onNavigate} />
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-zinc-500">
              Want to see measured accuracy datasets or point cloud LAS samples?
            </span>
            <button
              type="button"
              onClick={() => onNavigate('/work/')}
              className="loro-btn-secondary px-6 py-3 text-xs font-semibold whitespace-nowrap self-start sm:self-auto"
            >
              See all projects &rarr;
            </button>
          </div>
        </section>

        {/* 7. CTA band */}
        <section id="cta-band" className="rounded-2xl border border-line bg-gradient-to-b from-surface to-white p-8 sm:p-14 text-center shadow-md">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-xs font-mono text-zinc-600 mb-5 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span>Free consultation &amp; custom proposal</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-ink font-display text-balance">
              Not sure where to start?
            </h2>

            <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed text-balance">
              Tell us about your place and what you want people to do. We'll suggest the right mix and send a clear proposal.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/contact/')}
                className="loro-btn-primary w-full sm:w-auto px-8 py-3.5 text-xs font-semibold uppercase tracking-wider"
              >
                Plan your experience &rarr;
              </button>

              <a
                href={SITE_METADATA.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="loro-btn-secondary w-full sm:w-auto px-7 py-3.5 text-xs font-medium flex items-center justify-center gap-2"
              >
                <span>Chat on WhatsApp</span>
                <span className="text-emerald-600 font-bold" aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="mt-6 text-xs text-zinc-400 font-mono">
              Direct response within 24 hours · Kathmandu, Nepal
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
