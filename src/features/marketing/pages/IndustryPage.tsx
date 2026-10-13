import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, HelpCircle, ScanLine } from 'lucide-react';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import type { IndustryContent, IndustryTrack } from '../content/industries';
import { Placeholder, WithPlaceholders } from '../components/Placeholder';
import { SpotlightCard } from '../components/SpotlightCard';
import { SplatEmbed } from '../components/SplatEmbed';
import { buttonClass, eyebrowClass } from '../components/ui';
import {
  GuideFaq,
  SectionHeading,
  fadeUp,
  linkHandler,
  pageShellClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../components/GuideParts';

interface IndustryPageProps {
  industry: IndustryContent;
  onNavigate: (path: RoutePath) => void;
}

// Decorative: the questions guests are left with, answered by stepping inside.
const QuestionStack: React.FC<{ questions: string[] }> = ({ questions }) => {
  const [answered, setAnswered] = useState(false);
  return (
    <div className="relative rounded-2xl border border-line bg-surface p-6 sm:p-8 overflow-hidden">
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(#E4E4E7_1px,transparent_1px),linear-gradient(90deg,#E4E4E7_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden="true" />
      <div className="relative space-y-3">
        {questions.map((question, i) => (
          <motion.div
            key={question}
            initial={{ opacity: 0, x: i % 2 ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
            className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xs transition-colors ${
              i % 2 ? 'ml-8' : 'mr-8'
            } ${answered ? 'border-emerald-300' : 'border-line'}`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                answered ? 'bg-emerald-500 text-white' : 'bg-accent/10 text-accent'
              }`}
            >
              {answered ? <Check className="w-4 h-4" aria-hidden="true" /> : <HelpCircle className="w-4 h-4" aria-hidden="true" />}
            </span>
            <span className="text-sm text-zinc-800">{question}</span>
          </motion.div>
        ))}
        <button
          type="button"
          onClick={() => {
            // First press ticks the questions, then carries the visitor to the real place that answers them.
            if (!answered) window.setTimeout(() => document.getElementById('live-example')?.scrollIntoView({ behavior: 'smooth' }), 650);
            setAnswered((a) => !a);
          }}
          aria-pressed={answered}
          className={`mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
            answered ? 'bg-emerald-500 text-white' : 'bg-ink text-white hover:bg-zinc-800'
          }`}
        >
          {answered ? 'Answered by stepping inside' : 'Step inside to find out'}
        </button>
      </div>
    </div>
  );
};

// Dated captures of one site (a timeline) and the evidence bridge between documented and actual progress.
const ProgressEvidence: React.FC<{ progress: NonNullable<IndustryContent['progress']> }> = ({ progress }) => (
  <section id={progress.id} className="mb-20 sm:mb-24 scroll-mt-24">
    <SectionHeading eyebrow={progress.eyebrow} title={progress.title} className="max-w-3xl" />
    <p className="mt-4 max-w-3xl text-base text-zinc-600 leading-relaxed">
      <WithPlaceholders text={progress.intro} />
    </p>

    {/* Timeline: one dated capture per step */}
    <ol className="relative mt-10 grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-5">
      <span className="pointer-events-none absolute left-5 top-5 bottom-5 w-px bg-line md:left-5 md:right-5 md:top-5 md:bottom-auto md:h-px md:w-auto" aria-hidden="true" />
      {progress.steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.li
            key={step.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex gap-4 md:block"
          >
            <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-accent shadow-xs">
              <Icon className="h-4.5 w-4.5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <div className="md:mt-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-ink">{step.label}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                <WithPlaceholders text={step.line} />
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>

    {/* Evidence bridge: what the file says, what the field shows */}
    <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
      {[progress.documented, progress.field].map((side, i) => (
        <motion.div
          key={side.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={`rounded-2xl p-6 sm:p-7 ${i === 0 ? 'border border-line bg-surface lg:order-1' : 'bg-ink text-white lg:order-3'}`}
        >
          <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.16em] ${i === 0 ? 'text-zinc-500' : 'text-accent-soft'}`}>
            {i === 0 ? 'On paper' : 'In the field'}
          </p>
          <h3 className={`mt-2 font-display text-xl font-bold tracking-tight ${i === 0 ? 'text-ink' : 'text-white'}`}>{side.title}</h3>
          <ul className="mt-4 space-y-2.5">
            {side.items.map((item) => (
              <li key={item} className={`flex items-start gap-2.5 text-sm leading-relaxed ${i === 0 ? 'text-zinc-700' : 'text-zinc-300'}`}>
                <Check className={`mt-0.5 h-4 w-4 shrink-0 ${i === 0 ? 'text-accent' : 'text-accent-soft'}`} aria-hidden="true" />
                <span>
                  <WithPlaceholders text={item} />
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}

      {/* The link between them */}
      <div className="flex items-center justify-center lg:order-2 lg:w-44 lg:flex-col" aria-hidden="true">
        <span className="hidden h-8 w-px bg-line lg:block lg:flex-1" />
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-sm">
          <ScanLine className="h-5 w-5" strokeWidth={1.7} />
        </span>
        <span className="hidden h-8 w-px bg-line lg:block lg:flex-1" />
      </div>
    </div>
    <p className="mx-auto mt-6 max-w-2xl text-center text-base font-medium text-ink text-balance">
      <WithPlaceholders text={progress.bridge} />
    </p>
  </section>
);

const TrackSection: React.FC<{ track: IndustryTrack; onNavigate: (path: RoutePath) => void }> = ({ track, onNavigate }) => {
  const dark = track.tone === 'dark';
  const Icon = track.icon;
  return (
    <section
      id={track.id}
      className={`mb-20 sm:mb-24 scroll-mt-24 rounded-2xl p-6 sm:p-10 lg:p-12 ${
        dark ? 'bg-ink text-white' : 'border border-line bg-surface'
      }`}
    >
      <div className="flex items-center gap-3 mb-8">
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${dark ? 'bg-white/10' : 'bg-accent'}`}>
          <Icon className={`w-5 h-5 ${dark ? 'text-accent-soft' : 'text-white'}`} aria-hidden="true" />
        </span>
        <p className={`text-sm font-mono uppercase tracking-wider font-semibold ${dark ? 'text-accent-soft' : 'text-accent'}`}>{track.label}</p>
      </div>

      {/* The challenge */}
      <motion.div {...fadeUp} className="max-w-3xl mb-10">
        <span className={`text-xs font-mono uppercase tracking-wider ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>The challenge</span>
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight font-display mt-1 mb-4 text-balance ${dark ? 'text-white' : 'text-ink'}`}>
          {track.challengeTitle}
        </h2>
        <p className={`text-base sm:text-lg leading-relaxed ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>{track.challengeBody}</p>
      </motion.div>

      {/* The offer */}
      <h3 className={`text-xs font-mono uppercase tracking-wider font-semibold mb-4 ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{track.itemsTitle}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {track.items.map((item, i) => {
          const ItemIcon = item.icon;
          return (
            <motion.div
              key={item.what}
              {...fadeUp}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`group rounded-xl p-5 transition-colors ${
                dark ? 'border border-white/10 bg-white/[0.04] hover:border-white/25' : 'border border-line bg-white hover:border-line-strong'
              }`}
            >
              <span
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                  dark ? 'bg-white/10 group-hover:bg-accent' : 'bg-accent/10 group-hover:bg-accent'
                }`}
              >
                <ItemIcon className={`w-4.5 h-4.5 transition-colors group-hover:text-white ${dark ? 'text-accent-soft' : 'text-accent'}`} aria-hidden="true" />
              </span>
              <dt className={`text-base font-bold font-display mb-1.5 ${dark ? 'text-white' : 'text-zinc-900'}`}>
                <WithPlaceholders text={item.what} />
              </dt>
              <dd className={`text-sm leading-relaxed ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.how}</dd>
            </motion.div>
          );
        })}
      </dl>

      {/* Lists */}
      <div className={`grid grid-cols-1 ${track.lists.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
        {track.lists.map((list) => (
          <div key={list.title}>
            <h3 className={`text-xs font-mono uppercase tracking-wider font-semibold mb-3 ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{list.title}</h3>
            <ul className="flex flex-wrap gap-2">
              {list.items.map((item) => (
                <li
                  key={item}
                  className={`rounded-full px-3 py-1 text-xs ${dark ? 'border border-white/15 text-zinc-200' : 'border border-line bg-white text-zinc-700'}`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {track.links && (
        <div className={`mt-8 pt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono font-semibold border-t ${dark ? 'border-white/10' : 'border-line'}`}>
          {track.links.map((link, i) => (
            <React.Fragment key={link.path}>
              {i > 0 && <span className={dark ? 'text-zinc-600' : 'text-zinc-300'} aria-hidden="true">·</span>}
              <a
                href={link.path}
                onClick={linkHandler(onNavigate, link.path)}
                className={`inline-flex items-center gap-1 ${dark ? 'text-accent-soft hover:text-white' : 'text-accent hover:text-accent-strong'}`}
              >
                {link.label} <span aria-hidden="true">→</span>
              </a>
            </React.Fragment>
          ))}
        </div>
      )}
    </section>
  );
};

export const IndustryPage: React.FC<IndustryPageProps> = ({ industry, onNavigate }) => {
  // What to show / typical uses: before or after the live example, as the copy orders it.
  const renderSpaces = () =>
    industry.spaces && (
          <section className="mb-20 sm:mb-24">
            <SectionHeading eyebrow={industry.spaces.eyebrow ?? 'What to show'} title={industry.spaces.title} />
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {industry.spaces.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.space} {...fadeUp} transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}>
                    <SpotlightCard className="h-full p-6 group">
                      <div className="flex items-start justify-between mb-4">
                        <span className="w-11 h-11 rounded-xl border border-line bg-surface flex items-center justify-center transition-colors group-hover:bg-accent group-hover:border-accent">
                          <Icon className="w-5 h-5 text-accent transition-colors group-hover:text-white" aria-hidden="true" />
                        </span>
                        <span className="font-mono text-xs text-zinc-300">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <dt className="text-base font-bold text-zinc-900 font-display mb-1.5">{item.space}</dt>
                      <dd className="text-sm text-zinc-600 leading-relaxed">{item.why}</dd>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </dl>
          </section>
    );

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
          <button type="button" onClick={() => onNavigate('/industries/')} className="hover:text-zinc-900 transition-colors">
            Industries
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <span className="text-accent font-semibold" aria-current="page">
            {industry.name}
          </span>
        </nav>

        {industry.draft && (
          <div role="note" className="mb-8 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-5 py-3.5 text-xs font-mono text-amber-900 leading-relaxed">
            Draft · copy written from our confirmed services and awaiting approval. Hidden from search until reviewed.
          </div>
        )}

        {/* 1. HERO + ANSWER SUMMARY */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-20 sm:mb-24">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-6 shadow-xs"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-semibold text-zinc-900">{industry.name}</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display text-balance mb-6 leading-[1.12]"
            >
              {industry.h1}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mb-8"
            >
              {industry.answer}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <button
                type="button"
                onClick={() => onNavigate(industry.primaryCta.path)}
                className={buttonClass('primary', 'md')}
              >
                <span>{industry.primaryCta.label}</span>
                <span className="ml-2 font-mono" aria-hidden="true">→</span>
              </button>
              <a
                href={`#${industry.secondaryCta.anchor}`}
                onClick={scrollTo(industry.secondaryCta.anchor)}
                className={buttonClass('secondary', 'md')}
              >
                {industry.secondaryCta.label}
                <span className="ml-2 font-mono text-accent" aria-hidden="true">↓</span>
              </a>
            </motion.div>
          </div>
          <div className="lg:col-span-5">
            <QuestionStack questions={industry.heroQuestions} />
          </div>
        </section>

        {/* 2. THE CHALLENGE (optional) */}
        {industry.challenge && (
        <motion.section
          {...fadeUp}
          id={industry.challenge.id}
          className="mb-20 sm:mb-24 max-w-4xl border-l-4 border-accent pl-6 sm:pl-8 scroll-mt-24"
        >
          <span className={eyebrowClass}>
            {industry.challenge.eyebrow ?? 'The challenge'}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1 mb-4 text-balance">
            {industry.challenge.title}
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">{industry.challenge.body}</p>
          {industry.challenge.more?.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </motion.section>
        )}

        {/* 3. THE EXPERIENCE WE CREATE (optional) */}
        {industry.experience && (
        <section className="mb-20 sm:mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <SectionHeading eyebrow={industry.experience.eyebrow ?? 'The experience we create'} title={industry.experience.title} className="max-w-2xl" />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono font-semibold shrink-0">
              {industry.experience.links.map((link, i) => (
                <React.Fragment key={link.path}>
                  {i > 0 && <span className="text-zinc-300" aria-hidden="true">·</span>}
                  <a href={link.path} onClick={goToLink(link.path)} className="text-accent hover:text-accent-strong inline-flex items-center gap-1">
                    {link.label} <span aria-hidden="true">→</span>
                  </a>
                </React.Fragment>
              ))}
            </div>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {industry.experience.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.what} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.06 }}>
                  <SpotlightCard className="h-full p-6 group">
                    <span className="w-11 h-11 rounded-xl border border-line bg-surface flex items-center justify-center mb-4 transition-colors group-hover:bg-accent group-hover:border-accent">
                      <Icon className="w-5 h-5 text-accent transition-colors group-hover:text-white" aria-hidden="true" />
                    </span>
                    <dt className="text-base font-bold text-zinc-900 font-display mb-2">
                      <WithPlaceholders text={item.what} />
                    </dt>
                    <dd className="text-sm text-zinc-600 leading-relaxed">{item.how}</dd>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </dl>
        </section>
        )}

        {/* PROGRESS OVER TIME (optional): dated captures beside the documented record */}
        {industry.progress && <ProgressEvidence progress={industry.progress} />}

        {/* AUDIENCE TRACKS (optional): one section per audience, light and dark */}
        {industry.tracks?.map((track) => (
          <TrackSection key={track.id} track={track} onNavigate={onNavigate} />
        ))}

        {/* ONE VISIT, TWO USES (optional) */}
        {industry.oneVisit && (
          <motion.section {...fadeUp} className="mb-20 sm:mb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <span className={eyebrowClass}>One visit, two uses</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1 mb-4 text-balance">
                {industry.oneVisit.title}
              </h2>
              <p className="text-base text-zinc-600 leading-relaxed">{industry.oneVisit.body}</p>
            </div>
            {/* Visual: one capture splitting into two outputs */}
            <div className="lg:col-span-7 rounded-2xl border border-line bg-surface p-6 sm:p-8" aria-hidden="true">
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center gap-2 rounded-xl bg-ink text-white px-4 py-3 text-sm font-semibold shadow-sm">
                  <ScanLine className="w-4 h-4 text-accent" />
                  One site visit
                </span>
                <svg viewBox="0 0 200 48" className="w-48 h-12" preserveAspectRatio="none">
                  <motion.path
                    d="M100 0 C100 24 40 24 40 48 M100 0 C100 24 160 24 160 48"
                    fill="none"
                    stroke="#E11D48"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                  />
                </svg>
                <div className="grid grid-cols-2 gap-4 w-full">
                  {industry.oneVisit.outputs.map((output) => {
                    const Icon = output.icon;
                    return (
                      <div key={output.label} className="rounded-xl border border-line bg-white p-4 text-center shadow-xs">
                        <span className="mx-auto mb-2 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-accent" />
                        </span>
                        <p className="text-sm font-bold text-zinc-900 font-display">{output.label}</p>
                        <p className="text-xs text-zinc-500">{output.line}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* TWO LIVES OF ONE RECORD (optional) */}
        {industry.twoLives && (
          <section id={industry.twoLives.id} className="mb-20 sm:mb-24 scroll-mt-24">
            <SectionHeading eyebrow="Two lives of one record" title={industry.twoLives.title} className="max-w-3xl mb-10" />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
              {industry.twoLives.columns.map((column, ci) => {
                const Icon = column.icon;
                const dark = ci === 0;
                return (
                  <motion.div
                    key={column.title}
                    {...fadeUp}
                    transition={{ duration: 0.45, delay: ci * 0.1 }}
                    className={`rounded-2xl p-6 sm:p-8 ${dark ? 'bg-ink text-white' : 'border border-line bg-surface'}`}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${dark ? 'bg-white/10' : 'bg-accent'}`}>
                        <Icon className={`w-5 h-5 ${dark ? 'text-accent-soft' : 'text-white'}`} aria-hidden="true" />
                      </span>
                      <h3 className={`text-lg sm:text-xl font-bold font-display ${dark ? 'text-white' : 'text-zinc-900'}`}>{column.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {column.items.map((item) => (
                        <li key={item} className={`flex items-start gap-3 text-sm sm:text-base leading-relaxed ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          <Check className={`w-4 h-4 mt-1 shrink-0 ${dark ? 'text-accent-soft' : 'text-accent'}`} aria-hidden="true" />
                          <span>
                            <WithPlaceholders text={item} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
              <span
                className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full border border-line bg-white px-4 py-2 shadow-md text-xs font-mono font-semibold text-accent whitespace-nowrap"
                aria-hidden="true"
              >
                One capture
              </span>
            </div>
          </section>
        )}

        {industry.spaces?.position === 'beforeLive' && renderSpaces()}

        {/* 4. LIVE EXAMPLE */}
        <section id="live-example" className="mb-20 sm:mb-24 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
            <SectionHeading eyebrow="Live example" title={industry.liveExample.title} className="" />
            {!industry.liveExample.embedUrl && <Placeholder>{industry.liveExample.pending}</Placeholder>}
          </div>
          <SplatEmbed initialDemo={industry.liveExample.demo} />
          <p className="mt-3 text-xs font-mono text-zinc-500">
            <WithPlaceholders text={industry.liveExample.caption} />
          </p>
          {industry.liveExample.description && (
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed max-w-3xl">
              <WithPlaceholders text={industry.liveExample.description} />
            </p>
          )}
        </section>

        {/* 5. AUDIENCES (optional) */}
        {industry.audiences && (
        <section className="mb-20 sm:mb-24 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {industry.audiences.map((audience, i) => {
            const Icon = audience.icon;
            return (
              <motion.div key={audience.title} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.1 }}>
                <SpotlightCard className="h-full group" contentClassName="h-full flex flex-col">
                  <div className="relative h-52 overflow-hidden bg-zinc-900">
                    <img loading="lazy" decoding="async"
                      src={audience.image}
                      alt={audience.imageAlt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-5 flex items-center gap-3">
                      <span className="w-10 h-10 rounded-lg bg-white/95 flex items-center justify-center shadow-xs">
                        <Icon className="w-5 h-5 text-accent" aria-hidden="true" />
                      </span>
                      <h3 className="text-xl font-bold text-white font-display">{audience.title}</h3>
                    </div>
                  </div>
                  <div className="p-6 sm:p-7 flex flex-col flex-1">
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">{audience.body}</p>
                    <div className="mt-auto pt-6">
                      <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-3">What to capture</h4>
                      <ul className="flex flex-wrap gap-2">
                        {audience.capture.map((item) => (
                          <li key={item} className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-zinc-700">
                            <WithPlaceholders text={item} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </section>
        )}

        {industry.spaces?.position !== 'beforeLive' && renderSpaces()}

        {/* WHAT A RECORD INCLUDES (optional) */}
        {industry.record && (
          <section id={industry.record.id} className="mb-20 sm:mb-24 scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <SectionHeading eyebrow="The record" title={industry.record.title} className="mb-6" />
              <div className="rounded-2xl border border-line bg-surface p-5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-2">Made with</h3>
                <p className="text-sm text-zinc-700 leading-relaxed">{industry.record.madeWith}</p>
                <a
                  href={industry.record.link.path}
                  onClick={goToLink(industry.record.link.path)}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-mono font-semibold text-accent hover:text-accent-strong"
                >
                  {industry.record.link.label} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
            <ol className="lg:col-span-7 space-y-3">
              {industry.record.items.map((item, i) => (
                <motion.li
                  key={item}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="flex items-start gap-4 rounded-xl border border-line bg-white p-4 sm:p-5 shadow-xs"
                >
                  <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-accent">
                    {i + 1}
                  </span>
                  <span className="text-sm sm:text-base text-zinc-700 leading-relaxed pt-1">
                    <WithPlaceholders text={item} />
                  </span>
                </motion.li>
              ))}
            </ol>
          </section>
        )}

        {/* TEXT SECTIONS (optional): features full width, cards in a grid */}
        {industry.textSections?.filter((section) => section.layout === 'feature').map((section) => {
          const Icon = section.icon;
          return (
            <motion.section
              key={section.id}
              id={section.id}
              {...fadeUp}
              className="mb-20 sm:mb-24 scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl border border-line bg-surface overflow-hidden"
            >
              {section.image && (
                <div className="lg:col-span-5 relative min-h-[240px] bg-zinc-900">
                  <img loading="lazy" decoding="async" src={section.image.src} alt={section.image.alt} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              <div className={`${section.image ? 'lg:col-span-7' : 'lg:col-span-12'} p-6 sm:p-10`}>
                <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {section.eyebrow}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1 mb-4 text-balance">
                  {section.title}
                </h2>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  <WithPlaceholders text={section.body} />
                </p>
                {section.links && (
                  <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono font-semibold">
                    {section.links.map((link, i) => (
                      <React.Fragment key={link.path}>
                        {i > 0 && <span className="text-zinc-300" aria-hidden="true">·</span>}
                        <a href={link.path} onClick={goToLink(link.path)} className="text-accent hover:text-accent-strong inline-flex items-center gap-1">
                          {link.label} <span aria-hidden="true">→</span>
                        </a>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>
          );
        })}
        {industry.textSections?.some((section) => section.layout === 'card') && (
          <div className="mb-20 sm:mb-24 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {industry.textSections
              .filter((section) => section.layout === 'card')
              .map((section, i) => {
                const Icon = section.icon;
                return (
                  <motion.section key={section.id} id={section.id} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.08 }} className="scroll-mt-24">
                    <SpotlightCard className="h-full group" contentClassName="h-full p-6 sm:p-7 flex flex-col">
                      <span className="w-11 h-11 rounded-xl border border-line bg-surface flex items-center justify-center mb-4 transition-colors group-hover:bg-accent group-hover:border-accent">
                        <Icon className="w-5 h-5 text-accent transition-colors group-hover:text-white" aria-hidden="true" />
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">{section.eyebrow}</span>
                      <h2 className="mt-1 text-xl font-bold text-zinc-900 font-display mb-3 text-balance">{section.title}</h2>
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        <WithPlaceholders text={section.body} />
                      </p>
                      {section.cta && (
                        <a
                          href={section.cta.path}
                          onClick={goToLink(section.cta.path)}
                          className="mt-auto pt-5 inline-flex items-center gap-1 text-xs font-mono font-semibold text-accent hover:text-accent-strong"
                        >
                          {section.cta.label} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </SpotlightCard>
                  </motion.section>
                );
              })}
          </div>
        )}

        {/* 6. WHERE IT WORKS FOR YOU (optional) */}
        {industry.channels && (
        <section className="mb-20 sm:mb-24">
          <SectionHeading eyebrow="Where it works for you" title={industry.channels.title} />
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {industry.channels.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.channel}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                  className="group flex items-start gap-4 rounded-xl border border-line bg-white p-5 hover:border-line-strong transition-colors"
                >
                  <span className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-accent">
                    <Icon className="w-4.5 h-4.5 text-accent transition-colors group-hover:text-white" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="text-sm font-bold text-zinc-900 font-display">{item.channel}</dt>
                    <dd className="mt-1 text-sm text-zinc-600 leading-relaxed">{item.how}</dd>
                  </div>
                </motion.div>
              );
            })}
          </dl>
        </section>
        )}

        {/* WAYS TO WORK TOGETHER (optional) */}
        {industry.workTogether && (
          <section id={industry.workTogether.id} className="mb-20 sm:mb-24 scroll-mt-24 rounded-2xl bg-ink text-white p-6 sm:p-10 lg:p-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <span className="text-xs font-mono uppercase tracking-wider text-accent-soft font-semibold">Ways to work together</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight font-display mt-1 text-balance">{industry.workTogether.title}</h2>
              </div>
              <a
                href={industry.workTogether.cta.path}
                onClick={goToLink(industry.workTogether.cta.path)}
                className={buttonClass('primary', 'md', 'shrink-0')}
              >
                {industry.workTogether.cta.label}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
            <ol className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {industry.workTogether.models.map((model, i) => {
                const Icon = model.icon;
                return (
                  <motion.li
                    key={model.model}
                    {...fadeUp}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="group rounded-xl border border-white/10 bg-white/[0.04] p-5 hover:border-white/25 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center transition-colors group-hover:bg-accent">
                        <Icon className="w-4.5 h-4.5 text-accent-soft transition-colors group-hover:text-white" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-xs text-zinc-500">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 className="text-base font-bold font-display mb-1.5">{model.model}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{model.description}</p>
                  </motion.li>
                );
              })}
            </ol>
            {industry.workTogether.note && (
              <p className="mt-6">
                <WithPlaceholders text={industry.workTogether.note} />
              </p>
            )}
          </section>
        )}

        {/* 7. PROOF (hidden until a project exists) */}
        {industry.proof.cards.length > 0 && (
        <section className="mb-20 sm:mb-24">
          <SectionHeading eyebrow="Proof" title={industry.proof.title} />
          <div className={industry.proof.cards.length > 1 ? 'grid grid-cols-1 lg:grid-cols-2 gap-5' : 'space-y-5'}>
            {industry.proof.cards.map((card) => (
              <a
                key={card.path}
                href={card.path}
                onClick={goToLink(card.path)}
                className={`group grid grid-cols-1 rounded-2xl border border-line bg-white overflow-hidden hover:border-line-strong hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.18)] transition-all ${
                  industry.proof.cards.length > 1 ? '' : 'md:grid-cols-12'
                }`}
              >
                <div className={`aspect-[16/9] overflow-hidden bg-zinc-900 ${industry.proof.cards.length > 1 ? '' : 'md:col-span-5 md:aspect-auto'}`}>
                  <img loading="lazy" decoding="async" src={card.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className={`p-6 sm:p-8 flex flex-col justify-center ${industry.proof.cards.length > 1 ? '' : 'md:col-span-7'}`}>
                  <p className="text-xs font-mono text-zinc-500">
                    <span className="font-semibold text-zinc-900">
                      <WithPlaceholders text={card.name} />
                    </span>{' '}
                    · {card.tag}
                  </p>
                  <p className="mt-3 text-lg sm:text-xl text-zinc-800 font-display font-semibold leading-snug">{card.line}</p>
                  {card.pending && (
                    <p className="mt-3">
                      <Placeholder>{card.pending}</Placeholder>
                    </p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-mono font-semibold text-accent">
                    See the story <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
        )}

        {/* 8. FAQ (#faq) */}
        <div id="faq" className="scroll-mt-24">
          <GuideFaq title={industry.faq.title} faqs={industry.faq.items.map((item) => ({ question: item.question, answer: <WithPlaceholders text={item.answer} /> }))} />
        </div>

        {/* 9. CTA BAND */}
        <section className="rounded-2xl border border-line bg-surface p-8 sm:p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-4 text-balance">{industry.cta.title}</h2>
            <p className="text-sm sm:text-base text-zinc-600 mb-8 leading-relaxed">{industry.cta.body}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button type="button" onClick={() => onNavigate(industry.primaryCta.path)} className={primaryButtonClass}>
                <span>{industry.primaryCta.label}</span>
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
