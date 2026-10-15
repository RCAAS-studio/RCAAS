import React, { useState, useEffect } from 'react';
import { IMG } from '../data/images';
import { RoutePath } from '../types';
import { SplatEmbed } from '../components/SplatEmbed';
import { FaqList } from '../components/GuideParts';
import { buttonClass } from '../components/ui';

interface LaserScanningPageProps {
  onNavigate: (path: RoutePath) => void;
  onOpenPlanner?: () => void;
}

const KEY_FACTS = [
  { label: 'What you get', value: 'Measured 3D point cloud, plus drawings and models built from it' },
  { label: 'Time on site', value: 'Minutes per floor; a few hours to a day for most buildings' },
  { label: 'Ready in', value: 'Typically 3 to 7 business days depending on area and drawing scope' },
  { label: 'Accuracy', value: 'Millimeter-scale relative measurement accuracy calibrated per site' },
  { label: 'Works with', value: 'CAD, BIM and GIS software via standard formats (E57, LAS, DWG, DXF)' },
  { label: 'Pricing', value: 'Quoted per floor area, scope of drawings, or project complexity' },
  { label: 'Where', value: 'Kathmandu Valley and across all provinces in Nepal' },
];

const COMPARISON_ROWS = [
  {
    feature: 'Time on site',
    tape: 'Days for a large building',
    slam: 'Minutes per floor (walking pace)',
  },
  {
    feature: 'What’s captured',
    tape: 'Only what you chose to measure by hand',
    slam: 'Everything in view (hundreds of thousands of pts/sec)',
  },
  {
    feature: 'Irregular walls & floors',
    tape: 'Easy to miss bowed walls or sagging timbers',
    slam: 'Recorded as they are in true millimeter coordinates',
  },
  {
    feature: 'Missed dimensions',
    tape: 'Requires another site visit and schedule delays',
    slam: 'Measure it anytime directly from the 3D scan',
  },
  {
    feature: 'Sharing with team',
    tape: 'Hand sketches, scanned notes and photos',
    slam: 'Clean CAD/BIM files and a shareable web 3D model',
  },
];

const USE_CASES = [
  {
    title: 'As-built surveys',
    badge: 'Pre-Design Basis',
    description: 'A complete, undeniable record of what is actually on site before architectural design or engineering calculations begin.',
  },
  {
    title: 'Renovation and fit-out',
    badge: 'Adaptive Reuse',
    description: 'Ensure new architectural interventions, structural reinforcements, and partitions fit the real building rather than outdated drawings.',
  },
  {
    title: 'Interior design',
    badge: 'Precision Joinery',
    description: 'Capture exact room shapes, ceiling heights, door reveals and out-of-square corners so custom joinery fits with zero on-site trimming.',
  },
  {
    title: 'Extensions and alterations',
    badge: 'Structural Tie-In',
    description: 'Accurate existing conditions, floor level datums and roof profiles to design extensions that connect seamlessly without clashes.',
  },
  {
    title: 'Complex or irregular buildings',
    badge: 'Organic & Historic',
    description: 'Arched brickwork, sloping traditional floors, intricate courtyards and non-orthogonal timber structures recorded without guesswork.',
  },
  {
    title: 'Hard or unsafe-to-reach areas',
    badge: 'Safety First',
    description: 'Measure high ceilings, plant rooms, deep voids, and structurally compromised areas safely from a distance with eye-safe lasers.',
  },
  {
    title: 'Heritage interiors',
    badge: 'Non-Invasive',
    description: 'A 100% contactless, detailed record of sacred temples, carved wooden struts, and historic palace rooms without touching fragile surfaces.',
  },
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Brief & Scope',
    line: 'You tell us the area, what the data is for and the deliverables you need. We agree target accuracy and coordinate datums.',
  },
  {
    step: '02',
    title: 'On-Site Scan',
    line: 'Our surveyor walks the building with the handheld SLAM scanner. Where absolute position matters, we tie the scan to GNSS control.',
  },
  {
    step: '03',
    title: 'Process & Check',
    line: 'We register the trajectories, filter transient noise, and verify point cloud tolerances against independent ground check points.',
  },
  {
    step: '04',
    title: 'Deliver & Share',
    line: 'You receive point clouds (E57/LAS), CAD drawings (DWG/PDF), and an interactive web 3D view with measurement tools.',
  },
];

