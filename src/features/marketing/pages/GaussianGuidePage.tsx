import React, { useMemo, useState } from 'react';
import { IMG } from '../data/images';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  Eye,
  Focus,
  GlassWater,
  HardDrive,
  Layers3,
  Leaf,
  Move3d,
  PenOff,
  RotateCcw,
  Ruler,
  ScanLine,
  Sparkles,
  Triangle,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RoutePath } from '../types';
import { readingMinutes } from '../data/guides';
import { Placeholder } from '../components/Placeholder';
import { SpotlightCard } from '../components/SpotlightCard';
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
  secondaryButtonClass,
} from '../components/GuideParts';

interface GaussianGuidePageProps {
  onNavigate: (path: RoutePath) => void;
}

const H1 = 'What is Gaussian splatting?';

const DIRECT_ANSWER =
  'Gaussian splatting (or 3D Gaussian splatting) is a way of creating photorealistic 3D scenes from photos or scans of a real place. Instead of building the scene from flat surfaces, it represents it as millions of tiny, soft, coloured points called Gaussians. The result looks like a photograph you can move around in, and it can be explored in real time, even in a web browser.';

const HOW_IT_WORKS =
  'Imagine describing a room not with walls and textures, but with millions of tiny, slightly blurred blobs of colour floating in space. Each blob has a position, a size, a shape, a colour and a level of transparency. Seen together from any angle, they blend into a convincing image of the room.';

const STEPS_INTRO = 'Creating a Gaussian splat scene follows three broad steps:';

type StageId = 'capture' | 'training' | 'viewing';

const STEPS: { id: StageId; number: string; title: string; icon: LucideIcon; line: string }[] = [
  {
    id: 'capture',
    number: '1',
    title: 'Capture',
    icon: Camera,
    line: 'The place is photographed or scanned from many angles. Laser scanning can add accurate geometry.',
  },
  {
    id: 'training',
    number: '2',
    title: 'Training',
    icon: Layers3,
    line: 'Software places the Gaussians and adjusts them until, from every captured angle, the scene matches the real photos as closely as possible.',
  },
  {
    id: 'viewing',
    number: '3',
    title: 'Viewing',
    icon: Eye,
    line: 'The finished scene is displayed by "splatting" the Gaussians onto the screen, fast enough to move through it in real time.',
  },
];

const HISTORY =
  'The technique became widely known through a 2023 research paper on real-time rendering of radiance fields, and it has since been adopted by many reality capture tools and platforms.';

const GOOD_AT: { lead: string; text: string; icon: LucideIcon }[] = [
  { lead: 'Photorealism.', text: 'Light, colour, reflections and fine textures look natural, not like a computer model.', icon: Sparkles },
  {
    lead: 'Hard-to-model detail.',
    text: 'Foliage, carvings, fabric and cluttered interiors that are difficult to turn into clean surfaces.',
    icon: Leaf,
  },
  { lead: 'Real-time exploration.', text: 'Scenes can be explored smoothly in a browser or VR headset.', icon: Move3d },
  { lead: 'Speed from capture to result.', text: 'No one has to model the place by hand.', icon: Zap },
];

const LIMITS: { lead: string; text: string; icon: LucideIcon }[] = [
  {
    lead: 'Best near where it was captured.',
    text: 'Views far from the captured angles can look blurry or show stray artefacts. Good capture planning matters.',
    icon: Focus,
  },
  {
    lead: 'Large files.',
    text: 'Scenes can be heavy, so they are best loaded only when someone chooses to open them.',
    icon: HardDrive,
  },
  {
    lead: 'Not a measured model on its own.',
    text: 'A splat scene is built for looks. For reliable measurements, it needs to be paired with laser scanning or survey control.',
    icon: Ruler,
  },
  {
    lead: 'Harder to edit.',
    text: 'Changing part of a scene is less straightforward than editing a traditional 3D model.',
    icon: PenOff,
  },
  { lead: 'Tricky surfaces.', text: 'Mirrors, glass and moving objects can be difficult.', icon: GlassWater },
];

