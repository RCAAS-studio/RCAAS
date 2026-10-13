import React, { useState } from 'react';
import { IMG } from '../data/images';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarClock,
  Check,
  Clapperboard,
  ClipboardCheck,
  Drone,
  Eye,
  FileCheck,
  Layers,
  LayoutGrid,
  MapPin,
  Maximize2,
  Rocket,
  Ruler,
  ScanLine,
  Search,
  Server,
  ZoomIn,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RoutePath } from '../types';
import { SITE_METADATA } from '../data/siteData';
import { isGuidePublished, readingMinutes } from '../data/guides';
import { Placeholder } from '../components/Placeholder';
import { SpotlightCard } from '../components/SpotlightCard';
import {
  FromOurProjects,
  GuideBreadcrumb,
  GuideCta,
  GuideFaq,
  GuideHeader,
  SectionHeading,
  ShortAnswer,
  fadeUp,
  linkHandler,
  pageShellClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../components/GuideParts';

interface CostGuidePageProps {
  onNavigate: (path: RoutePath) => void;
}

export const COST_GUIDE_PATH: RoutePath = '/learn/planning-a-3d-experience-cost-and-timeline/';

const H1 = 'Planning a 3D experience: what it costs and how long it takes';

const DIRECT_ANSWER_LEAD =
  'The cost of a 3D experience depends mainly on the size of the place, how many spaces you want to show, and what you want to create from the capture.';
const DIRECT_ANSWER_CAPTURE =
  'Capture usually takes a few hours to a day on site, and a finished experience is typically ready within';

interface CostFactor {
  id: string;
  factor: string;
  why: React.ReactNode;
  whyText: string;
  icon: LucideIcon;
}

const COST_FACTORS: CostFactor[] = [
  { id: 'size', factor: 'Size of the place', whyText: 'More area means more capture and processing time.', icon: Maximize2 },
  { id: 'spaces', factor: 'Number of spaces', whyText: 'Ten rooms cost more than three, even in the same building.', icon: LayoutGrid },
  {
    id: 'outside',
    factor: 'Inside, outside or both',
    whyText: 'Adding roofs, grounds and surroundings brings in aerial capture.',
    icon: Drone,
  },
  {
    id: 'detail',
    factor: 'Level of detail',
    whyText: 'Close-up detail (carvings, exhibits) takes longer to capture and process.',
    icon: ZoomIn,
  },
  {
    id: 'outputs',
    factor: 'What you want created',
    whyText: 'A tour alone, or a tour plus films, VR, AR or an interactive experience.',
    icon: Clapperboard,
  },
  {
    id: 'measured',
    factor: 'Measured data',
    whyText: 'Survey-grade accuracy, drawings and ground control add engineering time.',
    icon: Ruler,
  },
  { id: 'location', factor: 'Location', whyText: 'Sites outside the Kathmandu Valley add travel and logistics.', icon: MapPin },
  { id: 'permissions', factor: 'Permissions', whyText: 'Drone and heritage approvals add planning time.', icon: FileCheck },
  {
    id: 'hosting',
    factor: 'Hosting and updates',
    whyText: 'How long the experience is hosted and whether it will be updated.',
    icon: Server,
  },
].map((f) => ({
  ...f,
  why:
    f.id === 'location' ? (
      <>
        Sites outside <Placeholder>[[TBC: the Kathmandu Valley]]</Placeholder> add travel and logistics.
      </>
    ) : (
      f.whyText
    ),
}));

// S02: fill in includes, cost and timeline. If prices are not published, swap the cost
// line for a "Pricing basis" line and keep the timeline.
const TYPICAL_PROJECTS: { project: string; image: string; imageAlt: string; includes: string }[] = [
  {
    project: 'Boutique hotel tour',
    image: IMG['cost-guide/showcase-1'],
    imageAlt: 'Photorealistic 3D view of a boutique hotel',
    includes: '[[TBI: e.g. lobby, 3–5 room types, restaurant]]',
  },
  {
    project: 'School or college campus tour',
    image: IMG['cost-guide/showcase-2'],
    imageAlt: 'Photorealistic 3D view of a college campus',
    includes: '[[TBI: e.g. entrance, classrooms, labs, grounds]]',
  },
  {
    project: 'Show flat or property',
    image: IMG['cost-guide/showcase-3'],
    imageAlt: 'A 3D tour of an interior open on a screen',
    includes: '[[TBI]]',
  },
  {
    project: 'Heritage site documentation',
    image: IMG['cost-guide/showcase-4'],
    imageAlt: 'Photorealistic 3D scene of Chilancho Stupa',
    includes: '[[TBI: e.g. structure inside and out, drone coverage, measured record]]',
  },
  {
    project: 'Tour + fly-through film',
    image: IMG['cost-guide/showcase-5'],
    imageAlt: 'Fly-through film being made from a 3D scene',
    includes: '[[TBI]]',
  },
];

const PROJECTS_NOTE = 'These are starting points for planning. Every project is quoted to its size and goal.';

const STAGES: { stage: string; time: string | null; timeHint?: string; what: string; icon: LucideIcon; optional?: boolean }[] = [
  { stage: 'Discover', time: null, timeHint: 'e.g. a few days', what: 'We agree your goal, scope and deliverables, and send a proposal.', icon: Search },
  { stage: 'Permissions (if needed)', time: null, what: 'Drone flights and some heritage sites need approval.', icon: FileCheck, optional: true },
  { stage: 'Capture', time: 'A few hours to a day for most sites', what: 'Our team scans the place on the ground and from the air.', icon: ScanLine },
  { stage: 'Create', time: null, what: 'We process the data, build the experience and shape the story.', icon: Layers },
  { stage: 'Review', time: null, what: 'You review a preview and request changes.', icon: Eye },
  { stage: 'Launch', time: null, what: 'We publish and help you place it on your channels.', icon: Rocket },
];

const PREPARATION: { lead: string; text: string }[] = [
  { lead: 'Choose the spaces that matter most.', text: 'Think about what your audience needs to see to decide.' },
  { lead: 'Tidy and stage.', text: 'Clear clutter, make beds, turn on lights, open curtains.' },
  {
    lead: 'Plan for quiet.',
    text: 'Fewer people moving through gives the cleanest result. Weekends, holidays or early mornings often work well.',
  },
  { lead: 'Arrange access.', text: 'Keys, doors, rooftops and any restricted areas.' },
  {
    lead: 'Share what you have.',
    text: 'Existing drawings, your logo and brand colours, and where the experience will be used.',
  },
  { lead: 'Tell people.', text: 'Let staff, guests or students know that capture is happening.' },
  { lead: 'For heritage sites:', text: 'confirm who gives permission, and any rules or times to avoid.' },
];

const PROVIDER_QUESTIONS: { question: string; why: string }[] = [
  { question: 'Is it a true 3D tour or a 360° photo tour?', why: 'They are different products with different results.' },
  { question: 'Can I see a live example on my phone?', why: 'The best test is how it feels to your audience.' },
  { question: 'Who owns the files, and what happens if hosting ends?', why: 'Avoid losing your experience later.' },
  { question: 'How are people and faces handled?', why: 'Protect guests, students and staff.' },
  {
    question: 'Can I embed it on my website and add booking or enquiry buttons?',
    why: 'The tour should lead to action.',
  },
  { question: 'Can it be updated after a renovation?', why: 'Places change; your experience should too.' },
  { question: 'If I need measurements, how accurate is the data?', why: 'Visual tours and measured data are not the same.' },
];

// None of these answers is resolved yet, so no FAQPage schema is emitted for this guide.
const COST_FAQS = [
  { question: 'Do you charge per square metre or per space?', answer: <Placeholder>[[TBI: pricing basis]]</Placeholder> },
  { question: 'Are there ongoing costs?', answer: <Placeholder>[[TBI: hosting fees, renewal, updates]]</Placeholder> },
  {
    question: 'Can we start small and add more later?',
    answer: (
      <Placeholder>
        [[TBC: "Yes. Many clients start with their most important spaces and add more, or add films and VR, later from the same capture."]]
      </Placeholder>
    ),
  },
  {
    question: 'Do you work outside Kathmandu?',
    answer: <Placeholder>[[TBC: "Yes, across Nepal. Travel and logistics are included in your proposal."]]</Placeholder>,
  },
];

const CTA_BODY =
  "Tell us about your place, the spaces you want to show and your timeline. We'll send a clear proposal with no surprises.";

export const READING_MINUTES = readingMinutes([
  H1,
  DIRECT_ANSWER_LEAD,
  DIRECT_ANSWER_CAPTURE,
  ...COST_FACTORS.flatMap((f) => [f.factor, f.whyText]),
  ...TYPICAL_PROJECTS.map((p) => p.project),
  PROJECTS_NOTE,
  ...STAGES.flatMap((s) => [s.stage, s.time ?? '', s.what]),
  ...PREPARATION.flatMap((p) => [p.lead, p.text]),
  ...PROVIDER_QUESTIONS.flatMap((q) => [q.question, q.why]),
  ...COST_FAQS.map((f) => f.question),
  CTA_BODY,
]);

export const CostGuidePage: React.FC<CostGuidePageProps> = ({ onNavigate }) => {
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [prepDone, setPrepDone] = useState<number[]>([]);
  const goToLink = (path: RoutePath) => linkHandler(onNavigate, path);
  const isDraft = !isGuidePublished(COST_GUIDE_PATH);

  const toggleFactor = (id: string) =>
    setSelectedFactors((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  const togglePrep = (idx: number) =>
    setPrepDone((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));

  const askForQuote = () => onNavigate('/contact/?type=project' as RoutePath);

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <GuideBreadcrumb label="Cost and timeline" onNavigate={onNavigate} />

        {isDraft && (
          <div role="note" className="mb-8 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-5 py-3.5 text-xs font-mono text-amber-900">
            Draft · not listed on the Learn page and hidden from search until the pricing basis, example ranges and
            timelines are input (Register S01, S02).
          </div>
        )}

        <article>
          <GuideHeader eyebrow="Transparent pricing" title={H1} minutes={READING_MINUTES} />

          {/* 1. DIRECT ANSWER */}
          <ShortAnswer
            text={
              <>
                {DIRECT_ANSWER_LEAD}{' '}
                <Placeholder>[[TBI: "In Nepal, a 3D virtual tour of a typical [hotel / campus] starts from around NPR [X]."]]</Placeholder>{' '}
                {DIRECT_ANSWER_CAPTURE} <Placeholder>[[TBI: time]]</Placeholder>.
              </>
            }
          />

          {/* 2. WHAT AFFECTS THE COST: tap the factors that apply */}
          <section className="mb-20 sm:mb-28">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <SectionHeading eyebrow="Cost factors" title="What affects the cost" className="" />
              <p className="text-xs font-mono text-zinc-500 md:text-right">Tap the factors that apply to your place.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COST_FACTORS.map((factor, i) => {
                const Icon = factor.icon;
                const isOn = selectedFactors.includes(factor.id);
                return (
                  <motion.div key={factor.id} {...fadeUp} transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}>
                    <button
                      type="button"
                      aria-pressed={isOn}
                      onClick={() => toggleFactor(factor.id)}
                      className={`group h-full w-full text-left rounded-lg border p-5 flex items-start gap-4 transition-all ${
                        isOn
                          ? 'border-accent bg-accent/[0.04] shadow-[0_8px_24px_-6px_rgba(225,29,72,0.18)]'
                          : 'border-line bg-white hover:border-line-strong hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)]'
                      }`}
                    >
                      <span
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isOn ? 'bg-accent text-white' : 'border border-line bg-surface text-accent'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                      </span>
                      <span className="flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-base font-bold text-zinc-900 font-display">{factor.factor}</span>
                          <span
                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isOn ? 'bg-accent border-accent' : 'border-zinc-300 bg-white'
                            }`}
                            aria-hidden="true"
                          >
                            {isOn && <Check className="w-3 h-3 text-white" />}
                          </span>
                        </span>
                        <span className="block mt-1.5 text-xs sm:text-sm text-zinc-600 leading-relaxed">{factor.why}</span>
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Running summary */}
            <div className="mt-6 rounded-xl border border-line bg-surface p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-900 font-display" aria-live="polite">
                  {selectedFactors.length === 0
                    ? 'Select the factors that apply, then ask for a quote.'
                    : `${selectedFactors.length} of ${COST_FACTORS.length} factors apply to your place`}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-white border border-line overflow-hidden" aria-hidden="true">
                  <motion.div
                    className="h-full w-full origin-left bg-accent"
                    initial={false}
                    animate={{ scaleX: selectedFactors.length / COST_FACTORS.length }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                {selectedFactors.length > 0 && (
                  <p className="mt-2 text-xs font-mono text-zinc-500">
                    {COST_FACTORS.filter((f) => selectedFactors.includes(f.id))
                      .map((f) => f.factor)
                      .join(' · ')}
                  </p>
                )}
              </div>
              <button type="button" onClick={askForQuote} className={`${primaryButtonClass} sm:!w-auto shrink-0 !py-3`}>
                <span>Ask for a quote</span>
                <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </section>

          {/* 3. TYPICAL PROJECTS (S02) */}
          <section className="mb-20 sm:mb-28">
            <SectionHeading eyebrow="Examples" title="Typical projects" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {TYPICAL_PROJECTS.map((project, i) => (
                <motion.div key={project.project} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.06 }}>
                  <SpotlightCard className="h-full group" contentClassName="h-full flex flex-col">
                    <div className="h-32 overflow-hidden bg-zinc-900">
                      <img loading="lazy" decoding="async"
                        src={project.image}
                        alt={project.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-sm font-bold text-zinc-900 font-display mb-3">{project.project}</h3>
                      <dl className="space-y-3 text-xs">
                        <div>
                          <dt className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Usually includes</dt>
                          <dd className="mt-1">
                            <Placeholder>{project.includes}</Placeholder>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Typical cost</dt>
                          <dd className="mt-1">
                            <Placeholder>[[TBI]]</Placeholder>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Typical timeline</dt>
                          <dd className="mt-1">
                            <Placeholder>[[TBI]]</Placeholder>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>

            <p className="mt-6 text-sm text-zinc-600 flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
              <span>{PROJECTS_NOTE}</span>
            </p>
          </section>

          {/* 4. HOW LONG IT TAKES (S01) */}
          <section className="mb-20 sm:mb-28">
            <SectionHeading eyebrow="Timeline" title="How long it takes" />

            <ol className="relative grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Connecting rail on large screens */}
              <span className="hidden lg:block absolute left-[8%] right-[8%] top-6 h-px bg-line" aria-hidden="true" />
              {STAGES.map((stage, i) => {
                const Icon = stage.icon;
                return (
                  <motion.li key={stage.stage} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.07 }} className="relative">
                    <div className="flex lg:flex-col items-start lg:items-center gap-4 lg:gap-3 lg:text-center">
                      <span
                        className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          stage.optional
                            ? 'border-2 border-dashed border-zinc-300 bg-white text-zinc-500'
                            : 'border border-line bg-white text-accent shadow-xs'
                        }`}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div>
                        <span className="font-mono text-[11px] text-zinc-400">0{i + 1}</span>
                        <h3 className="text-sm font-bold text-zinc-900 font-display">{stage.stage}</h3>
                        <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-mono text-zinc-800">
                          <CalendarClock className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                          {stage.time ?? <Placeholder>{stage.timeHint ? `[[TBI: ${stage.timeHint}]]` : '[[TBI]]'}</Placeholder>}
                        </p>
                        <p className="mt-2 text-xs text-zinc-600 leading-relaxed">{stage.what}</p>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>

            <motion.div
              {...fadeUp}
              className="mt-8 rounded-xl border border-accent/25 bg-accent/[0.04] p-5 flex items-start gap-3"
            >
              <CalendarClock className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-zinc-700 leading-relaxed">
                <strong className="text-zinc-900">Tip:</strong> If your experience is for a launch, admissions season or a
                tourism fair, contact us at least <Placeholder>[[TBI: lead time]]</Placeholder> before.
              </p>
            </motion.div>
          </section>

          {/* 5. HOW TO PREPARE: interactive checklist; all text stays visible */}
          <section className="mb-20 sm:mb-28">
            <motion.div
              {...fadeUp}
              className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl border border-line bg-surface overflow-hidden"
            >
              <div className="lg:col-span-5 relative min-h-[240px] bg-zinc-900">
                <img loading="lazy" decoding="async"
                  src={IMG['cost-guide/team-member-capturing-a-heritage-square-with-a-h']}
                  alt="Team member capturing a heritage square with a handheld laser scanner"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 border border-line p-4 rounded-xl shadow-sm">
                  <p className="text-xs font-mono text-zinc-500 mb-1.5" aria-live="polite">
                    {prepDone.length} of {PREPARATION.length} ready
                  </p>
                  <div className="h-1.5 rounded-full bg-surface-sunken overflow-hidden" aria-hidden="true">
                    <motion.div
                      className="h-full w-full origin-left bg-emerald-500"
                      initial={false}
                      animate={{ scaleX: prepDone.length / PREPARATION.length }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 p-6 sm:p-10">
                <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold inline-flex items-center gap-1.5">
                  <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  Checklist
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1 mb-6 text-balance">
                  How to prepare for capture day
                </h2>

                <ul className="space-y-2.5">
                  {PREPARATION.map((item, idx) => {
                    const done = prepDone.includes(idx);
                    return (
                      <li key={item.lead}>
                        <label
                          className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${
                            done ? 'border-emerald-300 bg-emerald-50/60' : 'border-line bg-white hover:border-zinc-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={() => togglePrep(idx)}
                            className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-emerald-600 shrink-0"
                          />
                          <span className={`text-sm leading-relaxed ${done ? 'text-zinc-500' : 'text-zinc-600'}`}>
                            <strong className={`font-semibold ${done ? 'text-zinc-600 line-through' : 'text-zinc-900'}`}>
                              {item.lead}
                            </strong>{' '}
                            {item.text}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          </section>

          {/* 6. QUESTIONS TO ASK ANY PROVIDER */}
          <section className="mb-20 sm:mb-28">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <SectionHeading eyebrow="Before you hire" title="Questions to ask before you hire anyone" className="max-w-2xl" />
              <a
                href="/learn/3d-virtual-tour-vs-360-tour-vs-video/"
                onClick={goToLink('/learn/3d-virtual-tour-vs-360-tour-vs-video/')}
                className="shrink-0 text-xs font-mono font-semibold text-accent hover:text-accent-strong inline-flex items-center gap-1 transition-colors"
              >
                3D tour vs 360° tour vs video <span aria-hidden="true">→</span>
              </a>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROVIDER_QUESTIONS.map((item, i) => (
                <motion.div key={item.question} {...fadeUp} transition={{ duration: 0.4, delay: (i % 2) * 0.06 }}>
                  <SpotlightCard className="h-full p-5 sm:p-6 group">
                    <div className="flex items-start gap-4">
                      <span className="font-mono text-sm font-bold text-accent w-7 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <dt className="text-base font-bold text-zinc-900 font-display">{item.question}</dt>
                        <dd className="mt-1.5 text-sm text-zinc-600 leading-relaxed">{item.why}</dd>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </dl>
          </section>

          {/* 7. FROM OUR PROJECTS (#from-our-projects): L02 required before publishing */}
          <FromOurProjects
            title="What we've seen in practice"
            items={[
              'actual capture times for a hotel and a campus',
              'how long clients took to review',
              'what most often delayed projects (permissions, access, weather)',
            ]}
          />

          {/* 8. COMMON QUESTIONS */}
          <GuideFaq faqs={COST_FAQS} />
        </article>

        {/* 9. CALL TO ACTION BAND */}
        <GuideCta title="Get a clear price for your place" body={CTA_BODY} icons={[Maximize2, LayoutGrid, CalendarClock]}>
          <button type="button" onClick={askForQuote} className={primaryButtonClass}>
            <span>Ask for a quote</span>
            <span className="ml-2 font-mono" aria-hidden="true">→</span>
          </button>
          <a href={SITE_METADATA.whatsappUrl} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
            <span>Chat on WhatsApp</span>
            <span aria-hidden="true">↗</span>
          </a>
        </GuideCta>
      </div>
    </div>
  );
};
