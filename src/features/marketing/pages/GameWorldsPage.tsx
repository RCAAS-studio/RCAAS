import React from 'react';
import { IMG } from '../data/images';
import { motion } from 'framer-motion';
import { ArrowRight, Box, Cpu, Gamepad2, Layers, Package, ScanLine, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import { Placeholder, WithPlaceholders } from '../components/Placeholder';
import { SplatEmbed } from '../components/SplatEmbed';
import { SpotlightCard } from '../components/SpotlightCard';
import {
  FaqList,
  SectionHeading,
  fadeUp,
  linkHandler,
  pageShellClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../components/GuideParts';
import { eyebrowClass } from '../components/ui';

interface GameWorldsPageProps {
  onNavigate: (path: RoutePath) => void;
}

import { GAME_WORLDS } from '../data/gameWorlds';
export { GAME_WORLDS };

const OFFERS: { number: string; title: string; body: string; tags: string[]; icon: LucideIcon }[] = [
  {
    number: '01',
    title: '3D Asset Generation',
    body: 'Photoreal 3D assets created from real-world capture, cleaned, optimised and delivered in formats ready for games, simulations and virtual production.',
    tags: ['Splat-to-asset', 'Props & environments', 'Optimised exports', 'Real-time ready'],
    icon: Box,
  },
  {
    number: '02',
    title: 'Game Development',
    body: 'Games and interactive worlds built on real captured places, combining Gaussian splatting with game-engine tools to create spaces players instantly recognise.',
    tags: ['Game environments', 'Level design', 'Unreal Engine', 'Interactive worlds'],
    icon: Gamepad2,
  },
];

const PIPELINE: { title: string; line: string; icon: LucideIcon }[] = [
  { title: 'Capture', line: 'Real locations, objects and heritage sites are captured on site.', icon: ScanLine },
  { title: 'Gaussian splat', line: 'Photoreal splats keep what makes the place feel real.', icon: Sparkles },
  { title: 'Clean and optimise', line: 'Assets are cleaned and optimised for real-time use.', icon: Layers },
  { title: 'Game-ready assets', line: 'Delivered in formats ready for games, simulations and virtual production. [[TBC: formats]]', icon: Package },
  { title: 'In your engine', line: 'Built into environments and interactive worlds in Unreal, Unity and real-time scenes.', icon: Cpu },
];

// Only the first and last answers are resolved; the rest wait for confirmation (Register).
export const GAME_WORLDS_FAQS = [
  {
    question: 'Which game engines do you work with?',
    answer: 'We build for Unreal and Unity, and for other real-time experiences. [[TBC: engine versions and other engines]]',
  },
  { question: 'Which file formats do you deliver?', answer: '[[TBC: formats, e.g. engine-ready meshes and textures, splat files]]' },
  { question: 'Who owns the assets?', answer: '[[TBI: ownership and licensing terms for captured assets]]' },
  {
    question: 'Can you capture heritage sites for a game?',
    answer:
      "Yes, with proper permission from the people who care for the site. We follow each site's rules and capture without touching or disturbing the structure.",
  },
];

export const GameWorldsPage: React.FC<GameWorldsPageProps> = ({ onNavigate }) => {
  const goToLink = (path: RoutePath) => linkHandler(onNavigate, path);
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-10 overflow-x-auto whitespace-nowrap pb-1">
          <button type="button" onClick={() => onNavigate('/')} className="hover:text-zinc-900 transition-colors">
            Home
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <button type="button" onClick={() => onNavigate('/services/')} className="hover:text-zinc-900 transition-colors">
            What we create
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <span className="text-accent font-semibold" aria-current="page">
            {GAME_WORLDS.title}
          </span>
        </nav>

        {/* 1. HERO */}
        <section className="mb-20 sm:mb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono uppercase tracking-wider text-zinc-700 mb-6 shadow-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-semibold text-zinc-900">{GAME_WORLDS.tagline}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display text-balance mb-6 leading-[1.12]"
          >
            Game Worlds <span className="text-accent">&amp; Assets</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mb-6"
          >
            {GAME_WORLDS.intro}
          </motion.p>
          <ul className="flex flex-wrap gap-2 mb-8" aria-label="Includes">
            {GAME_WORLDS.tags.map((tag) => (
              <li key={tag} className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-mono text-zinc-700">
                {tag}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button type="button" onClick={() => onNavigate('/contact/?type=gaming' as RoutePath)} className={primaryButtonClass.replace('w-full sm:w-auto ', '')}>
              <span>Discuss a game project</span>
              <span className="ml-2 font-mono" aria-hidden="true">→</span>
            </button>
            <a
              href="#live-example"
              onClick={scrollTo('live-example')}
              className="inline-flex items-center justify-center px-5 py-3.5 rounded-lg border border-line bg-white text-zinc-900 font-medium text-sm hover:bg-zinc-50 transition-colors shadow-xs"
            >
              See a real place in 3D <span className="ml-2 font-mono text-accent" aria-hidden="true">↓</span>
            </a>
          </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="rounded-2xl overflow-hidden border border-line bg-surface p-3 shadow-lg">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-zinc-900">
                <img
                  src={IMG['game-worlds/a-visitor-exploring-a-real-heritage-courtyard-ca']}
                  alt="A visitor exploring a real heritage courtyard captured in 3D"
                  width="1376"
                  height="768"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* 2. THE TWO OFFERS */}
        <section className="mb-20 sm:mb-24">
          <SectionHeading eyebrow="What we do" title="Capture it. Make it playable." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OFFERS.map((offer, i) => {
              const Icon = offer.icon;
              return (
                <motion.div key={offer.title} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.1 }}>
                  <SpotlightCard className="h-full group" contentClassName="h-full p-7 sm:p-9 flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                      <span className="w-12 h-12 rounded-xl border border-line bg-surface flex items-center justify-center transition-colors group-hover:bg-accent group-hover:border-accent">
                        <Icon className="w-6 h-6 text-accent transition-colors group-hover:text-white" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-xs text-zinc-400">{offer.number}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-ink font-display mb-3">{offer.title}</h3>
                    <p className="text-sm sm:text-base text-muted leading-relaxed mb-6">{offer.body}</p>
                    <ul className="mt-auto flex flex-wrap gap-2">
                      {offer.tags.map((tag) => (
                        <li key={tag} className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-mono text-zinc-700">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 3. FROM REAL PLACE TO REAL-TIME */}
        <section className="mb-20 sm:mb-24">
          <SectionHeading eyebrow="How it works" title="From real place to real-time" />
          <ol className="relative grid grid-cols-1 md:grid-cols-5 gap-5">
            <span className="hidden md:block absolute left-[10%] right-[10%] top-6 h-px bg-line" aria-hidden="true" />
            {PIPELINE.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li key={step.title} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.07 }} className="relative">
                  <div className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 md:text-center">
                    <span className="relative z-10 w-12 h-12 rounded-xl border border-line bg-white flex items-center justify-center shadow-xs shrink-0">
                      <Icon className="w-5 h-5 text-accent" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="font-mono text-[11px] text-zinc-400">0{i + 1}</span>
                      <h3 className="text-sm font-bold text-ink font-display">{step.title}</h3>
                      <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
                        <WithPlaceholders text={step.line} />
                      </p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </section>

        {/* 4. LIVE EXAMPLE */}
        <section id="live-example" className="mb-20 sm:mb-24 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
            <SectionHeading eyebrow="Live example" title="A real place, captured as a Gaussian splat" className="" />
            <Placeholder>[[TBI: a game-ready asset or environment example; if none, use the best available demo]]</Placeholder>
          </div>
          <SplatEmbed initialDemo="chilancho" />
        </section>

        {/* 5. WHO IT'S FOR */}
        <section className="mb-20 sm:mb-24">
          <motion.a
            {...fadeUp}
            href="/industries/gaming/"
            onClick={goToLink('/industries/gaming/')}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-line bg-surface p-7 sm:p-9 hover:border-line-strong transition-colors"
          >
            <div>
              <span className={eyebrowClass}>For studios and developers</span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display text-balance">
                Real places. Ready to play.
              </h2>
              <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl">
                See how game studios, simulation teams and virtual production use captured places.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent shrink-0">
              Gaming <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </motion.a>
        </section>

        {/* 6. FAQ */}
        <section id="faq" className="mb-20 sm:mb-24 scroll-mt-24">
          <SectionHeading eyebrow="Answers" title="Questions about game worlds and assets" className="max-w-3xl mx-auto mb-10 text-center" />
          <FaqList
            className="max-w-3xl mx-auto"
            items={GAME_WORLDS_FAQS.map((faq) => ({ question: faq.question, answer: <WithPlaceholders text={faq.answer} /> }))}
          />
        </section>

        {/* 7. CTA BAND */}
        <section className="rounded-2xl border border-line bg-surface p-8 sm:p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-4 text-balance">
              Build your world from a real place
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 mb-8 leading-relaxed">
              Tell us about your game, simulation or production and the place you want to capture. We'll suggest the right
              capture and send a clear proposal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button type="button" onClick={() => onNavigate('/contact/?type=gaming' as RoutePath)} className={primaryButtonClass}>
                <span>Discuss a game project</span>
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
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
