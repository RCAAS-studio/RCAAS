import React, { useState } from 'react';
import { IMG } from '../data/images';
import { motion } from 'framer-motion';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import { SplatEmbed } from '../components/SplatEmbed';
import { SpotlightCard } from '../components/SpotlightCard';
import { InteractiveTourFeaturesDemo } from '../components/InteractiveTourFeaturesDemo';
import { FaqList } from '../components/GuideParts';
import { buttonClass, eyebrowClass } from '../components/ui';

interface VirtualToursPageProps {
  onNavigate: (path: RoutePath) => void;
  onOpenPlanner: () => void;
}

interface DeliverableItem {
  id: string;
  number: string;
  title: string;
  tag: string;
  description: string;
  features: string[];
}

const DELIVERABLES: DeliverableItem[] = [
  {
    id: 'hosted-tour',
    number: '01',
    title: 'Hosted 3D tour & shareable link',
    tag: 'Cloud Infrastructure',
    description:
      'A dedicated, high-speed hosted URL running on global edge delivery networks. Streamlined to open instantly on mobile data across Nepal and internationally with zero app installations.',
    features: ['Custom branded subdomains available', 'SSL secure delivery & edge CDN caching', 'Under 2-second initial loading on mobile 4G'],
  },
  {
    id: 'embed-code',
    number: '02',
    title: 'Responsive website embed code',
    tag: 'Web Ready',
    description:
      'Clean, lightweight iframe code ready to copy-paste into WordPress, Webflow, Squarespace, Wix or custom React/HTML codebases. Scales fluidly across mobile, tablet and widescreen monitors.',
    features: ['One line of clean HTML code', 'Automatic portrait & landscape handling', 'Full-screen button with deep-link support'],
  },
  {
    id: 'hotspots',
    number: '03',
    title: 'Interactive information hotspots',
    tag: 'Sales & Story',
    description:
      'Spatial markers placed directly at key architectural points. Visitors click to open room specifications, high-res photos, audio commentaries, video walkthroughs, and direct booking links.',
    features: ['Custom icon styles & color themes', 'Rich markdown text and multi-image galleries', 'Direct WhatsApp & reservation button triggers'],
  },
  {
    id: 'dollhouse-radar',
    number: '04',
    title: 'Dollhouse view & floor plan radar',
    tag: 'Spatial Orientation',
    description:
      'An intuitive 3D dollhouse overview paired with architectural floor plans and live viewing angles, giving prospective visitors complete understanding of building connectivity.',
    features: ['Instant toggle between interior and cutaway view', 'Multi-floor level selector for multi-storey buildings', 'Synchronised mini-map orientation radar'],
  },
  {
    id: 'measurement-tool',
    number: '05',
    title: 'Interactive measurement tool',
    tag: 'Accurate Scale',
    description:
      'Millimetre-calibrated measurement utility permitting visitors, event planners, and interior architects to verify clearances, doorway heights, and table setups directly inside the browser.',
    features: ['True point-to-point laser measurement', 'Metric and imperial unit display', 'Crucial for conference venues & wedding halls'],
  },
  {
    id: 'qr-assets',
    number: '06',
    title: 'Print-ready QR marketing package',
    tag: 'Offline to Online',
    description:
      'High-resolution vector QR code packages linked directly to your tour, ready for reception counter signs, room brochures, exhibition stand banners, and roadside billboards.',
    features: ['Vector SVG & 300 DPI print-ready formats', 'Trackable scan metrics and campaign attribution', 'Co-branded with your organisation logo'],
  },
  {
    id: 'kiosk-mode',
    number: '07',
    title: 'Offline & exhibition kiosk mode',
    tag: 'Optional Add-on',
    description:
      'Pre-packaged local runtime for large touchscreens, admissions open day booths, and heritage visitor centres operating in locations with intermittent internet access.',
    features: ['Zero internet reliance for smooth exhibition uptime', 'Auto-resetting sleep timer between visitors', 'Touchscreen-optimised gesture navigation'],
  },
];

interface SectorUseCase {
  id: string;
  name: string;
  tag: string;
  headline: string;
  challenge: string;
  solution: string;
  outcome: string;
  sampleClient?: string;
  casePath?: RoutePath;
  image: string;
}

