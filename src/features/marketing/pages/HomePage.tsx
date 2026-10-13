import React, { useEffect, useMemo, useState } from 'react';
import { IMG } from '../data/images';
import { motion } from 'framer-motion';
import { RoutePath } from '../types';
import { SITE_METADATA, PILLARS, INDUSTRIES } from '../data/siteData';
import {
  ChevronRight,
  Gamepad2,
  Handshake,
  Ruler,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CASE_STUDY_CONTENT } from '../content/work';
import { Placeholder, WithPlaceholders } from '../components/Placeholder';
import { HOME_FAQS } from '../content/faq';
import { SplatEmbed } from '../components/SplatEmbed';
import { SpotlightCard } from '../components/SpotlightCard';
import { InfiniteMarquee } from '../components/InfiniteMarquee';
import { CaseStudyShowcase } from '../components/CaseStudyShowcase';
import { SpatialBackgroundScan } from '../components/SpatialBackgroundScan';
import { HeritageMotionBackdrop } from '../components/HeritageMotionBackdrop';
import { TypewriterHeroPhrase } from '../components/TypewriterHeroPhrase';
import { FaqList, linkHandler } from '../components/GuideParts';
import { eyebrowClass } from '../components/ui';

// Card copy for "Stories we've told" (docs/copy/home.md §5).
const HOME_CARD_COPY: Record<string, { tag: string; line: string }> = {
  'chilancho-stupa-digital-heritage': {
    tag: 'Heritage',
    line: 'Documented in 3D to preserve its form and detail for study and for the public.',
  },
  'nepathya-school-college-3d-campus-tour': { tag: 'Education', line: 'A campus tour families can take from home.' },
  'madan-ashrit-polytechnic-3d-campus-tour': {
    tag: 'Education',
    line: 'Workshops and labs prospective students can explore for themselves.',
  },
  'basera-boutique-hotel-3d-experience': { tag: 'Hospitality', line: 'A hotel guests can look around before they book.' },
};


// Photo for some industry cards in "Built around your goal"; the rest stay text-only for a varied masonry rhythm.
const INDUSTRY_IMAGES: Record<string, { src: string; tall?: boolean }> = {
  'hospitality-tourism': { src: IMG['home/industry-hospitality-tourism'], tall: true },
  education: { src: IMG['home/industry-education'] },
  factories: { src: IMG['home/industry-factories'] },
  'heritage-culture': { src: IMG['home/industry-heritage-culture'], tall: true },
  'government-municipalities': { src: IMG['home/industry-government-municipalities'] },
  gaming: { src: IMG['home/industry-gaming'], tall: true },
  filmmaking: { src: IMG['home/industry-filmmaking'] },
  'real-estate-architecture': { src: IMG['home/industry-real-estate-architecture'] },
  'non-life-insurance': { src: IMG['home/industry-non-life-insurance'] },
  'banking-financial-institutions': { src: IMG['home/industry-banking-financial-institutions'] },
  'nonprofit-international-development': { src: IMG['home/industry-nonprofit-international-development'] },
};

// Masonry column count for "Built around your goal": 1 on phones, 2 on tablets, 3 on laptops, 5 on wide screens (two cards per column).
const COLUMN_QUERIES: [string, number][] = [['(min-width: 1280px)', 5], ['(min-width: 1024px)', 3], ['(min-width: 640px)', 2]];
const readColumnCount = () =>
  typeof window === 'undefined' ? 5 : COLUMN_QUERIES.find(([query]) => window.matchMedia(query).matches)?.[1] ?? 1;
const useColumnCount = () => {
  // Starts at the server's 5 so the first render matches the HTML Next sent; the real count follows.
  const [count, setCount] = useState(5);
  useEffect(() => {
    const lists = COLUMN_QUERIES.map(([query]) => window.matchMedia(query));
    const update = () => setCount(readColumnCount());
    update();
    lists.forEach((list) => list.addEventListener('change', update));
    return () => lists.forEach((list) => list.removeEventListener('change', update));
  }, []);
  return count;
};

// "Why RCAAS" reasons (docs/copy/home.md §7).
const WHY_POINTS: { title: string; desc: string; icon: LucideIcon }[] = [
  {
    title: "Precise, because we're engineers.",
    desc: 'Every experience is built on accurate measurement, so what people see is true to the place.',
    icon: Ruler,
  },
  {
    title: "Engaging, because we're game developers.",
    desc: 'We bring the craft of interactive design, so people stay, explore and remember.',
    icon: Gamepad2,
  },
  {
    title: 'Story-first, built to act on.',
    desc: 'Each experience is designed around one goal: the action you want your audience to take.',
    icon: Target,
  },
  {
    title: 'Here for the long term.',
    desc: "A Kathmandu team that knows Nepal's places, conditions and people, and stays with you after launch.",
    icon: Handshake,
  },
];

