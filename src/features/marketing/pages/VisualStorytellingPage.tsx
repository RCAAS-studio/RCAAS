import React, { useState, useEffect } from 'react';
import { IMG } from '../data/images';
import { RoutePath } from '../types';
import { SplatEmbed } from '../components/SplatEmbed';
import { FaqList } from '../components/GuideParts';
import { buttonClass } from '../components/ui';

interface VisualStorytellingPageProps {
  onNavigate: (path: RoutePath) => void;
}

interface CapabilityItem {
  id: string;
  anchor: string;
  number: string;
  title: string;
  badge: string;
  whatItIs: string;
  audienceExperiences: string;
  youReceive: string[];
  bestFor: string[];
  madeWith: string;
  image?: string;
  specDetails?: {
    format: string;
    duration: string;
    resolution: string;
  };
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'guided-tours',
    anchor: 'guided-tours',
    number: '01',
    title: 'Guided 3D Tours',
    badge: 'Curated Path · Spatial Audio · Narrated Stops',
    whatItIs:
      'A 3D tour that leads visitors through your place along a curated path, with narration, text, music or video at key stops. Visitors can pause at any point and explore on their own.',
    audienceExperiences:
      'The personal feel of a hosted visit, at any time of day, from anywhere in the world. Visitors never feel lost and receive expert guidance on your highest-value highlights.',
    youReceive: [
      'Hosted guided 3D tour link accessible in any browser with zero plugins',
      'Curated camera waypoint choreography with smooth spatial transitions',
      'Interactive multi-media hotspot overlays (photos, specs, booking buttons)',
      'Dual-language voiceover narration support (English & Nepali) [[TBC]]',
      'Embed code for seamless integration into websites and landing pages',
    ],
    bestFor: [
      'School & College admissions journeys and boarding house tours',
      'Hotel & Resort introductions highlighting suites, spas and dining',
      'Museum, art gallery and sacred cultural exhibitions',
      'Remote commercial property investor pitches and leasing walkthroughs',
    ],
    madeWith:
      'Handheld SLAM LiDAR capture, calibrated 3D Gaussian splatting, smooth Bezier spline flight paths, and WebGL spatial runtime.',
    image: IMG['visual-storytelling/showcase-1'],
    specDetails: {
      format: 'Interactive WebGL / WebXR',
      duration: 'Self-paced or 2–4 min automated walkthrough',
      resolution: '4K progressive texture streaming',
    },
  },
  {
    id: 'films',
    anchor: 'films',
    number: '02',
    title: 'Cinematic Fly-Through Films & Renders',
    badge: 'Virtual Cinematography · 4K Master · Impossible Cameras',
    whatItIs:
      'Cinematic films that sweep through and around your place, following paths impossible with a physical drone or gimbal: diving through courtyards, gliding through narrow timber doorways, rising up multi-storey atriums.',
    audienceExperiences:
      'A film that captures the scale, architectural character and emotional atmosphere of your place in 60 to 90 seconds, set to bespoke sound design.',
    youReceive: [
      'Full 4K UHD master film edit with cinema-grade colour grading',
      '16:9 widescreen master for websites, YouTube, presentations and TV broadcasts',
      '9:16 vertical cut optimized for Instagram Reels, TikTok and YouTube Shorts',
      'Commercial-use licensed cinematic soundtrack and sound design',
      'High-resolution promotional still renders suitable for print and billboards',
    ],
    bestFor: [
      'Website homepage hero films and launch campaigns',
      'High-conversion social media advertising and organic campaigns',
      'Investor pitch decks, annual general meetings and donor presentations',
      'Milestone celebrations, anniversaries and architectural awards',
    ],
    madeWith:
      'Millimeter-accurate 3D reconstruction, virtual camera path physics, professional keyframe cinematography, DaVinci Resolve color grading, and acoustic mixing.',
    image: IMG['visual-storytelling/showcase-2'],
    specDetails: {
      format: 'MP4 / ProRes 422 HQ (4K UHD 60fps)',
      duration: '60 to 90 seconds (plus 15s teaser cuts)',
      resolution: '3840 × 2160 (16:9) & 1080 × 1920 (9:16)',
    },
  },
  {
    id: 'social',
    anchor: 'social',
    number: '03',
    title: 'Social Media Content & Short Clips',
    badge: 'Scroll-Stopping · 9:16 Vertical · High Engagement',
    whatItIs:
      'Short, punchy clips (6–15 seconds), seamless looping animations and high-resolution stills cut from your 3D place, sized and paced specifically for mobile social feeds.',
    audienceExperiences:
      'Eye-catching spatial movements that stop people scrolling, sparking curiosity and driving traffic directly into your booking engine or enquiry forms.',
    youReceive: [
      'Pack of vertical (9:16) video reels with caption safe-zone compliance',
      'Square (1:1) video cuts for Instagram feed grids and LinkedIn updates',
      'Seamless looping spatial animations for stories and digital banners',
      'Pack of high-resolution stills highlighting architectural focal points',
      'Story hooks, text overlay templates and suggested audio pairings',
    ],
    bestFor: [
      'Recurring social media marketing calendars and organic posting',
      'Targeted paid advertising (Meta Ads, Google Ads, TikTok Ads)',
      'Event countdowns, open-day announcements and seasonal promotions',
      'Influencer and partner marketing toolkits',
    ],
    madeWith:
      'Virtual camera renders rendered at native mobile resolutions with rapid pacing, sound sync, and motion graphic callouts.',
    image: IMG['visual-storytelling/showcase-3'],
    specDetails: {
      format: 'H.265 / H.264 vertical video',
      duration: '6 to 15 seconds per reel',
      resolution: '1080 × 1920 (9:16) & 1080 × 1080 (1:1)',
    },
  },
  {
    id: 'exhibitions',
    anchor: 'exhibitions',
    number: '04',
    title: 'Exhibition & Event Displays',
    badge: 'Large-Format Displays · Interactive Kiosks · Trade Fairs',
    whatItIs:
      'Large-format video loops, touch-optimised digital presentations, or VR immersion stations prepared for trade fairs, admissions open days, international roadshows and corporate lobbies.',
    audienceExperiences:
      'A magnetic presence that draws visitors to your pavilion, allowing them to experience your campus, resort or property development in tactile, high-definition fidelity.',
    youReceive: [
      'Display-ready seamless looping 4K/8K video files for LED video walls',
      'Touchscreen interactive kiosk application with intuitive navigational map [[TBC]]',
      'Turnkey VR headset configuration guidelines and standalone package [[TBC]]',
      'Technical specification sheet for event AV contractors and equipment hire',
      'On-site deployment guide and backup media drives',
    ],
    bestFor: [
      'International tourism fairs and travel trade marts (PATA, ITB, WTM)',
      'Overseas education fairs and college open days in regional hubs',
      'Luxury real estate roadshows, sales lounges and development launches',
      'Museum temporary exhibitions, cultural pavilions and diplomatic summits',
    ],
    madeWith:
      'Ultra-high-bitrate render engines, touch-optimised WebGL user interfaces, and robust offline kiosk software architecture.',
    image: IMG['visual-storytelling/showcase-4'],
    specDetails: {
      format: 'Custom Touch Kiosk / 4K Seamless Video Loop',
      duration: 'Continuous loop with instant touch override',
      resolution: 'Up to 3840 × 2160 or custom LED aspect ratios',
    },
  },
  {
    id: 'change-over-time',
    anchor: 'change-over-time',
    number: '05',
    title: 'Documenting Change Over Time',
    badge: 'Temporal Verification · Before & After · Restoration Milestones',
    whatItIs:
      'Side-by-side or interactive slider comparisons showing a site before and after renovation, construction progress over sequential months, or seasonal transformations.',
    audienceExperiences:
      'The clear, undeniable transformation of a place, showing structural progress, architectural craftsmanship or historical preservation with precision.',
    youReceive: [
      'Interactive before/after web sliders ready to embed on project websites',
      'Synchronised split-screen fly-through videos showing exact timeline changes',
      'Georeferenced milestone comparison reports for stakeholders and donors',
      'Longitudinal 3D archive preserving each phase in millimeter coordinates',
    ],
    bestFor: [
      'Heritage conservation and temple restoration accountability',
      'Commercial property development progress tracking for investors',
      'Hotel, heritage resort and restaurant major refurbishment reveals',
      'Government infrastructure reporting, donor transparency and public engagement',
    ],
    madeWith:
      'Survey-grade georeferenced repeat LiDAR scans, coordinate-locked virtual camera trajectories, and custom dual-view WebGL shaders.',
    image: IMG['visual-storytelling/showcase-5'],
    specDetails: {
      format: 'Interactive HTML5 Slider & Split-Screen 4K Video',
      duration: 'Interactive user drag / 30s synchronised video',
      resolution: 'Full HD & 4K split comparison',
    },
  },
];

