import React from 'react';
import { IMG } from '../data/images';
import { motion } from 'framer-motion';
import { ArrowRight, Box, Check, Film, Orbit } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RoutePath } from '../types';
import { isGuidePublished, readingMinutes } from '../data/guides';
import { Placeholder } from '../components/Placeholder';
import { SpotlightCard } from '../components/SpotlightCard';
import { eyebrowClass } from '../components/ui';
import {
  ComparisonTable,
  FromOurProjects,
  GuideBreadcrumb,
  GuideCta,
  GuideFaq,
  GuideHeader,
  GuideSources,
  SectionHeading,
  ShortAnswer,
  fadeUp,
  linkHandler,
  pageShellClass,
  primaryButtonClass,
} from '../components/GuideParts';

interface ComparisonGuidePageProps {
  onNavigate: (path: RoutePath) => void;
}

const COST_GUIDE_PATH: RoutePath = '/learn/planning-a-3d-experience-cost-and-timeline/';

const H1 = '3D virtual tour vs 360° tour vs video: which should you choose?';

const DIRECT_ANSWER =
  'Choose a 3D virtual tour when people need a true sense of a space before they decide, such as a hotel room, a campus or a property. Choose a 360° photo tour for a quick, low-cost overview. Choose video for emotion, storytelling and social media. The strongest results often combine a 3D tour with short video made from the same visit.';

type FormatId = 'tour360' | 'video' | 'tour3d';

interface Format {
  id: FormatId;
  name: string;
  icon: LucideIcon;
  howItWorks: string;
}

const FORMATS: Format[] = [
  {
    id: 'tour360',
    name: '360° photo tour',
    icon: Orbit,
    howItWorks:
      "A 360° tour is a set of panoramic photos taken from fixed spots. Viewers look around in every direction from each spot, then click to jump to the next one. Some platforms add a simple 3D overview built from depth data. It's quick to produce and familiar to most people.",
  },
  {
    id: 'video',
    name: 'Video',
    icon: Film,
    howItWorks:
      "A video, including drone footage, shows a place along a path chosen by the filmmaker. You control the pace, the angles, the music and the story. Viewers watch; they don't explore.",
  },
  {
    id: 'tour3d',
    name: '3D virtual tour',
    icon: Box,
    howItWorks:
      "A 3D virtual tour is a full 3D model of the place. Viewers move freely through it and see it from any angle, rather than jumping between fixed points. Modern photorealistic techniques such as Gaussian splatting make the model look like a photograph you can walk into, and when it's built on laser measurements, it's true to the real size and layout.",
  },
];

const COMPARISON_ROWS: { label: string; values: Record<FormatId, string> }[] = [
  {
    label: 'How people explore',
    values: {
      tour360: 'Look around from fixed spots, jump between them',
      video: 'Watch a fixed path',
      tour3d: 'Move freely, any angle',
    },
  },
  {
    label: 'Sense of size and layout',
    values: { tour360: 'Partial', video: 'Limited', tour3d: 'Close to being there' },
  },
  {
    label: 'Visual feel',
    values: { tour360: 'Photographic, but flat between spots', video: 'Cinematic', tour3d: 'Photorealistic and continuous' },
  },
  {
    label: 'Storytelling control',
    values: { tour360: 'Low', video: 'High', tour3d: 'Medium (guided paths and hotspots can add it)' },
  },
  {
    label: 'Production effort',
    values: { tour360: 'Low', video: 'Medium to high', tour3d: 'Medium' },
  },
  {
    label: 'Loading on mobile',
    values: { tour360: 'Light', video: 'Streams easily', tour3d: 'Heavier; best loaded on demand' },
  },
  {
    label: 'Can it be measured?',
    values: { tour360: 'Rarely', video: 'No', tour3d: 'Yes, when built on laser scans' },
  },
  {
    label: 'Best channels',
    values: {
      tour360: 'Listings, maps',
      video: 'Social media, ads, website hero',
      tour3d: 'Website, enquiries, sales and admissions',
    },
  },
  {
    label: 'Best at',
    values: {
      tour360: 'Quick, affordable overviews',
      video: 'Emotion and attention',
      tour3d: 'Helping people decide with confidence',
    },
  },
];

