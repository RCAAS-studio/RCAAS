import React, { useState } from 'react';
import { IMG } from '../data/images';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  Clapperboard,
  Crosshair,
  Drone,
  Gamepad2,
  HardDrive,
  KeyRound,
  Landmark,
  Layers,
  type LucideIcon,
  MessageCircleQuestion,
  Rocket,
  RefreshCw,
  ScanLine,
  Search,
  Satellite,
  Share2,
  ShieldCheck,
  Users,
  Scale,
} from 'lucide-react';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import { Placeholder } from '../components/Placeholder';
import { SpotlightCard } from '../components/SpotlightCard';
import { buttonClass, eyebrowClass } from '../components/ui';

interface HowWeWorkPageProps {
  onNavigate: (path: RoutePath) => void;
  onOpenPlanner: () => void;
}

interface ProcessStep {
  number: string;
  title: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
  whatHappens: React.ReactNode;
  youProvide?: React.ReactNode;
  youReceive: React.ReactNode;
}

const PROCESS: ProcessStep[] = [
  {
    number: '01',
    title: 'Discover',
    icon: Search,
    image: IMG['how-we-work/discover'],
    imageAlt: 'Photorealistic 3D view of a hotel, the kind of place a project starts from',
    whatHappens:
      "We start with your goal, not the technology. Who is your audience? What should they feel, notice and do? Where will they see the experience? We agree the area, the level of detail, the deliverables, the timeline and, if you'll need measurements, the accuracy.",
    youProvide:
      'The site location, access arrangements, any existing drawings, and how you plan to use the results.',
    youReceive: 'A clear proposal with scope, timeline and price.',
  },
  {
    number: '02',
    title: 'Capture',
    icon: ScanLine,
    image: IMG['how-we-work/capture'],
    imageAlt: 'Team member walking through a heritage square with a handheld laser scanner',
    whatHappens:
      'Our team visits the site and uses the right method for each part of it: handheld laser scanning for interiors and detail, aerial capture for roofs and large areas, and photography for photorealistic 3D. Where accuracy matters, we tie everything to ground control. We capture overlapping data so gaps can be filled without coming back.',
    youProvide:
      'Access, and someone to guide us and open doors. For heritage sites, we help you prepare the permissions needed.',
    youReceive: 'Usually a visit of a few hours to a day, with minimal disruption.',
  },
  {
    number: '03',
    title: 'Create',
    icon: Layers,
    image: IMG['how-we-work/create'],
    imageAlt: 'Point cloud of a scanned building being processed in the studio',
    whatHappens:
      'Back in the studio, engineers process and align the data and check it against control. Game developers turn the capture into the experience: a 3D tour, a VR scene, an interactive app or the raw material for a film. Together we shape the story: the path people take and the moments that matter.',
    youReceive: (
      <>
        A preview to review <Placeholder>[[TBC: number of revision rounds]]</Placeholder>.
      </>
    ),
  },
  {
    number: '04',
    title: 'Launch',
    icon: Rocket,
    image: IMG['how-we-work/launch'],
    imageAlt: 'A published 3D virtual tour open on a screen',
    whatHappens:
      'We publish the experience and deliver your files. We help you place it where your audience is: your website, social media, booking or admissions pages, events and QR codes.',
    youReceive: 'Your live experience, your files, and guidance on using them.',
  },
  {
    number: '05',
    title: 'Measure and evolve',
    icon: RefreshCw,
    image: IMG['how-we-work/measure-and-evolve'],
    imageAlt: 'A heritage courtyard during restoration, and the same courtyard being rescanned',
    whatHappens: (
      <>
        <Placeholder>[[TBC: "We review how people engage with the experience and suggest improvements."]]</Placeholder>{' '}
        When your place changes, after a renovation or a new building, we can capture the changes and update your
        experience.
      </>
    ),
    youReceive: (
      <>
        <Placeholder>[[TBC: engagement summary]]</Placeholder> and ongoing support.
      </>
    ),
  },
];