const OUTCOME_TILES = [
  {
    title: 'Give people a reason to care',
    line: 'Facts inform. Stories persuade. We turn your place into the second.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: 'Show what matters, in the right order',
    line: 'Lead your audience from first impression to the detail that decides.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: 'Feed every channel',
    line: 'Films, clips and stills for your website, ads, social media and presentations.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
  {
    title: 'Make it last',
    line: 'A story told today, from a record that stays accurate for years.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const FOUR_QUESTIONS = [
  {
    question: 'Who is watching?',
    whyItMatters: 'A parent abroad and a local student need different stories.',
    hotelExample: 'International luxury traveler planning a vacation vs. corporate event organizer booking a ballroom.',
    educationExample: 'Parent evaluating safety and boarding vs. high school graduate seeking technology labs and student life.',
    propertyExample: 'Non-resident Nepali (NRN) investor seeking rental yields vs. young family looking for a first home.',
  },
  {
    question: 'What should they feel?',
    whyItMatters: 'Calm, pride, excitement, trust. The feeling shapes the pace, light and sound.',
    hotelExample: 'Warmth, unhurried calm, sensory luxury through gentle panning and natural morning daylight.',
    educationExample: 'Academic rigor, modern capability and reassurance with vibrant pacing and student activity.',
    propertyExample: 'Architectural permanence, prestige, light-filled rooms and sound insulation confidence.',
  },
  {
    question: 'What should they notice?',
    whyItMatters: 'The view from the room, the new lab, the carving no one else has shown.',
    hotelExample: 'Hand-carved woodwork, private mountain balcony vistas, quiet courtyard dining pavilions.',
    educationExample: 'Hands-on engineering workshops, library study cubicles, hygienic cafeteria and sports facilities.',
    propertyExample: 'Earthquake-engineered construction quality, floor-to-ceiling glass, covered parking and high-end sanitaryware.',
  },
  {
    question: 'What should they do next?',
    whyItMatters: 'Book, apply, visit, invest or support. Every story ends with that step.',
    hotelExample: 'Click directly to booking calendar with preferred suite pre-selected.',
    educationExample: 'Download admissions brochure or book an on-campus guidance appointment.',
    propertyExample: 'Request the architectural floor plan package and schedule a private site meeting.',
  },
];

const INDUSTRIES_STORIES = [
  {
    sector: 'Hotels & Hospitality',
    headline: 'Turn website visitors into booked guests',
    summary:
      'Photographs show static bedrooms, but a cinematic fly-through film reveals the true sensory experience: walking through hand-carved archways, arriving at serene courtyard water features, and opening curtains to mountain vistas.',
    storyAngle: 'The Sensory Arrival Journey',
    deliverables: ['90-second 4K website hero film', '3x 15s Instagram Reels for seasonal promotions', 'Hosted guided tour for event & wedding planners'],
    metric: 'Increases direct bookings and cuts dependency on high-commission OTA listings.',
  },
  {
    sector: 'Schools & Colleges',
    headline: 'Reassure prospective students and parents',
    summary:
      'Choosing an educational institute is an emotional family decision. Guided video tours lead parents from regional districts and abroad directly through classrooms, robotics labs, student hostels, and dining halls.',
    storyAngle: 'The Admissions Path of Confidence',
    deliverables: ['Narrated campus walkthrough in English & Nepali', 'Hostel safety & student care featurette', 'Admissions social campaign clips'],
    metric: 'Reassures parents unable to travel before enrollment deadlines.',
  },
  {
    sector: 'Property Developers',
    headline: 'Sell off-plan and attract international investors',
    summary:
      'Blueprints and static 3D renderings often struggle to convey spatial scale. We create sweeping virtual cinematography through planned apartments and commercial plazas, demonstrating light, views, and spatial relationships.',
    storyAngle: 'The Off-Plan Vision to Reality',
    deliverables: ['Cinematic investor fly-through film', 'Architectural detail clips for digital ads', 'Interactive display loop for sales lounge'],
    metric: 'Accelerates pre-construction commitments from overseas buyers.',
  },
  {
    sector: 'Cultural Heritage & Tourism',
    headline: 'Celebrate culture and preserve living histories',
    summary:
      'Nepal’s cultural monuments are living spaces with layered oral traditions. We pair millimeter-accurate reality captures with oral history narration, traditional instrument soundscapes, and architectural commentary.',
    storyAngle: 'Living Monuments & Sacred Craft',
    deliverables: ['Cultural documentary short film', 'Curated virtual exhibition with scholar commentary', 'Permanent millimeter 3D archival record'],
    metric: 'Engages diaspora youth and international travelers while documenting endangered heritage.',
  },
];

const PROCESS_STEPS = [
  {
    step: '01',
    name: 'Briefing & Story Concept',
    description:
      'We meet to define your audience, emotional objectives, key architectural highlights and clear call to action. We establish the narrative arc and storyboard before touch-down.',
  },
  {
    step: '02',
    name: '3D Reality Capture',
    description:
      'Our team visits your site with handheld SLAM LiDAR and aerial imaging. We capture the complete space in 2 to 6 hours with zero business downtime or disruptive filming rigs.',
  },
  {
    step: '03',
    name: 'Virtual Cinematography',
    description:
      'Inside the 3D model, our directors craft cinematic camera trajectories, focal depths, lighting moods, and smooth speed ramps impossible with physical camera tracks.',
  },
  {
    step: '04',
    name: 'Sound Design & Voiceover',
    description:
      'We combine professional voiceover narration (available in British English, American English, and Nepali) with bespoke musical scoring and spatial acoustic ambience.',
  },
  {
    step: '05',
    name: 'Multi-Format Delivery',
    description:
      'You receive 4K master films, 9:16 mobile reels, web embed snippets, high-res stills, and full launch support to deploy across your website, ads and social channels.',
  },
];

const FAQS = [
  {
    question: 'Do we need a film crew on site?',
    answer:
      'No traditional film crew with tracks, booms or heavy lighting rigs is needed. Our capture team needs only 2 to 6 hours on site with compact handheld laser and camera equipment. Because we digitise the entire environment into an accurate 3D model, all camera angles, crane shots, lighting and transitions are crafted in virtual cinematography from the digital twin.',
  },
  {
    question: 'Can you deliver videos formatted for both Instagram/TikTok and YouTube/Websites?',
    answer:
      'Yes. That is one of the greatest advantages of 3D-driven visual storytelling. From the single 3D capture, we render both 16:9 widescreen films (for websites, YouTube, pitch decks and television) and 9:16 vertical cuts (for Instagram Reels, TikTok and YouTube Shorts) without awkward cropping or quality loss.',
  },
  {
    question: 'Can we update the story later without re-scanning?',
    answer:
      'Yes. If your messaging, branding, voiceover or music changes, we can re-render new camera movements, highlight different rooms, or re-record the narration directly from the existing 3D digital model without needing to revisit your physical property.',
  },
  {
    question: 'What languages do you support for voiceover?',
    answer:
      'We produce professional studio voiceover narration in British English, American English, and Nepali, with subtitle support for any required language. You can also provide your own voice talent or brand spokesperson audio tracks.',
  },
  {
    question: 'How long does a visual storytelling project take?',
    answer:
      'Typical projects take 7 to 14 business days from on-site capture to final 4K delivery. Rush timelines are available for event launches or campaign deadlines.',
  },
];

export const VisualStorytellingPage: React.FC<VisualStorytellingPageProps> = ({ onNavigate }) => {
  // Showcase state
  const [showcaseMode, setShowcaseMode] = useState<'film' | 'splat'>('film');
  const [isPlayingFacade, setIsPlayingFacade] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [selectedWaypoint, setSelectedWaypoint] = useState<number>(0);

  // Audience persona selector in Why Story
  const [activePersona, setActivePersona] = useState<'hotel' | 'education' | 'property'>('hotel');

  // Change over time slider state
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // FAQ state

  const waypoints = [
    { title: 'Courtyard Arrival', time: '0:12', note: 'Establishing scale through traditional Newari carved brickwork.' },
    { title: 'Dining Pavilion', time: '0:34', note: 'Low-angle gliding shot over reflection pond into candlelit dining.' },
    { title: 'Executive Suite', time: '0:58', note: 'Seamless transition through balcony doors showcasing Kathmandu sunset.' },
    { title: 'Call to Action', time: '1:18', note: 'Direct invitation to reserve with live booking badge overlay.' },
  ];

  // Handle hash scrolling on page load / navigation
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
        {/* Subtle architectural grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

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
              <li className="text-zinc-900 font-semibold" aria-current="page">
                Visual Storytelling
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 mb-6">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-600">
                  Service Pillar · Visual Storytelling
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-6">
                Turn your place into a story people remember.
              </h1>

              <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed mb-8 max-w-3xl">
                Visual storytelling turns a real place into films, guided tours and content that give people a reason to care and a reason to act. RCAAS Technology creates fly-through films, narrated 3D tours and social content from accurate 3D captures of hotels, campuses, properties and heritage sites across Nepal.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('/contact/')}
                  className={buttonClass('dark', 'md')}
                >
                  <span>Plan your story</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <a
                  href="#showcase"
                  className="px-6 py-3.5 bg-white hover:bg-zinc-50 text-zinc-900 text-sm font-semibold rounded-lg border border-zinc-300 transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Watch an example</span>
                </a>
              </div>
            </div>

            {/* Quick Facts Sidebar Card */}
            <div className="lg:col-span-4 bg-zinc-50 border border-zinc-200 rounded-xl p-6 relative">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-600 mb-4 pb-2 border-b border-zinc-200">
                Pillar Capabilities at a glance
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Output formats:</span>
                  <span className="font-mono text-xs text-zinc-900">4K Film · 9:16 Reels · Web 3D</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">On-site filming time:</span>
                  <span className="font-mono text-xs text-zinc-900">2–6 hrs (No film crew)</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Turnaround:</span>
                  <span className="font-mono text-xs text-zinc-900">7 to 14 days</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Audio options:</span>
                  <span className="font-mono text-xs text-zinc-900">English, Nepali & Music</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Delivery:</span>
                  <span className="font-mono text-xs text-zinc-900">Cloud downloads & Embeds</span>
                </li>
              </ul>
              <div className="mt-5 pt-4 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Need immediate consultation?</span>
                <a
                  href="https://wa.me/9779846789573"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  WhatsApp us →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUTCOME STRIP */}
      <section className="py-12 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {OUTCOME_TILES.map((tile, i) => (
              <div
                key={i}
                className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-all hover:shadow-xs group"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-4 group-hover:bg-red-50/50 transition-colors">
                  {tile.icon}
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">
                  {tile.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {tile.line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Anchor Navigation Strip */}
      <nav aria-label="Section anchors" className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 py-3 overflow-x-auto shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 sm:space-x-3 text-xs font-mono whitespace-nowrap">
          <span className="text-zinc-400 uppercase text-[10px] tracking-wider mr-2 hidden sm:inline">Jump to:</span>
          <a href="#showcase" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#showcase</a>
          <a href="#why-story" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#why-story</a>
          <a href="#guided-tours" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#guided-tours</a>
          <a href="#films" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#films</a>
          <a href="#social" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#social</a>
          <a href="#exhibitions" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#exhibitions</a>
          <a href="#change-over-time" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#change-over-time</a>
          <a href="#industries" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#industries</a>
          <a href="#process" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#process</a>
          <a href="#faq" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#faq</a>
        </div>
      </nav>

      {/* 3. SHOWCASE (#showcase) */}
      <section id="showcase" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-zinc-200">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
                Featured Experience Showcase
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
                See a place become a story
              </h2>
              <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
                Every story starts with an accurate reality capture. Below, experience the cinematic virtual fly-through film and the underlying 3D spatial capture that powers it.
              </p>
            </div>

            {/* Showcase Mode Switcher */}
            <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
              <button
                onClick={() => setShowcaseMode('film')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  showcaseMode === 'film'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Cinematic Film Facade
              </button>
              <button
                onClick={() => setShowcaseMode('splat')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  showcaseMode === 'splat'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Interactive 3D Reality Capture
              </button>
            </div>
          </div>

          {/* Showcase Player Area */}
          {showcaseMode === 'film' ? (
            <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-950 text-white shadow-lg">
              {/* Media Player Container */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                {!isPlayingFacade ? (
                  // Facade Poster & Click-To-Load State
                  <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 sm:p-8">
                    <img loading="lazy" decoding="async"
                      src={IMG['visual-storytelling/basera-boutique-hotel-cinematic-fly-through']}
                      alt="Basera Boutique Hotel Cinematic Fly-Through"
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

                    {/* Top bar with metadata */}
                    <div className="relative z-20 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="px-2.5 py-1 bg-red-600/90 text-white text-[11px] font-mono uppercase tracking-wider rounded">
                          4K Master Film
                        </span>
                        <span className="text-xs font-mono text-zinc-300">
                          Basera Boutique Hotel · 1m 24s
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setAspectRatio(aspectRatio === '16:9' ? '9:16' : '16:9')}
                          className="px-2.5 py-1 rounded bg-black/60 hover:bg-black/90 text-[11px] font-mono border border-zinc-700 text-zinc-200 transition-colors"
                        >
                          Aspect: {aspectRatio}
                        </button>
                      </div>
                    </div>

                    {/* Center Play Button Facade */}
                    <div className="relative z-20 flex flex-col items-center justify-center text-center my-auto">
                      <button
                        onClick={() => setIsPlayingFacade(true)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 hover:bg-accent text-zinc-900 hover:text-white transition-all transform hover:scale-105 flex items-center justify-center shadow-2xl cursor-pointer group"
                        aria-label="Play fly-through preview"
                      >
                        <svg className="w-8 h-8 ml-1 text-zinc-900 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                      <p className="mt-4 text-xs font-mono tracking-wider text-zinc-300 uppercase">
                        Click to launch cinematic fly-through
                      </p>
                    </div>

                    {/* Bottom Waypoint trajectory preview */}
                    <div className="relative z-20">
                      <div className="text-xs text-zinc-400 font-mono mb-2 flex items-center justify-between">
                        <span>CAMERA FLIGHT WAYPOINTS</span>
                        <span>0:00 / 1:24</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {waypoints.map((wp, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedWaypoint(idx)}
                            className={`p-2 rounded text-left text-xs transition-all border ${
                              selectedWaypoint === idx
                                ? 'bg-white/20 border-white text-white'
                                : 'bg-black/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <div className="font-semibold truncate">{wp.title}</div>
                            <div className="text-[10px] font-mono text-zinc-400">{wp.time}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Active Facade Player State
                  <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-6">
                    <img loading="lazy" decoding="async"
                      src={aspectRatio === '9:16' ? IMG['visual-storytelling/active-video-preview'] : IMG['visual-storytelling/active-video-preview-2']}
                      alt="Active video preview"
                      className={`h-full object-cover transition-all duration-300 rounded-lg ${
                        aspectRatio === '9:16' ? 'max-w-xs aspect-[9/16]' : 'w-full'
                      }`}
                    />
                    <div className="absolute top-4 right-4 z-20 flex space-x-2">
                      <button
                        onClick={() => setIsPlayingFacade(false)}
                        className="px-3 py-1 bg-black/80 text-white text-xs font-mono rounded hover:bg-zinc-800 transition-colors"
                      >
                        Pause / Reset
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-6 right-6 z-20 bg-black/80 p-3 rounded-lg border border-zinc-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-zinc-300">
                          Now playing: {waypoints[selectedWaypoint].title} ({waypoints[selectedWaypoint].time})
                        </span>
                      </div>
                      <span className="text-zinc-400 italic hidden sm:inline">
                        {waypoints[selectedWaypoint].note}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Caption and Video Object Context */}
              <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex flex-col md:flex-row md:items-center justify-between text-xs sm:text-sm text-zinc-300">
                <div>
                  <span className="font-bold text-white">Client:</span> Basera Boutique Hotel, Kathmandu ·{' '}
                  <span className="text-zinc-400">
                    Goal: Guide international guests through courtyards, heritage architecture, and luxury suites with cinematic pacing.
                  </span>
                </div>
                <div className="mt-2 md:mt-0 font-mono text-xs text-zinc-500">
                  Format: 4K UHD Master (3840×2160) · 60fps · Dual-audio
                </div>
              </div>
            </div>
          ) : (
            // Interactive SplatEmbed reality capture view
            <div>
              <div className="mb-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-semibold text-zinc-900">
                    Every story starts with a capture like this.
                  </span>
                  <span className="text-zinc-600 hidden sm:inline">
                    — Explore the interactive 3D model that generates our cinematic fly-throughs.
                  </span>
                </div>
                <button
                  onClick={() => setShowcaseMode('film')}
                  className="font-mono text-accent hover:underline cursor-pointer"
                >
                  Switch back to Film Facade →
                </button>
              </div>
              <SplatEmbed initialDemo="basera" />
            </div>
          )}
        </div>
      </section>

      {/* 4. WHY STORY (#why-story) */}
      <section id="why-story" className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              The Strategic Framework
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 leading-tight">
              A place on its own is information. A place with a story is a reason to act.
            </h2>
            <p className="text-base text-zinc-600 mt-4 leading-relaxed">
              People don't remember a dry inventory of rooms or square footage. They remember how a place made them feel and the one compelling moment that convinced them. Before we capture or direct anything, we answer four essential questions with you:
            </p>
          </div>

          {/* Interactive Four Questions Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* The 4 Questions Table */}
            <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 font-mono text-xs uppercase tracking-wider text-zinc-600 flex justify-between items-center">
                <span>The Four Narrative Pillars</span>
                <span className="text-accent">RCAAS Story Methodology</span>
              </div>
              <div className="divide-y divide-zinc-200">
                {FOUR_QUESTIONS.map((item, idx) => (
                  <div key={idx} className="p-6 hover:bg-zinc-50/50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <span className="font-mono text-sm font-bold text-accent pt-0.5">
                        0{idx + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-zinc-900 mb-1">
                          {item.question}
                        </h3>
                        <p className="text-sm text-zinc-600 leading-relaxed">
                          {item.whyItMatters}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Persona Adaptation Simulator */}
            <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-600 mb-3 pb-2 border-b border-zinc-200">
                Live Narrative Adaptation Example
              </div>
              <p className="text-xs text-zinc-600 mb-4">
                Select an audience profile to see how the four questions change the camera pacing, tone, and call-to-action:
              </p>

              {/* Persona buttons */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                  onClick={() => setActivePersona('hotel')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    activePersona === 'hotel'
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Hotels
                </button>
                <button
                  onClick={() => setActivePersona('education')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    activePersona === 'education'
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Colleges
                </button>
                <button
                  onClick={() => setActivePersona('property')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    activePersona === 'property'
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Property
                </button>
              </div>

              {/* Persona details */}
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <div className="font-semibold text-zinc-900 mb-1">1. Who is watching:</div>
                  <div className="text-zinc-600">
                    {activePersona === 'hotel' && FOUR_QUESTIONS[0].hotelExample}
                    {activePersona === 'education' && FOUR_QUESTIONS[0].educationExample}
                    {activePersona === 'property' && FOUR_QUESTIONS[0].propertyExample}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <div className="font-semibold text-zinc-900 mb-1">2. What they feel:</div>
                  <div className="text-zinc-600">
                    {activePersona === 'hotel' && FOUR_QUESTIONS[1].hotelExample}
                    {activePersona === 'education' && FOUR_QUESTIONS[1].educationExample}
                    {activePersona === 'property' && FOUR_QUESTIONS[1].propertyExample}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <div className="font-semibold text-zinc-900 mb-1">3. What they notice:</div>
                  <div className="text-zinc-600">
                    {activePersona === 'hotel' && FOUR_QUESTIONS[2].hotelExample}
                    {activePersona === 'education' && FOUR_QUESTIONS[2].educationExample}
                    {activePersona === 'property' && FOUR_QUESTIONS[2].propertyExample}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <div className="font-semibold text-zinc-900 mb-1">4. Action they take:</div>
                  <div className="text-zinc-600 font-medium text-accent">
                    {activePersona === 'hotel' && FOUR_QUESTIONS[3].hotelExample}
                    {activePersona === 'education' && FOUR_QUESTIONS[3].educationExample}
                    {activePersona === 'property' && FOUR_QUESTIONS[3].propertyExample}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHAT WE CREATE (#capabilities) */}
      <section id="capabilities" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Comprehensive Story Formats
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              Ways we tell your story
            </h2>
            <p className="text-base text-zinc-600 mt-4 leading-relaxed">
              Each format starts from the same accurate 3D capture of your place. We write, direct and produce the story, so your audience sees your place at its best without you having to manage a film crew.
            </p>
          </div>

          {/* Capabilities List */}
          <div className="space-y-16">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.id}
                id={cap.anchor}
                className="scroll-mt-24 border border-zinc-200 rounded-2xl overflow-hidden bg-white hover:border-zinc-300 transition-all shadow-xs"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Left content area */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      {/* Number and Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <span className="font-mono text-xs font-bold text-zinc-600">
                          FORMAT {cap.number}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {cap.badge}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
                        {cap.title}
                      </h3>

                      <div className="space-y-4 text-sm text-zinc-600 mb-6">
                        <div>
                          <span className="font-semibold text-zinc-900">What it is: </span>
                          <span>{cap.whatItIs}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-900">What your audience experiences: </span>
                          <span>{cap.audienceExperiences}</span>
                        </div>
                      </div>

                      {/* Deliverables Checklist */}
                      <div className="mb-6 pt-4 border-t border-zinc-100">
                        <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-900 font-semibold mb-3">
                          You receive:
                        </h4>
                        <ul className="space-y-2 text-xs sm:text-sm text-zinc-700">
                          {cap.youReceive.map((item, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Best for tags */}
                      <div className="mb-6">
                        <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-2">
                          Best for:
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {cap.bestFor.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded bg-zinc-50 border border-zinc-200 text-xs text-zinc-700"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer tech note & CTA */}
                    <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="text-zinc-500">
                        <span className="font-medium text-zinc-700">Made with: </span>
                        {cap.madeWith}
                      </div>

                      <button
                        onClick={() => onNavigate('/contact/')}
                        className={buttonClass('dark', 'sm', 'shrink-0 self-start sm:self-auto')}
                      >
                        Enquire about this format →
                      </button>
                    </div>
                  </div>

                  {/* Right visual asset area */}
                  <div className="lg:col-span-5 bg-zinc-50 border-t lg:border-t-0 lg:border-l border-zinc-200 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      {/* Image / Preview */}
                      {cap.image && (
                        <div className="relative rounded-xl overflow-hidden border border-zinc-200 aspect-video mb-6 shadow-xs group">
                          <img loading="lazy" decoding="async"
                            src={cap.image}
                            alt={cap.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                          <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-mono">
                            {cap.specDetails?.format}
                          </div>
                        </div>
                      )}

                      {/* Interactive Change Over Time Slider if section 5.5 */}
                      {cap.id === 'change-over-time' && (
                        <div className="mb-6 p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
                          <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-2 flex justify-between">
                            <span>Interactive Split Comparison</span>
                            <span className="text-accent font-bold">{sliderPosition}% Slider</span>
                          </div>

                          {/* Slider Graphic */}
                          <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-300 select-none">
                            {/* Before layer */}
                            <img loading="lazy" decoding="async"
                              src={IMG['visual-storytelling/before-renovation']}
                              alt="Before renovation"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                              2023: Pre-Restoration Scan
                            </div>

                            {/* After layer clipped */}
                            <div
                              className="absolute inset-0 overflow-hidden"
                              style={{ width: `${sliderPosition}%` }}
                            >
                              <img loading="lazy" decoding="async"
                                src={IMG['visual-storytelling/after-restoration']}
                                alt="After restoration"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ width: '100%', maxWidth: 'none' }}
                              />
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-accent text-white text-[10px] font-mono">
                                2024: Post-Restoration Twin
                              </div>
                            </div>

                            {/* Split bar */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
                              style={{ left: `${sliderPosition}%` }}
                            >
                              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-zinc-400 flex items-center justify-center text-zinc-700 shadow-sm text-xs font-bold">
                                ↔
                              </div>
                            </div>
                          </div>

                          {/* Slider Input */}
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderPosition}
                            onChange={(e) => setSliderPosition(Number(e.target.value))}
                            className="w-full mt-3 accent-accent cursor-pointer"
                            aria-label="Before and after split slider"
                          />
                          <p className="text-[11px] text-zinc-500 text-center mt-1">
                            Drag slider to verify restoration alignment down to coordinate accuracy.
                          </p>
                        </div>
                      )}

                      {/* Technical specifications box */}
                      {cap.specDetails && (
                        <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2.5 text-xs">
                          <div className="font-mono uppercase tracking-wider text-zinc-500 text-[10px] pb-1 border-b border-zinc-100">
                            Technical Output Profile
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Master format:</span>
                            <span className="font-mono text-zinc-800">{cap.specDetails.format}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Pacing:</span>
                            <span className="font-mono text-zinc-800">{cap.specDetails.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Resolution:</span>
                            <span className="font-mono text-zinc-800">{cap.specDetails.resolution}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHO IT HELPS (#industries) */}
      <section id="industries" className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Industry Applications
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              Tailored for moments that matter
            </h2>
            <p className="text-base text-zinc-600 mt-4 leading-relaxed">
              Every sector has a decisive question in its audience’s mind. Here is how visual storytelling replaces uncertainty with clarity and action:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {INDUSTRIES_STORIES.map((ind, i) => (
              <div
                key={i}
                className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 hover:border-zinc-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                      {ind.sector}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Story Arc: {ind.storyAngle}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 mb-3">
                    {ind.headline}
                  </h3>

                  <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                    {ind.summary}
                  </p>

                  <div className="mb-6 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                    <div className="font-mono text-xs uppercase tracking-wider text-zinc-700 font-semibold mb-2">
                      Delivered Package:
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-600">
                      {ind.deliverables.map((del, dIdx) => (
                        <li key={dIdx} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">{ind.metric}</span>
                  <button
                    onClick={() => onNavigate('/contact/')}
                    className="text-accent font-semibold hover:underline cursor-pointer"
                  >
                    Discuss project →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. HOW WE MAKE IT (#process) */}
      <section id="process" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Production Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              How we craft your story
            </h2>
            <p className="text-base text-zinc-600 mt-4 leading-relaxed">
              We eliminate traditional filming friction: no giant trucks, no rigging delays, and no closed-door disruptions. From single capture to full deployment:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {PROCESS_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 relative flex flex-col justify-between hover:bg-white hover:border-zinc-300 transition-all shadow-xs"
              >
                <div>
                  <div className="font-mono text-2xl font-bold text-accent mb-3">
                    {step.step}
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mb-2">
                    {step.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200 text-[11px] font-mono text-zinc-400">
                  Step {idx + 1} of 5
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS (#faq) */}
      <section id="faq" className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Clear Answers
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              Frequently asked questions
            </h2>
          </div>

          <FaqList items={FAQS} />
        </div>
      </section>

      {/* 9. CALL TO ACTION BAND */}
      <section className="py-20 bg-zinc-900 text-white relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-300">
              Start Your Narrative Project
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
            Ready to turn your place into a story?
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell us about your site and what you want people to feel and do. We will help you shape the story, calculate your spatial requirements, and propose the right format.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/contact/')}
              className={buttonClass('primary', 'lg', 'shadow-lg hover:shadow-red-900/30')}
            >
              <span>Plan your story</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <a
              href="https://wa.me/9779846789573"
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
            RCAAS Technology · Kathmandu, Nepal · reality capture & visual storytelling
          </p>
        </div>
      </section>
    </div>
  );
};
