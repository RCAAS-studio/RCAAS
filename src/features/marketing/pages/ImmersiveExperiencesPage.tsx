import React, { useState } from 'react';
import { IMG } from '../data/images';
import { motion } from 'framer-motion';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import { SplatEmbed } from '../components/SplatEmbed';
import { SpotlightCard } from '../components/SpotlightCard';
import { InteractiveTourFeaturesDemo } from '../components/InteractiveTourFeaturesDemo';
import { FaqList } from '../components/GuideParts';
import { buttonClass } from '../components/ui';

interface ImmersiveExperiencesPageProps {
  onNavigate: (path: RoutePath) => void;
  onOpenPlanner: () => void;
}

interface CapabilitySection {
  id: string;
  anchor: string;
  number: string;
  title: string;
  badge: string;
  whatItIs: string;
  audienceExperiences: string;
  youReceive: string[];
  bestFor: string[];
  madeWith: string;
  actionLink?: RoutePath;
  actionLabel?: string;
  image: string;
}

const CAPABILITIES: CapabilitySection[] = [
  {
    id: '3d-tours',
    anchor: '3d-tours',
    number: '01',
    title: '3D Virtual Tours',
    badge: 'Web 3D · Zero App Install',
    whatItIs:
      'A photorealistic, explorable 3D model of your place that opens from a link in any browser. Visitors move freely through the space instead of jumping between fixed photos.',
    audienceExperiences:
      'The real feel of a room, a campus or a courtyard: its size, light and layout, from any angle, with smooth 60 FPS continuous movement.',
    youReceive: [
      'Hosted high-speed 3D tour on our dedicated cloud platform',
      'Shareable link with custom URL and branding',
      'One-line responsive iframe embed code for any CMS',
      'Print-ready high-resolution QR codes for brochures & banners',
      'Custom brand overlay with logo and enquiry buttons',
    ],
    bestFor: ['Hotels & Resorts', 'Schools & Colleges', 'Property Sales & Showrooms', 'Heritage Sites', 'Event Venues'],
    madeWith:
      'Handheld laser scanning and aerial capture, reconstructed as photorealistic 3D (Gaussian splatting) and published on our platform.',
    actionLink: '/services/immersive-experiences/3d-virtual-tours/',
    actionLabel: 'Explore 3D virtual tours',
    image: IMG['immersive-experiences/showcase-1'],
  },
  {
    id: 'vr',
    anchor: 'vr',
    number: '02',
    title: 'VR Experiences',
    badge: 'Spatial Presence · WebXR & Headsets',
    whatItIs:
      'Your 3D place, prepared for a virtual reality headset, so visitors stand directly inside it with true 1:1 human scale and depth perception.',
    audienceExperiences:
      'The sense of being there: standing in a temple courtyard, walking a hotel lobby or touring an engineering workshop before enrolling.',
    youReceive: [
      'VR-ready application package optimised for standalone headsets',
      'WebXR browser link enabling instant entry without app stores',
      'Setup guidance and on-site support for events and exhibitions',
      'Kiosk kiosk mode locks for visitor centre unattended use',
    ],
    bestFor: [
      'International Tourism Fairs & Trade Shows',
      'Museums & Visitor Discovery Centres',
      'Admissions Open Days & Campus Fairs',
      'Luxury Property Sales Galleries',
    ],
    madeWith:
      'Your 3D capture dataset, mesh-optimised for 90 FPS rendering on headsets including Meta Quest 3, Apple Vision Pro, and HTC Vive.',
    image: IMG['immersive-experiences/showcase-2'],
  },
  {
    id: 'ar',
    anchor: 'ar',
    number: '03',
    title: 'AR Experiences',
    badge: 'Augmented Reality · Mobile Camera',
    whatItIs:
      'Augmented reality places a scanned architectural monument, room, or heritage artefact into the viewer’s own physical surroundings through their smartphone camera.',
    audienceExperiences:
      'A sacred medieval chaitya on their study table, an architectural campus masterplan scaled to room size, or interactive informational overlays while standing on site.',
    youReceive: [
      'App-free WebAR links launching instantly on iOS Safari & Android Chrome',
      'Apple Quick Look (.usdz) and Google Scene Viewer (.gltf) models',
      'Physical QR launch stickers and tabletop display stands',
      'Spatial measurement overlay calibrated to real dimensions',
    ],
    bestFor: [
      'Cultural Heritage Preservation & Education',
      'Museum Interactive Exhibitions',
      'Outdoor Heritage Trails & Historic Squares',
      'Architectural Scale Models for Off-Plan Sales',
    ],
    madeWith:
      'High-density surface reconstruction, ultra-compressed WebAR polygon meshes, and WebXR browser camera tracking pipelines.',
    image: IMG['immersive-experiences/showcase-3'],
  },
  {
    id: 'interactive',
    anchor: 'interactive',
    number: '04',
    title: 'Interactive Experiences',
    badge: 'Game-Engine Runtime · Branching Journeys',
    whatItIs:
      'Rich interactive applications built using game-engine technology (Unreal Engine / WebGL) incorporating guided navigation, audio, branching paths, information points, and real-time lighting.',
    audienceExperiences:
      'Deep exploration with gamified interaction, spatial audio narration, day-to-night lighting transitions, interactive doors, and rich multimedia popups.',
    youReceive: [
      'Custom interactive WebGL application embeddable anywhere',
      'Touchscreen kiosk build for corporate lobbies and visitor centres',
      'Real-time user engagement telemetry and heatmap dashboard',
      'Custom scripted narrative paths and multi-language audio narration',
    ],
    bestFor: [
      'Flagship Visitor Centres & Cultural Institutions',
      'Interactive Science Museums & Heritage Pavilions',
      'Large Multi-Campus Universities & Medical Institutes',
      'Premier Real Estate Sales Galleries',
    ],
    madeWith:
      'Unreal Engine 5 and WebGL spatial runtime, combining photogrammetric reality capture with real-time interactive physics and audio.',
    image: IMG['immersive-experiences/showcase-4'],
  },
];