const ENGINEERS: React.ReactNode[] = [
  'Plan the capture and ground control',
  'Make sure the data is accurate and complete',
  'Process, align and check every dataset',
  'Deliver measured data for design and preservation',
];

const GAME_DEVELOPERS: React.ReactNode[] = [
  'Design how people move through the experience',
  'Build interaction, hotspots and guided paths',
  'Optimise experiences to run smoothly on phones, browsers and headsets',
  <>
    Create VR, AR and interactive experiences <Placeholder>[[TBC: per confirmed scope]]</Placeholder>
  </>,
];

const DISCIPLINES = [
  {
    heading: 'Our engineers',
    tag: 'Engineering precision',
    icon: Crosshair,
    image: IMG['how-we-work/our-engineers'],
    imageAlt: 'Engineer setting up a survey drone and GNSS receiver on a hillside',
    items: ENGINEERS,
  },
  {
    heading: 'Our game developers',
    tag: 'Game-development craft',
    icon: Gamepad2,
    image: IMG['how-we-work/our-game-developers'],
    imageAlt: 'Visitor in a VR headset exploring a 3D courtyard shown on a large screen',
    items: GAME_DEVELOPERS,
  },
];

interface ToolkitRow {
  category: string;
  icon: LucideIcon;
  whatItDoes: string;
  examples: React.ReactNode;
}

// Build note: remove rows or examples not confirmed (Register E02, E04, E05, E07, S05).
const TOOLKIT_ROWS: ToolkitRow[] = [
  {
    category: 'Handheld laser scanning',
    icon: ScanLine,
    whatItDoes: 'Captures interiors and complex structures quickly and accurately, at walking pace',
    examples: (
      <>
        XGRIDS Lixel Kitty K1 <Placeholder>[[TBI: key specs]]</Placeholder>
      </>
    ),
  },
  {
    category: 'Aerial capture',
    icon: Drone,
    whatItDoes: 'Roofs, courtyards, landscapes and whole sites, with distortion-free images',
    examples: 'DJI Mavic 3E survey drone',
  },
  {
    category: 'Survey positioning',
    icon: Satellite,
    whatItDoes: 'Places your data in real-world coordinates so it matches maps and drawings',
    examples: (
      <>
        Survey-grade GNSS and ground control <Placeholder>[[TBI: equipment]]</Placeholder>
      </>
    ),
  },
  {
    category: '3D reconstruction',
    icon: Box,
    whatItDoes: 'Turns captures into photorealistic 3D scenes and measured point clouds',
    examples: 'LCC Studio, CyberColor',
  },
  {
    category: 'Real-time and game engines',
    icon: Gamepad2,
    whatItDoes: 'Interactive, gamified and VR experiences',
    examples: <Placeholder>[[TBC: Unreal Engine, Unity]]</Placeholder>,
  },
  {
    category: 'Film and content production',
    icon: Clapperboard,
    whatItDoes: 'Fly-throughs, renders and social cuts',
    examples: <Placeholder>[[TBC: tools]]</Placeholder>,
  },
  {
    category: 'Delivery',
    icon: Share2,
    whatItDoes: 'Where your audience experiences it',
    examples: (
      <>
        RCAAS 3D platform · VR headsets <Placeholder>[[TBI: models]]</Placeholder> ·{' '}
        <Placeholder>[[TBC: AR]]</Placeholder>
      </>
    ),
  },
];

interface AccuracyRow {
  method: string;
  typicalAccuracy: string | null;
  conditions: string | null;
}

// S03: the table stays hidden until every value is confirmed.
const ACCURACY_ROWS: AccuracyRow[] = [
  { method: 'Handheld laser scanning', typicalAccuracy: null, conditions: null },
  { method: 'Drone mapping with ground control', typicalAccuracy: null, conditions: null },
  { method: 'GNSS control points', typicalAccuracy: null, conditions: null },
];

