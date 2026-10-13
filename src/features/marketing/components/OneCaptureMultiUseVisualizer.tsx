import React, { useState } from 'react';
import { IMG } from '../data/images';
import { motion, AnimatePresence } from 'framer-motion';
import { RoutePath } from '../types';

interface Hotspot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  title: string;
  telemetry: string;
}

interface DeliverableOutput {
  id: string;
  number: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  forWhom: string;
  deliverables: string[];
  specs: { label: string; value: string }[];
  route: RoutePath;
  buttonText: string;
  image: string;
  overlayStyle: 'tour' | 'film' | 'vr' | 'bim';
  hotspots: Hotspot[];
}

const DELIVERABLES: DeliverableOutput[] = [
  {
    id: 'tour',
    number: '01',
    name: '3D Virtual Tour',
    category: 'Immersive Experiences',
    badge: 'Browser Instant Access',
    description: 'A photorealistic digital twin visitors can explore on any phone, tablet, or desktop with zero app downloads. Complete with waypoint jumps and info tags.',
    forWhom: 'Websites, booking pages, admissions campaigns, and property listings.',
    deliverables: ['Custom Web Viewer', 'Interactive Waypoints', 'Booking / Lead Hotspots', 'Embed Code'],
    specs: [
      { label: 'Access', value: 'Instant via URL (No App)' },
      { label: 'Load Time', value: '< 1.8 seconds' },
      { label: 'Compatibility', value: 'iOS, Android, Windows, Mac' },
    ],
    route: '/services/immersive-experiences/3d-virtual-tours/',
    buttonText: 'Explore 3D Virtual Tours',
    image: IMG['one-capture-multi-use-visualizer/compatibility'],
    overlayStyle: 'tour',
    hotspots: [
      { id: 'h1', x: 38, y: 46, title: 'Central Courtyard Waypoint', telemetry: '360° HDR · 16K Panorama' },
      { id: 'h2', x: 68, y: 32, title: 'Deluxe Suite Entrance', telemetry: 'Direct Room Booking Link' },
    ],
  },
  {
    id: 'film',
    number: '02',
    name: 'Cinematic Fly-Through Film',
    category: 'Visual Storytelling',
    badge: '4K Narrative Video',
    description: 'Ultra-smooth scripted camera flights generated directly from your 3D spatial capture. Scripted and narrated around what you want your audience to feel and do.',
    forWhom: 'Instagram Reels, YouTube, TV commercials, investor decks, and launch campaigns.',
    deliverables: ['4K UHD Master Video', '9:16 Social Reels', 'Voiceover Audio', 'Colour Graded Stills'],
    specs: [
      { label: 'Resolution', value: '4K 60fps Ultra HD' },
      { label: 'Sound', value: 'Spatial narration & sound design' },
      { label: 'Formats', value: '16:9 Landscape & 9:16 Portrait' },
    ],
    route: '/services/visual-storytelling/',
    buttonText: 'Explore Visual Storytelling',
    image: IMG['one-capture-multi-use-visualizer/formats'],
    overlayStyle: 'film',
    hotspots: [
      { id: 'h1', x: 50, y: 38, title: 'Dome Orbit Keyframe', telemetry: '4K ProRes 422 · Shutter 1/120' },
      { id: 'h2', x: 26, y: 64, title: 'Plinth Elevation Track', telemetry: 'Drone Aerial Spline Path' },
    ],
  },
  {
    id: 'vr',
    number: '03',
    name: 'VR & Exhibition Immersion',
    category: 'Immersive Experiences',
    badge: '6DoF Virtual Reality',
    description: 'Fully immersive 1:1 scale virtual reality for Meta Quest and Apple Vision Pro. Visitors step physically inside your spaces during trade expos and admissions fairs.',
    forWhom: 'International trade expos, admissions fairs, VIP showrooms, and cultural museum kiosks.',
    deliverables: ['Standalone VR App', 'Interactive Teleport Controls', 'Kiosk Auto-Reset Mode'],
    specs: [
      { label: 'Field of View', value: '110° Stereo 3D' },
      { label: 'Framerate', value: '90 FPS smooth tracking' },
      { label: 'Hardware', value: 'Meta Quest 3, Apple Vision Pro' },
    ],
    route: '/services/immersive-experiences/',
    buttonText: 'Explore VR Experiences',
    image: IMG['one-capture-multi-use-visualizer/hardware'],
    overlayStyle: 'vr',
    hotspots: [
      { id: 'h1', x: 42, y: 52, title: 'Teleport Node A (Main Quad)', telemetry: '6DoF Physical Boundary Active' },
      { id: 'h2', x: 74, y: 44, title: 'STEM Laboratory Portal', telemetry: 'Interactive Equipment Hotspot' },
    ],
  },
  {
    id: 'bim',
    number: '04',
    name: 'As-Built CAD & BIM Data',
    category: 'Digital Twins & Survey',
    badge: 'Millimetre SLAM LiDAR',
    description: 'Clean, measured point clouds and CAD drawings ready for architects, engineers, and conservators. Cuts repeat site visits and guarantees design precision.',
    forWhom: 'Architects, MEP engineers, interior fit-out teams, and heritage conservators.',
    deliverables: ['Dense Point Cloud (.LAS/.E57)', '2D CAD Floor Plans (.DWG)', 'Revit/BIM IFC Model'],
    specs: [
      { label: 'Accuracy', value: '±5mm Terrestrial SLAM' },
      { label: 'Density', value: '200,000 pts / second' },
      { label: 'Datum', value: 'UTM / WGS84 Geodetic RTK' },
    ],
    route: '/services/digital-twins/3d-laser-scanning/',
    buttonText: 'Explore Digital Twins & Survey',
    image: IMG['one-capture-multi-use-visualizer/datum'],
    overlayStyle: 'bim',
    hotspots: [
      { id: 'h1', x: 48, y: 40, title: 'LiDAR Registration Station #04', telemetry: '±4.2mm Terrestrial SLAM' },
      { id: 'h2', x: 30, y: 68, title: 'Geodetic RTK Ground Control Point', telemetry: 'UTM Zone 45N / WGS84' },
    ],
  },
];