const OUTCOME_TILES = [
  {
    title: 'Answer "what is it really like?"',
    body: 'Show the real space, at real scale, instead of a few chosen photos.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'Reach people who can\'t visit',
    body: 'Families abroad, guests planning a trip, investors in another city.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="9" strokeWidth="1.75" />
        <ellipse cx="12" cy="12" rx="4" ry="9" strokeWidth="1.5" />
        <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Invite exploring, not scrolling',
    body: 'People move through your place at their own pace and in their own order.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Create once, use everywhere',
    body: 'One capture powers your website, social media, events and sales conversations.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.75" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 9h6v6H9z" />
      </svg>
    ),
  },
];

const COMPARISON_ROWS = [
  {
    feature: 'Movement',
    photos: 'None (flat 2D still images)',
    panos: 'Jumps between fixed 360° node bubbles',
    rcaas: 'Continuous free-roam (6DoF) with smooth glide',
  },
  {
    feature: 'Spatial Feel & Scale',
    photos: 'Flattened perspective, camera lens tricks',
    panos: 'Distorted panoramic warping at edges',
    rcaas: 'Accurate human-scale depth, photorealistic lighting',
  },
  {
    feature: 'Device Compatibility',
    photos: 'Standard screens only',
    panos: 'Desktop and mobile browsers',
    rcaas: 'Phone, tablet, laptop, touch kiosks & VR headsets',
  },
  {
    feature: 'Secondary Deliverables',
    photos: 'Only photos',
    panos: 'Only panoramic tour',
    rcaas: 'Tour, VR, fly-through films, and CAD/BIM data',
  },
  {
    feature: 'Measuring & Interaction',
    photos: 'Cannot measure dimensions',
    panos: 'Limited rough estimates',
    rcaas: 'Sub-centimetre laser measurement tool built-in',
  },
];

