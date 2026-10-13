import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ValueChainStep {
  number: string;
  phase: string;
  title: string;
  detail: string;
  tools: string;
  badge: string;
  specs: string[];
  iconSvg: React.ReactNode;
}

const STEPS: ValueChainStep[] = [
  {
    number: '01',
    phase: 'Capture',
    title: 'Single Site Capture',
    detail: 'Terrestrial SLAM LiDAR (±5mm) and high-resolution aerial photogrammetry flown once with precision geodetic RTK coordinates.',
    tools: 'SLAM LiDAR · RTK Drones · 360° HDR',
    badge: 'Reality Intake',
    specs: ['Sub-centimetre terrestrial LiDAR', 'Centimetre-grade RTK aerial passes', 'Zero disruption to ongoing operations'],
    iconSvg: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="3" strokeWidth="2" />
        <path strokeWidth="1.75" strokeLinecap="round" d="M3 12h3m12 0h3M12 3v3m0 12v3" />
        <circle cx="12" cy="12" r="8" strokeWidth="1.2" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    number: '02',
    phase: 'Create',
    title: 'Digital Reconstruction',
    detail: 'Dense point cloud registration, clean CAD/BIM floor plans, 3D mesh building, and real-time Gaussian radiance fields.',
    tools: 'Millimetre Registration · Radiance Fields',
    badge: 'Geometry & Light',
    specs: ['200,000 pts/sec unified point clouds', 'Cleaned geometry ready for CAD/BIM', '3D Gaussian radiance reconstruction'],
    iconSvg: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    number: '03',
    phase: 'Tell',
    title: 'Spatial Storycraft',
    detail: 'Interactive waypoints, curated 4K fly-through cameras, audio narratives, and custom visitor journey paths designed to convert.',
    tools: 'Game-Engine · Direction · Scripting',
    badge: 'Narrative Layer',
    specs: ['Scripted cinematic camera paths', 'Spatial hotspot waypoint architecture', 'Bilingual English & Nepali narration'],
    iconSvg: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: '04',
    phase: 'Deliver',
    title: 'Multi-Format Delivery',
    detail: 'Instant browser tours via link, VR headsets for exhibitions, vertical social cuts for ads, and raw CAD/BIM data for architects.',
    tools: 'Web (No apps) · VR · Social 4K · DWG/IFC',
    badge: 'Omni-channel',
    specs: ['Zero-app instant browser streaming', 'Standalone Meta Quest & Vision Pro builds', 'Standardized DWG, DXF & IFC formats'],
    iconSvg: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    number: '05',
    phase: 'Measure',
    title: 'Outcome & Impact',
    detail: 'Visitor engagement metrics, dwell time, direct bookings, admissions enquiries, and verified site dimensions.',
    tools: 'Telemetry · Lead Flow · As-Built Accuracy',
    badge: 'Results',
    specs: ['Real-time visitor heatmaps & dwell time', 'Direct booking and lead conversion tracking', 'Permanent digital archive certification'],
    iconSvg: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export const ValueChainGraphic: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const selectedStep = STEPS[activeStepIndex];

  return (
    <div className="w-full">
      {/* Interactive Process Pipeline */}
      <div className="relative">
        {/* Animated Connector Line behind steps (desktop) */}
        <div 
          className="hidden lg:block absolute top-[44px] left-[6%] right-[6%] h-[2px] bg-zinc-200 z-0 overflow-hidden" 
          aria-hidden="true"
        >
          {/* Animated Laser Pulse Beam */}
          <motion.div
            className="w-48 h-full bg-gradient-to-r from-transparent via-accent to-transparent"
            animate={{
              x: ['-100%', '600%'],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative z-10">
          {STEPS.map((step, idx) => {
            const isSelected = idx === activeStepIndex;
            return (
              <motion.button
                key={step.phase}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className={`group relative text-left flex flex-col justify-between rounded-xl border p-4 sm:p-5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? 'border-accent bg-white shadow-lg shadow-rose-950/5 ring-1 ring-accent/30 -translate-y-1'
                    : 'border-zinc-200 bg-gradient-to-b from-white to-zinc-50/60 shadow-sm hover:border-zinc-300 hover:bg-white hover:-translate-y-0.5'
                }`}
              >
                {/* Active Indicator Pip */}
                {isSelected && (
                  <motion.div
                    layoutId="activeValueChainPip"
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-1 bg-accent rounded-full shadow-sm"
                  />
                )}

                <div>
                  {/* Top Bar: Circular Icon & Phase Index */}
                  <div className="flex items-center justify-between mb-3.5">
                    {/* Circular Top Icon */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
                        isSelected
                          ? 'border-accent bg-rose-50/70 shadow-sm'
                          : 'border-zinc-200 bg-white group-hover:border-zinc-300 shadow-sm'
                      }`}
                    >
                      {step.iconSvg}
                    </div>

                    {/* Step number & Phase tag */}
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className={isSelected ? 'text-accent font-bold' : 'text-zinc-500 font-semibold'}>
                        {step.number}
                      </span>
                      <span className="text-zinc-300">/</span>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                          isSelected
                            ? 'bg-rose-100/70 text-accent-strong'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {step.phase}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-sm font-bold font-display transition-colors ${
                      isSelected ? 'text-ink' : 'text-zinc-900 group-hover:text-accent'
                    }`}
                  >
                    {step.title}
                  </h3>

                  {/* Detail */}
                  <p className="mt-2 text-xs leading-relaxed text-muted line-clamp-3">
                    {step.detail}
                  </p>
                </div>

                {/* Tools footer */}
                <div className="mt-4 pt-3 border-t border-zinc-100">
                  <div
                    className={`font-mono text-[10px] truncate transition-colors ${
                      isSelected ? 'text-accent-strong font-semibold' : 'text-zinc-400 group-hover:text-zinc-600'
                    }`}
                  >
                    {step.tools}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Expanded Phase Inspector Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedStep.phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 rounded-xl border border-zinc-200/90 bg-white p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-mono text-xs font-bold border border-accent/20">
              {selectedStep.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900">
                  Phase {selectedStep.number}: {selectedStep.title}
                </span>
                <span className="font-mono text-[10px] text-accent-strong bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60 font-semibold">
                  {selectedStep.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 max-w-2xl">
                {selectedStep.detail}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100">
            {selectedStep.specs.map((spec) => (
              <span
                key={spec}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-50 border border-zinc-200 font-mono text-[11px] text-zinc-700 font-medium"
              >
                <span className="h-1 w-1 rounded-full bg-accent" />
                {spec}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