interface VisualizerProps {
  onNavigate: (path: RoutePath) => void;
}

export const OneCaptureMultiUseVisualizer: React.FC<VisualizerProps> = ({ onNavigate }) => {
  const [selectedId, setSelectedId] = useState<string>('tour');
  const [isLidarMode, setIsLidarMode] = useState<boolean>(false);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  const active = DELIVERABLES.find((d) => d.id === selectedId) || DELIVERABLES[0];

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm">
      {/* Header explanation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-mono text-accent font-semibold mb-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
            Interactive Output Switcher
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-ink">
            From 1 Single Site Visit &rarr; 4 High-Value Deliverables
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 max-w-2xl">
            Select an output below to see how our reality-capture engineering pipeline extracts maximum commercial and technical value from one single visit.
          </p>
        </div>

        {/* Efficiency Metric & LiDAR Toggle */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setIsLidarMode(!isLidarMode)}
            className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 ${
              isLidarMode
                ? 'bg-ink text-white border-ink shadow-sm'
                : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
            }`}
            title="Toggle LiDAR laser scan sweep view"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isLidarMode ? 'bg-accent animate-pulse' : 'bg-zinc-400'
              }`}
            />
            <span>{isLidarMode ? 'LiDAR Sweep Active' : 'Inspect LiDAR Beam'}</span>
          </button>

          <div className="flex items-center gap-3 bg-zinc-50 p-2.5 px-3.5 rounded-xl border border-zinc-200/80">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-mono text-xs font-bold border border-accent/20">
              4x
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                ROI Multiplier
              </div>
              <div className="text-[11px] font-semibold text-zinc-900 leading-none mt-0.5">
                Zero duplicate visits
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Tab selection cards with circular badges and gradient shading */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {DELIVERABLES.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedId(item.id);
                  setActiveHotspotId(null);
                }}
                className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 flex items-start gap-4 relative ${
                  isSelected
                    ? 'border-accent bg-rose-50/40 shadow-sm ring-1 ring-accent/30 -translate-y-0.5'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/60'
                }`}
              >
                {/* Circular Top Icon / Number */}
                <div
                  className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full border transition-colors ${
                    isSelected
                      ? 'border-accent bg-accent text-white shadow-sm'
                      : 'border-zinc-200 bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <span className="font-mono text-xs font-bold">
                    {item.number}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                        isSelected
                          ? 'bg-rose-100 text-accent-strong'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h4
                    className={`text-base font-bold font-display mt-1 ${
                      isSelected ? 'text-accent' : 'text-zinc-900'
                    }`}
                  >
                    {item.name}
                  </h4>

                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Live Output Viewport & Deliverable Details */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {/* Visual Simulated Viewport */}
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-950 shadow-inner group">
                <img loading="lazy" decoding="async"
                  src={active.image}
                  alt={active.name}
                  className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05] transition-transform duration-700"
                />

                {/* Simulated LiDAR Scan Beam Sweep (if active) */}
                {isLidarMode && (
                  <motion.div
                    className="absolute inset-x-0 h-1 bg-accent shadow-[0_0_15px_#E11D48] pointer-events-none z-20"
                    animate={{
                      top: ['0%', '100%', '0%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <div className="absolute top-1 right-3 font-mono text-[9px] text-accent bg-black/80 px-2 py-0.5 rounded">
                      SLAM LASER SWEEP · ±5mm ACCURACY
                    </div>
                  </motion.div>
                )}

                {/* Interactive Clickable Telemetry Hotspots */}
                {active.hotspots.map((spot) => {
                  const isOpen = activeHotspotId === spot.id;
                  return (
                    <div
                      key={spot.id}
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveHotspotId(isOpen ? null : spot.id)}
                        className="group/pin relative flex items-center justify-center w-7 h-7 rounded-full bg-white/90 border border-accent shadow-lg hover:scale-110 transition-transform focus:outline-none"
                        aria-label={`Inspect ${spot.title}`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping absolute" />
                        <span className="w-2 h-2 rounded-full bg-accent relative" />
                      </button>

                      {/* Hotspot Popover Tooltip */}
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 p-2.5 rounded-lg bg-black/90 border border-white/20 text-white z-30 shadow-2xl"
                        >
                          <div className="text-[11px] font-bold font-display text-white">
                            {spot.title}
                          </div>
                          <div className="text-[10px] font-mono text-rose-300 mt-0.5">
                            {spot.telemetry}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}

                {/* Simulated UI Overlays according to type */}
                {active.overlayStyle === 'tour' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[11px] text-white">
                      <div className="flex items-center gap-2 bg-black/75 px-3 py-1.5 rounded-lg border border-white/20">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span>Interactive 3D Walkthrough Mode</span>
                      </div>
                      <div className="bg-black/75 px-3 py-1.5 rounded-lg border border-white/20">
                        Zero Plugins · 60 FPS
                      </div>
                    </div>
                  </>
                )}

                {active.overlayStyle === 'film' && (
                  <>
                    <div className="absolute inset-0 border-[16px] border-black/60 pointer-events-none flex flex-col justify-between p-2">
                      <div className="flex items-center justify-between text-white font-mono text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          REC · 4K UHD 60FPS
                        </span>
                        <span>SHUTTER 1/120 · ISO 200</span>
                      </div>
                      <div className="flex items-center justify-between text-white font-mono text-[10px]">
                        <span>PRORES 422 HQ</span>
                        <span>FLY-THROUGH CRANE TRACK A</span>
                      </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/30 border border-white/40 flex items-center justify-center text-white">
                      <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </>
                )}

                {active.overlayStyle === 'vr' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
                      <div className="w-16 h-16 rounded-full border border-cyan-400/50 flex items-center justify-center">
                        <span className="w-1 h-1 bg-cyan-400 rounded-full" />
                      </div>
                      <div className="w-16 h-16 rounded-full border border-cyan-400/50 flex items-center justify-center">
                        <span className="w-1 h-1 bg-cyan-400 rounded-full" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[11px] text-white">
                      <div className="bg-cyan-950/80 text-cyan-200 border border-cyan-500/40 px-3 py-1.5 rounded-lg">
                        Spatial 6DoF Mode · Headset Active
                      </div>
                      <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-white/20">
                        110° FOV · 90 Hz
                      </div>
                    </div>
                  </>
                )}

                {active.overlayStyle === 'bim' && (
                  <>
                    <div 
                      className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" 
                    />
                    <div className="absolute top-4 left-4 bg-black/80 border border-cyan-400/40 text-cyan-300 font-mono text-[11px] px-3 py-1.5 rounded">
                      TERRESTRIAL SLAM LIDAR: ±5mm ACCURACY
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/80 border border-zinc-700 text-zinc-300 font-mono text-[10px] px-3 py-1.5 rounded">
                      CAD / BIM DWG · IFC READY
                    </div>
                  </>
                )}
              </div>

              {/* Specs & Deliverables Breakdown */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-zinc-200">
                  {active.specs.map((spec) => (
                    <div key={spec.label}>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                        {spec.label}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-zinc-900 font-mono">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-2">
                    Packaged Deliverables:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active.deliverables.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-zinc-200 text-xs font-mono text-zinc-800 shadow-sm"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-zinc-500">
                    <strong className="text-zinc-900 font-semibold">Best for:</strong> {active.forWhom}
                  </div>
                  <button
                    onClick={() => onNavigate(active.route)}
                    className="loro-btn-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider max-w-full text-left sm:whitespace-nowrap self-start sm:self-auto"
                  >
                    {active.buttonText} &rarr;
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