const INDUSTRIES_LIST = [
  {
    name: 'Hotels & Hospitality',
    goal: 'Fill rooms and inspire direct bookings.',
    how: 'Guests explore suites, dining terraces and courtyard pavilions before booking, removing reservation doubt and boosting direct revenue.',
    link: '/industries/hospitality-tourism/' as RoutePath,
    tag: 'Hospitality',
  },
  {
    name: 'Schools & Colleges',
    goal: 'Attract students and reassure parents.',
    how: 'Families across Nepal and overseas explore science laboratories, sports fields and hostels during admissions open seasons.',
    link: '/industries/education/' as RoutePath,
    tag: 'Education',
  },
  {
    name: 'Real Estate & Architecture',
    goal: 'Sell and lease property faster.',
    how: 'Buyers inspect show flats, office layouts and developments remotely, accelerating decisions without repeated on-site visits.',
    link: '/industries/real-estate-architecture/' as RoutePath,
    tag: 'Real Estate',
  },
  {
    name: 'Heritage & Cultural Sites',
    goal: 'Protect, celebrate and share culture.',
    how: 'Creates millimeter-accurate digital records for conservation while welcoming pilgrims and international diaspora to explore sacred architecture.',
    link: '/industries/heritage-culture/' as RoutePath,
    tag: 'Heritage',
  },
];

const FAQS = [
  {
    q: 'Do visitors need to download an application?',
    a: 'No. All our 3D virtual tours run natively in modern web browsers (Chrome, Safari, Edge, Firefox) across smartphones, tablets and desktop computers. Visitors simply click a link or scan a QR code.',
  },
  {
    q: 'How does the 3D tour perform on mobile connections in Nepal?',
    a: 'We engineer progressive level-of-detail (LOD) streaming. The essential geometry loads in under two seconds on standard 4G connections, streaming high-definition texture splats seamlessly as the visitor moves through the space.',
  },
  {
    q: 'Can we embed the tour on our existing website?',
    a: 'Yes. We provide a single-line responsive iframe embed snippet that works immediately in WordPress, Webflow, Wix, Squarespace, or custom React/HTML websites without modifying server configurations.',
  },
  {
    q: 'How much disruption occurs during on-site scanning?',
    a: 'Very little. Our mobile SLAM laser scanners and aerial drones capture spaces continuously as our engineer walks. For hotels or active campuses, we typically complete a full scan in 2 to 6 hours during quiet operational windows.',
  },
  {
    q: 'Can you create a VR version from the same capture?',
    a: 'Yes. Because our capture records true three-dimensional geometry and volumetric radiance, every project can be deployed directly to VR headsets (Meta Quest, Apple Vision Pro) without needing a second site visit.',
  },
];