const FAQS = [
  {
    question: 'How long does scanning take?',
    answer:
      'A single floor usually takes only minutes to walk and capture. Most residential buildings, commercial offices, or heritage courtyards are scanned in a few hours to a day, depending on size and accessibility. We give you a guaranteed on-site window in our proposal.',
  },
  {
    question: 'How accurate is a handheld laser scan?',
    answer:
      'Handheld SLAM LiDAR achieves millimeter-scale relative measurement accuracy across typical rooms and interior spaces. Where absolute georeferencing is needed, we anchor the scan to survey-grade GNSS control points. We discuss the specific tolerance required by your project during scoping and ensure it is achieved.',
  },
  {
    question: 'Do we need to empty the building?',
    answer:
      'No. Quieter times give the cleanest results, but people passing through can be filtered out during post-processing. Having someone on site to guide our surveyor and unlock doors ensures the fastest coverage with zero downtime.',
  },
  {
    question: 'Which files will I get?',
    answer:
      'We deliver industry-standard formats including E57, LAS, and LAZ for 3D point clouds, DWG and DXF for 2D architectural drawings, and vector PDFs. Files open directly in Autodesk AutoCAD, Revit, ArchiCAD, Rhino, CloudCompare, and SketchUp.',
  },
  {
    question: 'Can you scan outdoor areas and large sites too?',
    answer:
      'Yes. We combine handheld SLAM laser scanning with RTK survey drone capture for roofs, spires, compound grounds and surrounding topography, delivering a unified 3D dataset where interiors and exteriors join seamlessly.',
  },
  {
    question: 'Can the scan also become a 3D tour?',
    answer:
      'Yes. The same capture visit can produce both measured point cloud data for your design team and a photorealistic 3D virtual tour for your clients, saving budget, cutting repeat site visits, and ensuring consistent records.',
  },
];