const CHOOSE: Record<FormatId, { heading: string; reasons: string[] }> = {
  tour360: {
    heading: 'Choose a 360° tour if:',
    reasons: [
      'you need something quickly and on a tight budget',
      'your spaces are simple and similar',
      'people mainly need to check that a place exists and looks as described',
    ],
  },
  video: {
    heading: 'Choose video if:',
    reasons: [
      'you want to create emotion and attention, especially on social media',
      'you are telling a story about people, events or atmosphere',
      'you need a short piece for an ad or a website hero',
    ],
  },
  tour3d: {
    heading: 'Choose a 3D virtual tour if:',
    reasons: [
      'the decision is significant: booking a stay, choosing a school, buying or renting a property',
      'size, layout and flow matter to your audience',
      "your audience can't easily visit in person",
      'you also need accurate measurements, or a record that lasts',
    ],
  },
};

const COMBINATION =
  'Video gets attention; a 3D tour helps people decide. A common pattern is to use a short fly-through film on social media and in ads, and link it to the full 3D tour on your website, where interested visitors can explore in their own time. When both come from the same 3D capture, they look consistent, and you pay for one site visit instead of two.';

export const COMPARISON_FAQS: { question: string; answer: string }[] = [
  {
    question: 'Is a 3D tour just a better 360° tour?',
    answer:
      'Not exactly. They are different formats. A 360° tour is a set of panoramas; a 3D tour is a full model of the space. 3D gives more freedom and a truer sense of space, while 360° is quicker and lighter. Each fits different needs.',
  },
  {
    question: 'Will a 3D tour work on phones?',
    answer:
      'Yes. Photorealistic 3D tours run in modern mobile browsers with nothing to install. They are heavier than photos, so they work best when loaded only when the viewer chooses to open them.',
  },
  {
    question: 'Can I make a video from a 3D tour?',
    answer:
      "Yes. Once a place is captured in 3D, cinematic fly-through films and still images can be produced from the model, including camera moves a normal camera can't make.",
  },
  {
    question: 'Which is cheapest?',
    answer:
      'Usually a 360° photo tour, then 3D, with video varying the most depending on production. The better question is which one will help your audience decide.',
  },
];

const CTA_BODY =
  "Tell us about your place and your audience. We'll recommend the right format, or mix, and explain why.";

export const READING_MINUTES = readingMinutes([
  H1,
  DIRECT_ANSWER,
  ...FORMATS.flatMap((f) => [f.name, f.howItWorks]),
  ...COMPARISON_ROWS.flatMap((r) => [r.label, ...Object.values(r.values)]),
  ...Object.values(CHOOSE).flatMap((c) => [c.heading, ...c.reasons]),
  COMBINATION,
  ...COMPARISON_FAQS.flatMap((f) => [f.question, f.answer]),
  CTA_BODY,
]);

