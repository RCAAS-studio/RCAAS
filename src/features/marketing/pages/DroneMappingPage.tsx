import React, { useState, useEffect } from 'react';
import { IMG } from '../data/images';
import { RoutePath } from '../types';
import { SplatEmbed } from '../components/SplatEmbed';
import { FaqList } from '../components/GuideParts';
import { buttonClass } from '../components/ui';

interface DroneMappingPageProps {
  onNavigate: (path: RoutePath) => void;
  onOpenPlanner?: () => void;
}

const KEY_FACTS = [
  { label: 'What you get', value: 'Orthomosaic map, surface and terrain models, 3D site model' },
  { label: 'Area per day', value: 'Dozens of hectares per day, depending on terrain, altitude and detail' },
  { label: 'Ready in', value: 'Typically 3 to 7 business days from flight completion' },
  { label: 'Accuracy', value: 'Sub-centimeter GSD; absolute georeferencing calibrated with survey GCPs' },
  { label: 'Permissions', value: 'We coordinate flight permits and security clearances with authorities' },
  { label: 'Pricing', value: 'Quoted per hectare, site perimeter, or specific deliverable scope' },
  { label: 'Where', value: 'Kathmandu Valley and across all 7 provinces in Nepal' },
];

const COMPARISON_ROWS = [
  {
    feature: 'Large or steep sites',
    ground: 'Slow, hazardous, requires dozens of physical instrument setups',
    drone: 'Covered in automated, high-overlap autonomous flight missions',
  },
  {
    feature: 'Roofs and courtyards',
    ground: 'Hard, slow or unsafe to reach without high scaffolding or cranes',
    drone: 'Captured safely from above with zero risk to personnel or tiles',
  },
  {
    feature: 'What is recorded',
    ground: 'Only selected, discrete surveyed survey points',
    drone: 'The entire visible surface captured in millions of pixels',
  },
  {
    feature: 'Repeat surveys',
    ground: 'Full manual labor, tape and total station setup each time',
    drone: 'Identical waypoint flight plan re-run effortlessly for progress tracking',
  },
];

const DELIVERABLES = [
  {
    deliverable: 'Orthomosaic Map',
    whatItIs: 'A true-scale, georeferenced distortion-free aerial photographic map',
    useItFor: 'Site plans, cadastral overlay, GIS databases, measuring real distances and boundary areas',
    formats: 'GeoTIFF, ECW, High-Res JPEG',
  },
  {
    deliverable: 'Digital Surface Model (DSM)',
    whatItIs: 'Elevation model capturing heights of everything: terrain, trees, structures, and walls',
    useItFor: 'Line-of-sight analysis, solar shading simulations, 3D spatial context and skyline studies',
    formats: 'GeoTIFF, XYZ, LAS',
  },
  {
    deliverable: 'Digital Terrain Model (DTM)',
    whatItIs: 'Filtered bare-earth elevation model stripping away trees and structures',
    useItFor: 'Civil engineering earthworks, slope stability, watershed drainage, and foundation planning',
    formats: 'GeoTIFF, ASCII Grid',
  },
  {
    deliverable: '3D Textured Site Model',
    whatItIs: 'Photorealistic 3D polygonal mesh of site topography and building exteriors',
    useItFor: 'BIM site context, stakeholder presentations, VR simulations, and architectural competitions',
    formats: 'OBJ, FBX, glTF, USDZ',
  },
  {
    deliverable: 'Topographic Contours',
    whatItIs: 'Smooth vector contour curves generated at custom elevation intervals (e.g., 0.25m, 0.5m, 1m)',
    useItFor: 'Engineering grading plans, AutoCAD site layouts, and municipal submission drawings',
    formats: 'DWG, DXF, SHP',
  },
  {
    deliverable: 'Volumetric Calculations',
    whatItIs: 'Accurate cut, fill, and stockpile volume reports measured against benchmark planes',
    useItFor: 'Earthmoving contractor verification, quarry inventory, and excavation progress tracking',
    formats: 'PDF Report, CSV, GeoTIFF',
  },
];