const SECTOR_USE_CASES: SectorUseCase[] = [
  {
    id: 'hospitality',
    name: 'Hotels & Resorts',
    tag: 'Direct Bookings',
    headline: 'Let prospective guests walk through your rooms, dining pavilions and courtyards before they arrive.',
    challenge: 'Travellers and event planners hesitate when online photos look staged or wide-angle lenses distort actual room proportions.',
    solution: 'A photorealistic 3D tour that opens right on your booking page, letting guests inspect deluxe suites, bathrooms, banquet lawns, and quiet reading terraces at real scale.',
    outcome: 'Greater booking confidence, lower cancellation rates, and significantly higher direct bookings through your own website instead of third-party OTAs.',
    sampleClient: 'Basera Boutique Hotel, Babarmahal, Kathmandu',
    casePath: '/work/basera-boutique-hotel-3d-experience/',
    image: IMG['virtual-tours/hotels-resorts'],
  },
  {
    id: 'education',
    name: 'Schools & Colleges',
    tag: 'Admissions & Campus Tour',
    headline: 'Help parents and students explore your classrooms, sports grounds and labs from anywhere in the world.',
    challenge: 'Families living in regional districts across Nepal or parents working abroad find it difficult to travel to Kathmandu for weekday campus open days.',
    solution: 'An interactive virtual campus tour that guides families through STEM laboratories, the central library, sports grounds, cafeteria, and residential hostels.',
    outcome: 'Reassures parents during admissions cycles, expands applicant recruitment across all provinces and diaspora families, and drives higher enrolment conversion.',
    sampleClient: 'Nepathya College, Tilottama',
    casePath: '/work/nepathya-school-college-3d-campus-tour/',
    image: IMG['virtual-tours/schools-colleges'],
  },
  {
    id: 'real-estate',
    name: 'Commercial & Residential Property',
    tag: 'Property Sales & Leasing',
    headline: 'Pre-qualify buyers and lease commercial units faster with 24/7 self-guided 3D walkthroughs.',
    challenge: 'Scheduling repetitive on-site showings consumes weeks of sales team bandwidth and slows down overseas diaspora buyers.',
    solution: 'Immersive 3D walkthroughs of show apartments, penthouse suites, and commercial corporate floors accessible from a simple link sent via WhatsApp or email.',
    outcome: 'Enables remote buyers to inspect room orientations and sightlines, filter out non-serious inquiries, and close lease agreements with complete confidence.',
    sampleClient: 'Contemporary Residential Showroom & Apartments',
    image: IMG['virtual-tours/commercial-residential-property'],
  },
  {
    id: 'heritage',
    name: 'Cultural Heritage & Museums',
    tag: 'Preservation & Public Access',
    headline: 'Document sacred architecture in millimetre detail while welcoming global pilgrims and researchers.',
    challenge: 'Historic monuments face environmental wear and seismic risks, while international devotees and scholars cannot regularly travel to physical sites.',
    solution: 'High-density 3D digital documentation capturing authentic textures, wood carvings, and inscriptions, enriched with scholarly hotspots and audio chants.',
    outcome: 'Creates a permanent, archival-grade digital twin for restoration architects while allowing the global public to step inside cultural landmarks online.',
    sampleClient: 'Chilancho Stupa (16th Century Buddhist Complex, Kirtipur)',
    casePath: '/work/chilancho-stupa-digital-heritage/',
    image: IMG['virtual-tours/cultural-heritage-museums'],
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'How is a 3D virtual tour different from a 360° photo tour?',
    answer:
      'A 360° photo tour consists of static spherical images; you jump between predetermined dots and rotate in place like a swivel chair. A 3D virtual tour is an actual continuous three-dimensional reconstruction built using laser scanning and radiance fields (Gaussian splatting). Visitors move freely in any direction with six degrees of freedom (6DoF), perceiving genuine spatial volume, natural lighting, and true ceiling heights.',
  },
  {
    question: 'How fast does the tour load on mobile connections in Nepal?',
    answer:
      'We engineer progressive spatial streaming. The base geometry and immediate room viewpoints load in under two seconds on standard 4G mobile networks across Kathmandu, Pokhara, and regional districts. Widescreen textures and fine details stream smoothly in the background as the visitor navigates.',
  },
  {
    question: 'Do visitors need to download an application or plugin?',
    answer:
      'No. All our tours run natively in modern web browsers (Safari, Chrome, Firefox, Edge) across iOS, Android, macOS, and Windows. There are no app store downloads, logins, or plugins required.',
  },
  {
    question: 'Can we embed the 3D tour on our existing website?',
    answer:
      'Yes. We provide a single-line iframe snippet that drops directly into WordPress, Webflow, Squarespace, Wix, Shopify, or custom HTML code. It is responsive and automatically adapts to smartphone and desktop screen ratios.',
  },
  {
    question: 'Can we update hotspots and booking links after launch?',
    answer:
      'Yes. Hotspot text descriptions, images, room rates, phone numbers, and reservation links can be updated at any time in our management portal without re-scanning your property.',
  },
  {
    question: 'How much preparation does our space require before capture?',
    answer:
      'Treat capture day like a high-end photography shoot: ensure lights are switched on, surfaces are neat and free of clutter, and walkways are clear. We supply a simple preparation checklist in advance and scan during your quietest operational hours to ensure zero disruption.',
  },
  {
    question: 'Can we also create VR headsets or video fly-throughs from the same capture?',
    answer:
      'Yes! One capture powers multiple outputs. From the same on-site visit, we can produce VR headset walkthroughs for events, cinematic fly-through films for social media reels, and measured CAD/BIM floor plans for renovation.',
  },
];