const accuracyConfirmed = ACCURACY_ROWS.every((row) => row.typicalAccuracy && row.conditions);

// Restates the accuracy paragraph as three checkpoints; no new claims.
const ACCURACY_CHECKPOINTS = [
  { label: 'Agreed', line: 'during planning' },
  { label: 'Honest', line: 'about what can be achieved' },
  { label: 'Checked', line: 'before delivery' },
];

const PROMISES: { title: string; icon: LucideIcon; meaning: React.ReactNode }[] = [
  {
    title: 'Checked before delivery',
    icon: ShieldCheck,
    meaning: 'Every dataset is checked for errors, gaps and drift before it leaves our hands.',
  },
  { title: 'Stored safely', icon: HardDrive, meaning: 'Your data is backed up in more than one place.' },
  {
    title: 'Honest about limits',
    icon: Scale,
    meaning: 'We tell you what the data and the experience can and cannot be used for.',
  },
  {
    title: 'Respect for people',
    icon: Users,
    meaning: (
      <Placeholder>
        [[TBI: people and faces policy, e.g. "We capture when spaces are quiet and remove or blur people before
        publishing."]]
      </Placeholder>
    ),
  },
  {
    title: 'Respect for places',
    icon: Landmark,
    meaning:
      "Capture is contactless. On sacred and protected sites, we follow each site's rules and work with the people who care for it.",
  },
  {
    title: 'Clear ownership',
    icon: KeyRound,
    meaning: (
      <Placeholder>
        [[TBI: ownership terms, e.g. "You own the deliverables you paid for. We ask permission before showing your
        project in our portfolio."]]
      </Placeholder>
    ),
  },
];

const EXPLAINERS: {
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  linkLabel: string;
  linkPath: RoutePath;
}[] = [
  {
    title: 'Gaussian splatting',
    body: 'Traditional 3D models are built from surfaces and often look flat or artificial. Gaussian splatting builds a scene from millions of tiny, soft points of colour and light, so the result looks like a photograph you can walk around in. We pair it with laser measurements, so it is not only beautiful but true to size.',
    image: IMG['how-we-work/gaussian-splatting'],
    imageAlt: 'Photorealistic 3D scene of Chilancho Stupa',
    linkLabel: 'What is Gaussian splatting?',
    linkPath: '/learn/what-is-gaussian-splatting/',
  },
  {
    title: 'SLAM laser scanning',
    body: 'SLAM stands for simultaneous localisation and mapping. The scanner fires laser pulses while we walk and works out where it is as it goes, producing a dense 3D map of everything around it in minutes, without setting up a tripod at each position.',
    image: IMG['how-we-work/slam-laser-scanning'],
    imageAlt: 'Dense 3D point cloud map of a building produced by laser scanning',
    linkLabel: 'More on 3D laser scanning',
    linkPath: '/services/digital-twins/3d-laser-scanning/#what-is-slam' as RoutePath,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45 },
};

export const HowWeWorkPage: React.FC<HowWeWorkPageProps> = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState(0);
  const planProject = () => onNavigate('/contact/?type=project' as RoutePath);

  const goToLink = (path: RoutePath) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="py-14 sm:py-20 md:py-24 bg-white text-ink relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-10 overflow-x-auto whitespace-nowrap pb-1">
          <button type="button" onClick={() => onNavigate('/')} className="hover:text-zinc-900 transition-colors">
            Home
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <button type="button" onClick={() => onNavigate('/about/')} className="hover:text-zinc-900 transition-colors">
            About
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <span className="text-accent font-semibold" aria-current="page">
            How we work
          </span>
        </nav>

        {/* 1. INTRO */}
        <section className="max-w-4xl mb-20 sm:mb-28">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-6 shadow-xs"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-semibold text-zinc-900">How we work</span>
              <span className="text-zinc-400">·</span>
              <span>Process &amp; standards</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display text-balance mb-6 leading-[1.12]"
            >
              How we turn a place into <span className="text-accent">an experience</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mb-8"
            >
              Every project combines two disciplines. Our engineers make sure what we capture is accurate and measurable.
              Our game developers make sure what people experience is beautiful, interactive and memorable. Between them
              sits a clear process, so you always know what happens next and what you will receive.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <button
                type="button"
                onClick={planProject}
                className={buttonClass('primary', 'md')}
              >
                <span>Plan your experience</span>
                <span className="ml-2 font-mono" aria-hidden="true">→</span>
              </button>
              <a
                href="#process"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={buttonClass('secondary', 'md')}
              >
                <span>See the five steps</span>
                <span className="ml-2 font-mono text-accent" aria-hidden="true">↓</span>
              </a>
            </motion.div>
          </div>
        </section>

        {/* 2. OUR PROCESS (#process): interactive stepper; every panel stays in the DOM */}
        <section id="process" className="mb-20 sm:mb-28 scroll-mt-20">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div className="max-w-2xl">
              <span className={eyebrowClass}>Our process</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1 text-balance">
                Five steps from real place to finished experience
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-500">Select a step to see what happens.</p>
          </motion.div>

          {/* Step selector */}
          <div role="tablist" aria-label="Process steps" className="relative grid grid-cols-5 gap-2 sm:gap-3 mb-6">
            {PROCESS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === activeStep;
              const isDone = idx < activeStep;
              return (
                <button
                  key={step.number}
                  type="button"
                  role="tab"
                  id={`step-tab-${idx}`}
                  aria-selected={isActive}
                  aria-controls={`step-panel-${idx}`}
                  onClick={() => setActiveStep(idx)}
                  className={`group relative flex flex-col items-center sm:items-start gap-2 rounded-xl border p-3 sm:p-4 text-left transition-all ${
                    isActive
                      ? 'border-accent bg-white shadow-[0_8px_24px_-6px_rgba(225,29,72,0.18)]'
                      : 'border-line bg-surface hover:border-zinc-300 hover:bg-white'
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? 'bg-accent text-white' : isDone ? 'bg-accent/10 text-accent' : 'bg-white border border-line text-zinc-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="hidden sm:block font-mono text-[11px] text-zinc-500">Step {step.number}</span>
                  <span className={`hidden sm:block text-sm font-bold font-display ${isActive ? 'text-zinc-900' : 'text-zinc-700'}`}>
                    {step.title}
                  </span>
                  <span className="sm:hidden font-mono text-[11px] text-zinc-600">{step.number}</span>
                </button>
              );
            })}
          </div>

          {/* Progress rail */}
          <div className="h-1 rounded-full bg-surface-sunken mb-6 overflow-hidden" aria-hidden="true">
            <motion.div
              className="h-full w-full origin-left bg-accent rounded-full"
              initial={false}
              animate={{ scaleX: (activeStep + 1) / PROCESS.length }}
              transition={{ duration: 0.35 }}
            />
          </div>

          {/* Step panels */}
          {PROCESS.map((step, idx) => {
            const isActive = idx === activeStep;
            return (
              <div
                key={step.number}
                role="tabpanel"
                id={`step-panel-${idx}`}
                aria-labelledby={`step-tab-${idx}`}
                className={isActive ? 'block' : 'hidden'}
              >
                <motion.div
                  key={isActive ? `active-${idx}` : `idle-${idx}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl border border-line bg-white overflow-hidden shadow-sm"
                >
                  <div className="lg:col-span-5 relative min-h-[220px] bg-zinc-900">
                    <img loading="lazy" decoding="async" src={step.image} alt={step.imageAlt} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 bg-white/95 border border-line px-3 py-1.5 rounded-md text-xs font-mono text-zinc-900 shadow-xs">
                      Step {step.number} · {step.title}
                    </div>
                  </div>

                  <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col">
                    <span className="font-mono text-xs text-accent-strong font-semibold">Step {step.number} of 05</span>
                    <h3 className="text-2xl font-bold text-zinc-900 font-display mt-1 mb-4">{step.title}</h3>

                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">What happens</h4>
                    <p className="text-sm text-zinc-600 leading-relaxed mb-6">{step.whatHappens}</p>

                    <dl className={`grid grid-cols-1 ${step.youProvide ? 'sm:grid-cols-2' : ''} gap-3 mb-6`}>
                      {step.youProvide && (
                        <div className="rounded-xl border border-line bg-surface p-4">
                          <dt className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">You provide</dt>
                          <dd className="text-sm text-zinc-700 leading-relaxed">{step.youProvide}</dd>
                        </div>
                      )}
                      <div className="rounded-xl border border-accent/25 bg-accent/[0.04] p-4">
                        <dt className="text-xs font-mono uppercase tracking-wider text-accent mb-1">You receive</dt>
                        <dd className="text-sm text-zinc-900 font-medium leading-relaxed">{step.youReceive}</dd>
                      </div>
                    </dl>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-line">
                      <button
                        type="button"
                        onClick={() => setActiveStep(Math.max(0, idx - 1))}
                        disabled={idx === 0}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Previous</span>
                      </button>
                      {idx < PROCESS.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setActiveStep(idx + 1)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent hover:text-accent-strong transition-colors"
                        >
                          <span>Next: {PROCESS[idx + 1].title}</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={planProject}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent hover:text-accent-strong transition-colors"
                        >
                          <span>Start with step one</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </section>

        {/* 3. TWO DISCIPLINES, ONE TEAM (#team-approach) */}
        <section id="team-approach" className="mb-20 sm:mb-28 scroll-mt-20">
          <motion.div {...fadeUp} className="max-w-2xl mb-10">
            <span className={eyebrowClass}>Two disciplines, one team</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1 text-balance">
              Engineering precision. Game-development craft.
            </h2>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
            {DISCIPLINES.map((discipline, i) => {
              const Icon = discipline.icon;
              return (
                <motion.div key={discipline.heading} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.1 }}>
                  <SpotlightCard className="h-full group" contentClassName="h-full flex flex-col">
                    <div className="relative h-44 overflow-hidden bg-zinc-900">
                      <img loading="lazy" decoding="async"
                        src={discipline.image}
                        alt={discipline.imageAlt}
                        className="w-full h-full object-cover object-left group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-5 flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-lg bg-white/95 flex items-center justify-center shadow-xs">
                          <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-[11px] font-mono uppercase tracking-wider text-white/80">{discipline.tag}</p>
                          <h3 className="text-lg font-bold text-white font-display">{discipline.heading}</h3>
                        </div>
                      </div>
                    </div>
                    <ul className="p-6 space-y-3">
                      {discipline.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700 leading-relaxed">
                          <span className="mt-0.5 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-accent" aria-hidden="true" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </motion.div>
              );
            })}

            {/* Join badge between the two cards */}
            <div
              className="hidden md:flex absolute left-1/2 top-44 -translate-x-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-line bg-white shadow-md items-center justify-center font-mono text-sm font-bold text-accent"
              aria-hidden="true"
            >
              +
            </div>
          </div>

          <motion.div
            {...fadeUp}
            className="mt-6 rounded-2xl border border-line bg-surface p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="max-w-2xl">
              <p className="text-base sm:text-lg text-zinc-900 font-display font-semibold leading-relaxed">
                Accuracy without engagement is a file no one opens. Engagement without accuracy is a pretty picture you
                can't trust. <span className="text-accent">We do both.</span>
              </p>
              <p className="mt-3">
                <Placeholder>[[TBC: add other disciplines if relevant, e.g. 3D artists, storytellers, videographers]]</Placeholder>
              </p>
            </div>
            <a
              href="/about/#team"
              onClick={goToLink('/about/#team' as RoutePath)}
              className={buttonClass('secondary', 'md', 'shrink-0')}
            >
              <Users className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>Meet the team</span>
              <span className="font-mono" aria-hidden="true">→</span>
            </a>
          </motion.div>
        </section>

        {/* 4. OUR TOOLKIT (#toolkit) */}
        <section id="toolkit" className="mb-20 sm:mb-28 scroll-mt-20">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className={eyebrowClass}>Toolkit</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1">Our toolkit</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
              We choose tools for the job. These are the categories we work with, and examples of what we use.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TOOLKIT_ROWS.map((row, i) => {
              const Icon = row.icon;
              return (
                <motion.div key={row.category} {...fadeUp} transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}>
                  <SpotlightCard className="h-full group" contentClassName="h-full p-6 flex flex-col">
                    <span className="w-10 h-10 rounded-lg border border-line bg-surface flex items-center justify-center mb-4 transition-colors group-hover:bg-accent group-hover:border-accent">
                      <Icon className="w-4.5 h-4.5 text-accent transition-colors group-hover:text-white" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 font-display mb-2">{row.category}</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed mb-5">{row.whatItDoes}</p>
                    <div className="mt-auto pt-4 border-t border-line">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Examples</p>
                      <p className="text-xs font-mono text-zinc-800 leading-relaxed">{row.examples}</p>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}

            <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.18 }}>
              <button
                type="button"
                onClick={planProject}
                className="h-full w-full rounded-lg border border-dashed border-accent/40 bg-accent/[0.03] p-6 flex flex-col text-left hover:bg-accent/[0.06] hover:border-accent transition-colors"
              >
                <span className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <MessageCircleQuestion className="w-4.5 h-4.5 text-white" aria-hidden="true" />
                </span>
                <h3 className="text-base font-bold text-zinc-900 font-display mb-2">Not sure what your place needs?</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">Tell us your goal. We choose tools for the job.</p>
                <span className="mt-auto pt-4 text-xs font-mono font-semibold text-accent">Plan your experience →</span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* 5. ACCURACY YOU CAN TRUST (#accuracy) */}
        <section id="accuracy" className="mb-20 sm:mb-28 scroll-mt-20">
          <motion.div
            {...fadeUp}
            className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl border border-line bg-surface overflow-hidden"
          >
            <div className="lg:col-span-5 p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-line flex flex-col justify-between bg-white">
              <div>
                <span className={eyebrowClass}>Accuracy</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1">
                  Accuracy you can trust
                </h2>
              </div>

              {/* Target graphic: decorative */}
              <div className="relative mx-auto mt-10 w-44 h-44" aria-hidden="true">
                {[100, 72, 44].map((size, i) => (
                  <motion.span
                    key={size}
                    className="absolute rounded-full border border-accent"
                    style={{
                      width: `${size}%`,
                      height: `${size}%`,
                      left: `${(100 - size) / 2}%`,
                      top: `${(100 - size) / 2}%`,
                      opacity: 0.2 + i * 0.25,
                    }}
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                  />
                ))}
                <span className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-300" />
                <span className="absolute top-1/2 left-0 right-0 h-px bg-zinc-300" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent shadow-[0_0_0_6px_rgba(225,29,72,0.15)]" />
              </div>
            </div>

            <div className="lg:col-span-7 p-8 sm:p-10">
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                A 3D model is only useful if it is right. Accuracy depends on the method, the site and the ground control
                used. We agree the accuracy your project needs during planning, tell you honestly if it can be achieved,
                and check every dataset before delivery.
              </p>

              <ol className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="How we handle accuracy">
                {ACCURACY_CHECKPOINTS.map((checkpoint, i) => (
                  <li key={checkpoint.label} className="relative rounded-xl border border-line bg-white p-4">
                    <span className="font-mono text-[11px] text-zinc-400">0{i + 1}</span>
                    <p className="text-base font-bold text-zinc-900 font-display">{checkpoint.label}</p>
                    <p className="text-xs text-zinc-600">{checkpoint.line}</p>
                  </li>
                ))}
              </ol>

              {accuracyConfirmed && (
                <div className="mt-6 rounded-xl border border-line bg-white overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left">
                    <thead className="border-b border-line">
                      <tr className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                        <th scope="col" className="px-5 py-3 font-semibold">Method</th>
                        <th scope="col" className="px-5 py-3 font-semibold">Typical accuracy</th>
                        <th scope="col" className="px-5 py-3 font-semibold">Conditions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {ACCURACY_ROWS.map((row) => (
                        <tr key={row.method}>
                          <th scope="row" className="px-5 py-3.5 text-sm font-bold text-zinc-900 font-display">{row.method}</th>
                          <td className="px-5 py-3.5 text-sm font-mono tabular-nums text-zinc-900">{row.typicalAccuracy}</td>
                          <td className="px-5 py-3.5 text-sm text-zinc-600">{row.conditions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* 6. OUR PROMISE (#quality) */}
        <section id="quality" className="mb-20 sm:mb-28 scroll-mt-20">
          <motion.div {...fadeUp} className="max-w-2xl mb-10">
            <span className={eyebrowClass}>Our promise</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1 text-balance">
              Our quality, privacy and data promise
            </h2>
          </motion.div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROMISES.map((promise, i) => {
              const Icon = promise.icon;
              return (
                <motion.div key={promise.title} {...fadeUp} transition={{ duration: 0.4, delay: (i % 3) * 0.07 }}>
                  <SpotlightCard className="h-full p-6 group">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-10 h-10 rounded-lg border border-line bg-surface flex items-center justify-center shrink-0 transition-colors group-hover:bg-accent group-hover:border-accent">
                        <Icon className="w-4.5 h-4.5 text-accent transition-colors group-hover:text-white" aria-hidden="true" />
                      </span>
                      <dt className="text-base font-bold text-zinc-900 font-display">{promise.title}</dt>
                    </div>
                    <dd className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{promise.meaning}</dd>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </dl>
        </section>

        {/* 7. EXPLAINED SIMPLY (#explained) */}
        <section id="explained" className="mb-20 sm:mb-28 scroll-mt-20">
          <motion.div {...fadeUp} className="max-w-2xl mb-10">
            <span className={eyebrowClass}>Explained simply</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1">
              The technology, in plain words
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EXPLAINERS.map((explainer, i) => (
              <motion.div key={explainer.title} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.1 }}>
                <SpotlightCard className="h-full group" contentClassName="h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-zinc-900">
                    <img loading="lazy" decoding="async"
                      src={explainer.image}
                      alt={explainer.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <article className="p-6 sm:p-8 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-zinc-900 font-display mb-3">{explainer.title}</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed mb-6">{explainer.body}</p>
                    <a
                      href={explainer.linkPath}
                      onClick={goToLink(explainer.linkPath)}
                      className="mt-auto text-xs font-semibold text-accent hover:text-accent-strong flex items-center gap-1 transition-colors self-start font-mono"
                    >
                      <span>{explainer.linkLabel}</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  </article>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 8. CALL TO ACTION BAND */}
        <section className="rounded-2xl border border-line bg-surface p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Decorative step dots echoing the five-step process */}
          <div className="flex items-center justify-center gap-2 mb-6" aria-hidden="true">
            {PROCESS.map((step, i) => (
              <React.Fragment key={step.number}>
                <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-accent' : 'bg-zinc-300'}`} />
                {i < PROCESS.length - 1 && <span className="w-6 h-px bg-zinc-300" />}
              </React.Fragment>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-4 text-balance">
              Let's start with your goal
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 mb-8 leading-relaxed">
              Tell us about your place and what you want people to do. We'll take it from there, one clear step at a
              time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={planProject}
                className={buttonClass('primary', 'lg', 'w-full sm:w-auto')}
              >
                <span>Plan your experience</span>
                <span className="ml-2 font-mono" aria-hidden="true">→</span>
              </button>

              <a
                href={SITE_METADATA.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass('secondary', 'lg', 'w-full sm:w-auto')}
              >
                <span>Chat on WhatsApp</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