const METHODS = [
  { id: 'mesh', name: 'Photogrammetry mesh', icon: Triangle },
  { id: 'pointcloud', name: 'Laser scan point cloud', icon: ScanLine },
  { id: 'splat', name: 'Gaussian splatting', icon: Sparkles },
];

const METHOD_ROWS = [
  {
    label: 'What it produces',
    values: {
      mesh: 'A surface model with textures',
      pointcloud: 'Millions of measured points',
      splat: 'Millions of soft, coloured Gaussians',
    },
  },
  {
    label: 'Looks',
    values: {
      mesh: 'Good, can look flat or melted on fine detail',
      pointcloud: 'Technical, not photographic',
      splat: 'Photorealistic',
    },
  },
  {
    label: 'Measurement',
    values: { mesh: 'Possible, depends on control', pointcloud: 'Strongest', splat: 'Limited on its own' },
  },
  {
    label: 'Best for',
    values: {
      mesh: 'Models for CAD and 3D printing',
      pointcloud: 'Design, survey and engineering',
      splat: 'Visual experiences and tours',
    },
  },
  {
    label: 'Runs in a browser',
    values: { mesh: 'Yes', pointcloud: 'Possible, often heavy', splat: 'Yes, in real time' },
  },
];

const PAIRING =
  'These methods work best together. At RCAAS, we pair laser scanning for accuracy with Gaussian splatting for the visual experience, so a tour is both beautiful and true to the real size and layout of the place.';

const USES: { use: string; why: string; image: string; imageAlt: string }[] = [
  {
    use: 'Hotel and property tours',
    why: 'Guests and buyers see the real atmosphere, not a rendering',
    image: IMG['gaussian-guide/runs-in-a-browser'],
    imageAlt: 'Photorealistic 3D view of a hotel',
  },
  {
    use: 'Campus tours',
    why: 'Families explore classrooms, labs and grounds as they really are',
    image: IMG['gaussian-guide/showcase-1'],
    imageAlt: 'Photorealistic 3D view of a college campus',
  },
  {
    use: 'Heritage sites and museums',
    why: 'Carvings, textures and settings are preserved photographically',
    image: IMG['gaussian-guide/showcase-2'],
    imageAlt: 'Photorealistic 3D scene of Chilancho Stupa',
  },
  {
    use: 'VR experiences',
    why: 'Real places become immersive scenes for headsets',
    image: IMG['gaussian-guide/showcase-3'],
    imageAlt: 'Visitor in a VR headset exploring a 3D courtyard',
  },
  {
    use: 'Films and renders',
    why: 'Camera moves through a photorealistic scene, from one capture',
    image: IMG['gaussian-guide/showcase-4'],
    imageAlt: 'Fly-through film being made from a 3D scene',
  },
];

export const GAUSSIAN_FAQS = [
  {
    question: 'Is Gaussian splatting the same as a 360° photo?',
    answer:
      'No. A 360° photo is a panorama seen from one point. A Gaussian splat scene is a full 3D scene you can move through and view from any angle.',
  },
  {
    question: 'Is it the same as NeRF?',
    answer:
      'They are related. Both create photorealistic 3D scenes from images. NeRF uses a neural network to represent the scene, while Gaussian splatting uses explicit Gaussians, which makes real-time viewing much more practical.',
  },
  {
    question: 'Can I measure from a Gaussian splat scene?',
    answer:
      'Not reliably on its own. For measurements, the scene should be combined with laser scanning or survey control, which is how we work.',
  },
  {
    question: 'Does it need special software to view?',
    answer: 'No. Scenes can be viewed in a modern web browser on a phone, tablet or computer. VR needs a headset.',
  },
];

const CTA_BODY =
  "Explore a photorealistic 3D scene captured by our team, then tell us about the place you'd like to show.";