export const LaserScanningPage: React.FC<LaserScanningPageProps> = ({ onNavigate }) => {
  const [showcaseView, setShowcaseView] = useState<'textured' | 'pointcloud'>('pointcloud');
  const [elevationSlice, setElevationSlice] = useState<number>(45);

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
                3D Laser Scanning
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 mb-6">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-600">
                  Capability · 3D Laser Scanning (SLAM LiDAR)
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-6">
                Measure any building in minutes. Design from reality.
              </h1>

              <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed mb-8 max-w-3xl">
                3D laser scanning records the exact shape of a building or space as millions of measured points, called a point cloud. RCAAS Technology uses handheld SLAM laser scanners to capture interiors and complex structures across Nepal in minutes, then delivers point clouds, drawings and 3D models that design teams can measure and work from.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('/contact/')}
                  className={buttonClass('dark', 'md')}
                >
                  <span>Get a scanning quote</span>
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
                  <span>See a scan</span>
                </a>
              </div>
            </div>

            {/* Quick Tech Profile Card */}
            <div className="lg:col-span-4 bg-zinc-50 border border-zinc-200 rounded-xl p-6 relative">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-600 mb-4 pb-2 border-b border-zinc-200 flex justify-between items-center">
                <span>SLAM Scanner Toolkit</span>
                <span className="text-accent font-bold">XGRIDS Lixel K1</span>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Scan speed:</span>
                  <span className="font-mono text-xs text-zinc-900">200,000+ pts/sec</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Mobility:</span>
                  <span className="font-mono text-xs text-zinc-900">Handheld continuous walking</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Primary output:</span>
                  <span className="font-mono text-xs text-zinc-900">E57 · LAS · DWG · DXF</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Target sectors:</span>
                  <span className="font-mono text-xs text-zinc-900">Architects &amp; Conservators</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Coverage:</span>
                  <span className="font-mono text-xs text-zinc-900">All 7 provinces in Nepal</span>
                </li>
              </ul>

              <div className="mt-5 pt-4 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Need immediate booking?</span>
                <a
                  href="https://wa.me/9779801234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  WhatsApp survey team →
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
          <a href="#why-scan" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#why-scan</a>
          <a href="#what-is-slam" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#what-is-slam</a>
          <a href="#deliverables" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#deliverables</a>
          <a href="#uses" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#uses</a>
          <a href="#process" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#process</a>
          <a href="#toolkit" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#toolkit</a>
          <a href="#faq" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#faq</a>
        </div>
      </nav>

      {/* 3. SHOWCASE (#showcase) */}
      <section id="showcase" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-zinc-200">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
                Point Cloud &amp; As-Built Inspection
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
                See what a scan captures
              </h2>
              <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
                Millions of precise laser measurements form a dense spatial record. Compare the photorealistic 3D view with the underlying point cloud geometry.
              </p>
            </div>

            {/* Toggle View */}
            <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
              <button
                onClick={() => setShowcaseView('pointcloud')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  showcaseView === 'pointcloud'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                LiDAR Point Cloud View
              </button>
              <button
                onClick={() => setShowcaseView('textured')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  showcaseView === 'textured'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Photorealistic 3D Model
              </button>
            </div>
          </div>

          {/* Viewer Card */}
          {showcaseView === 'pointcloud' ? (
            <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-950 text-white shadow-lg">
              <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                <img loading="lazy" decoding="async"
                  src={IMG['laser-scanning/lidar-point-cloud-scan-in-field']}
                  alt="LiDAR point cloud scan in field"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

                {/* Point Cloud HUD */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2 bg-black/70 px-3 py-1.5 rounded border border-zinc-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LIDAR PULSE FREQUENCY: 200 KHZ</span>
                  </div>
                  <div className="bg-black/70 px-3 py-1.5 rounded border border-zinc-800 text-zinc-300">
                    RELATIVE DRIFT ERROR: &lt; 5MM
                  </div>
                </div>

                {/* Interactive Elevation Section Slider */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/85 p-4 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-white mb-1">
                      Active Floor Plan Slice: +{elevationSlice} cm from finished floor datum
                    </div>
                    <div className="text-zinc-400 font-mono text-[11px]">
                      Point Density: ~18,500 pts/m² · Beam sag and wall plumbness inspected in real time
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-mono text-zinc-400">Cut Plane Height:</span>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      value={elevationSlice}
                      onChange={(e) => setElevationSlice(Number(e.target.value))}
                      className="w-32 accent-accent cursor-pointer"
                      aria-label="Cut plane height slider"
                    />
                    <span className="font-mono text-zinc-300 text-xs w-10">+{elevationSlice}cm</span>
                  </div>
                </div>
              </div>

              {/* Technical Caption */}
              <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-300">
                <div>
                  <span className="font-bold text-white">Project:</span> Historic Architecture &amp; Complex Interiors ·{' '}
                  <span className="text-zinc-400">
                    Captured with handheld SLAM LiDAR to eliminate site measuring errors before renovation and structural design.
                  </span>
                </div>
                <button
                  onClick={() => setShowcaseView('textured')}
                  className="mt-2 sm:mt-0 font-mono text-xs text-accent hover:underline cursor-pointer"
                >
                  View 3D Tour Mode →
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-semibold text-zinc-900">
                    Photorealistic 3D Model: Chilancho Stupa Complex.
                  </span>
                  <span className="text-zinc-500 hidden sm:inline">
                    — From the exact same reality capture, we can deploy client-facing tours.
                  </span>
                </div>
                <button
                  onClick={() => setShowcaseView('pointcloud')}
                  className="font-mono text-accent hover:underline cursor-pointer"
                >
                  Return to Point Cloud View →
                </button>
              </div>
              <SplatEmbed initialDemo="chilancho" />
            </div>
          )}
        </div>
      </section>

      {/* 4. WHY SCAN INSTEAD OF MEASURE (#why-scan) */}
      <section id="why-scan" className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Efficiency &amp; Accuracy Shift
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 leading-tight">
              Days of measuring, replaced by one walk-through
            </h2>
            <p className="text-base text-zinc-700 mt-4 leading-relaxed">
              Measuring a building by hand means days of site visits, tape measures and sketches, and the mistakes show up later as costly changes. A laser scan records everything in one visit: every wall, beam, opening and level, including walls that aren't straight and floors that slope. If you forget a dimension, you take it from the scan, not from another site visit.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 font-mono text-xs uppercase tracking-wider text-zinc-700">
                    <th className="py-4 px-6 font-semibold w-1/3">Survey Task</th>
                    <th className="py-4 px-6 font-semibold w-1/3 text-zinc-500">Traditional Tape &amp; Sketch</th>
                    <th className="py-4 px-6 font-semibold w-1/3 text-accent">Handheld SLAM Laser Scan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-zinc-900">
                        {row.feature}
                      </td>
                      <td className="py-4 px-6 text-zinc-600">
                        {row.tape}
                      </td>
                      <td className="py-4 px-6 font-medium text-zinc-900">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2" />
                        {row.slam}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHAT IS SLAM LASER SCANNING? (#what-is-slam) */}
      <section id="what-is-slam" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
                Technology Explained
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
                What is SLAM laser scanning?
              </h2>
              <p className="text-base text-zinc-700 leading-relaxed mb-6">
                SLAM stands for <strong>simultaneous localisation and mapping</strong>. The scanner fires laser pulses as our engineer walks, and works out its own position in space as it goes. The result is a dense 3D map of everything around it, captured at walking pace without setting up a tripod at each position. That makes it fast for interiors, stairs, corridors and complex structures.
              </p>

              {/* Honest Engineering Note */}
              <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-700 leading-relaxed">
                <div className="font-mono text-xs uppercase tracking-wider text-zinc-900 font-semibold mb-2 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Honest Engineering Note: SLAM vs Static Tripods</span>
                </div>
                Static tripod scanners can reach higher accuracy for some specialist industrial engineering tasks, but take far longer on site (often requiring 40+ tripod setups per floor). For most as-built, renovation, interior and heritage work, handheld SLAM gives the right balance of speed and accuracy. We'll tell you honestly at the brief stage which your project needs.
              </div>
            </div>

            <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200 rounded-2xl p-6 sm:p-8">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-zinc-200">
                SLAM Scanning Advantages
              </div>
              <ul className="space-y-4 text-xs sm:text-sm text-zinc-700">
                <li className="flex items-start space-x-3">
                  <span className="font-mono font-bold text-accent text-sm">01</span>
                  <div>
                    <strong className="text-zinc-900 block">Walking Pace Capture:</strong>
                    No tripod relocations or leveling delay; move through doors and up stairs continuously.
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="font-mono font-bold text-accent text-sm">02</span>
                  <div>
                    <strong className="text-zinc-900 block">Shadow Minimisation:</strong>
                    Continuous operator motion fills in scanner shadow behind columns and partitions.
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="font-mono font-bold text-accent text-sm">03</span>
                  <div>
                    <strong className="text-zinc-900 block">Seamless Multi-Floor Trajectory:</strong>
                    Ties ground floor, narrow spiral staircases, and upper attics into one single coordinate file.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHAT YOU RECEIVE (#deliverables) */}
      <section id="deliverables" className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Deliverables Package
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              What you receive
            </h2>
            <p className="text-base text-zinc-700 mt-4 leading-relaxed">
              Every laser scan project is delivered in open, software-ready formats configured for your design team:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-accent font-bold uppercase mb-2">Deliverable 01</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">3D Point Cloud</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4">
                  Full millimeter-accurate point cloud of your building or space, indexed for rapid viewport navigation.
                </p>
              </div>
              <div className="font-mono text-xs text-zinc-500 pt-3 border-t border-zinc-100">
                Formats: E57 · LAS · LAZ · RCP
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-accent font-bold uppercase mb-2">Deliverable 02</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Architectural CAD Drawings</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4">
                  Measured floor plans, reflected ceiling plans, building sections, and exterior facade elevations drafted directly from the scan data.
                </p>
              </div>
              <div className="font-mono text-xs text-zinc-500 pt-3 border-t border-zinc-100">
                Formats: DWG · DXF · Vector PDF
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-accent font-bold uppercase mb-2">Deliverable 03</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">CAD/BIM Reference Clips</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4">
                  Cropped, coordinate-locked slices prepared for direct insertion into Autodesk Revit, AutoCAD, and ArchiCAD modeling templates.
                </p>
              </div>
              <div className="font-mono text-xs text-zinc-500 pt-3 border-t border-zinc-100">
                Software: Revit · ArchiCAD · Rhino
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-accent font-bold uppercase mb-2">Deliverable 04</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Shareable 3D Web Link</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4">
                  A secure link that opens in any browser on phone, tablet or desktop, allowing clients and contractors to inspect and measure without CAD licenses.
                </p>
              </div>
              <div className="font-mono text-xs text-zinc-500 pt-3 border-t border-zinc-100">
                Access: Zero software installation
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-accent font-bold uppercase mb-2">Deliverable 05</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">3D Mesh or Scan-to-BIM</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4">
                  Optional parametric Revit family model (LOD 200/300) or high-density textured polygon mesh for visualisation and clash detection.
                </p>
              </div>
              <div className="font-mono text-xs text-zinc-500 pt-3 border-t border-zinc-100">
                Formats: RVT · IFC · OBJ
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-accent font-bold uppercase mb-2">Deliverable 06</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Optional: 3D Virtual Tour</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4">
                  From the exact same reality capture visit, we can produce a photorealistic 3D virtual tour for your marketing and leasing team.
                </p>
              </div>
              <div className="font-mono text-xs text-zinc-500 pt-3 border-t border-zinc-100">
                Synergy: One capture, two outcomes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHAT CLIENTS USE IT FOR (#uses) */}
      <section id="uses" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Project Applications
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              What clients use it for
            </h2>
            <p className="text-base text-zinc-600 mt-4 leading-relaxed">
              How architects, interior designers, structural engineers and conservators put handheld laser scanning to work:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {USE_CASES.map((uc, i) => (
              <div
                key={i}
                className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 hover:bg-white hover:border-zinc-300 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                    {uc.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  {uc.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {uc.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('/industries/real-estate-architecture/')}
                className="font-semibold text-zinc-900 hover:text-accent underline cursor-pointer"
              >
                For architects and developers →
              </button>
              <span className="text-zinc-300">·</span>
              <button
                onClick={() => onNavigate('/industries/heritage-culture/')}
                className="font-semibold text-zinc-900 hover:text-accent underline cursor-pointer"
              >
                For heritage &amp; conservation →
              </button>
            </div>

            <button
              onClick={() => onNavigate('/contact/')}
              className="text-accent font-semibold hover:underline cursor-pointer"
            >
              Discuss your building with our surveyors →
            </button>
          </div>
        </div>
      </section>

      {/* 8. HOW A SCANNING PROJECT WORKS (#process) */}
      <section id="process" className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Workflow Protocol
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              How a scanning project works
            </h2>
            <p className="text-base text-zinc-600 mt-4 leading-relaxed">
              A predictable 4-step process from initial scope to CAD deliverable:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.step}
                className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col justify-between"
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
                <div className="mt-4 pt-3 border-t border-zinc-100 text-[10px] font-mono text-zinc-400">
                  Step {step.step} of 04
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('/how-we-work/')}
              className="font-mono text-xs text-accent hover:underline cursor-pointer font-semibold"
            >
              See our full field capture &amp; quality check protocol →
            </button>
          </div>
        </div>
      </section>

      {/* 9. MADE WITH (#toolkit) */}
      <section id="toolkit" className="py-16 md:py-20 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
                Hardware &amp; Software Rig
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                Our scanning toolkit
              </h2>
              <p className="text-base text-zinc-600 leading-relaxed mb-6">
                We scan with advanced handheld SLAM laser scanners such as the XGRIDS Lixel Kitty K1, process raw trajectories in LCC Studio, and tie scans to real-world coordinates with survey-grade GNSS where needed. For roofs, courtyards and surroundings, we add aerial capture from a survey drone, so the inside and outside join into one record.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <button
                  onClick={() => onNavigate('/services/digital-twins/drone-mapping/')}
                  className="text-zinc-900 hover:text-accent underline cursor-pointer"
                >
                  Drone mapping →
                </button>
                <span className="text-zinc-300">·</span>
                <button
                  onClick={() => onNavigate('/how-we-work/')}
                  className="text-zinc-900 hover:text-accent underline cursor-pointer"
                >
                  Full toolkit specifications →
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-center">
              <div className="text-2xl font-bold font-mono text-accent mb-1">XGRIDS Lixel K1</div>
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">Field Certified</div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Integrated high-frequency LiDAR, panoramic visual cameras, and inertial measurement unit (IMU) for continuous SLAM tracking.
              </p>
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
                src={IMG['laser-scanning/chilancho-stupa-laser-scanning-documentation']}
                alt="Chilancho Stupa Laser Scanning Documentation"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-bold block mb-2">
                  Heritage Documentation · Kirtipur, Nepal
                </span>
                <h3 className="text-2xl font-bold text-zinc-900 mb-3">
                  Historic Monument Preserved in 3D
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                  A historic stupa complex documented in complete 3D to preserve its form, proportions and structural detail. Captured using handheld SLAM laser scanning across the platform courtyards with drone photogrammetry capturing the spire.
                </p>
                <div className="space-y-2 text-xs font-mono text-zinc-700 mb-6">
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span>LiDAR Data:</span>
                    <span className="font-bold text-zinc-900">Millimeter point cloud</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span>Use Case:</span>
                    <span className="font-bold text-zinc-900">Conservation archive &amp; research</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deliverables:</span>
                    <span className="font-bold text-zinc-900">E57, Drawings &amp; Web View</span>
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
              Engineering FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              Questions about 3D laser scanning
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
              Start Your As-Built Survey
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
            Start your design from reality
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell us about the building and what you need from the data. We'll send a clear proposal with timeline, scanning scope, and deliverables.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/contact/')}
              className={buttonClass('primary', 'lg', 'shadow-lg hover:shadow-red-900/30')}
            >
              <span>Get a scanning quote</span>
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
            RCAAS Technology · Kathmandu, Nepal · SLAM LiDAR scanning &amp; as-built documentation
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
              onClick={() => onNavigate('/services/digital-twins/drone-mapping/')}
              className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 transition-all cursor-pointer shadow-xs group"
            >
              <h4 className="text-base font-bold text-zinc-900 group-hover:text-accent transition-colors mb-2">
                Drone Mapping &amp; Aerial Survey
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4">
                Add roofs, grounds and the whole site from above with sub-centimeter orthomosaics.
              </p>
              <span className="text-xs font-semibold text-accent">
                Explore drone mapping →
              </span>
            </div>

            <div
              onClick={() => onNavigate('/services/digital-twins/')}
              className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 transition-all cursor-pointer shadow-xs group"
            >
              <h4 className="text-base font-bold text-zinc-900 group-hover:text-accent transition-colors mb-2">
                As-Built Drawings &amp; BIM
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4">
                Convert your point cloud into 2D plans, sections, elevations, and Revit BIM models.
              </p>
              <span className="text-xs font-semibold text-accent">
                View digital twins hub →
              </span>
            </div>

            <div
              onClick={() => onNavigate('/services/immersive-experiences/3d-virtual-tours/')}
              className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 transition-all cursor-pointer shadow-xs group"
            >
              <h4 className="text-base font-bold text-zinc-900 group-hover:text-accent transition-colors mb-2">
                3D Virtual Tours
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4">
                Show the same space to clients and stakeholders as an interactive, photorealistic walkthrough.
              </p>
              <span className="text-xs font-semibold text-accent">
                Explore 3D tours →
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