export const VirtualToursPage: React.FC<VirtualToursPageProps> = ({ onNavigate, onOpenPlanner }) => {
  const [activeSector, setActiveSector] = useState<string>('hospitality');
  const [selectedScene, setSelectedScene] = useState<'basera' | 'chilancho'>('basera');

  const selectedSectorData = SECTOR_USE_CASES.find((s) => s.id === activeSector) || SECTOR_USE_CASES[0];

  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="py-14 sm:py-20 md:py-24 bg-white text-ink relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* 1. BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-10 overflow-x-auto whitespace-nowrap pb-1">
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
          <button
            type="button"
            onClick={() => onNavigate('/services/immersive-experiences/')}
            className="hover:text-zinc-900 transition-colors"
          >
            Immersive Experiences
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <span className="text-accent font-semibold" aria-current="page">
            3D Virtual Tours
          </span>
        </nav>

        {/* 1. HERO + ANSWER SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20 sm:mb-24">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-6 shadow-xs"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-semibold text-zinc-900">3D Virtual Tours</span>
              <span className="text-zinc-400">·</span>
              <span>Capability</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display text-balance mb-6 leading-[1.12]"
            >
              3D virtual tours that let people <span className="text-accent">explore before they visit.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mb-8"
            >
              A 3D virtual tour is a photorealistic, explorable model of a real place that opens from a link. Unlike a 360° photo tour, where you jump between fixed points, visitors move freely through the space and see it from any angle. RCAAS Technology creates 3D virtual tours across Nepal for hotels, schools, colleges, property developers and heritage sites.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8"
            >
              <button
                type="button"
                onClick={() => onNavigate('/contact/')}
                className={buttonClass('primary', 'md')}
              >
                <span>Plan your 3D tour</span>
                <span className="ml-2 font-mono" aria-hidden="true">→</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToAnchor('live-tour')}
                className={buttonClass('secondary', 'md')}
              >
                <svg className="w-4 h-4 text-accent mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Try a live tour</span>
              </button>
            </motion.div>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-line text-xs font-mono text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Zero app install</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span>Photorealistic 6DoF movement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>Fast 4G streaming in Nepal</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-line bg-surface p-3 shadow-lg group">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-zinc-900">
                <img loading="lazy" decoding="async"
                  src={IMG['virtual-tours/3d-virtual-tour-interface-walkthrough-on-modern']}
                  alt="3D virtual tour interface walkthrough on modern screen"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4 bg-white/90 border border-line px-3 py-1 rounded-md text-xs font-mono text-zinc-900 flex items-center gap-2 shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                  <span>Real-Scale 3D Walkthrough</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-white/95 border border-line p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 font-display">Continuous Free Exploration</p>
                    <p className="text-[11px] text-zinc-500 font-mono">Mobile, tablet & desktop ready</p>
                  </div>
                  <button
                    onClick={() => scrollToAnchor('live-tour')}
                    className="px-3 py-1.5 bg-accent hover:bg-accent-strong text-white rounded-md text-xs font-medium transition-colors"
                  >
                    Launch Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. KEY FACTS GRID */}
        <section className="mb-20 sm:mb-24">
          <div className="mb-8">
            <span className={eyebrowClass}>At a Glance</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1">Key delivery facts</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-6 rounded-xl border border-line bg-surface hover:border-zinc-300 transition-colors">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">What you get</span>
              <h3 className="text-base font-bold text-zinc-900 font-display mt-1 mb-2">Hosted 3D tour & shareable link</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                A dedicated, photorealistic 3D tour hosted on fast edge cloud servers, accessible via a custom link and embeddable on any website.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-line bg-surface hover:border-zinc-300 transition-colors">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Works on</span>
              <h3 className="text-base font-bold text-zinc-900 font-display mt-1 mb-2">Any modern web browser</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Phones, tablets, laptops, and desktop computers (Safari, Chrome, Firefox, Edge). Nothing to install.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-line bg-surface hover:border-zinc-300 transition-colors">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Time on site</span>
              <h3 className="text-base font-bold text-zinc-900 font-display mt-1 mb-2">A few hours to one day</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Rapid LiDAR and drone photogrammetry scanning with zero business interruption during your preferred hours.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-line bg-surface hover:border-zinc-300 transition-colors">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Ready in</span>
              <h3 className="text-base font-bold text-zinc-900 font-display mt-1 mb-2">3 to 7 working days</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Typical turnaround from on-site scanning to 3D reconstruction, hotspot integration, and live client publishing.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-line bg-surface hover:border-zinc-300 transition-colors">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Pricing basis</span>
              <h3 className="text-base font-bold text-zinc-900 font-display mt-1 mb-2">Project-based transparent quotes</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Quoted based on total space area, architectural complexity, and whether aerial drone capture is required.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-line bg-surface hover:border-zinc-300 transition-colors">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Where</span>
              <h3 className="text-base font-bold text-zinc-900 font-display mt-1 mb-2">Across Nepal & abroad</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Active deployments in Kathmandu Valley, Pokhara, Chitwan, Lumbini, and remote cultural heritage sites.
              </p>
            </div>
          </div>
        </section>

        {/* 3. LIVE TOUR SHOWCASE SECTION (#live-tour) */}
        <section id="live-tour" className="mb-20 sm:mb-28 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-3 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span>Live tour · #live-tour</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display">
                Move through it yourself
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base mt-2 max-w-2xl">
                Drag to look around, move forward, step back and see the space from any angle.
              </p>
            </div>

            {/* Scene Selector Switcher */}
            <div className="flex items-center gap-2 p-1 rounded-lg border border-line bg-surface self-start md:self-auto">
              <button
                type="button"
                onClick={() => setSelectedScene('basera')}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                  selectedScene === 'basera'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Basera Boutique Hotel
              </button>
              <button
                type="button"
                onClick={() => setSelectedScene('chilancho')}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                  selectedScene === 'chilancho'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Chilancho Stupa
              </button>
            </div>
          </div>

          {/* Interactive SplatEmbed Viewer */}
          <div className="rounded-2xl overflow-hidden border border-line bg-ink shadow-xl">
            <SplatEmbed key={selectedScene} initialDemo={selectedScene} />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-600 bg-surface border border-line p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Full continuous 6DoF walkthrough · Real spatial capture from Nepal</span>
            </div>
            <div>
              <button
                type="button"
                onClick={onOpenPlanner}
                className="text-accent font-semibold hover:underline"
              >
                Calculate quote for your site →
              </button>
            </div>
          </div>
        </section>

        {/* 4. WHY A 3D TOUR (COMPARISON TABLE) */}
        <section className="mb-20 sm:mb-28">
          <div className="max-w-3xl mb-10">
            <span className={eyebrowClass}>The Spatial Advantage</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1">
              More than photos, more than 360°
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base mt-3 leading-relaxed">
              Photos show what a photographer chose. 360° tours let people look around, but only from fixed spots. A 3D tour gives them the whole place, at real scale, to explore in their own way. That’s how people get a true feel for a room, a campus or a courtyard before they decide to visit.
            </p>
          </div>

          {/* Comparison Matrix Table */}
          <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="p-4 sm:p-5 font-semibold text-zinc-500 w-1/4">Comparison</th>
                  <th className="p-4 sm:p-5 font-semibold text-zinc-700 w-1/4">Photos & video</th>
                  <th className="p-4 sm:p-5 font-semibold text-zinc-700 w-1/4">360° photo tour</th>
                  <th className="p-4 sm:p-5 font-bold text-accent bg-accent-tint w-1/4 border-l border-accent-line">
                    3D virtual tour (RCAAS)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-zinc-700">
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-zinc-900">How people explore</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Watch what you show them</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Look around from fixed points</td>
                  <td className="p-4 sm:p-5 font-bold text-zinc-900 bg-accent-tint/60 border-l border-accent-line">
                    Move freely through the space
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-zinc-900">Sense of size and layout</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Limited (distorted by lenses)</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Partial (fish-eye sphere bubbles)</td>
                  <td className="p-4 sm:p-5 font-bold text-accent-strong bg-accent-tint/60 border-l border-accent-line">
                    Close to being there
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-zinc-900">Best at</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Mood, emotion, social media</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Quick, low-cost overviews</td>
                  <td className="p-4 sm:p-5 font-bold text-zinc-900 bg-accent-tint/60 border-l border-accent-line">
                    Helping people decide with confidence
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-zinc-900">Freedom of movement</td>
                  <td className="p-4 sm:p-5 text-zinc-500">None (static sequence)</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Click to jump fixed nodes</td>
                  <td className="p-4 sm:p-5 font-bold text-zinc-900 bg-accent-tint/60 border-l border-accent-line">
                    Continuous 6DoF walkthrough
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-zinc-900">Measurement capability</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Not possible</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Inaccurate or unavailable</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-accent-tint/60 border-l border-accent-line">
                    Accurate laser scale verification
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-zinc-900">Secondary uses</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Photo gallery & video reels</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Virtual tour only</td>
                  <td className="p-4 sm:p-5 font-bold text-zinc-900 bg-accent-tint/60 border-l border-accent-line">
                    VR headsets, fly-through films & CAD data
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-line bg-surface">
            <p className="text-xs sm:text-sm text-zinc-600">
              <span className="font-semibold text-zinc-900">Note:</span> The best results often combine them. From one capture we can also produce fly-through films and social clips. See{' '}
              <button
                type="button"
                onClick={() => onNavigate('/services/visual-storytelling/')}
                className="text-accent font-semibold hover:underline"
              >
                Visual Storytelling
              </button>
              .
            </p>

            <div className="flex items-center gap-4 text-xs font-mono">
              <button
                type="button"
                onClick={() => onNavigate('/learn/3d-virtual-tour-vs-360-tour-vs-video/')}
                className="text-zinc-700 hover:text-accent transition-colors flex items-center gap-1.5"
              >
                <span>Read the full comparison</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </section>

        {/* 5. INTERACTIVE FEATURES SIMULATION COMPONENT */}
        <section className="mb-20 sm:mb-28">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-3 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span>Interactive Features Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display">
              Try the built-in tour features
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base mt-2">
              Test how interactive hotspots, in-scene measurements, radar mini-maps, and direct booking actions feel for prospective visitors.
            </p>
          </div>

          {/* Interactive Feature Demo */}
          <InteractiveTourFeaturesDemo />
        </section>

        {/* 6. WHAT YOU RECEIVE */}
        <section className="mb-20 sm:mb-28">
          <div className="max-w-2xl mb-10">
            <span className={eyebrowClass}>Deliverables</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1">
              What you receive
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base mt-2">
              Everything you need to publish, share and track your 3D virtual tour is included in one complete package.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DELIVERABLES.map((item) => (
              <SpotlightCard
                key={item.id}
                className="p-6 rounded-xl border border-line bg-white hover:border-zinc-300 transition-colors shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-accent font-bold px-2 py-0.5 rounded bg-accent-tint border border-accent-line">
                      {item.number}
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 font-display mb-2">{item.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed mb-6">{item.description}</p>
                </div>

                <div className="pt-4 border-t border-line space-y-2">
                  {item.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-600">
                      <svg className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* 7. WHO IT HELPS (#use-cases) */}
        <section id="use-cases" className="mb-20 sm:mb-28 scroll-mt-20">
          <div className="max-w-3xl mb-10">
            <span className={eyebrowClass}>Sectors</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1">
              Built for spaces where people need to see before they commit
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base mt-2">
              From hotel suites and college laboratories to heritage temples and real estate sales galleries.
            </p>
          </div>

          {/* Sector Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {SECTOR_USE_CASES.map((sector) => (
              <button
                key={sector.id}
                type="button"
                onClick={() => setActiveSector(sector.id)}
                className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeSector === sector.id
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-surface text-zinc-700 hover:bg-zinc-100 border border-line'
                }`}
              >
                {sector.name}
              </button>
            ))}
          </div>

          {/* Active Sector Card */}
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-line text-accent text-xs font-mono font-semibold mb-4">
                  <span>{selectedSectorData.tag}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 font-display mb-4 leading-snug">
                  {selectedSectorData.headline}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="p-3.5 rounded-lg bg-white border border-line">
                    <p className="text-xs font-semibold text-rose-700 mb-1">The Challenge:</p>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{selectedSectorData.challenge}</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-white border border-line">
                    <p className="text-xs font-semibold text-indigo-700 mb-1">Our 3D Solution:</p>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{selectedSectorData.solution}</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-white border border-line">
                    <p className="text-xs font-semibold text-emerald-700 mb-1">Concrete Outcome:</p>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{selectedSectorData.outcome}</p>
                  </div>
                </div>

                {selectedSectorData.sampleClient && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-line">
                    <div className="text-xs font-mono text-zinc-600">
                      <span className="text-zinc-900 font-semibold">Real client:</span> {selectedSectorData.sampleClient}
                    </div>

                    {selectedSectorData.casePath && (
                      <button
                        type="button"
                        onClick={() => onNavigate(selectedSectorData.casePath!)}
                        className="text-xs font-semibold text-accent hover:text-accent-strong flex items-center gap-1 transition-colors self-start sm:self-auto font-mono"
                      >
                        <span>View case study</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sector image */}
              <div className="lg:col-span-5">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-line group shadow-xs">
                  <img loading="lazy" decoding="async"
                    src={selectedSectorData.image}
                    alt={selectedSectorData.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-xs font-medium text-white bg-black/75 p-2.5 rounded-lg border border-white/10 font-mono">
                    {selectedSectorData.sampleClient || selectedSectorData.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. HOW WE MAKE IT (#process) */}
        <section id="process" className="mb-20 sm:mb-28 scroll-mt-20">
          <div className="max-w-3xl mb-12">
            <span className={eyebrowClass}>Workflow</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1">
              From site visit to live tour in four straightforward steps
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base mt-2">
              We handle everything from precision scanning to final hosting. You do not need technical expertise or special equipment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-line bg-white shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-accent-tint border border-accent-line flex items-center justify-center text-accent font-bold text-sm mb-4 font-mono">
                  01
                </div>
                <h3 className="text-base font-bold text-zinc-900 font-display mb-2">Preparation & briefing</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  We discuss your commercial goals, identify the hero spaces and views to highlight, and schedule the scan during your quietest operational hours.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-line text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span>Pre-capture checklist</span>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-line bg-white shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-accent-tint border border-accent-line flex items-center justify-center text-accent font-bold text-sm mb-4 font-mono">
                  02
                </div>
                <h3 className="text-base font-bold text-zinc-900 font-display mb-2">On-site reality capture</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Our engineers capture the premises with handheld mobile SLAM LiDAR and drone aerial photography. Takes between 2 hours and 1 day with zero guest disruption.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-line text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Zero guest interruption</span>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-line bg-white shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-accent-tint border border-accent-line flex items-center justify-center text-accent font-bold text-sm mb-4 font-mono">
                  03
                </div>
                <h3 className="text-base font-bold text-zinc-900 font-display mb-2">3D reconstruction & enrich</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  We reconstruct the continuous space into photorealistic 3D using Gaussian splatting, calibrate lighting, configure interactive hotspots, floor plans and links.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-line text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span>Private preview review</span>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-line bg-white shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-accent-tint border border-accent-line flex items-center justify-center text-accent font-bold text-sm mb-4 font-mono">
                  04
                </div>
                <h3 className="text-base font-bold text-zinc-900 font-display mb-2">Delivery, embed & launch</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  You receive your final hosted link, responsive iframe snippet, QR code assets, and our technical team assists your web team in going live.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-line text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>Integration guidance</span>
              </div>
            </div>
          </div>
        </section>

        {/* 9. FREQUENTLY ASKED QUESTIONS (#faq) */}
        <section id="faq" className="mb-20 sm:mb-28 scroll-mt-20">
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <span className={eyebrowClass}>Answers</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1">
              Frequently asked questions
            </h2>
            <p className="text-zinc-600 text-sm mt-2">
              Common questions from hotel owners, school directors, and property marketers.
            </p>
          </div>

          <FaqList items={FAQS} />
        </section>

        {/* 10. RELATED CAPABILITIES & COMBINATIONS */}
        <section className="mb-20 sm:mb-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className={eyebrowClass}>One Capture, Multiple Media</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1">
                Combine with related capabilities
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
              From the exact same reality capture visit, we can produce multiple tailored deliverables without extra on-site fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-line bg-surface hover:border-zinc-300 transition-colors flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-accent font-semibold uppercase">Media & Reach</span>
                <h3 className="text-base font-bold text-zinc-900 font-display mt-1 mb-2">Visual Storytelling</h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-6">
                  Turn your 3D capture into cinematic fly-through films, social media reels, and guided narrative walkthroughs with voiceover.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/services/visual-storytelling/')}
                className="text-xs font-semibold text-accent hover:text-accent-strong flex items-center gap-1 transition-colors self-start font-mono"
              >
                <span>Explore Visual Storytelling</span>
                <span>→</span>
              </button>
            </div>

            <div className="p-6 rounded-xl border border-line bg-surface hover:border-zinc-300 transition-colors flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-accent font-semibold uppercase">Presence & Events</span>
                <h3 className="text-base font-bold text-zinc-900 font-display mt-1 mb-2">VR Headset Experiences</h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-6">
                  Put visitors inside your space using VR headsets at international trade fairs, education expos, and hotel sales suites.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/services/immersive-experiences/')}
                className="text-xs font-semibold text-accent hover:text-accent-strong flex items-center gap-1 transition-colors self-start font-mono"
              >
                <span>Explore VR Experiences</span>
                <span>→</span>
              </button>
            </div>

            <div className="p-6 rounded-xl border border-line bg-surface hover:border-zinc-300 transition-colors flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-accent font-semibold uppercase">Survey & Engineering</span>
                <h3 className="text-base font-bold text-zinc-900 font-display mt-1 mb-2">Digital Twins & Survey</h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-6">
                  Extract measured CAD drawings, BIM models, and point clouds for renovation, architecture, and structural heritage conservation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/services/digital-twins/')}
                className="text-xs font-semibold text-accent hover:text-accent-strong flex items-center gap-1 transition-colors self-start font-mono"
              >
                <span>Explore Digital Twins</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </section>

        {/* 11. CALL TO ACTION BAND */}
        <section className="rounded-2xl border border-line bg-surface p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-white text-xs font-mono text-zinc-700 mb-6 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span>Let People Step Inside</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-4">
              Ready to let people explore your place?
            </h2>

            <p className="text-sm sm:text-base text-zinc-600 mb-8 leading-relaxed">
              Tell us about your property in Nepal. We will demonstrate relevant live tours from your industry, advise on the best approach, and provide a clear quote.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/contact/')}
                className={buttonClass('primary', 'lg', 'w-full sm:w-auto')}
              >
                <span>Plan your 3D tour</span>
                <span className="ml-2 font-mono" aria-hidden="true">→</span>
              </button>

              <a
                href={`https://wa.me/${SITE_METADATA.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass('secondary', 'lg', 'w-full sm:w-auto')}
              >
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <p className="text-xs font-mono text-zinc-500 mt-6">
              Typical response within 2 hours during Nepal working hours · No obligation consultation
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