export const READING_MINUTES = readingMinutes([
  H1,
  DIRECT_ANSWER,
  HOW_IT_WORKS,
  STEPS_INTRO,
  ...STEPS.flatMap((s) => [s.title, s.line]),
  HISTORY,
  ...GOOD_AT.flatMap((g) => [g.lead, g.text]),
  ...LIMITS.flatMap((l) => [l.lead, l.text]),
  ...METHOD_ROWS.flatMap((r) => [r.label, ...Object.values(r.values)]),
  PAIRING,
  ...USES.flatMap((u) => [u.use, u.why]),
  ...GAUSSIAN_FAQS.flatMap((f) => [f.question, f.answer]),
  CTA_BODY,
]);

/* ---------- Illustration: how Gaussians become a scene ---------- */

interface Blob {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot: number;
  fill: string;
  opacity: number;
  startX: number;
  startY: number;
  layer: 0 | 1 | 2;
}

// Deterministic pseudo-random numbers, so the illustration is the same on every load.
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const buildBlobs = (): Blob[] => {
  const rand = seeded(42);
  const pick = <T,>(items: T[]) => items[Math.floor(rand() * items.length)];
  const blobs: Blob[] = [];
  const add = (count: number, layer: 0 | 1 | 2, colours: string[], place: () => [number, number], size: [number, number]) => {
    for (let i = 0; i < count; i++) {
      const [x, y] = place();
      blobs.push({
        x,
        y,
        rx: size[0] + rand() * size[1],
        ry: (size[0] + rand() * size[1]) * (0.5 + rand() * 0.6),
        rot: rand() * 180,
        fill: pick(colours),
        opacity: 0.55 + rand() * 0.35,
        startX: 20 + rand() * 360,
        startY: 20 + rand() * 220,
        layer,
      });
    }
  };

  // Sky
  add(34, 0, ['#BFDBFE', '#DBEAFE', '#E0F2FE', '#C7D2FE'], () => [rand() * 400, rand() * 150], [18, 22]);
  // Ground
  add(24, 2, ['#C2A07A', '#A8835A', '#D6BC94', '#8B6B4A'], () => [rand() * 400, 214 + rand() * 46], [14, 16]);
  // Plinth
  add(18, 1, ['#E7E5E4', '#D6D3D1', '#F5F5F4'], () => [110 + rand() * 180, 186 + rand() * 22], [9, 8]);
  // Dome
  add(
    38,
    1,
    ['#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0'],
    () => {
      const a = Math.PI + rand() * Math.PI;
      const r = Math.sqrt(rand());
      return [200 + Math.cos(a) * 78 * r, 186 + Math.sin(a) * 66 * r];
    },
    [8, 9]
  );
  // Harmika
  add(8, 1, ['#FDE68A', '#FEF3C7', '#F5F5F4'], () => [186 + rand() * 28, 106 + rand() * 14], [4, 4]);
  // Spire
  add(
    16,
    1,
    ['#EAB308', '#CA8A04', '#D4A017', '#FACC15'],
    () => {
      const t = rand();
      return [200 + (rand() - 0.5) * 26 * t, 46 + t * 58];
    },
    [3, 4]
  );
  return blobs;
};

const CAMERAS = [
  [30, 60],
  [90, 24],
  [200, 14],
  [310, 24],
  [370, 60],
  [24, 150],
  [376, 150],
];