// Decorative diagrams of how a viewer moves through each format.
const FormatDiagram: React.FC<{ id: FormatId }> = ({ id }) => {
  if (id === 'tour360') {
    const spots = [40, 120, 200];
    return (
      <svg viewBox="0 0 240 90" className="w-full h-20" aria-hidden="true">
        {spots.slice(0, -1).map((x) => (
          <path key={x} d={`M${x + 14} 45 Q${x + 40} 18 ${x + 66} 45`} fill="none" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="4 4" />
        ))}
        {spots.map((x, i) => (
          <g key={x}>
            <circle cx={x} cy="45" r="12" fill="#FFF" stroke="#D4D4D8" strokeWidth="1.5" />
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: i * 0.3 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <circle cx={x} cy="45" r="12" fill="none" stroke="#E11D48" strokeWidth="2" strokeDasharray="10 66" />
            </motion.g>
            <circle cx={x} cy="45" r="3" fill="#E11D48" />
          </g>
        ))}
      </svg>
    );
  }
  if (id === 'video') {
    return (
      <svg viewBox="0 0 240 90" className="w-full h-20" aria-hidden="true">
        <path d="M20 65 C70 10 120 80 170 35 S220 30 225 30" fill="none" stroke="#D4D4D8" strokeWidth="1.5" />
        <motion.path
          d="M20 65 C70 10 120 80 170 35 S220 30 225 30"
          fill="none"
          stroke="#E11D48"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }}
        />
        <path d="M218 24 L228 30 L218 36 Z" fill="#E11D48" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 90" className="w-full h-20" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`h${i}`} x1="20" x2="220" y1={20 + i * 14} y2={20 + i * 14} stroke="#F4F4F5" strokeWidth="1" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <line key={`v${i}`} x1={20 + i * 25} x2={20 + i * 25} y1="20" y2="76" stroke="#F4F4F5" strokeWidth="1" />
      ))}
      <path d="M40 60 C60 20 100 30 120 50 S180 80 200 30 S120 10 90 40" fill="none" stroke="#E11D48" strokeWidth="1.5" strokeOpacity="0.35" />
      <motion.circle
        r="5"
        fill="#E11D48"
        animate={{ cx: [40, 70, 120, 165, 200, 140, 90, 40], cy: [60, 30, 50, 70, 30, 22, 40, 60] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
};

export const ComparisonGuidePage: React.FC<ComparisonGuidePageProps> = ({ onNavigate }) => {
  const costGuideLive = isGuidePublished(COST_GUIDE_PATH);
  const goToLink = (path: RoutePath) => linkHandler(onNavigate, path);

  const faqs = COMPARISON_FAQS.map((faq, idx) =>
    idx === COMPARISON_FAQS.length - 1 && costGuideLive
      ? {
          ...faq,
          extra: (
            <>
              {' '}
              <a
                href={COST_GUIDE_PATH}
                onClick={goToLink(COST_GUIDE_PATH)}
                className="text-accent hover:text-accent-strong underline underline-offset-2"
              >
                See our guide to cost and timeline.
              </a>
            </>
          ),
        }
      : faq
  );

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <GuideBreadcrumb label="3D tour vs 360° tour vs video" onNavigate={onNavigate} />

        <article>
          <GuideHeader eyebrow="Honest comparison" title={H1} minutes={READING_MINUTES} />

          {/* 1. DIRECT ANSWER */}
          <ShortAnswer text={DIRECT_ANSWER} />

          {/* 2. HOW EACH ONE WORKS */}
          <section className="mb-20 sm:mb-28">
            <SectionHeading eyebrow="The three formats" title="How each one works" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FORMATS.map((format, i) => {
                const Icon = format.icon;
                return (
                  <motion.div key={format.id} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.1 }}>
                    <SpotlightCard className="h-full group" contentClassName="h-full flex flex-col">
                      <div className="border-b border-line bg-surface px-4 py-3">
                        <FormatDiagram id={format.id} />
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-10 h-10 rounded-lg border border-line bg-surface flex items-center justify-center shrink-0 transition-colors group-hover:bg-accent group-hover:border-accent">
                            <Icon className="w-4.5 h-4.5 text-accent transition-colors group-hover:text-white" aria-hidden="true" />
                          </span>
                          <h3 className="text-lg font-bold text-zinc-900 font-display">{format.name}</h3>
                        </div>
                        <p className="text-sm text-zinc-600 leading-relaxed">{format.howItWorks}</p>
                        {format.id === 'tour3d' && (
                          <a
                            href="/learn/what-is-gaussian-splatting/"
                            onClick={goToLink('/learn/what-is-gaussian-splatting/')}
                            className="mt-auto pt-5 text-xs font-semibold text-accent hover:text-accent-strong inline-flex items-center gap-1 transition-colors self-start font-mono"
                          >
                            <span>What is Gaussian splatting?</span>
                            <span aria-hidden="true">→</span>
                          </a>
                        )}
                      </div>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* 3. SIDE-BY-SIDE COMPARISON */}
          <section className="mb-20 sm:mb-28">
            <ComparisonTable eyebrow="Comparison" title="Side by side" columns={FORMATS} rows={COMPARISON_ROWS} />
          </section>

          {/* 4. WHEN TO CHOOSE EACH */}
          <section className="mb-20 sm:mb-28">
            <SectionHeading eyebrow="When to choose each" title="Which one is right for you?" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FORMATS.map((format, i) => {
                const Icon = format.icon;
                const choice = CHOOSE[format.id];
                return (
                  <motion.div key={format.id} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.1 }}>
                    <SpotlightCard className="h-full p-6 sm:p-7 group">
                      <span className="w-10 h-10 rounded-lg border border-line bg-surface flex items-center justify-center mb-4 transition-colors group-hover:bg-accent group-hover:border-accent">
                        <Icon className="w-4.5 h-4.5 text-accent transition-colors group-hover:text-white" aria-hidden="true" />
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 font-display mb-4">{choice.heading}</h3>
                      <ul className="space-y-3">
                        {choice.reasons.map((reason) => (
                          <li key={reason} className="flex items-start gap-3 text-sm text-zinc-700 leading-relaxed">
                            <span className="mt-0.5 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-accent" aria-hidden="true" />
                            </span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* 5. WHY NOT BOTH? */}
          <section className="mb-20 sm:mb-28">
            <motion.div
              {...fadeUp}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-2xl border border-line bg-surface p-6 sm:p-10"
            >
              <div className="lg:col-span-5 flex flex-col">
                <span className={eyebrowClass}>Why not both?</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink font-display mt-1 mb-4 text-balance">
                  The best answer is often a combination
                </h2>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">{COMBINATION}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono font-semibold">
                  <a
                    href="/services/immersive-experiences/3d-virtual-tours/"
                    onClick={goToLink('/services/immersive-experiences/3d-virtual-tours/')}
                    className="text-accent hover:text-accent-strong inline-flex items-center gap-1 transition-colors"
                  >
                    3D virtual tours <span aria-hidden="true">→</span>
                  </a>
                  <span className="text-zinc-400" aria-hidden="true">·</span>
                  <a
                    href="/services/visual-storytelling/"
                    onClick={goToLink('/services/visual-storytelling/')}
                    className="text-accent hover:text-accent-strong inline-flex items-center gap-1 transition-colors"
                  >
                    Visual Storytelling <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>

              {/* Visual: film draws attention, 3D tour helps decide, both from one capture */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <figure className="rounded-xl border border-line bg-white overflow-hidden shadow-xs group">
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                      <img loading="lazy" decoding="async"
                        src={IMG['comparison-guide/fly-through-film-being-made-from-a-3d-capture']}
                        alt="Fly-through film being made from a 3D capture"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <figcaption className="p-3.5">
                      <p className="text-sm font-bold text-zinc-900 font-display">Fly-through film</p>
                      <p className="text-[11px] font-mono text-zinc-500">Social media and ads · gets attention</p>
                    </figcaption>
                  </figure>

                  <div className="flex sm:flex-col items-center justify-center gap-1 text-accent" aria-hidden="true">
                    <span className="w-9 h-9 rounded-full border border-accent/30 bg-white flex items-center justify-center shadow-xs rotate-90 sm:rotate-0">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">links to</span>
                  </div>

                  <figure className="rounded-xl border border-line bg-white overflow-hidden shadow-xs group">
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                      <img loading="lazy" decoding="async"
                        src={IMG['comparison-guide/full-3d-virtual-tour-open-on-a-website']}
                        alt="Full 3D virtual tour open on a website"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <figcaption className="p-3.5">
                      <p className="text-sm font-bold text-zinc-900 font-display">Full 3D tour</p>
                      <p className="text-[11px] font-mono text-zinc-500">Your website · helps people decide</p>
                    </figcaption>
                  </figure>
                </div>

                <div className="mt-3 rounded-xl border border-dashed border-accent/40 bg-white px-4 py-3 flex items-center justify-center gap-2 text-xs font-mono text-zinc-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  Both from the same 3D capture · one site visit
                </div>
              </div>
            </motion.div>
          </section>

          {/* 6. FROM OUR PROJECTS (#from-our-projects): L02 required before publishing */}
          <FromOurProjects
            title="What we've seen in our own projects"
            items={[
              'how long capture took for a hotel vs a campus',
              'typical file sizes and loading times on mobile in Nepal',
              'how clients used the tour alongside photos or video',
              'engagement figures (views, time spent) if available',
              'what clients asked about before choosing 3D',
            ]}
          />

          {/* 7. COMMON QUESTIONS */}
          <GuideFaq faqs={faqs} />

          <GuideSources>
            <Placeholder>[[TBI: any external sources used; if none, remove this section]]</Placeholder>
          </GuideSources>
        </article>

        {/* 8. CALL TO ACTION BAND */}
        <GuideCta title="Not sure which fits your place?" body={CTA_BODY} icons={FORMATS.map((format) => format.icon)}>
          <button type="button" onClick={() => onNavigate('/contact/?type=3d-tour' as RoutePath)} className={primaryButtonClass}>
            <span>Ask for a recommendation</span>
            <span className="ml-2 font-mono" aria-hidden="true">→</span>
          </button>
        </GuideCta>
      </div>
    </div>
  );
};