const USE_CASES = [
  {
    title: 'Site and land surveys',
    badge: 'Pre-Purchase & Planning',
    description: 'A true-scale measured map of the complete property before acquisition, design, or master planning.',
  },
  {
    title: 'Planning and design',
    badge: 'Civil & Architectural Context',
    description: 'Accurate terrain slopes, road alignments and contextual buildings for architects and civil engineers.',
  },
  {
    title: 'Large heritage complexes',
    badge: 'Monuments & Sacred Sites',
    description: 'Document multi-tiered pagoda roofs, sprawling courtyards, and compound walls in one unified 3D record.',
  },
  {
    title: 'Roof and facade records',
    badge: 'Condition Inspection',
    description: 'Inspect tile deterioration, structural cracking, and gutter conditions without erecting expensive scaffolding.',
  },
  {
    title: 'Monitoring change',
    badge: 'Construction Tracking',
    description: 'Repeat identical waypoint flights monthly to verify earthwork volumes and structural construction progress.',
  },
  {
    title: 'Municipal mapping',
    badge: 'Smart Cities & GIS',
    description: 'Provide local governments with high-resolution base maps for property tax records, disaster management, and zoning.',
  },
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Brief & Permissions',
    line: 'We agree the flight boundary, required GSD resolution, and deliverables, and initiate flight permits with regulatory authorities.',
  },
  {
    step: '02',
    title: 'Flight Planning & Control',
    line: 'We programme autonomous flight trajectories with optimal forward/side overlap and place survey-grade GNSS ground control points.',
  },
  {
    step: '03',
    title: 'Autonomous Flight Capture',
    line: 'Our certified remote pilots execute the planned mapping missions using RTK survey drones with mechanical shutter cameras.',
  },
  {
    step: '04',
    title: 'Photogrammetric Processing',
    line: 'Images are bundle-block adjusted, orthorectified, and checked against independent ground check points to verify absolute scale.',
  },
  {
    step: '05',
    title: 'Delivery & CAD Integration',
    line: 'You receive georeferenced GeoTIFFs, DWG contour drawings, 3D meshes, and an interactive web link ready for your GIS or CAD software.',
  },
];

const FAQS = [
  {
    question: 'Do you need permission to fly in Nepal?',
    answer:
      'Yes. Commercial drone flights in Nepal require regulatory clearance from civil aviation authorities, the Ministry of Home Affairs, and local administration. RCAAS manages the permit documentation and flight scheduling as part of our turnkey project delivery, ensuring all flights comply with national safety regulations.',
  },
  {
    question: 'How large an area can you map in a day?',
    answer:
      'Depending on terrain topography, altitude, weather, and the required ground resolution (GSD), our survey teams can capture sites ranging from a single 0.5-hectare building compound up to dozens of hectares in a single field day. Multi-day operations cover large infrastructure corridors and municipal townships.',
  },
  {
    question: 'How accurate is drone mapping?',
    answer:
      'When calibrated with survey-grade GNSS ground control points (GCPs) and RTK positioning, horizontal and vertical accuracy is typically within 2 to 5 centimeters. Ground Sample Distance (GSD) is typically sub-centimeter (1–2 cm per pixel). We discuss your specific engineering tolerance requirements during the scoping phase and provide an RMS calibration report upon delivery.',
  },
  {
    question: 'Can you fly over temples and heritage sites?',
    answer:
      'Yes, with appropriate government permissions from the Department of Archaeology and local guthi trusts. We maintain absolute respect for sacred spaces, religious ceremonies, and worshippers. Drone capture is 100% contactless, ensuring zero risk of contact or physical disruption to delicate historic monuments.',
  },
  {
    question: 'What if the weather is bad on the flight day?',
    answer:
      'We track localized weather forecasts closely. High-accuracy photogrammetry requires stable lighting and winds within manufacturer safety envelopes. We never fly in rain, active thunderstorms, or high winds. We include weather buffer contingency days in all project proposals at no extra cost.',
  },
  {
    question: 'Can you combine aerial drone mapping with ground survey data?',
    answer:
      'Yes. Combining aerial drone mapping with handheld SLAM laser scanning is one of our flagship capabilities. Drone passes capture roofs, courtyards, and grounds, while our walking LiDAR scanner captures complex interior floors. Both datasets are co-registered into one unified coordinate system.',
  },
];