const SplatIllustration: React.FC<{ stage: StageId; runId: number }> = ({ stage, runId }) => {
  const blobs = useMemo(buildBlobs, []);
  const [pointer, setPointer] = useState(0);

  const layerShift = (layer: number) => (stage === 'viewing' ? pointer * [6, 16, 10][layer] : 0);

  return (
    <div className="relative rounded-xl overflow-hidden border border-line bg-surface">
      <svg
        viewBox="0 0 400 260"
        className="w-full h-auto block touch-none"
        aria-hidden="true"
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPointer(((e.clientX - rect.left) / rect.width) * 2 - 1);
        }}
        onPointerLeave={() => setPointer(0)}
      >
        <defs>
          <filter id="splat-blend" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={stage === 'viewing' ? 2.6 : 0} />
          </filter>
        </defs>

        {/* Capture: reference outline and camera positions */}
        <motion.g animate={{ opacity: stage === 'capture' ? 1 : 0 }} transition={{ duration: 0.4 }}>
          <path
            d="M110 208 L290 208 L290 190 L122 190 Z M122 186 A78 66 0 0 1 278 186 Z M188 118 h24 v-14 h-24 Z M200 46 L212 104 L188 104 Z"
            fill="none"
            stroke="#A1A1AA"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          {CAMERAS.map(([cx, cy], i) => (
            <g key={i}>
              <motion.line
                x1={cx}
                y1={cy}
                x2="200"
                y2="150"
                stroke="#E11D48"
                strokeWidth="1"
                strokeDasharray="3 4"
                animate={{ opacity: stage === 'capture' ? [0.15, 0.7, 0.15] : 0 }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25 }}
              />
              <rect x={cx - 9} y={cy - 6} width="18" height="12" rx="3" fill="#18181B" />
              <circle cx={cx} cy={cy} r="3.2" fill="#E11D48" />
            </g>
          ))}
        </motion.g>

        {/* Gaussians, grouped by depth so viewing can show parallax */}
        <g filter="url(#splat-blend)">
          {([0, 1, 2] as const).map((layer) => (
            <motion.g key={`${layer}-${runId}`} animate={{ x: layerShift(layer) }} transition={{ type: 'spring', stiffness: 80, damping: 18 }}>
              {blobs.map((b, i) =>
                b.layer === layer ? (
                  <motion.ellipse
                    key={i}
                    initial={{ cx: b.startX, cy: b.startY, rx: 3, ry: 3, opacity: 0, fill: '#A1A1AA' }}
                    animate={
                      stage === 'capture'
                        ? { cx: b.startX, cy: b.startY, rx: 3, ry: 3, opacity: 0, fill: '#A1A1AA' }
                        : { cx: b.x, cy: b.y, rx: b.rx, ry: b.ry, opacity: b.opacity, fill: b.fill }
                    }
                    transition={{ duration: stage === 'training' ? 1.8 : 0.4, delay: stage === 'training' ? (i % 40) * 0.02 : 0, ease: 'easeInOut' }}
                    transform={`rotate(${b.rot} ${b.x} ${b.y})`}
                    stroke={stage === 'training' ? '#FFFFFF' : 'none'}
                    strokeWidth="0.6"
                  />
                ) : null
              )}
            </motion.g>
          ))}
        </g>
      </svg>

      <div className="absolute top-3 left-3 bg-white/95 border border-line px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-700 shadow-xs">
        {stage === 'capture' && 'Photos from many angles'}
        {stage === 'training' && 'Gaussians placed and adjusted'}
        {stage === 'viewing' && 'Blended on screen · move your pointer'}
      </div>
    </div>
  );
};

/* ---------- Page ---------- */

