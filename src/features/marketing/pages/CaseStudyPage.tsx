import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Camera,
  Eye,
  Flag,
  Layers,
  MapPin,
  Package,
  Radio,
  ScanLine,
  Target,
  Users,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import { CASE_STUDY_CONTENT, caseStudyPath, findCaseStudy, isCaseStudyPublished } from '../content/work';
import type { CaseStudyContent } from '../content/work';
import { Placeholder, WithPlaceholders } from '../components/Placeholder';
import { SplatEmbed } from '../components/SplatEmbed';
import { fadeUp, linkHandler, pageShellClass, primaryButtonClass, secondaryButtonClass } from '../components/GuideParts';
import { buttonClass, eyebrowClass } from '../components/ui';

interface CaseStudyPageProps {
  study: CaseStudyContent;
  onNavigate: (path: RoutePath) => void;
}

const SNAPSHOT_ICONS: Record<string, LucideIcon> = {
  Client: Briefcase,
  Goal: Target,
  Audience: Users,
  'Experience delivered': Layers,
  Channels: Radio,
  Location: MapPin,
  Date: CalendarDays,
  Methods: ScanLine,
};

const STORY_STEPS: { key: 'challenge' | 'story' | 'built'; label: string; title: string; icon: LucideIcon }[] = [
  { key: 'challenge', label: '01', title: 'The challenge', icon: Flag },
  { key: 'story', label: '02', title: 'The story we told', icon: Eye },
  { key: 'built', label: '03', title: 'What we built', icon: Wrench },
];