export const DroneMappingPage: React.FC<DroneMappingPageProps> = ({ onNavigate }) => {
  const [showcaseMode, setShowcaseMode] = useState<'ortho' | 'dem' | '3d'>('ortho');
  const [contourDensity, setContourDensity] = useState<number>(50);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  return (
    <div className="bg-white text-zinc-900 min-h-dvh selection:bg-accent selection:text-white">
      {/* 1. HERO + ANSWER SUMMARY */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 border-b border-zinc-200 overflow-hidden">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,#000_70%,transparent_100%)] opacity-75 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-xs font-mono tracking-wider uppercase text-zinc-600">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <span className="text-zinc-400" aria-hidden="true">›</span>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/services/')}
                  className="hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  What we create
                </button>
              </li>
              <li>
                <span className="text-zinc-400" aria-hidden="true">›</span>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/services/digital-twins/')}
                  className="hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  Digital Twins &amp; Survey
                </button>
              </li>
              <li>
                <span className="text-zinc-400" aria-hidden="true">›</span>
              </li>
              <li className="text-zinc-900 font-semibold" aria-current="page">
                Drone Mapping
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 mb-6">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-600">
                  Capability · Drone Mapping &amp; Aerial Survey
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-6">
                See and measure your whole site from above.
              </h1>

              <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed mb-8 max-w-3xl">
                Drone mapping uses planned survey flights to capture land, roofs and whole sites from above, then turns the images into true-scale maps and 3D models. RCAAS Technology provides drone mapping and aerial survey across Nepal, delivering orthomosaic maps, terrain models and 3D site models for planning, design, monitoring and heritage records.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('/contact/')}
                  className={buttonClass('dark', 'md')}
                >
                  <span>Get a survey quote</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <a
                  href="#showcase"
                  className="px-6 py-3.5 bg-white hover:bg-zinc-50 text-zinc-900 text-sm font-semibold rounded-lg border border-zinc-300 transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>See an example</span>
                </a>
              </div>
            </div>

            {/* Quick Aerial Tech Card */}
            <div className="lg:col-span-4 bg-zinc-50 border border-zinc-200 rounded-xl p-6 relative">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-600 mb-4 pb-2 border-b border-zinc-200 flex justify-between items-center">
                <span>Aerial Survey Profile</span>
                <span className="text-accent font-bold">RTK Drone</span>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Camera hardware:</span>
                  <span className="font-mono text-xs text-zinc-900">4/3 CMOS Mechanical Shutter</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Ground sampling:</span>
                  <span className="font-mono text-xs text-zinc-900">Sub-centimeter GSD</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Primary output:</span>
                  <span className="font-mono text-xs text-zinc-900">GeoTIFF · DSM/DTM · OBJ</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Coordinate system:</span>
                  <span className="font-mono text-xs text-zinc-900">WGS84 / Nepal Grid (UTM)</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Flight approvals:</span>
                  <span className="font-mono text-xs text-zinc-900">Handled on your behalf</span>
                </li>
              </ul>

              <div className="mt-5 pt-4 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Need immediate feasibility?</span>
                <a
                  href="https://wa.me/9779801234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  WhatsApp flight team →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KEY FACTS STRIP */}
      <section className="py-12 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-6 font-semibold">
            Key Specifications &amp; Project Terms
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {KEY_FACTS.map((fact, i) => (
              <div
                key={i}
                className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs"
              >
                <div className="font-mono text-xs font-semibold text-zinc-500 mb-2 uppercase">
                  {fact.label}
                </div>
                <div className="text-sm font-bold text-zinc-900 leading-snug">
                  {fact.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STICKY ANCHOR NAVIGATION STRIP */}
      <nav aria-label="Section anchors" className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 py-3 overflow-x-auto shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 sm:space-x-3 text-xs font-mono whitespace-nowrap">
          <span className="text-zinc-400 uppercase text-[10px] tracking-wider mr-2 hidden sm:inline">Jump to:</span>
          <a href="#showcase" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#showcase</a>
          <a href="#why-drone" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#why-drone</a>
          <a href="#deliverables" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#deliverables</a>
          <a href="#uses" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#uses</a>
          <a href="#process" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#process</a>
          <a href="#toolkit" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#toolkit</a>
          <a href="#more-value" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#more-value</a>
          <a href="#faq" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#faq</a>
        </div>
      </nav>

      {/* 3. SHOWCASE (#showcase) */}
      <section id="showcase" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-zinc-200">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
                Aerial Data Showcase
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
                See a site from above
              </h2>
              <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
                Inspect high-resolution aerial mapping data. Compare a true-scale orthomosaic map with the underlying digital elevation model (DEM) and 3D mesh.
              </p>
            </div>

            {/* View Switcher */}
            <div className="mt-4 md:mt-0 flex items-center space-x-1 sm:space-x-2 bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs">
              <button
                onClick={() => setShowcaseMode('ortho')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  showcaseMode === 'ortho'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Orthomosaic Map
              </button>
              <button
                onClick={() => setShowcaseMode('dem')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  showcaseMode === 'dem'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Elevation Terrain Model
              </button>
              <button
                onClick={() => setShowcaseMode('3d')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  showcaseMode === '3d'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                3D Site Model
              </button>
            </div>
          </div>

          {/* Aerial Viewer Container */}
          {showcaseMode === '3d' ? (
            <div>
              <div className="mb-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-semibold text-zinc-900">
                    Live 3D Aerial Reality Capture: Chilancho Stupa &amp; Surroundings.
                  </span>
                  <span className="text-zinc-500 hidden sm:inline">
                    — Rotate freely to inspect roof tiers, spires, and adjacent courtyard geometry.
                  </span>
                </div>
                <button
                  onClick={() => setShowcaseMode('ortho')}
                  className="font-mono text-accent hover:underline cursor-pointer"
                >
                  Return to Orthomosaic View →
                </button>
              </div>
              <SplatEmbed initialDemo="chilancho" />
            </div>
          ) : (
            <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-950 text-white shadow-lg">
              <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                <img loading="lazy" decoding="async"
                  src={showcaseMode === 'ortho' ? IMG['drone-mapping/showcase-ortho'] : IMG['drone-mapping/showcase-point-cloud']}
                  alt={showcaseMode === 'ortho' ? 'True-scale aerial orthomosaic map' : 'Digital surface model elevation gradient'}
                  className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />

                {/* Aerial Telemetry HUD */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2 bg-black/70 px-3 py-1.5 rounded border border-zinc-800">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>
                      {showcaseMode === 'ortho' ? 'TRUE-SCALE ORTHOMOSAIC: 1.2 CM/PX GSD' : 'DIGITAL SURFACE MODEL: 0.5M CONTOURS'}
                    </span>
                  </div>
                  <div className="bg-black/70 px-3 py-1.5 rounded border border-zinc-800 text-zinc-300">
                    RTK FIXED · 18 SATELLITES
                  </div>
                </div>

                {/* Contour overlay controller */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/85 p-4 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-white mb-1">
                      {showcaseMode === 'ortho' ? 'Seamless Aerial Orthomosaic (GeoTIFF)' : 'Digital Elevation Model (DEM) with Shaded Relief'}
                    </div>
                    <div className="text-zinc-400 font-mono text-[11px]">
                      Coordinate System: Nepal Grid (UTM Zone 45N) · Distortion corrected with mechanical shutter
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-mono text-zinc-400">Contour Interval:</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={contourDensity}
                      onChange={(e) => setContourDensity(Number(e.target.value))}
                      className="w-32 accent-accent cursor-pointer"
                      aria-label="Contour interval adjustment"
                    />
                    <span className="font-mono text-zinc-300 text-xs w-10">{(contourDensity / 100).toFixed(2)}m</span>
                  </div>
                </div>
              </div>

              {/* Technical Caption */}
              <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-300">
                <div>
                  <span className="font-bold text-white">Project:</span> Large Site &amp; Heritage Mapping, Nepal ·{' '}
                  <span className="text-zinc-400">
                    Captured with autonomous RTK drone survey flights to provide true-scale base data for master planning and preservation.
                  </span>
                </div>
                <button
                  onClick={() => setShowcaseMode('3d')}
                  className="mt-2 sm:mt-0 font-mono text-xs text-accent hover:underline cursor-pointer"
                >
                  View in 3D Mode →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. WHY DRONE MAPPING (#why-drone) */}
      <section id="why-drone" className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Aerial Advantage
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 leading-tight">
              The whole site, mapped in a fraction of the time
            </h2>
            <p className="text-base text-zinc-700 mt-4 leading-relaxed">
              Some places can't be measured well from the ground: large sites, steep terrain, rooftops and courtyards hidden behind walls. A survey drone captures them in a few planned flights, without anyone climbing a roof or walking every slope. The images become a true-scale map you can measure from, and a 3D model of the ground and everything on it.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 font-mono text-xs uppercase tracking-wider text-zinc-700">
                    <th className="py-4 px-6 font-semibold w-1/3">Survey Challenge</th>
                    <th className="py-4 px-6 font-semibold w-1/3 text-zinc-500">Ground Survey Alone</th>
                    <th className="py-4 px-6 font-semibold w-1/3 text-accent">Drone Mapping &amp; Aerial Survey</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-zinc-900">
                        {row.feature}
                      </td>
                      <td className="py-4 px-6 text-zinc-600">
                        {row.ground}
                      </td>
                      <td className="py-4 px-6 font-medium text-zinc-900">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2" />
                        {row.drone}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Honest Note on Canopy */}
          <div className="p-5 rounded-xl bg-white border border-zinc-200 text-xs sm:text-sm text-zinc-700 leading-relaxed shadow-xs">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-900 font-semibold mb-2 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Honest Engineering Note: Drones &amp; Dense Tree Canopy</span>
            </div>
            Drones see surfaces. Under dense trees or heavy forest vegetation, the bare ground itself may not be visible to optical sensors. In those scenarios, we combine aerial capture with terrestrial survey or ground laser scanning where the terrain beneath the canopy matters. We will advise you transparently at the project brief stage.
          </div>
        </div>
      </section>

      {/* 5. WHAT YOU RECEIVE (#deliverables) */}
      <section id="deliverables" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Deliverables Package
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              What you receive
            </h2>
            <p className="text-base text-zinc-700 mt-4 leading-relaxed">
              Standard, software-agnostic spatial files ready for direct import into AutoCAD Civil 3D, QGIS, ArcGIS, Revit, and Blender:
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 font-mono text-xs uppercase tracking-wider text-zinc-700">
                    <th className="py-4 px-6 font-semibold">Deliverable</th>
                    <th className="py-4 px-6 font-semibold">What it is</th>
                    <th className="py-4 px-6 font-semibold">Use it for</th>
                    <th className="py-4 px-6 font-semibold">Formats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {DELIVERABLES.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-zinc-900 whitespace-nowrap">
                        {item.deliverable}
                      </td>
                      <td className="py-4 px-6 text-zinc-600 leading-relaxed">
                        {item.whatItIs}
                      </td>
                      <td className="py-4 px-6 text-zinc-600 leading-relaxed">
                        {item.useItFor}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-accent font-semibold whitespace-nowrap">
                        {item.formats}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHAT CLIENTS USE IT FOR (#uses) */}
      <section id="uses" className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Application Sectors
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              What clients use it for
            </h2>
            <p className="text-base text-zinc-600 mt-4 leading-relaxed">
              How developers, civil engineers, municipal planners, and heritage conservationists put aerial mapping to work:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {USE_CASES.map((uc, i) => (
              <div
                key={i}
                className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent block mb-2">
                    {uc.badge}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">
                    {uc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {uc.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('/industries/government-municipalities/')}
                className="font-semibold text-zinc-900 hover:text-accent underline cursor-pointer"
              >
                For municipalities &amp; public bodies →
              </button>
              <span className="text-zinc-300">·</span>
              <button
                onClick={() => onNavigate('/industries/heritage-culture/')}
                className="font-semibold text-zinc-900 hover:text-accent underline cursor-pointer"
              >
                For heritage &amp; culture →
              </button>
              <span className="text-zinc-300">·</span>
              <button
                onClick={() => onNavigate('/industries/real-estate-architecture/')}
                className="font-semibold text-zinc-900 hover:text-accent underline cursor-pointer"
              >
                For property developers →
              </button>
            </div>

            <button
              onClick={() => onNavigate('/contact/')}
              className="text-accent font-semibold hover:underline cursor-pointer"
            >
              Discuss your site perimeter →
            </button>
          </div>
        </div>
      </section>

      {/* 7. HOW A DRONE MAPPING PROJECT WORKS (#process) */}
      <section id="process" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Workflow Protocol
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              How a drone mapping project works
            </h2>
            <p className="text-base text-zinc-600 mt-4 leading-relaxed">
              From regulatory flight approvals to certified delivery, our structured survey pipeline ensures compliance and accuracy:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.step}
                className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono text-2xl font-bold text-accent mb-3">
                    {step.step}
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {step.line}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200 text-[10px] font-mono text-zinc-400">
                  Step {step.step} of 05
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('/how-we-work/')}
              className="font-mono text-xs text-accent hover:underline cursor-pointer font-semibold"
            >
              See our full field procedures &amp; quality check protocol →
            </button>
          </div>
        </div>
      </section>

      {/* 8. OUR AERIAL TOOLKIT (#toolkit) */}
      <section id="toolkit" className="py-16 md:py-20 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
                Survey Hardware &amp; Photogrammetry
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                Our aerial toolkit
              </h2>
              <p className="text-base text-zinc-600 leading-relaxed mb-6">
                We fly survey drones built specifically for mapping, such as the DJI Mavic 3 Enterprise, whose mechanical-shutter camera eliminates motion blur and gives distortion-free images for precise photogrammetry. We integrate RTK positioning and tie data to real-world coordinates with survey-grade GNSS and ground control points (GCPs). When interior floors or close details are needed, we combine flights with handheld SLAM laser scanning.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <button
                  onClick={() => onNavigate('/services/digital-twins/3d-laser-scanning/')}
                  className="text-zinc-900 hover:text-accent underline cursor-pointer"
                >
                  3D laser scanning →
                </button>
                <span className="text-zinc-300">·</span>
                <button
                  onClick={() => onNavigate('/how-we-work/')}
                  className="text-zinc-900 hover:text-accent underline cursor-pointer"
                >
                  Full survey toolkit →
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl p-5 text-center shadow-xs">
              <div className="text-2xl font-bold font-mono text-accent mb-1">DJI Mavic 3E</div>
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">Mechanical Shutter RTK</div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                4/3 CMOS sensor with 0.7-second interval shooting, eliminating rolling shutter distortion at high flight speeds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. MORE FROM THE SAME FLIGHT (#more-value) */}
      <section id="more-value" className="py-16 md:py-20 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 sm:p-10 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
                  Dual-Use Project Value
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                  Maps for your engineers, visuals for your audience
                </h2>
                <p className="text-base text-zinc-600 leading-relaxed mb-6">
                  The same flights that produce your survey data can also give you cinematic aerial views and fly-through footage for presentations, investor launches and marketing campaigns. One deployment delivers both technical CAD deliverables and promotional media.
                </p>
                <button
                  onClick={() => onNavigate('/services/visual-storytelling/')}
                  className="text-xs font-semibold text-zinc-900 hover:text-accent underline cursor-pointer"
                >
                  Explore Visual Storytelling &amp; Fly-Through Films →
                </button>
              </div>

              <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl p-5 text-center shadow-xs">
                <div className="text-3xl font-bold font-mono text-accent mb-1">1 Flight Mission</div>
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Dual Project Output</div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Engineers get GeoTIFF maps &amp; contours. Marketing gets 4K cinematic launch reels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FEATURED PROJECT */}
      <section className="py-16 md:py-20 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
            In Practice
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-8">
            Case Study: Chilancho Stupa
          </h2>

          <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white grid grid-cols-1 lg:grid-cols-12 shadow-xs">
            <div className="lg:col-span-7 aspect-video lg:aspect-auto relative overflow-hidden">
              <img loading="lazy" decoding="async"
                src={IMG['drone-mapping/chilancho-stupa-aerial-drone-documentation']}
                alt="Chilancho Stupa Aerial Drone Documentation"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-bold block mb-2">
                  Aerial &amp; Terrestrial Heritage Record · Kirtipur, Nepal
                </span>
                <h3 className="text-2xl font-bold text-zinc-900 mb-3">
                  Historic Stupa Documented in 3D
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                  A historic stupa and its surrounding courtyards documented in complete 3D, from the ground and from the air. High-altitude drone passes captured the pinnacle and roof tiers, while terrestrial scanners mapped the surrounding stone platform.
                </p>
                <div className="space-y-2 text-xs font-mono text-zinc-700 mb-6">
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span>Aerial GSD:</span>
                    <span className="font-bold text-zinc-900">0.8 cm / pixel</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span>Flight Safety:</span>
                    <span className="font-bold text-zinc-900">100% Non-contact capture</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deliverables:</span>
                    <span className="font-bold text-zinc-900">Orthomosaic, 3D Mesh, DSM</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('/work/chilancho-stupa-digital-heritage/')}
                className={buttonClass('dark', 'sm', 'self-start')}
              >
                See the project →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ (#faq) */}
      <section id="faq" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Regulatory &amp; Technical FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              Questions about drone mapping
            </h2>
          </div>

          <FaqList items={FAQS} />
        </div>
      </section>

      {/* 12. CTA BAND */}
      <section className="py-20 bg-zinc-900 text-white relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-300">
              Flight Scoping &amp; Survey Quotation
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
            Map your site with confidence
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell us the location, the size of the area and what you need the data for. We'll plan the flights, coordinate approvals, and send a clear proposal.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/contact/')}
              className={buttonClass('primary', 'lg', 'shadow-lg hover:shadow-red-900/30')}
            >
              <span>Get a survey quote</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <a
              href="https://wa.me/9779801234567"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg border border-zinc-700 transition-colors flex items-center space-x-2 text-sm"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.541 1.838.831 2.791.831 3.181 0 5.767-2.586 5.767-5.766.001-3.182-2.585-5.767-5.767-5.767zm0 10.428c-.854 0-1.637-.247-2.316-.701l-.166-.111-1.574.413.421-1.536-.122-.194c-.5-.794-.764-1.597-.763-2.532.001-2.573 2.093-4.665 4.52-4.665 2.427 0 4.519 2.092 4.519 4.665-.001 2.573-2.092 4.661-4.519 4.661z" />
              </svg>
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          <p className="mt-8 text-xs font-mono text-zinc-500">
            RCAAS Technology · Kathmandu, Nepal · RTK Drone photogrammetry &amp; orthomosaic mapping
          </p>
        </div>
      </section>

      {/* 13. RELATED CAPABILITIES */}
      <section className="py-16 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-6 font-semibold">
            Related Capabilities
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => onNavigate('/services/digital-twins/3d-laser-scanning/')}
              className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 transition-all cursor-pointer shadow-xs group"
            >
              <h4 className="text-base font-bold text-zinc-900 group-hover:text-accent transition-colors mb-2">
                3D Laser Scanning
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4">
                Add dense millimeter interior point clouds and as-built drawings to your aerial survey.
              </p>
              <span className="text-xs font-semibold text-accent">
                Explore laser scanning →
              </span>
            </div>

            <div
              onClick={() => onNavigate('/services/digital-twins/')}
              className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 transition-all cursor-pointer shadow-xs group"
            >
              <h4 className="text-base font-bold text-zinc-900 group-hover:text-accent transition-colors mb-2">
                Survey and GIS
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4">
                Geodetic ground control, topographic spot heights, and GIS cadastral layers.
              </p>
              <span className="text-xs font-semibold text-accent">
                View digital twins hub →
              </span>
            </div>

            <div
              onClick={() => onNavigate('/services/visual-storytelling/')}
              className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 transition-all cursor-pointer shadow-xs group"
            >
              <h4 className="text-base font-bold text-zinc-900 group-hover:text-accent transition-colors mb-2">
                Visual Storytelling
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4">
                Cinematic fly-through films and promotional aerial reels from the same mission.
              </p>
              <span className="text-xs font-semibold text-accent">
                Explore storytelling →
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