export const ImmersiveExperiencesPage: React.FC<ImmersiveExperiencesPageProps> = ({
  onNavigate,
  onOpenPlanner,
}) => {
  const [activePillarTab, setActivePillarTab] = useState<string>('3d-tours');

  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="py-14 sm:py-20 md:py-24 bg-white text-ink relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation: Home › What we create › Immersive Experiences */}
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
            className="hover:text-zinc-900 transition-colors"
          >
            What we create
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <span className="text-accent font-semibold" aria-current="page">
            Immersive Experiences
          </span>
        </nav>

        {/* 1. Hero + Answer Summary */}
        <div className="max-w-4xl mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-6 shadow-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-semibold text-zinc-900">Immersive Experiences</span>
            <span className="text-zinc-400">·</span>
            <span>Pillar 01</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-6xl font-bold tracking-tight text-ink font-display text-balance mb-6"
          >
            Let people step inside your place.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="bg-surface border-l-4 border-accent p-5 sm:p-6 rounded-r-xl border-y border-r border-line mb-8"
          >
            <p className="text-base sm:text-lg text-zinc-700 leading-relaxed font-sans">
              Immersive experiences let your audience explore a real place as if they were there, on a phone, in a browser or in a VR headset. RCAAS Technology creates photorealistic 3D tours, VR, AR and interactive experiences from real places across Nepal, designed to help hotels, schools, property developers and heritage sites turn interest into action.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6"
          >
            <button
              type="button"
              onClick={() => onNavigate('/contact/')}
              className={buttonClass('primary', 'md')}
            >
              <span>Plan your experience</span>
              <span className="ml-2 font-mono" aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToAnchor('showcase')}
              className={buttonClass('secondary', 'md')}
            >
              <span>Explore a live tour</span>
              <span className="ml-2 font-mono text-zinc-400">↓</span>
            </button>

            <button
              type="button"
              onClick={onOpenPlanner}
              className="inline-flex items-center justify-center px-4 py-3.5 rounded-lg text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors"
            >
              <span>Open Project Calculator</span>
            </button>
          </motion.div>

          {/* Trust Attributes Strip */}
          <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-zinc-500 border-t border-line">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Zero App Download Required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              6DoF Photorealistic Gaussian Splats
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              WebXR & Headset Compatible
            </span>
          </div>
        </div>

        {/* 2. Outcome Strip */}
        <section className="mb-20 sm:mb-28" aria-label="Key Outcomes">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OUTCOME_TILES.map((tile, idx) => (
              <SpotlightCard key={idx} className="p-6">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-line flex items-center justify-center mb-4">
                  {tile.icon}
                </div>
                <h3 className="text-sm font-bold text-ink font-display mb-2 leading-snug">
                  {tile.title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  {tile.body}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* 3. Showcase Section (#showcase) */}
        <section id="showcase" className="mb-20 sm:mb-28 scroll-mt-24">
          <div className="mb-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-100 border border-line text-xs font-mono text-zinc-600 mb-3">
              <span>Section 03</span>
              <span className="text-zinc-400">·</span>
              <span>Interactive Spatial Player</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-3">
              See it for yourself
            </h2>
            <p className="text-base text-zinc-600 font-sans">
              This experience was captured and built by our team. Open it on any device. Rotate the camera, jump between waypoints, or view full-screen.
            </p>
          </div>

          {/* Interactive SplatEmbed Player */}
          <div className="rounded-2xl border border-line bg-white p-2 sm:p-4 shadow-sm mb-4">
            <SplatEmbed initialDemo="basera" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500 font-mono px-2">
            <div>
              <span className="font-semibold text-zinc-900">Basera Boutique Hotel</span>
              <span className="mx-2 text-zinc-400">·</span>
              <span>Captured to let international guests explore the courtyard, suites and dining before booking.</span>
            </div>
            <div className="text-zinc-400">
              Interactive 3D Demo · Kathmandu, Nepal
            </div>
          </div>
        </section>

        {/* 4. Four Ways to Step Inside (#what-we-create, #3d-tours, #vr, #ar, #interactive) */}
        <section className="mb-20 sm:mb-28 scroll-mt-24" id="what-we-create">
          <div className="mb-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-100 border border-line text-xs font-mono text-zinc-600 mb-3">
              <span>Section 04</span>
              <span className="text-zinc-400">·</span>
              <span>Delivery Formats</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-3">
              Four ways to step inside
            </h2>
            <p className="text-base text-zinc-600 font-sans">
              Most projects start with a 3D tour. From the same capture, we can add VR, AR or a fully interactive experience, depending on where your audience is and what you want them to do.
            </p>
          </div>

          {/* Quick Pillar Jump Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-line">
            {CAPABILITIES.map((cap) => (
              <button
                key={cap.id}
                type="button"
                onClick={() => {
                  setActivePillarTab(cap.id);
                  scrollToAnchor(cap.anchor);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                  activePillarTab === cap.id
                    ? 'bg-ink text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <span>{cap.number}. </span>
                <span className="font-sans font-semibold">{cap.title}</span>
              </button>
            ))}
          </div>

          {/* Deep Capability Cards */}
          <div className="space-y-12">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.id}
                id={cap.anchor}
                className="scroll-mt-24 rounded-2xl border border-line bg-white overflow-hidden shadow-xs hover:border-zinc-300 transition-all duration-200"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                  
                  {/* Left Column: Visual & Deliverables */}
                  <div className="lg:col-span-5 bg-zinc-950 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono text-accent font-bold">
                          FORMAT {cap.number}
                        </span>
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/10">
                          {cap.badge}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold font-display text-white mb-4">
                        {cap.title}
                      </h3>
                      
                      {/* Image Preview Container */}
                      <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-white/15 mb-6 group">
                        <img loading="lazy" decoding="async"
                          src={cap.image}
                          alt={cap.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono text-white/90">
                          <span className="bg-black/75 px-2 py-0.5 rounded">
                            RCAAS SPATIAL CAPTURE
                          </span>
                          <span className="text-emerald-400">● 60 FPS</span>
                        </div>
                      </div>

                      {/* Best For Tags */}
                      <div className="mb-2">
                        <div className="text-[11px] font-mono text-zinc-400 uppercase mb-2 font-semibold">
                          Best Suited For
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {cap.bestFor.map((item, i) => (
                            <span
                              key={i}
                              className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-zinc-200 border border-white/5"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Made With Spec */}
                    <div className="pt-6 border-t border-white/10 mt-6 relative z-10">
                      <div className="text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Technology Pipeline
                      </div>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {cap.madeWith}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Spec Copy & Outcome */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
                    <div>
                      {/* What it is */}
                      <div className="mb-6">
                        <div className="text-xs font-mono font-semibold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          <span>What It Is</span>
                        </div>
                        <p className="text-base text-zinc-900 font-medium leading-relaxed font-sans">
                          {cap.whatItIs}
                        </p>
                      </div>

                      {/* What your audience experiences */}
                      <div className="mb-6 bg-surface p-4 sm:p-5 rounded-xl border border-line">
                        <div className="text-xs font-mono font-semibold uppercase text-zinc-500 mb-1.5">
                          What Your Audience Experiences
                        </div>
                        <p className="text-sm text-zinc-700 leading-relaxed font-sans">
                          {cap.audienceExperiences}
                        </p>
                      </div>

                      {/* You receive checklist */}
                      <div className="mb-8">
                        <div className="text-xs font-mono font-semibold uppercase text-zinc-500 mb-3">
                          What You Receive
                        </div>
                        <ul className="space-y-2.5">
                          {cap.youReceive.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-800">
                              <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4">
                      {cap.actionLink ? (
                        <button
                          type="button"
                          onClick={() => onNavigate(cap.actionLink!)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-strong transition-colors"
                        >
                          <span>{cap.actionLabel}</span>
                          <span className="font-mono" aria-hidden="true">→</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onNavigate('/contact/')}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-strong transition-colors"
                        >
                          <span>Request quote for this format</span>
                          <span className="font-mono" aria-hidden="true">→</span>
                        </button>
                      )}

                      <span className="text-xs font-mono text-zinc-400">
                        Anchored at #{cap.anchor}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Built-in Features (#hotspots) */}
        <section id="hotspots" className="mb-20 sm:mb-28 scroll-mt-24">
          <div className="mb-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-100 border border-line text-xs font-mono text-zinc-600 mb-3">
              <span>Section 05</span>
              <span className="text-zinc-400">·</span>
              <span>Tour Features & Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-3">
              Everything your visitors need to decide
            </h2>
            <p className="text-base text-zinc-600 font-sans">
              A 3D tour is more than a visual walkthrough. It is an interactive sales, admissions, and storytelling environment tailored to turn curious visits into measurable actions.
            </p>
          </div>

          {/* Interactive Feature Sandbox */}
          <div className="mb-12">
            <InteractiveTourFeaturesDemo />
          </div>

          {/* Features Matrix Table */}
          <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-surface border-b border-line text-zinc-700 font-mono text-xs">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold w-1/4">Feature</th>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold w-2/5">What it does</th>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold">Why it matters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-zinc-700 font-sans">
                <tr className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-zinc-900 font-display">
                    Interactive Hotspots
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    Pin photos, videos, text details and audio narration at exact points in 3D space.
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-600">
                    Tell the stories behind key architecture, room features or heritage carvings without cluttering the screen.
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-zinc-900 font-display">
                    Direct Booking & CTA
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    Integrate "Book this room", "Apply now" or "Contact agent" directly inside the tour interface.
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-600">
                    Convert visitor curiosity into immediate enquiries and reservations without leaving the experience.
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-zinc-900 font-display">
                    Floor Plans & Mini-Map
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    Toggle between 3D free-roam, dollhouse view and 2D architectural floor plan with live radar orientation.
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-600">
                    Visitors never feel lost, even across large hotel complexes, multi-storey campuses or heritage courtyards.
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-zinc-900 font-display">
                    In-Browser Measurement Tool
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    Allow visitors, event planners or interior designers to measure distances and door heights in real scale.
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-600">
                    Speeds up booking decisions for weddings, conferences, furniture fittings and renovation planning.
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-zinc-900 font-display">
                    Highlight Reel & Autoplay
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    Offer a cinematic autoplay tour that guides first-time visitors, with free exploration at any moment.
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-600">
                    Perfect for passive browsing on mobile, digital signage or exhibition kiosk displays.
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-zinc-900 font-display">
                    Responsive Cross-Device Embed
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    Embed in any WordPress, Webflow, custom website or mobile app using a simple single-line code snippet.
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-600">
                    Zero technical friction for marketing and IT teams; loads reliably over Nepal's mobile networks.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Comparison Table */}
        <section className="mb-20 sm:mb-28">
          <div className="mb-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-100 border border-line text-xs font-mono text-zinc-600 mb-3">
              <span>Section 06</span>
              <span className="text-zinc-400">·</span>
              <span>Technology Comparison</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-3">
              Why photorealistic 3D outperforms static media
            </h2>
            <p className="text-base text-zinc-600 font-sans">
              Traditional photos and jumpy 360 panorama tours leave gaps. Photorealistic 3D gives true spatial presence and uncompromised realism.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-surface border-b border-line text-zinc-700 font-mono text-xs">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold w-1/5">Capability</th>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold text-zinc-500">Standard Photos</th>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold text-zinc-500">360 Panorama Tours</th>
                  <th className="py-3.5 px-4 sm:px-6 font-bold text-accent bg-rose-50/50">RCAAS Photorealistic 3D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-sans">
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-zinc-900 font-display">
                      {row.feature}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-zinc-500">
                      {row.photos}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-zinc-600">
                      {row.panos}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-zinc-900 bg-rose-50/30">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span>{row.rcaas}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. Who it helps (#industries) */}
        <section id="industries" className="mb-20 sm:mb-28 scroll-mt-24">
          <div className="mb-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-100 border border-line text-xs font-mono text-zinc-600 mb-3">
              <span>Section 07</span>
              <span className="text-zinc-400">·</span>
              <span>Industry Impact</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-3">
              Designed for places where seeing is believing
            </h2>
            <p className="text-base text-zinc-600 font-sans">
              Every project is shaped around a specific commercial or institutional outcome.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INDUSTRIES_LIST.map((ind, i) => (
              <SpotlightCard key={i} className="p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold uppercase text-zinc-500">
                      {ind.tag}
                    </span>
                    <span className="text-xs font-mono text-accent font-bold">
                      Sector 0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-ink font-display mb-1.5">
                    {ind.name}
                  </h3>
                  <div className="text-xs font-semibold text-accent mb-3">
                    Goal: {ind.goal}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans mb-6">
                    {ind.how}
                  </p>
                </div>

                <div className="pt-4 border-t border-line flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onNavigate(ind.link)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:text-accent transition-colors"
                  >
                    <span>View {ind.name} solutions</span>
                    <span className="font-mono" aria-hidden="true">→</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/contact/')}
                    className="text-xs font-mono text-zinc-400 hover:text-zinc-700"
                  >
                    Request Proposal
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* 8. Simple, proven process */}
        <section className="mb-20 sm:mb-28">
          <div className="mb-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-100 border border-line text-xs font-mono text-zinc-600 mb-3">
              <span>Section 08</span>
              <span className="text-zinc-400">·</span>
              <span>Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-3">
              From site visit to live tour
            </h2>
            <p className="text-base text-zinc-600 font-sans">
              Our capture workflow requires just one carefully planned visit with minimal disruption to your operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="rounded-xl border border-line bg-white p-6 shadow-xs relative">
              <span className="text-2xl font-black font-mono text-zinc-200 block mb-3">01</span>
              <h3 className="text-base font-bold text-zinc-900 font-display mb-2">
                1. Capture (Single visit)
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                We scan your premises using handheld SLAM LiDAR and drone photogrammetry. Typically takes 2 to 6 hours with zero business interruption.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-white p-6 shadow-xs relative">
              <span className="text-2xl font-black font-mono text-zinc-200 block mb-3">02</span>
              <h3 className="text-base font-bold text-zinc-900 font-display mb-2">
                2. Reconstruct & Optimise
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Our team reconstructs the space in photorealistic 3D using Gaussian splatting, calibrating lighting, color accuracy and geometry.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-white p-6 shadow-xs relative">
              <span className="text-2xl font-black font-mono text-zinc-200 block mb-3">03</span>
              <h3 className="text-base font-bold text-zinc-900 font-display mb-2">
                3. Enrich with Hotspots
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                We add your branding, information tags, booking buttons, audio narration and 2D floor plans into the 3D space.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-white p-6 shadow-xs relative">
              <span className="text-2xl font-black font-mono text-zinc-200 block mb-3">04</span>
              <h3 className="text-base font-bold text-zinc-900 font-display mb-2">
                4. Launch & Share
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                You receive a hosted URL, embed snippet, QR codes and full VR files. We provide guidance on adding it to your website and marketing.
              </p>
            </div>
          </div>
        </section>

        {/* 9. Frequently asked questions (#faq) */}
        <section id="faq" className="mb-20 sm:mb-28 scroll-mt-24">
          <div className="mb-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-100 border border-line text-xs font-mono text-zinc-600 mb-3">
              <span>Section 09</span>
              <span className="text-zinc-400">·</span>
              <span>FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-3">
              Frequently asked questions
            </h2>
            <p className="text-base text-zinc-600 font-sans">
              Answers to technical and logistical questions about our immersive 3D, VR and AR experiences.
            </p>
          </div>

          <FaqList items={FAQS.map((faq) => ({ question: faq.q, answer: faq.a }))} />
        </section>

        {/* 10. Call to action Band */}
        <section className="rounded-2xl border border-zinc-900 bg-zinc-950 text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              <span>Let's collaborate</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mb-5 tracking-tight text-balance">
              Ready to let people step inside your place?
            </h2>
            
            <p className="text-sm sm:text-base text-zinc-300 font-sans leading-relaxed mb-8 max-w-2xl">
              Tell us about your site. We will walk you through live examples, suggest the best format, and provide a clear, no-obligation proposal with fixed scope and timeline.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/contact/')}
                className={buttonClass('primary', 'md')}
              >
                <span>Plan your experience</span>
                <span className="ml-2 font-mono" aria-hidden="true">→</span>
              </button>

              <a
                href={SITE_METADATA.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <span>Chat on WhatsApp</span>
                <span className="text-emerald-400 font-mono">↗</span>
              </a>

              <button
                type="button"
                onClick={() => onNavigate('/work/')}
                className="px-4 py-3.5 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
              >
                Explore all client work →
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