export const CaseStudyPage: React.FC<CaseStudyPageProps> = ({ study, onNavigate }) => {
  const goToLink = (path: RoutePath) => linkHandler(onNavigate, path);
  const published = isCaseStudyPublished(study);
  const next = findCaseStudy(study.nextSlug) ?? CASE_STUDY_CONTENT[0];
  const index = CASE_STUDY_CONTENT.indexOf(study);

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-10 overflow-x-auto whitespace-nowrap pb-1">
          <button type="button" onClick={() => onNavigate('/')} className="hover:text-zinc-900 transition-colors">
            Home
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <button type="button" onClick={() => onNavigate('/work/')} className="hover:text-zinc-900 transition-colors">
            Our Work
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <span className="text-accent font-semibold" aria-current="page">
            {study.name}
          </span>
        </nav>

        {!published && (
          <div role="note" className="mb-8 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-5 py-3.5 text-xs font-mono text-amber-900 leading-relaxed">
            Draft · hidden from search until this case study has its 3D link, location and date (Register W0{index + 1}).
          </div>
        )}

        <article>
          {/* HERO */}
          <header className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16 sm:mb-20">
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-6 shadow-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span className="font-semibold text-zinc-900">Case study</span>
                <span className="text-zinc-400">·</span>
                <span>{study.industryLabel}</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="text-3xl sm:text-5xl font-bold tracking-tight text-ink font-display text-balance leading-[1.12]"
              >
                {study.h1}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="mt-6 flex items-start gap-3 text-lg sm:text-xl text-zinc-700 leading-relaxed"
              >
                <span className="mt-2.5 h-2 w-2 rounded-full bg-accent shrink-0" aria-hidden="true" />
                {study.heroResult}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <a
                  href="#live-experience"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('live-experience')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={buttonClass('primary', 'md')}
                >
                  Explore in 3D <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                </a>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-6"
            >
              <div className="relative rounded-2xl overflow-hidden border border-line bg-surface p-3 shadow-lg">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-zinc-900">
                  <img loading="lazy" decoding="async" src={study.image} alt={study.imageAlt} className="w-full h-full object-cover" />
                </div>
              </div>
            </motion.div>
          </header>

          {/* SNAPSHOT */}
          <section aria-labelledby="snapshot-heading" className="mb-20 sm:mb-24">
            <h2 id="snapshot-heading" className="text-xs font-mono uppercase tracking-wider text-accent font-semibold mb-4">
              Snapshot
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl border border-line bg-line overflow-hidden">
              {study.snapshot.map((row) => {
                const Icon = SNAPSHOT_ICONS[row.label] ?? Briefcase;
                return (
                  <div key={row.label} className="bg-white p-5">
                    <dt className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                      <Icon className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                      {row.label}
                    </dt>
                    <dd className="mt-2 text-sm text-zinc-900 font-medium leading-relaxed">
                      <WithPlaceholders text={row.value} />
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>

          {/* LIVE EXPERIENCE */}
          <section id="live-experience" className="mb-20 sm:mb-24 scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
              <div>
                <span className={eyebrowClass}>Live experience</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1">{study.embedCaption}</h2>
              </div>
              {!study.embedUrl && <Placeholder>[[TBI: URL]]</Placeholder>}
            </div>
            <SplatEmbed initialDemo={study.embedDemo} />
          </section>

          {/* CHALLENGE → STORY → WHAT WE BUILT */}
          <section className="mb-20 sm:mb-24">
            <ol className="relative space-y-6 max-w-4xl">
              <span className="absolute left-[1.375rem] top-4 bottom-4 w-px bg-line" aria-hidden="true" />
              {STORY_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.li key={step.key} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.08 }} className="relative flex gap-5">
                    <span className="relative z-10 w-11 h-11 rounded-full bg-white border-2 border-accent flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5 text-accent" aria-hidden="true" />
                    </span>
                    <div className="flex-1 rounded-2xl border border-line bg-surface p-6 sm:p-7">
                      <span className="font-mono text-[11px] text-zinc-400">{step.label}</span>
                      <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 font-display mb-3">{step.title}</h2>
                      <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                        <WithPlaceholders text={study[step.key]} />
                      </p>
                      {step.key === 'built' && (
                        <div className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-white p-4">
                          <Package className="w-4 h-4 text-accent mt-0.5 shrink-0" aria-hidden="true" />
                          <div>
                            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">What the client received</h3>
                            <p className="text-sm text-zinc-800 leading-relaxed">
                              <WithPlaceholders text={study.received} />
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </section>

          {/* RESULTS and CLIENT VOICE: shown only when real */}
          {study.results && (
            <section className="mb-20 sm:mb-24 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-7 sm:p-9 max-w-4xl">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold">Results</span>
              <p className="mt-2 text-lg text-zinc-800 leading-relaxed">{study.results}</p>
            </section>
          )}
          {study.clientVoice && (
            <figure className="mb-20 sm:mb-24 max-w-4xl">
              <blockquote className="text-2xl sm:text-3xl font-bold text-zinc-900 font-display leading-snug">“{study.clientVoice.quote}”</blockquote>
              <figcaption className="mt-4 text-sm font-mono text-zinc-500">
                {study.clientVoice.name}, {study.clientVoice.role}
              </figcaption>
            </figure>
          )}
          {!published && (!study.results || !study.clientVoice) && (
            <div className="mb-20 sm:mb-24 max-w-4xl rounded-xl border border-dashed border-zinc-300 px-5 py-4 text-xs font-mono text-zinc-500 space-y-2">
              <p>Review note · Results and Client voice are left off the page until real:</p>
              {!study.results && (
                <p>
                  Results: <Placeholder>{study.resultsPending}</Placeholder>
                </p>
              )}
              {!study.clientVoice && (
                <p>
                  Client voice: <Placeholder>{study.clientVoicePending}</Placeholder>
                </p>
              )}
            </div>
          )}

          {/* GALLERY */}
          <section className="mb-20 sm:mb-24">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mb-6">Gallery</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {study.gallery.map((view) => (
                <figure key={view} className="rounded-2xl border-2 border-dashed border-line bg-surface aspect-[4/3] flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <Camera className="w-6 h-6 text-zinc-300" aria-hidden="true" />
                  <figcaption>
                    <Placeholder>[[TBI: {view}]]</Placeholder>
                  </figcaption>
                </figure>
              ))}
            </div>
            {study.galleryAlt && <p className="mt-3 text-[11px] font-mono text-zinc-400">Alt pattern: {study.galleryAlt}</p>}
          </section>

          {/* WHAT WE USED */}
          <section className="mb-20 sm:mb-24">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mb-6">What we used</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...study.used.map((link) => ({ ...link, kind: 'Service' })), { ...study.industry, kind: 'Industry' }].map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={goToLink(link.path)}
                  className="group flex items-center gap-3 rounded-xl border border-line bg-white p-4 hover:border-accent transition-colors"
                >
                  <span className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-accent">
                    {link.kind === 'Industry' ? (
                      <Users className="w-4.5 h-4.5 text-accent group-hover:text-white" aria-hidden="true" />
                    ) : (
                      <Layers className="w-4.5 h-4.5 text-accent group-hover:text-white" aria-hidden="true" />
                    )}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">{link.kind}</span>
                    <span className="block text-sm font-semibold text-zinc-900">{link.label}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-300 transition-all group-hover:text-accent group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              ))}
            </div>
            {study.usedPending && (
              <p className="mt-3">
                <Placeholder>{study.usedPending}</Placeholder>
              </p>
            )}
          </section>
        </article>

        {/* NEXT STORY */}
        <a
          href={caseStudyPath(next)}
          onClick={goToLink(caseStudyPath(next))}
          className="group mb-16 grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-line bg-white overflow-hidden hover:border-line-strong hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.18)] transition-all"
        >
          <div className="md:col-span-4 aspect-[16/9] md:aspect-auto overflow-hidden bg-zinc-900">
            <img loading="lazy" decoding="async" src={next.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="md:col-span-8 p-6 sm:p-8 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Next story</span>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-zinc-900 font-display group-hover:text-accent transition-colors">{next.name}</p>
              <p className="mt-1 text-sm text-zinc-600">{next.heroResult}</p>
            </div>
            <span className="w-11 h-11 rounded-full border border-line flex items-center justify-center shrink-0 transition-colors group-hover:bg-accent group-hover:border-accent">
              <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-white" aria-hidden="true" />
            </span>
          </div>
        </a>

        {/* CTA BAND */}
        <section className="rounded-2xl border border-line bg-surface p-8 sm:p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-display mb-4 text-balance">Have a place with a story to tell?</h2>
            <p className="text-sm sm:text-base text-zinc-600 mb-8 leading-relaxed">
              Tell us about your place and what you want people to do. We'll suggest the right experience and send a clear
              proposal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button type="button" onClick={() => onNavigate('/contact/?type=project' as RoutePath)} className={primaryButtonClass}>
                <span>Plan your experience</span>
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