export const GaussianGuidePage: React.FC<GaussianGuidePageProps> = ({ onNavigate }) => {
  const [stage, setStage] = useState<StageId>('training');
  const [runId, setRunId] = useState(0);
  const goToLink = (path: RoutePath) => linkHandler(onNavigate, path);

  const selectStage = (id: StageId) => {
    setStage(id);
    if (id === 'training') setRunId((n) => n + 1);
  };

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <GuideBreadcrumb label="What is Gaussian splatting?" onNavigate={onNavigate} />

        <article>
          <GuideHeader eyebrow="Explained simply" title={H1} minutes={READING_MINUTES} />

          {/* 1. DIRECT ANSWER */}
          <ShortAnswer text={DIRECT_ANSWER} />

          {/* 2. HOW IT WORKS: interactive illustration; every step's text stays in the DOM */}
          <section className="mb-20 sm:mb-28">
            <SectionHeading eyebrow="In plain words" title="How it works" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5">
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-6">{HOW_IT_WORKS}</p>
                <p className="text-sm font-semibold text-zinc-900 mb-3">{STEPS_INTRO}</p>

                <ol className="space-y-3" role="tablist" aria-label="Steps">
                  {STEPS.map((step) => {
                    const Icon = step.icon;
                    const isActive = stage === step.id;
                    return (
                      <li key={step.id}>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => selectStage(step.id)}
                          className={`w-full text-left rounded-xl border p-4 flex items-start gap-3 transition-all ${
                            isActive
                              ? 'border-accent bg-white shadow-[0_8px_24px_-6px_rgba(225,29,72,0.18)]'
                              : 'border-line bg-surface hover:border-zinc-300 hover:bg-white'
                          }`}
                        >
                          <span
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isActive ? 'bg-accent text-white' : 'bg-white border border-line text-accent'
                            }`}
                          >
                            <Icon className="w-4 h-4" aria-hidden="true" />
                          </span>
                          <span>
                            <span className="block text-sm font-bold text-zinc-900 font-display">
                              {step.number}. {step.title}
                            </span>
                            <span className="block mt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed">{step.line}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="lg:col-span-7">
                <SplatIllustration stage={stage} runId={runId} />
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-[11px] font-mono text-zinc-500">Illustration, not a real capture.</p>
                  <button
                    type="button"
                    onClick={() => selectStage('training')}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent hover:text-accent-strong transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    Replay training
                  </button>
                </div>
              </div>
            </div>

            <motion.p {...fadeUp} className="mt-8 max-w-3xl text-sm text-zinc-600 leading-relaxed border-l-2 border-accent pl-4">
              {HISTORY}
            </motion.p>
          </section>

          {/* 3. WHAT IT'S GOOD AT + 4. ITS LIMITS */}
          <section className="mb-20 sm:mb-28 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { eyebrow: 'Strengths', title: "What Gaussian splatting is good at", items: GOOD_AT, tone: 'good' as const },
              { eyebrow: 'Limits', title: 'Its limits, honestly', items: LIMITS, tone: 'limit' as const },
            ].map((column, ci) => (
              <motion.div key={column.title} {...fadeUp} transition={{ duration: 0.45, delay: ci * 0.1 }}>
                <SpotlightCard className="h-full" contentClassName="h-full p-6 sm:p-8">
                  <span
                    className={`text-xs font-mono uppercase tracking-wider font-semibold ${
                      column.tone === 'good' ? 'text-accent' : 'text-amber-700'
                    }`}
                  >
                    {column.eyebrow}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display mt-1 mb-6">{column.title}</h2>
                  <ul className="space-y-4">
                    {column.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.lead} className="flex items-start gap-3">
                          <span
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              column.tone === 'good' ? 'bg-accent/10 text-accent' : 'bg-amber-50 border border-amber-200 text-amber-700'
                            }`}
                          >
                            <Icon className="w-4 h-4" aria-hidden="true" />
                          </span>
                          <p className="text-sm text-zinc-600 leading-relaxed">
                            <strong className="text-zinc-900 font-semibold">{item.lead}</strong> {item.text}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </SpotlightCard>
              </motion.div>
            ))}
          </section>

          {/* 5. HOW IT COMPARES */}
          <section className="mb-20 sm:mb-28">
            <ComparisonTable eyebrow="How it compares" title="Gaussian splatting vs other 3D methods" columns={METHODS} rows={METHOD_ROWS} />

            {/* Pairing: accuracy + looks */}
            <motion.div {...fadeUp} className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <p className="lg:col-span-5 text-sm sm:text-base text-zinc-700 leading-relaxed">{PAIRING}</p>

              <div className="lg:col-span-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3" aria-hidden="true">
                {[
                  { image: IMG['gaussian-guide/showcase-5'], title: 'Laser scanning', line: 'Accuracy' },
                  { image: IMG['gaussian-guide/laser-scanning'], title: 'Gaussian splatting', line: 'Visual experience' },
                ].map((item, i) => (
                  <React.Fragment key={item.title}>
                    {i === 1 && (
                      <span className="w-9 h-9 rounded-full border border-accent/30 bg-white flex items-center justify-center shadow-xs font-mono font-bold text-accent">
                        +
                      </span>
                    )}
                    <figure className="rounded-xl border border-line bg-white overflow-hidden shadow-xs group">
                      <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
                        <img loading="lazy" decoding="async" src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <figcaption className="p-3">
                        <p className="text-sm font-bold text-zinc-900 font-display">{item.title}</p>
                        <p className="text-[11px] font-mono text-zinc-500">{item.line}</p>
                      </figcaption>
                    </figure>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </section>

          {/* 6. WHERE IT'S USED */}
          <section className="mb-20 sm:mb-28">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <SectionHeading eyebrow="Uses" title="Where it's used" className="" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono font-semibold">
                <a
                  href="/services/immersive-experiences/3d-virtual-tours/"
                  onClick={goToLink('/services/immersive-experiences/3d-virtual-tours/')}
                  className="text-accent hover:text-accent-strong inline-flex items-center gap-1 transition-colors"
                >
                  3D virtual tours <span aria-hidden="true">→</span>
                </a>
                <span className="text-zinc-400" aria-hidden="true">·</span>
                <a
                  href="/platform/"
                  onClick={goToLink('/platform/')}
                  className="text-accent hover:text-accent-strong inline-flex items-center gap-1 transition-colors"
                >
                  Our platform <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {USES.map((use, i) => (
                <motion.div key={use.use} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.06 }}>
                  <SpotlightCard className="h-full group" contentClassName="h-full flex flex-col">
                    <div className="h-32 overflow-hidden bg-zinc-900">
                      <img loading="lazy" decoding="async"
                        src={use.image}
                        alt={use.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-sm font-bold text-zinc-900 font-display mb-1.5">{use.use}</h3>
                      <p className="text-xs text-zinc-600 leading-relaxed">{use.why}</p>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 7. FROM OUR PROJECTS (#from-our-projects): L02 required before publishing */}
          <FromOurProjects
            title="What we've learned using it"
            items={[
              'capture time for a typical room, campus or heritage site',
              'typical scene size and how it loads on mobile in Nepal',
              'what worked well (e.g. carvings at Chilancho Stupa) and what was hard (glass, crowds, low light)',
              'how laser scanning improved the result',
            ]}
          />

          {/* 8. COMMON QUESTIONS */}
          <GuideFaq faqs={GAUSSIAN_FAQS} />

          <GuideSources>
            <p>
              Kerbl, B., Kopanas, G., Leimkühler, T. and Drettakis, G. (2023).{' '}
              <cite className="not-italic font-semibold text-zinc-800">
                3D Gaussian Splatting for Real-Time Radiance Field Rendering.
              </cite>{' '}
              ACM Transactions on Graphics (SIGGRAPH 2023).{' '}
              <a
                href="https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-strong underline underline-offset-2 break-all"
              >
                https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/
              </a>
            </p>
            <p>
              <Placeholder>[[TBI: any other sources used]]</Placeholder>
            </p>
          </GuideSources>
        </article>

        {/* 9. CALL TO ACTION BAND */}
        <GuideCta title="See Gaussian splatting for yourself" body={CTA_BODY} icons={[Camera, Layers3, Eye]}>
          <button type="button" onClick={() => onNavigate('/platform/#demo' as RoutePath)} className={primaryButtonClass}>
            <span>Try the live demo</span>
            <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onNavigate('/contact/?type=3d-tour' as RoutePath)} className={secondaryButtonClass}>
            <span>Plan your experience</span>
            <span className="font-mono" aria-hidden="true">→</span>
          </button>
        </GuideCta>
      </div>
    </div>
  );
};