const WHY_FADE = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

// Illustrative image for each pillar card in "What we create".
const PILLAR_VISUALS: Record<string, { image: string; alt: string }> = {
  'immersive-experiences': { image: IMG['home/immersive-experiences'], alt: 'A 3D virtual tour of a real place open on screen' },
  'visual-storytelling': { image: IMG['home/visual-storytelling'], alt: 'A cinematic camera move through a captured place' },
  'digital-twins': { image: IMG['home/digital-twins'], alt: 'A measured point cloud of a building beside its drawings' },
  'game-worlds-assets': { image: IMG['home/game-worlds-assets'], alt: 'A visitor exploring a real heritage courtyard captured in 3D' },
};

interface HomePageProps {
  onNavigate: (path: RoutePath) => void;
  onOpenPlanner: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenPlanner }) => {
  const industryColumnCount = useColumnCount();
  const industryColumns = useMemo(() => {
    // Rough card heights (in column widths) so each card goes to the shortest column.
    const columns = Array.from({ length: industryColumnCount }, () => ({ height: 0, items: [] as { ind: (typeof INDUSTRIES)[number]; i: number }[] }));
    INDUSTRIES.forEach((ind, i) => {
      const image = INDUSTRY_IMAGES[ind.id];
      const height = (image ? (image.tall ? 0.75 : 0.5) : 0) + 0.65 + ind.summary.length / 350;
      const target = columns.reduce((min, col) => (col.height < min.height ? col : min), columns[0]);
      target.items.push({ ind, i });
      target.height += height;
    });
    return columns.map((col) => col.items);
  }, [industryColumnCount]);


  const scrollToLive = () => {
    const el = document.getElementById('live-experience');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden bg-white text-ink">
      {/* Ambient Spatial Scanning Grid */}
      <SpatialBackgroundScan />
      
      {/* 1. Hero Section #hero */}
      <section id="hero" className="relative pt-16 pb-20 md:pt-24 md:pb-28">
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
              <span className="sr-only">
                Turn real places into experiences that move people to act.
              </span>

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
                <span className="text-zinc-400 ml-1.5">&darr;</span>
              </button>
            </div>

            {/* Trust Line */}
            <div className="mt-7 text-xs text-zinc-500 font-mono flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
              <span>Engineers and game developers, based in Kathmandu.</span>
            </div>

          </motion.div>

        </div>
      </section>

      {/* Infinite Momentum Marquee Band */}
      <InfiniteMarquee />

      {/* 2. Live experience #live-experience */}
      <section id="live-experience" className="py-24 border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-12">
            <span className={eyebrowClass}>
              Step inside
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-ink font-display">
              Don't just look at photos. Walk through the place.
            </h2>
            <p className="mt-4 text-base text-muted leading-relaxed">
              <WithPlaceholders text="This is [[TBI: project name]], captured by our team and published on our 3D platform. Move around it on your phone or laptop. No app, no download." />
            </p>
          </div>

          {/* Interactive SplatEmbed */}
          <SplatEmbed initialDemo="chilancho" />

          {/* Static HTML description for crawlers and accessibility */}
          <div className="mt-6 rounded-md border border-line bg-white p-4 text-xs text-zinc-600 font-mono shadow-sm">
            <p>
              <WithPlaceholders text="An interactive, photorealistic 3D model of [[TBI: place name]] in [[TBI: location]], created by RCAAS Technology. Visitors can move freely through [[TBI: spaces shown, e.g. the lobby, rooms and courtyard]]." />
            </p>
            <p className="mt-2">
              <WithPlaceholders text={'Built to help [[TBI: client]] [[TBI: goal, e.g. "show guests the hotel before they book"]].'} />
            </p>
          </div>

        </div>
      </section>

      {/* 3. What we create #what-we-create */}
      <section id="what-we-create" className="py-24 border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-16">
            <span className={eyebrowClass}>
              Four Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-ink font-display">
              What we create
            </h2>
            <p className="mt-4 text-base text-muted leading-relaxed">
              Every project starts with a real place and ends with something people can experience, share and act on.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {PILLARS.map((pillar, i) => {
              const visual = PILLAR_VISUALS[pillar.id];
              return (
                <motion.a
                  key={pillar.id}
                  href={pillar.link}
                  onClick={linkHandler(onNavigate, pillar.link as RoutePath)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex flex-col sm:flex-row gap-5 sm:gap-7 rounded-[1.75rem] bg-surface p-3 sm:p-4 transition-shadow duration-500 hover:shadow-[0_18px_50px_-24px_rgba(9,9,11,0.25)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {/* Image panel */}
                  <div className="relative shrink-0 overflow-hidden rounded-[1.25rem] bg-zinc-200 aspect-[16/10] sm:aspect-auto sm:w-[44%] sm:min-h-[22rem]">
                    <img
                      src={visual?.image}
                      alt={visual?.alt ?? ''}
                      width={1376}
                      height={768}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover saturate-50 transition-[transform,filter] duration-700 group-hover:saturate-100 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                    {/* Mask: mutes the busy photography so the pillar title stays the focus; it lifts on hover. */}
                    <div className="absolute inset-0 bg-ink/40 transition-opacity duration-500 group-hover:opacity-0" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" aria-hidden="true" />
                    <span className="absolute left-4 bottom-4 font-mono text-[11px] font-semibold tracking-[0.2em] text-white/90">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Copy */}
                  <div className="flex flex-1 flex-col px-2 pb-3 sm:px-0 sm:py-3 sm:pr-4">
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                      {pillar.promise}
                    </span>
                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-ink font-display transition-colors group-hover:text-accent-strong">
                      {pillar.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted">{pillar.body}</p>

                    <span className="mt-auto pt-7 inline-flex items-center gap-2.5 text-sm font-semibold text-accent-strong">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white transition-transform duration-300 group-hover:translate-x-1">
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      Explore {pillar.title.toLowerCase()}
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. Built for your goal #industries */}
      <section id="industries" className="relative overflow-hidden py-24 sm:py-28 bg-ink">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-mono uppercase tracking-wider text-accent-soft font-semibold">
              Industry Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-white font-display">
              Built around your goal
            </h2>
            <p className="mt-4 text-base text-zinc-300 leading-relaxed">
              Tell us what you want people to do. We will design the experience around it.
            </p>
          </div>

          {/* Masonry: image cards and text cards of different heights, each placed in the shortest column */}
          <div className="flex items-start gap-4 xl:gap-4">
            {industryColumns.map((column, c) => (
              <div key={c} className="flex min-w-0 flex-1 flex-col gap-4">
            {column.map(({ ind, i }) => {
              const image = INDUSTRY_IMAGES[ind.id];
              return (
                <motion.a
                  key={ind.id}
                  href={ind.link}
                  onClick={linkHandler(onNavigate, ind.link as RoutePath)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)] sm:block transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {image && (
                    <div className={`relative w-24 shrink-0 overflow-hidden bg-zinc-200 sm:w-auto ${image.tall ? 'sm:aspect-[4/3]' : 'sm:aspect-[2/1]'}`}>
                      <img
                        src={image.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 p-4 sm:p-5">
                    <h3 className="text-lg font-bold tracking-tight text-ink font-display leading-snug transition-colors group-hover:text-accent-strong">
                      <span className="sr-only">{ind.title}: </span>
                      {ind.goalHeadline}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{ind.summary}</p>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                      <span className="min-w-0 truncate text-[11px] text-zinc-500">
                        For <span className="font-medium text-zinc-700">{ind.whoItsFor}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-accent" aria-hidden="true" />
                    </div>
                  </div>
                </motion.a>
              );
            })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How it works #how-it-works */}
      <section id="how-it-works" className="py-24 border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <div>
              <span className={eyebrowClass}>
                How it works
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-ink font-display">
                From real place to finished experience
              </h2>
            </div>
            <div>
              <button
                onClick={() => onNavigate('/how-we-work/')}
                className="text-xs font-mono font-semibold text-accent hover:underline flex items-center gap-1.5"
              >
                <span>See how we work</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Discover',
                desc: 'We start with your goal, your audience and what you want them to do.',
              },
              {
                step: '02',
                title: 'Capture',
                desc: 'Our team scans the place on the ground and from the air, quickly and without touching anything.',
              },
              {
                step: '03',
                title: 'Create',
                desc: 'Engineers build an accurate 3D model. Game developers shape it into an experience. Together we design the story.',
              },
              {
                step: '04',
                title: 'Launch',
                desc: 'We publish it and help you place it where your audience is: your website, social media, events and QR codes.',
              },
              {
                step: '05',
                title: 'Measure',
                desc: 'We look at how people engage and refine the experience over time. [[TBC: keep only if engagement analytics are available]]',
              },
            ].map((s) => (
              <SpotlightCard
                key={s.step}
                className="p-6 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-2xl font-bold text-accent">
                    {s.step}
                  </span>
                  <h3 className="mt-3 text-base font-bold text-ink font-display">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    <WithPlaceholders text={s.desc} />
                  </p>
                </div>
              </SpotlightCard>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Why RCAAS #why-rcaas */}
      <section id="why-rcaas" className="py-24 sm:py-28 border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-12">

            {/* Statement */}
            <motion.div {...WHY_FADE} className="lg:col-span-5 lg:pt-2">
              <span className={eyebrowClass}>The RCAAS Advantage</span>
              <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display leading-[1.02]">
                Why RCAAS
              </h2>
              <p className="mt-6 max-w-md text-sm sm:text-base text-muted leading-relaxed">
                {SITE_METADATA.boilerplate}{' '}
                <Placeholder>[[TBC: add "RCAAS stands for Reality Capture as a Service." here]]</Placeholder>
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                <button
                  type="button"
                  onClick={onOpenPlanner}
                  className="group inline-flex items-center gap-1 text-xs font-mono font-semibold text-accent hover:text-accent-strong transition-colors"
                >
                  Plan your experience
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </button>
                <a
                  href="/about/"
                  onClick={linkHandler(onNavigate, '/about/')}
                  className="group inline-flex items-center gap-1 text-xs font-mono font-semibold text-accent hover:text-accent-strong transition-colors"
                >
                  Meet the team
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              </div>
            </motion.div>

            {/* Reasons: one list in reading order; on wider screens it splits into two staggered columns with a hairline between. */}
            <div className="relative lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 sm:pb-20">
              <span className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-line sm:block" aria-hidden="true" />
              {WHY_POINTS.map((point, i) => {
                const Icon = point.icon;
                const left = i % 2 === 0;
                return (
                  <motion.div
                    key={point.title}
                    {...WHY_FADE}
                    transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex gap-5 py-8 border-line ${i === 0 ? '' : 'border-t'} ${
                      left ? 'sm:pr-8 lg:pr-10 sm:translate-y-20' : 'sm:pl-8 lg:pl-10'
                    } ${i >= 2 ? 'sm:border-t' : 'sm:border-t-0 sm:pt-0'}`}
                  >
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
                      <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-accent ring-2 ring-white" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-ink font-display leading-snug">{point.title}</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted">{point.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* 7. Stories we've told #work (placed after Why RCAAS) */}
      <section id="work" className="py-24 sm:py-28 bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-wider text-accent-soft font-semibold">
                Case Studies
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-white font-display">
                Stories we've told
              </h2>
              <p className="mt-3 text-base text-zinc-400">
                Real places, real clients, each with a clear goal.
              </p>
            </div>
            <div>
              <button
                onClick={() => onNavigate('/work/')}
                className="text-xs font-mono font-semibold text-accent-soft hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>See all our work</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          <CaseStudyShowcase
            onNavigate={onNavigate}
            studies={CASE_STUDY_CONTENT.map((study) => ({
              slug: study.slug,
              title: study.name,
              image: study.image,
              imageAlt: study.imageAlt,
              tag: HOME_CARD_COPY[study.slug].tag,
              line: HOME_CARD_COPY[study.slug].line,
              location: study.location ?? 'Location to be confirmed',
              path: `/work/${study.slug}/` as RoutePath,
            }))}
          />

        </div>
      </section>

      {/* 8. Heritage Band #heritage */}
      <section id="heritage" className="relative py-28 border-t border-line bg-surface overflow-hidden">
        {/* Active Heritage Aerial Point Cloud & Radar Motion Backdrop */}
        <HeritageMotionBackdrop />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-wider text-accent-strong font-semibold">
              Lasting impact
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-ink font-display">
              Nepal's heritage, recorded for the next generation.
            </h2>
            <p className="mt-4 text-base text-muted leading-relaxed">
              Temples, stupas and historic towns change with weather, earthquakes and time. We document them in 3D, measurable for conservators and explorable for everyone, so they can be studied, cared for and shared long after today.
            </p>
            <div className="mt-8">
              <button
                onClick={() => onNavigate('/industries/heritage-culture/')}
                className="loro-btn-primary px-6 py-3 text-xs"
              >
                Discover digital heritage &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Proof strip #proof: hidden until every value is real (Register G17). */}

      {/* 10. Short FAQ #faq */}
      <section id="faq" className="py-24 border-t border-line bg-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className={eyebrowClass}>
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-ink font-display">
              Questions people ask first
            </h2>
          </div>

          <FaqList items={HOME_FAQS} firstOpen={false} />

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('/faq/')}
              className="text-xs font-mono font-semibold text-accent hover:text-accent-strong transition-colors"
            >
              More questions &rarr;
            </button>
          </div>

        </div>
      </section>

      {/* 11. Closing CTA #cta */}
      <section id="cta" className="py-24 border-t border-line bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display">
            Have a place with a story to tell?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted leading-relaxed">
            Tell us about your place and what you want people to do after they've seen it. We'll suggest the right experience and send a clear proposal.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenPlanner}
              className="loro-btn-primary w-full sm:w-auto px-8 py-3.5 text-sm font-semibold"
            >
              Plan your experience &rarr;
            </button>
            <a
              href={SITE_METADATA.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="loro-btn-secondary w-full sm:w-auto px-7 py-3.5 text-sm font-medium"
            >
              <span>Chat on WhatsApp</span>
              <span className="ml-1 text-zinc-400">↗</span>
            </a>
          </div>

        </div>
      </section>

    </div>
  );
};
