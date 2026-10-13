import React, { useState } from 'react';
import { IMG } from '../data/images';
import { motion, AnimatePresence } from 'framer-motion';

interface Hotspot {
  id: string;
  title: string;
  category: 'Detail' | 'Booking' | 'Architecture';
  coords: { x: number; y: number }; // Percentage position
  description: string;
  detailSpecs?: string[];
  ctaText?: string;
  ctaAction?: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'hs-1',
    title: 'Traditional Malla-Era Woodwork',
    category: 'Detail',
    coords: { x: 34, y: 44 },
    description: 'Intricately hand-carved Sal timber colonnades crafted by master Newari artisans, documented down to 2mm sub-millimetre fidelity.',
    detailSpecs: ['Heritage Sal Wood', '18th-century motif reproduction', 'Restored 2023'],
    ctaText: 'Listen to 45s Audio Guide',
    ctaAction: 'audio',
  },
  {
    id: 'hs-2',
    title: 'Courtyard Heritage Suite',
    category: 'Booking',
    coords: { x: 68, y: 38 },
    description: 'High-ceiling suite overlooking the internal brick courtyard. Features hand-loomed textiles, king bed, and stone bath.',
    detailSpecs: ['68 m² total area', 'King bed & private balcony', 'Smart climate control'],
    ctaText: 'Reserve Room from Tour',
    ctaAction: 'booking',
  },
  {
    id: 'hs-3',
    title: 'Sunken Brick Courtyard',
    category: 'Architecture',
    coords: { x: 50, y: 72 },
    description: 'Acoustically quiet central gathering space featuring traditional Dachi Appa brickwork and warm concealed night illumination.',
    detailSpecs: ['140 m² open courtyard', 'Capacity: 80 seated', '360° natural daylight'],
    ctaText: 'View Evening Lighting',
    ctaAction: 'lighting',
  },
];

const MEASUREMENTS = [
  { id: 'm-1', label: 'Colonnade Width', value: '8.40 m', x1: 26, y1: 52, x2: 44, y2: 52 },
  { id: 'm-2', label: 'Archway Height', value: '3.65 m', x1: 34, y1: 32, x2: 34, y2: 60 },
  { id: 'm-3', label: 'Courtyard Span', value: '14.20 m', x1: 35, y1: 78, x2: 65, y2: 78 },
];

export const InteractiveTourFeaturesDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hotspots' | 'measure' | 'floorplan' | 'autoplay'>('hotspots');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(HOTSPOTS[0]);
  const [viewMode, setViewMode] = useState<'3d' | 'dollhouse'>('3d');
  const [radarRotation, setRadarRotation] = useState(42);
  const [isPlayingReel, setIsPlayingReel] = useState(false);
  const [bookingToast, setBookingToast] = useState<string | null>(null);

  const triggerAction = (hotspot: Hotspot) => {
    if (hotspot.category === 'Booking') {
      setBookingToast(`Booking popup triggered: "${hotspot.title}" enquiry launched seamlessly inside tour!`);
      setTimeout(() => setBookingToast(null), 4000);
    } else if (hotspot.ctaAction === 'audio') {
      setBookingToast(`Audio playback started: Narrator explaining "${hotspot.title}"`);
      setTimeout(() => setBookingToast(null), 3500);
    } else {
      setBookingToast(`Mode adjusted: Evening ambiance lighting preview applied.`);
      setTimeout(() => setBookingToast(null), 3500);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-line">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-line text-xs font-mono text-zinc-600 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>Interactive Feature Sandbox</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-ink font-display">
            Interactive Hotspots, Measure & Dollhouse
          </h3>
          <p className="text-sm text-zinc-600 max-w-2xl mt-1">
            Test the spatial tools embedded into every RCAAS 3D virtual tour. Click pins, switch into measurement mode, or consult the 2D floorplan.
          </p>
        </div>

        {/* Feature Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-line self-start lg:self-center shadow-xs">
          <button
            type="button"
            onClick={() => { setActiveTab('hotspots'); setViewMode('3d'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'hotspots'
                ? 'bg-ink text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            1. Hotspots & CTAs
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('measure'); setViewMode('3d'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'measure'
                ? 'bg-ink text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            2. Real-Scale Measure
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('floorplan'); setViewMode('dollhouse'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'floorplan'
                ? 'bg-ink text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            3. Mini-Map & Floor Plan
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('autoplay');
              setIsPlayingReel(!isPlayingReel);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'autoplay'
                ? 'bg-accent text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            {isPlayingReel ? '❚❚ Guided Tour Running' : '▶ Autoplay Reel'}
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Viewport Simulation */}
        <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden border border-zinc-300 bg-zinc-950 shadow-inner group select-none">
          {/* Main Backdrop Image */}
          <img loading="lazy" decoding="async"
            src={IMG['interactive-tour-features-demo/interactive-3d-virtual-tour-space']}
            alt="Interactive 3D Virtual Tour Space"
            className={`w-full h-full object-cover transition-all duration-700 ${
              viewMode === 'dollhouse' ? 'scale-105 filter brightness-90 saturate-75' : 'scale-100'
            } ${isPlayingReel ? 'animate-pulse' : ''}`}
          />

          {/* Semi-transparent Grid Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Top HUD Bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black/75 border border-white/10 text-[11px] font-mono text-white/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE 3D ENGINE · 60 FPS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/70 bg-black/75 px-2 py-1 rounded border border-white/10">
                LOD: 100% (Sub-centimetre)
              </span>
            </div>
          </div>

          {/* Mode 1: Hotspot Pins Layer */}
          {activeTab === 'hotspots' && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {HOTSPOTS.map((hs) => {
                const isSelected = selectedHotspot?.id === hs.id;
                return (
                  <button
                    key={hs.id}
                    type="button"
                    onClick={() => setSelectedHotspot(hs)}
                    style={{ left: `${hs.coords.x}%`, top: `${hs.coords.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group/pin focus:outline-none"
                    aria-label={`Select hotspot: ${hs.title}`}
                  >
                    <span className="relative flex h-8 w-8 items-center justify-center">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          hs.category === 'Booking' ? 'bg-accent' : 'bg-white'
                        }`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-7 w-7 items-center justify-center text-xs font-bold text-white shadow-lg transition-transform duration-200 group-hover/pin:scale-110 border ${
                          isSelected
                            ? 'bg-accent border-white scale-110 ring-4 ring-accent/30'
                            : 'bg-zinc-900/90 border-white/50'
                        }`}
                      >
                        {hs.category === 'Booking' ? '🏷' : 'ℹ'}
                      </span>
                    </span>

                    {/* Pin Label */}
                    <span
                      className={`absolute left-1/2 -translate-x-1/2 top-9 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap shadow-md transition-all ${
                        isSelected
                          ? 'bg-ink text-white border border-accent'
                          : 'bg-black/70 text-white/90 border border-white/10 opacity-80 group-hover/pin:opacity-100'
                      }`}
                    >
                      {hs.title}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Mode 2: Measure Overlay */}
          {activeTab === 'measure' && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <svg className="w-full h-full">
                {MEASUREMENTS.map((m) => (
                  <g key={m.id} className="cursor-pointer">
                    <line
                      x1={`${m.x1}%`}
                      y1={`${m.y1}%`}
                      x2={`${m.x2}%`}
                      y2={`${m.y2}%`}
                      stroke="#E11D48"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                    />
                    <circle cx={`${m.x1}%`} cy={`${m.y1}%`} r="4.5" fill="#FFFFFF" stroke="#E11D48" strokeWidth="2" />
                    <circle cx={`${m.x2}%`} cy={`${m.y2}%`} r="4.5" fill="#FFFFFF" stroke="#E11D48" strokeWidth="2" />
                    <foreignObject
                      x={`${(m.x1 + m.x2) / 2 - 12}%`}
                      y={`${(m.y1 + m.y2) / 2 - 4}%`}
                      width="100"
                      height="30"
                    >
                      <div className="bg-ink/90 border border-accent text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow text-center inline-block">
                        {m.value}
                      </div>
                    </foreignObject>
                  </g>
                ))}
              </svg>
              <div className="absolute bottom-4 left-4 bg-black/80 border border-white/10 rounded-lg p-2.5 text-xs text-white">
                <span className="font-mono text-accent font-bold">● MEASUREMENT TOOL:</span> Click any two surface points in 3D to derive millimeter-accurate distance.
              </div>
            </div>
          )}

          {/* Mode 3: Mini-Map / Floor Plan Overlay */}
          {activeTab === 'floorplan' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/75">
              <div className="w-[85%] h-[85%] bg-zinc-900/90 border border-zinc-700 rounded-xl p-4 relative shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-white">ARCHITECTURAL 2D FLOOR PLAN & RADAR</span>
                  <span className="text-[10px] font-mono text-zinc-400">GROUND FLOOR · LEVEL 0</span>
                </div>
                {/* Simulated Blueprint Layout */}
                <div className="w-full h-[85%] border border-dashed border-zinc-600 rounded-lg relative flex items-center justify-center bg-zinc-950/80">
                  <div className="absolute inset-4 grid grid-cols-3 grid-rows-2 gap-2 pointer-events-none">
                    <div className="border border-zinc-700/80 bg-zinc-800/30 rounded p-1.5 text-[10px] font-mono text-zinc-400">
                      East Pavilion (Lobby)
                    </div>
                    <div className="border border-emerald-500/40 bg-emerald-500/10 rounded p-1.5 text-[10px] font-mono text-emerald-300">
                      Central Courtyard [Active]
                    </div>
                    <div className="border border-zinc-700/80 bg-zinc-800/30 rounded p-1.5 text-[10px] font-mono text-zinc-400">
                      West Suites (101-106)
                    </div>
                    <div className="border border-zinc-700/80 bg-zinc-800/30 rounded p-1.5 text-[10px] font-mono text-zinc-400">
                      Dining Veranda
                    </div>
                    <div className="border border-zinc-700/80 bg-zinc-800/30 rounded p-1.5 text-[10px] font-mono text-zinc-400">
                      Traditional Water Fountain
                    </div>
                    <div className="border border-zinc-700/80 bg-zinc-800/30 rounded p-1.5 text-[10px] font-mono text-zinc-400">
                      Admissions / Reception
                    </div>
                  </div>

                  {/* Pulsing Radar Cone indicating viewer position */}
                  <motion.div
                    animate={{ rotate: [30, 85, 30] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                    className="absolute z-20 flex flex-col items-center pointer-events-none"
                    style={{ left: '50%', top: '48%' }}
                  >
                    <div className="w-4 h-4 rounded-full bg-accent ring-4 ring-accent/40 shadow-lg" />
                    <div className="w-24 h-24 -mt-2 bg-gradient-to-t from-accent/30 to-transparent clip-path-cone" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          {/* Autoplay Highlight Notice */}
          {isPlayingReel && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-ink/90 border border-accent text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <span>Cinematic Guided Tour · Waypoint 2 of 5 (Courtyard Colonnade)</span>
            </div>
          )}

          {/* Bottom Toast Notification */}
          <AnimatePresence>
            {bookingToast && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-4 right-4 z-40 bg-ink border border-accent text-white text-xs px-3.5 py-2.5 rounded-lg shadow-xl flex items-center justify-between"
              >
                <span>{bookingToast}</span>
                <span className="font-mono text-accent text-[10px] uppercase font-bold">Interactive Event</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Detail Card & Spatial Controls */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white border border-line rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
              <span className="text-xs font-mono font-semibold uppercase text-zinc-500">
                Selected Hotspot
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  selectedHotspot?.category === 'Booking'
                    ? 'bg-rose-100 text-accent'
                    : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                {selectedHotspot?.category}
              </span>
            </div>

            <h4 className="text-base font-bold text-ink font-display mb-1.5">
              {selectedHotspot?.title}
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed mb-4">
              {selectedHotspot?.description}
            </p>

            <div className="bg-surface rounded-lg p-3 border border-line mb-4 space-y-1.5">
              <div className="text-[11px] font-mono text-zinc-500 uppercase font-semibold">
                Spatial Attributes
              </div>
              {selectedHotspot?.detailSpecs?.map((spec, i) => (
                <div key={i} className="text-xs text-zinc-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => selectedHotspot && triggerAction(selectedHotspot)}
              className="w-full py-2.5 px-4 rounded-lg bg-ink text-white hover:bg-accent transition-colors text-xs font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{selectedHotspot?.ctaText}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Embed snippet explanation */}
          <div className="bg-white border border-line rounded-xl p-4 text-xs text-zinc-600 shadow-xs">
            <div className="font-semibold text-zinc-900 font-display mb-1 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>Single-line CMS Embed</span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-2">
              Every tour generates a responsive embed code compatible with WordPress, Webflow, Squarespace, and custom apps.
            </p>
            <div className="font-mono text-[10px] bg-zinc-900 text-zinc-300 p-2 rounded border border-zinc-800 overflow-x-auto select-all">
              &lt;iframe src="https://view.rcaas.tech/tour/basera-hotel" allow="xr-spatial-tracking" loading="lazy"&gt;&lt;/iframe&gt;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
