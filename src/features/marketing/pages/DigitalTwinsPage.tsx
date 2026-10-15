import React, { useState, useEffect } from 'react';
import { IMG } from '../data/images';
import { RoutePath } from '../types';
import { SplatEmbed } from '../components/SplatEmbed';
import { FaqList } from '../components/GuideParts';
import { buttonClass } from '../components/ui';

interface DigitalTwinsPageProps {
  onNavigate: (path: RoutePath) => void;
  onOpenPlanner?: () => void;
}

interface CapabilityItem {
  id: string;
  anchor?: string;
  number: string;
  title: string;
  badge: string;
  whatItIs: string;
  youReceive: string[];
  bestFor: string[];
  madeWith: string;
  linkText?: string;
  linkHref?: RoutePath;
  image?: string;
  specDetails?: {
    accuracyProfile: string;
    primaryFormats: string;
    captureMethod: string;
  };
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'laser-scanning',
    number: '01',
    title: '3D Laser Scanning',
    badge: 'Mobile SLAM LiDAR · Handheld Trajectory · Interior & Exterior',
    whatItIs:
      'A handheld laser scanner records every wall, beam, structural column and opening as our surveyor walks through the space. A building floor that takes days to measure by hand with tape and disto is captured in minutes.',
    youReceive: [
      'Registered 3D point cloud with true spatial dimensions',
      'Unified coordinate system tying multi-floor interiors and exteriors together',
      'Cleaned point cloud clips formatted for Autodesk Revit, AutoCAD, and ArchiCAD',
      'High-resolution spherical panoramas linked to scan trajectory coordinates',
      'Quality inspection report documenting point density and registration tolerances',
    ],
    bestFor: [
      'As-built surveys for architecture, interior renovations and fit-outs',
      'Historic and irregular buildings with un-plumb walls and bowed timber beams',
      'Industrial plants, MEP coordination and mechanical plant rooms',
      'Challenging spaces that are hazardous or physically impossible to hand-measure',
    ],
    madeWith:
      'Handheld SLAM laser scanners such as the XGRIDS Lixel Kitty K1, operating at hundreds of thousands of laser pulses per second.',
    linkText: 'Explore 3D laser scanning',
    linkHref: '/services/digital-twins/3d-laser-scanning/',
    image: IMG['digital-twins/showcase-1'],
    specDetails: {
      accuracyProfile: 'Millimeter-scale relative measurement accuracy',
      primaryFormats: 'E57, LAS, LAZ, PTS, RCP',
      captureMethod: 'Continuous walking SLAM LiDAR with RTK georeferencing',
    },
  },
  {
    id: 'drone-mapping',
    number: '02',
    title: 'Drone Mapping & Aerial Survey',
    badge: 'RTK Photogrammetry · True-Scale Orthomosaics · Roof & Site Topography',
    whatItIs:
      'Planned autonomous survey flights that capture roofs, courtyards, steep terrain, and entire sites from above, processed into distortion-free true-scale maps and dense 3D models.',
    youReceive: [
      'Sub-centimeter resolution Orthomosaic maps (GeoTIFF) ready for GIS and CAD',
      'Digital Surface Models (DSM) and Digital Terrain Models (DTM)',
      '3D textured polygonal mesh of complex rooftops, facades and compound perimeters',
      'Topographic contour vectors at custom intervals (0.25m, 0.5m, 1m) [[TBC]]',
      'Aerial condition photography of inaccessible spires, cornices and tiles',
    ],
    bestFor: [
      'Large campus masterplans, land plots and resort master development',
      'Inaccessible roof surveys, temple pagoda tiers and historic facade conservation',
      'Topographic terrain modeling for civil engineering and stormwater planning',
      'Construction progress tracking and volumetric earthwork measurement',
    ],
    madeWith:
      'Survey drones such as the DJI Mavic 3 Enterprise, equipped with a 4/3 CMOS mechanical shutter camera and RTK precision positioning.',
    linkText: 'Explore drone mapping',
    linkHref: '/services/digital-twins/drone-mapping/',
    image: IMG['digital-twins/showcase-2'],
    specDetails: {
      accuracyProfile: 'Sub-centimeter Ground Sample Distance (GSD) calibrated with GCPs',
      primaryFormats: 'GeoTIFF, LAS, OBJ, DXF contours, PDF',
      captureMethod: 'Autonomous photogrammetric grid flight with RTK corrections',
    },
  },
  {
    id: 'as-built',
    anchor: 'as-built',
    number: '03',
    title: 'As-Built Drawings & CAD/BIM-Ready Data',
    badge: 'Scan-to-CAD · Revit Ready · Parametric Geometry',
    whatItIs:
      'Your laser scan converted into the exact 2D drawings and 3D architectural files your design, engineering, and construction teams work with every day.',
    youReceive: [
      'Measured architectural floor plans showing real wall thicknesses and true angles',
      'Longitudinal and cross building sections capturing structural slab depths and sags',
      'Exterior facade elevations highlighting ornamentation, stone carvings and openings',
      'CAD vector files structured with clean layer hierarchies (walls, openings, steps)',
      'Point cloud reference files indexed for immediate insertion into AutoCAD and Revit',
    ],
    bestFor: [
      'Architects beginning adaptive reuse, interior renovation, or structural retrofitting',
      'Interior designers planning bespoke millwork and fitted joinery',
      'MEP and HVAC engineers coordinating pipe runs through existing structures',
      'Contractors validating structural handover before fit-out works commence',
    ],
    madeWith:
      'Autodesk Revit, AutoCAD, and specialized point-cloud extraction pipelines drafted by qualified architectural technicians.',
    image: IMG['digital-twins/showcase-3'],
    specDetails: {
      accuracyProfile: 'Drafted to agreed Level of Detail (LOD 200/300) from scan data',
      primaryFormats: 'DWG, DXF, RVT, IFC, Vector PDF',
      captureMethod: 'Extracted directly from registered LiDAR slice geometries',
    },
  },
  {
    id: 'survey-gis',
    anchor: 'survey-gis',
    number: '04',
    title: 'Survey, Positioning & GIS',
    badge: 'Geodetic Control · National Grid · Spatial Databases',
    whatItIs:
      'The geodetic surveying that anchors your 3D scan to the real world: ground control networks, boundary georeferencing, topographic leveling, and GIS layer structuring.',
    youReceive: [
      'Georeferenced spatial data aligned with Nepal National Grid or WGS84 coordinates',
      'Survey benchmark control point documentation and datum reports',
      'Topographic site survey drawings including spot heights and breaklines [[TBC]]',
      'GIS geodatabase layers ready for QGIS, ArcGIS, and municipal planning software',
      'Boundary verification overlays against cadastral maps',
    ],
    bestFor: [
      'Civil infrastructure, roadway upgrades, and bridge approach documentation',
      'Municipal planning departments, utility authorities, and smart-city initiatives',
      'Large property development master plans requiring real-world orientation',
      'Environmental planning, flood risk modeling, and slope stability analysis',
    ],
    madeWith:
      'Multi-constellation survey-grade GNSS receivers (RTK/PPK), total stations, and calibrated ground control targets.',
    image: IMG['digital-twins/showcase-4'],
    specDetails: {
      accuracyProfile: 'Tied to geodetic control networks with millimeter closure',
      primaryFormats: 'GeoPackage, ESRI Shapefile (.shp), GeoTIFF, CSV, DWG',
      captureMethod: 'Dual-frequency GNSS RTK and optical traverse tie-ins',
    },
  },
  {
    id: 'heritage-records',
    anchor: 'heritage-records',
    number: '05',
    title: 'Heritage Records & Digital Archives',
    badge: 'Non-Invasive · Conservation Archiving · Millimeter Precision',
    whatItIs:
      'A complete, permanent 3D record of a historic monument or sacred site, inside and out: its geometry, timber carvings, structural deformations, and sacred surroundings. Capture is 100% contactless, so nothing is touched or altered.',
    youReceive: [
      'Millimeter-accurate 3D archival point cloud preserved in open archival formats',
      'Drone aerial record of multi-tiered pagoda roofs, finials (gajur), and courtyards',
      'Structural deflection and lean analysis (out-of-plumb walls, timber beam sags)',
      'High-resolution photographic texture maps for condition and material assessment',
      'Long-term archival bundle formatted for institutional preservation [[TBI: archive format]]',
    ],
    bestFor: [
      'Department of Archaeology, heritage conservation trusts, and restoration architects',
      'Structural engineers calculating post-earthquake stability and seismic resilience',
      'Academic researchers, historians, and international conservation bodies (UNESCO/ICOMOS)',
      'Community trusts seeking permanent documentation of sacred monuments',
    ],
    madeWith:
      'Non-invasive laser scanning, close-range photogrammetry, and aerial imaging with zero physical contact or site disturbance.',
    linkText: 'Explore digital heritage',
    linkHref: '/industries/heritage-culture/',
    image: IMG['digital-twins/showcase-5'],
    specDetails: {
      accuracyProfile: 'Millimeter spatial resolution preserving subtle masonry detail',
      primaryFormats: 'E57, LAS, OBJ, GeoTIFF, PDF Reports',
      captureMethod: 'Non-contact terrestrial SLAM LiDAR + aerial drone photogrammetry',
    },
  },
];

const OUTCOME_TILES = [
  {
    title: 'Fewer site visits',
    line: 'Take any measurement from the 3D record, any time, without going back.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Design that fits',
    line: 'Walls that aren’t straight and floors that slope are captured as they really are.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Plan from data',
    line: 'Work from measured ground, buildings and terrain, not old drawings or guesses.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'A record that lasts',
    line: 'Keep an exact copy of a place, even after it changes.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
    ),
  },
];

const DELIVERABLES_LIST = [
  {
    deliverable: '3D Point Cloud',
    category: '3D Geometry',
    useItFor: 'Measuring, 3D modelling, CAD cross-sections, clash detection, BIM reference',
    formats: 'E57, LAS, LAZ, PTS',
    software: 'Revit, AutoCAD, ArchiCAD, CloudCompare, Rhino',
  },
  {
    deliverable: 'Plans, Sections, Elevations',
    category: '2D CAD',
    useItFor: 'Architectural design, municipal permit approvals, refurbishment, joinery planning',
    formats: 'DWG, DXF, Vector PDF',
    software: 'AutoCAD, SketchUp, Vectorworks, BricsCAD',
  },
  {
    deliverable: 'Orthomosaic Map',
    category: 'Aerial Survey',
    useItFor: 'True-scale site plans, cadastral overlay, roof condition mapping, boundary verification',
    formats: 'GeoTIFF, ECW, High-Res JPEG',
    software: 'QGIS, ArcGIS, Civil 3D, Global Mapper',
  },
  {
    deliverable: 'Surface & Terrain Models (DSM/DTM)',
    category: 'Terrain & GIS',
    useItFor: 'Earthwork cut/fill estimation, contour generation, watershed & drainage analysis',
    formats: 'GeoTIFF, ASCII Grid, XYZ',
    software: 'Civil 3D, QGIS, ArcGIS, 12d Model',
  },
  {
    deliverable: '3D Textured Mesh Model',
    category: '3D Visualisation',
    useItFor: 'Stakeholder visualisation, design coordination, virtual reality, game-engine simulation',
    formats: 'OBJ, FBX, glTF, USDZ',
    software: 'Blender, 3ds Max, Unreal Engine, Unity',
  },
  {
    deliverable: 'GIS Spatial Layers',
    category: 'Terrain & GIS',
    useItFor: 'Urban asset management, environmental mapping, municipal land-use records',
    formats: 'ESRI Shapefile (SHP), GeoPackage, KML',
    software: 'QGIS, ArcGIS, Google Earth Pro',
  },
  {
    deliverable: 'Photorealistic 3D Web View',
    category: 'Web Sharing',
    useItFor: 'Instant browser sharing with clients, donors and non-technical stakeholders (no CAD needed)',
    formats: 'Hosted web link with measurement tool',
    software: 'Any modern browser (Chrome, Safari, Edge)',
  },
];

const PROCESS_STEPS = [
  {
    step: '1',
    title: 'Brief & Scope',
    line: 'We agree what the data is for, the area, the accuracy and the deliverables.',
    detail:
      'We review your site boundaries, identify specific drawing deliverables (plans, sections, terrain), and agree target accuracy tolerances before deploying.',
  },
  {
    step: '2',
    title: 'Reality Capture',
    line: 'We scan on the ground and from the air, tied to survey-grade control where accuracy matters.',
    detail:
      'Our surveyors deploy handheld SLAM LiDAR through every interior floor and fly RTK photogrammetry over roofs, tied to GNSS ground control markers.',
  },
  {
    step: '3',
    title: 'Process & Verify',
    line: 'Our engineers align and clean the data, then check it for gaps, errors and drift.',
    detail:
      'Raw laser trajectories and aerial passes are co-registered, noise is eliminated, and the point cloud is verified against independent ground check points.',
  },
  {
    step: '4',
    title: 'Deliver & Export',
    line: 'You receive files ready for your software, and a 3D view you can share.',
    detail:
      'Deliverables are exported into standard formats (E57, DWG, GeoTIFF) with coordinate headers, plus a password-protected web 3D model for stakeholder review.',
  },
  {
    step: '5',
    title: 'Repeat & Update',
    line: 'Repeat captures to track change over time [[TBC]].',
    detail:
      'For ongoing construction or conservation monitoring, we perform repeat scans aligned to identical coordinates to produce delta reports and volume changes.',
  },
];

const WHO_ITS_FOR = [
  {
    role: 'Architects & Interior Designers',
    benefit: 'Accurate as-builts in days, not weeks of measuring with tape.',
    detail: 'Never discover on site that a wall is out-of-square by 8 inches after ordering custom cabinetry. Start renovation designs from true geometry.',
    linkHref: '/industries/real-estate-architecture/' as RoutePath,
    linkText: 'Architecture solutions →',
  },
  {
    role: 'Developers & Contractors',
    benefit: 'Site and building data for planning, tender accuracy and coordination.',
    detail: 'Eliminate costly site guesswork, quantify cut and fill volumes with confidence, and coordinate MEP trades against an undeniable 3D record.',
    linkHref: '/industries/real-estate-architecture/' as RoutePath,
    linkText: 'Construction solutions →',
  },
  {
    role: 'Conservators & Researchers',
    benefit: 'Measured heritage records for structural study and faithful restoration.',
    detail: 'Preserve millimeter documentation of fragile timber carvings, pagoda roof tiers, and earthquake cracks with 100% contactless technology.',
    linkHref: '/industries/heritage-culture/' as RoutePath,
    linkText: 'Digital heritage solutions →',
  },
  {
    role: 'Municipalities & Public Bodies',
    benefit: '3D base data for urban planning, asset management and smart-city work.',
    detail: 'Build georeferenced spatial datasets of historic squares, public infrastructure, and municipal terrain for flood analysis and master planning.',
    linkHref: '/industries/government-municipalities/' as RoutePath,
    linkText: 'Municipal solutions →',
  },
  {
    role: 'Factories & Facility Teams',
    benefit: 'Measured records of plants and sites for layout, retrofit and maintenance.',
    detail: 'Plan new lines and equipment against the plant as it really is, not drawings that are out of date.',
    linkHref: '/industries/factories/' as RoutePath,
    linkText: 'Factory solutions →',
  },
  {
    role: 'Insurers & Loss Adjusters',
    benefit: 'Measured 3D records of insured properties before and after a loss.',
    detail: 'Support underwriting surveys and claims with a site record that several parties can review from a link.',
    linkHref: '/industries/non-life-insurance/' as RoutePath,
    linkText: 'Insurance solutions →',
  },
];

const FAQS = [
  {
    question: 'How accurate is your data?',
    answer:
      'Accuracy depends on the method, the site and the ground control used. For handheld SLAM laser scanning, relative measurement accuracy across typical rooms and building levels is within millimeter tolerances. For drone aerial mapping, ground resolution (GSD) is typically sub-centimeter, with absolute real-world georeferencing anchored by survey-grade GNSS control points. We agree the accuracy your project needs during planning and tell you honestly if it can be achieved. Every project includes verification against independent check points.',
  },
  {
    question: 'Can I use the data in CAD, BIM or GIS software?',
    answer:
      'Yes. We deliver data in open and industry-standard formats including E57 and LAS/LAZ for point clouds, DWG/DXF for vector CAD drawings, GeoTIFF for georeferenced aerial maps and elevation models, and OBJ/FBX for 3D polygon meshes. Files plug directly into AutoCAD, Revit, ArchiCAD, Rhino, Civil 3D, and QGIS.',
  },
  {
    question: 'Can you produce floor plans and sections?',
    answer:
      'Yes. Our architectural team drafts clean 2D architectural floor plans, reflected ceiling plans, building sections, and exterior facade elevations directly from the registered point cloud, delivered in DWG and PDF formats with proper layering conventions.',
  },
  {
    question: 'Is the data tied to real-world coordinates?',
    answer:
      'Yes, where your project needs it. We use multi-frequency survey-grade GNSS receivers and ground control targets (GCPs) so your 3D dataset aligns precisely with the Nepal National Grid, UTM zones, cadastral boundaries, and GIS databases.',
  },
  {
    question: 'Does scanning damage buildings or monuments?',
    answer:
      'No. Terrestrial laser scanning and drone aerial capture are completely contactless (non-destructive). Our sensors emit eye-safe Class 1 laser pulses or capture passive aerial imagery. Nothing touches the monument, making it safe for delicate timber carvings, ancient terracotta, and fragile structures.',
  },
  {
    question: 'Can you support academic research or a PhD?',
    answer:
      'Yes. We regularly collaborate with university researchers and conservation scholars. We can plan capture around your specific research questions, advise on spatial data resolution, and export point clouds or mesh models in formats needed for structural finite-element modeling, deformation analysis, or archaeological archiving.',
  },
  {
    question: 'Who owns the data?',
    answer:
      'You own all delivered files, drawings, point clouds and models for your project. Full commercial usage rights are transferred to you upon project handover. RCAAS only uses project imagery in its portfolio with your explicit prior consent.',
  },
];

export const DigitalTwinsPage: React.FC<DigitalTwinsPageProps> = ({ onNavigate }) => {
  // Showcase state
  const [showcaseView, setShowcaseView] = useState<'textured' | 'pointcloud'>('textured');
  const [elevationSlice, setElevationSlice] = useState<number>(65);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // FAQ state

  // Hash anchor scrolling
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

  const filteredDeliverables =
    selectedCategory === 'all'
      ? DELIVERABLES_LIST
      : DELIVERABLES_LIST.filter((d) => d.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="bg-white text-zinc-900 min-h-dvh selection:bg-accent selection:text-white">
      {/* 1. HERO + ANSWER SUMMARY */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 border-b border-zinc-200 overflow-hidden">
        {/* Engineering grid background */}
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
              <li className="text-zinc-900 font-semibold" aria-current="page">
                Digital Twins &amp; Survey
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 mb-6">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-600">
                  Service Pillar · Digital Twins &amp; Survey
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-6">
                Accurate 3D you can measure, design and plan from.
              </h1>

              <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed mb-8 max-w-3xl">
                A digital twin is an accurate, measurable 3D copy of a real building, site or landscape. RCAAS Technology captures places across Nepal with advanced laser and aerial scanning, then delivers point clouds, drawings, maps and 3D models that architects, engineers, conservators and planners can work from with confidence.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('/contact/')}
                  className={buttonClass('dark', 'md')}
                >
                  <span>Plan your capture</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <a
                  href="#deliverables"
                  className="px-6 py-3.5 bg-white hover:bg-zinc-50 text-zinc-900 text-sm font-semibold rounded-lg border border-zinc-300 transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>See what you receive</span>
                </a>
              </div>
            </div>

            {/* Technical Specification Summary Card */}
            <div className="lg:col-span-4 bg-zinc-50 border border-zinc-200 rounded-xl p-6 relative">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-600 mb-4 pb-2 border-b border-zinc-200 flex justify-between items-center">
                <span>Survey Specification Profile</span>
                <span className="text-accent font-bold">RCAAS Survey</span>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Sensor hardware:</span>
                  <span className="font-mono text-xs text-zinc-900">SLAM LiDAR + RTK Drone</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Coordinate datums:</span>
                  <span className="font-mono text-xs text-zinc-900">WGS84 / Nepal Grid (UTM)</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Primary point formats:</span>
                  <span className="font-mono text-xs text-zinc-900">E57 · LAS · LAZ · RCP</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">CAD deliverables:</span>
                  <span className="font-mono text-xs text-zinc-900">DWG · DXF · RVT · PDF</span>
                </li>
                <li className="flex items-center justify-between text-zinc-700">
                  <span className="font-medium">Contact method:</span>
                  <span className="font-mono text-xs text-zinc-900">100% Non-invasive</span>
                </li>
              </ul>

              <div className="mt-5 pt-4 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Have drawings to review?</span>
                <button
                  onClick={() => onNavigate('/contact/')}
                  className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  Send site brief →
                </button>
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

      {/* STICKY ANCHOR NAVIGATION STRIP */}
      <nav aria-label="Section anchors" className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 py-3 overflow-x-auto shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 sm:space-x-3 text-xs font-mono whitespace-nowrap">
          <span className="text-zinc-400 uppercase text-[10px] tracking-wider mr-2 hidden sm:inline">Jump to:</span>
          <a href="#showcase" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#showcase</a>
          <a href="#definition" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#definition</a>
          <a href="#capabilities" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#capabilities</a>
          <a href="#as-built" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#as-built</a>
          <a href="#survey-gis" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#survey-gis</a>
          <a href="#heritage-records" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#heritage-records</a>
          <a href="#accuracy" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#accuracy</a>
          <a href="#deliverables" className="px-3 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">#deliverables</a>
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
                Survey &amp; Reality Capture Showcase
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
                See a measured place
              </h2>
              <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
                Inspect reality captured with survey precision. Compare photorealistic 3D textures with the underlying laser point cloud coordinates.
              </p>
            </div>

            {/* Toggle view button */}
            <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
              <button
                onClick={() => setShowcaseView('textured')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  showcaseView === 'textured'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Interactive 3D Reality
              </button>
              <button
                onClick={() => setShowcaseView('pointcloud')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  showcaseView === 'pointcloud'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                LiDAR Point Cloud Density
              </button>
            </div>
          </div>

          {/* Viewer Container */}
          {showcaseView === 'textured' ? (
            <div>
              <div className="mb-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-semibold text-zinc-900">
                    Live photorealistic 3D coordinate model: Chilancho Stupa, Kirtipur.
                  </span>
                  <span className="text-zinc-500 hidden sm:inline">
                    — Drag to rotate, pan to inspect masonry, zoom into carved pagoda base.
                  </span>
                </div>
                <button
                  onClick={() => setShowcaseView('pointcloud')}
                  className="font-mono text-accent hover:underline cursor-pointer"
                >
                  View Point Cloud Mesh →
                </button>
              </div>
              <SplatEmbed initialDemo="chilancho" />
              <div className="mt-4 text-xs text-zinc-500 font-mono text-center">
                Caption: Chilancho Stupa Heritage Complex, Kirtipur · Documented in 3D to establish true proportions, structural alignment and millimeter-scale conservation records.
              </div>
            </div>
          ) : (
            // Point Cloud Inspector View
            <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-950 text-white shadow-lg">
              <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                <img loading="lazy" decoding="async"
                  src={IMG['digital-twins/lidar-point-cloud-cad-cross-section-view']}
                  alt="LiDAR Point cloud CAD cross section view"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

                {/* Point Cloud HUD Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2 bg-black/70 px-3 py-1.5 rounded border border-zinc-800">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>LIDAR REFLECTANCE INTENSITY: ACTIVE</span>
                  </div>
                  <div className="bg-black/70 px-3 py-1.5 rounded border border-zinc-800 text-zinc-300">
                    CRS: EPSG:32645 (WGS 84 / UTM zone 45N)
                  </div>
                </div>

                {/* Real-time Coordinate Simulator readout */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/85 p-4 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-white mb-1">
                      Elevation Section Slice: {elevationSlice}m AOD (Above Ordnance Datum)
                    </div>
                    <div className="text-zinc-400 font-mono text-[11px]">
                      X: 631,245.812m E · Y: 3,061,920.405m N · Density: 14,200 pts/m²
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-mono text-zinc-400">Section Height:</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={elevationSlice}
                      onChange={(e) => setElevationSlice(Number(e.target.value))}
                      className="w-32 accent-accent cursor-pointer"
                      aria-label="Elevation section height slider"
                    />
                    <span className="font-mono text-zinc-300 text-xs w-8">{elevationSlice}m</span>
                  </div>
                </div>
              </div>

              {/* Technical Caption */}
              <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-300">
                <div>
                  <span className="font-bold text-white">Dataset:</span> Terrestrial SLAM LiDAR (XGRIDS Lixel Kitty K1) + RTK Aerial Drone Photogrammetry ·{' '}
                  <span className="text-zinc-400">
                    Registered to 12 independent survey ground control benchmarks.
                  </span>
                </div>
                <button
                  onClick={() => setShowcaseView('textured')}
                  className="mt-2 sm:mt-0 font-mono text-xs text-accent hover:underline"
                >
                  Return to 3D View →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. WHAT WE MEAN BY A DIGITAL TWIN (#definition) */}
      <section id="definition" className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Engineering Definition
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 leading-tight">
              What we mean by "digital twin"
            </h2>
            <p className="text-base sm:text-lg text-zinc-700 mt-4 leading-relaxed">
              For us, a digital twin is a measured 3D record of a place as it is today. It is accurate enough to measure and design from, and it sits in real-world coordinates so it lines up with your maps and drawings. It can be updated with repeat captures to show change over time, and the same data can power a 3D tour or a film.
            </p>
          </div>

          {/* The 3 Core Pillars of a Measured Twin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
              <div className="font-mono text-xs font-bold text-accent mb-2 uppercase tracking-wider">
                01 · Geometric Fidelity
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">
                Measurable Millimeter Scale
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Not a stylized 3D artist impression. Every point represents a real physical reflection captured by laser and high-resolution optical sensors, revealing bowed beams and non-plumb walls.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
              <div className="font-mono text-xs font-bold text-accent mb-2 uppercase tracking-wider">
                02 · Spatial Georeferencing
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">
                Real-World Coordinate Datum
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Tied to GNSS ground control points so the scan lines up with your architectural drawings, GIS cadastral layers, and topographical maps without coordinate drift.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
              <div className="font-mono text-xs font-bold text-accent mb-2 uppercase tracking-wider">
                03 · Multi-Disciplinary Utility
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">
                CAD, BIM, GIS &amp; Web 3D
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                One reality capture fuels your entire project lifecycle: E57 point clouds for engineers, DWG plans for architects, GeoTIFFs for planners, and 3D tours for executive clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHAT WE CREATE (#capabilities) */}
      <section id="capabilities" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Capabilities &amp; Survey Methodologies
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              What we create
            </h2>
            <p className="text-base text-zinc-600 mt-4 leading-relaxed">
              We choose the capture method for your site and purpose. Most projects combine ground and aerial capture, so interiors, roofs and surroundings join into one complete record.
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
                  {/* Left Column */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <span className="font-mono text-xs font-bold text-zinc-600">
                          METHOD {cap.number}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {cap.badge}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
                        {cap.title}
                      </h3>

                      <div className="text-sm text-zinc-600 mb-6 leading-relaxed">
                        <span className="font-semibold text-zinc-900">What it is: </span>
                        <span>{cap.whatItIs}</span>
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

                    {/* Footer note and links */}
                    <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="text-zinc-500 max-w-sm">
                        <span className="font-medium text-zinc-700">Made with: </span>
                        {cap.madeWith}
                      </div>

                      {cap.linkHref && cap.linkText && (
                        <button
                          onClick={() => onNavigate(cap.linkHref!)}
                          className={buttonClass('dark', 'sm', 'shrink-0 self-start sm:self-auto')}
                        >
                          <span>{cap.linkText}</span>
                          <span>→</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Spec Sheet & Preview */}
                  <div className="lg:col-span-5 bg-zinc-50 border-t lg:border-t-0 lg:border-l border-zinc-200 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      {cap.image && (
                        <div className="relative rounded-xl overflow-hidden border border-zinc-200 aspect-video mb-6 shadow-xs group">
                          <img loading="lazy" decoding="async"
                            src={cap.image}
                            alt={cap.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                          <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-mono">
                            {cap.specDetails?.captureMethod}
                          </div>
                        </div>
                      )}

                      {/* Technical specifications box */}
                      {cap.specDetails && (
                        <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2.5 text-xs shadow-xs">
                          <div className="font-mono uppercase tracking-wider text-zinc-500 text-[10px] pb-1 border-b border-zinc-100 flex justify-between">
                            <span>Technical Spec Profile</span>
                            <span className="text-accent">Survey-Grade</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block mb-0.5">Accuracy Profile:</span>
                            <span className="font-mono text-zinc-800 text-[11px] leading-tight block">
                              {cap.specDetails.accuracyProfile}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block mb-0.5">Primary File Formats:</span>
                            <span className="font-mono text-zinc-800 text-[11px] leading-tight block">
                              {cap.specDetails.primaryFormats}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block mb-0.5">Capture Pipeline:</span>
                            <span className="font-mono text-zinc-800 text-[11px] leading-tight block">
                              {cap.specDetails.captureMethod}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-200 text-[11px] text-zinc-500 font-mono">
                      Coordinate-locked &amp; checked against survey control.
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ACCURACY YOU CAN RELY ON (#accuracy) */}
      <section id="accuracy" className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Quality Assurance &amp; Tolerances
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 leading-tight">
              Accuracy you can rely on
            </h2>
            <p className="text-base text-zinc-700 mt-4 leading-relaxed">
              A 3D model is only useful if it is right. Accuracy depends on the method, the site and the ground control used, so we agree the accuracy your project needs at the start and tell you honestly if it can be achieved. Every dataset is checked against control and against itself before it leaves our hands.
            </p>
          </div>

          {/* Transparent Quality Check Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-accent font-mono font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2">
                Ground Control &amp; Check Points
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                We distribute independent ground control targets across your site. Half are used for georeferencing; the remaining targets serve as uninfluenced check points to verify absolute position and scale.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-accent font-mono font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2">
                SLAM Loop Closure Analysis
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Handheld LiDAR trajectories always loop back to their origin point. We compute loop closure residuals to eliminate spatial drift across multi-room corridors and stairwells.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-accent font-mono font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2">
                Calibration Verification Reports
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                You receive a transparent survey report detailing RMS residuals, point cloud alignment deviations, and camera calibration parameters alongside your primary CAD and BIM files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHAT YOU RECEIVE (#deliverables) */}
      <section id="deliverables" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-zinc-200">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
                Engineering Deliverables Matrix
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
                What you receive
              </h2>
              <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
                Standard, vendor-agnostic file formats engineered for seamless import into Autodesk, Bentley, QGIS, and game-engine toolchains.
              </p>
            </div>

            {/* Category filter buttons */}
            <div className="mt-4 md:mt-0 flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs">
              {['all', '3D', 'CAD', 'Aerial', 'GIS'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Deliverables Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 font-mono text-xs uppercase tracking-wider text-zinc-700">
                    <th className="py-3.5 px-4 sm:px-6 font-semibold">Deliverable</th>
                    <th className="py-3.5 px-4 sm:px-6 font-semibold">Use it for</th>
                    <th className="py-3.5 px-4 sm:px-6 font-semibold">Formats</th>
                    <th className="py-3.5 px-4 sm:px-6 font-semibold hidden lg:table-cell">Target Software</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredDeliverables.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-bold text-zinc-900">
                        <div>{item.deliverable}</div>
                        <span className="font-mono text-[10px] text-zinc-400 font-normal uppercase">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-zinc-600 max-w-xs leading-relaxed">
                        {item.useItFor}
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-mono text-xs text-accent font-medium">
                        {item.formats}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-xs text-zinc-500 font-mono hidden lg:table-cell">
                        {item.software}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 8. HOW WE BUILD IT (#process) */}
      <section id="process" className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Workflow Protocol
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              How we deliver measured data
            </h2>
            <p className="text-base text-zinc-600 mt-4 leading-relaxed">
              From project scoping to delivery, every dataset follows a strict quality pipeline to eliminate rework and registration errors:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.step}
                className="bg-white border border-zinc-200 rounded-xl p-5 relative flex flex-col justify-between hover:border-zinc-300 transition-all shadow-xs"
              >
                <div>
                  <div className="font-mono text-2xl font-bold text-accent mb-3">
                    0{step.step}
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-3">
                    {step.line}
                  </p>
                  <p className="text-[11px] text-zinc-500 leading-normal border-t border-zinc-100 pt-3">
                    {step.detail}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 text-[10px] font-mono text-zinc-400">
                  Phase {step.step} of 5
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('/how-we-work/')}
              className="font-mono text-xs text-accent hover:underline cursor-pointer font-semibold"
            >
              See our full engineering workflow &amp; equipment toolkit →
            </button>
          </div>
        </div>
      </section>

      {/* 9. WHO IT'S FOR (#industries) */}
      <section id="industries" className="py-16 md:py-24 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Stakeholder Applications
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              Who it's for
            </h2>
            <p className="text-base text-zinc-600 mt-4 leading-relaxed">
              Designed specifically for professionals whose work depends on spatial truth:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {WHO_ITS_FOR.map((item, idx) => (
              <div
                key={idx}
                className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 sm:p-8 hover:bg-white hover:border-zinc-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">
                    {item.role}
                  </h3>
                  <div className="font-mono text-xs text-accent font-semibold mb-4">
                    {item.benefit}
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                    {item.detail}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                  <button
                    onClick={() => onNavigate(item.linkHref)}
                    className="text-xs font-semibold text-zinc-900 hover:text-accent transition-colors cursor-pointer"
                  >
                    {item.linkText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. SAME CAPTURE, MORE VALUE (#more-value) */}
      <section id="more-value" className="py-16 md:py-20 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 sm:p-10 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
                  Multi-Use Reality Capture Synergy
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                  Measured data that also tells a story
                </h2>
                <p className="text-base text-zinc-600 leading-relaxed mb-6">
                  The capture that gives your architect accurate measurements can also become a photorealistic 3D tour for your clients or a fly-through film for your launch. One site visit, many uses. You save budget, minimize site access coordination, and ensure spatial consistency across marketing and engineering.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <button
                    onClick={() => onNavigate('/services/immersive-experiences/3d-virtual-tours/')}
                    className="text-zinc-900 hover:text-accent underline cursor-pointer"
                  >
                    3D virtual tours →
                  </button>
                  <span className="text-zinc-300">·</span>
                  <button
                    onClick={() => onNavigate('/services/visual-storytelling/')}
                    className="text-zinc-900 hover:text-accent underline cursor-pointer"
                  >
                    Visual Storytelling films →
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold font-mono text-accent mb-1">1 Capture</div>
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">Multi-Discipline ROI</div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Power CAD drawings, Revit models, Web 3D tours, and marketing reels from a single on-site deployment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FEATURED PROJECT */}
      <section className="py-16 md:py-20 border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
            In Practice
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-8">
            Case Study: Chilancho Stupa
          </h2>

          <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50 grid grid-cols-1 lg:grid-cols-12 shadow-xs">
            <div className="lg:col-span-7 aspect-video lg:aspect-auto relative overflow-hidden">
              <img loading="lazy" decoding="async"
                src={IMG['digital-twins/chilancho-stupa-3d-documentation']}
                alt="Chilancho Stupa 3D documentation"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-bold block mb-2">
                  Historic Monument · Kirtipur, Nepal
                </span>
                <h3 className="text-2xl font-bold text-zinc-900 mb-3">
                  Preserving Form, Proportions and Detail
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                  A medieval Buddhist stupa complex documented in complete 3D. We combined handheld SLAM laser scanning across the platform courtyards with drone photogrammetry capturing the spire, establishing a permanent millimeter-scale record for conservation architects and the local community.
                </p>
                <div className="space-y-2 text-xs font-mono text-zinc-700 mb-6">
                  <div className="flex justify-between border-b border-zinc-200 pb-1">
                    <span>LiDAR Points:</span>
                    <span className="font-bold text-zinc-900">42,000,000+ points</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200 pb-1">
                    <span>Primary Outputs:</span>
                    <span className="font-bold text-zinc-900">E57, CAD Sections, Web 3D</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Site Downtime:</span>
                    <span className="font-bold text-zinc-900">0 minutes (Non-invasive)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('/work/chilancho-stupa-digital-heritage/')}
                className={buttonClass('dark', 'sm', 'self-start')}
              >
                See the full project →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FAQ (#faq) */}
      <section id="faq" className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              Technical Clarity
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              Questions about digital twins and survey
            </h2>
          </div>

          <FaqList items={FAQS} />
        </div>
      </section>

      {/* 13. CTA BAND */}
      <section className="py-20 bg-zinc-900 text-white relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-300">
              Survey Scoping &amp; Quotation
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
            Need accurate data for your next project?
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell us what you need to measure, document or plan. We'll recommend the fastest way to capture it and send a clear proposal with deliverables and timelines.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/contact/')}
              className={buttonClass('primary', 'lg', 'shadow-lg hover:shadow-red-900/30')}
            >
              <span>Plan your capture</span>
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
            RCAAS Technology · Kathmandu, Nepal · SLAM LiDAR, Drone Mapping &amp; Survey
          </p>
        </div>
      </section>

      {/* 14. RELATED CARDS */}
      <section className="py-16 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-6 font-semibold">
            Related Pillars &amp; Guides
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => onNavigate('/services/immersive-experiences/')}
              className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 transition-all cursor-pointer shadow-xs group"
            >
              <h4 className="text-base font-bold text-zinc-900 group-hover:text-accent transition-colors mb-2">
                Immersive Experiences
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4">
                Turn your measured place into something people can explore online in 3D or VR.
              </p>
              <span className="text-xs font-semibold text-accent">
                Explore experiences →
              </span>
            </div>

            <div
              onClick={() => onNavigate('/how-we-work/')}
              className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 transition-all cursor-pointer shadow-xs group"
            >
              <h4 className="text-base font-bold text-zinc-900 group-hover:text-accent transition-colors mb-2">
                How We Work
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4">
                Our detailed survey process, hardware toolkit and data verification checks.
              </p>
              <span className="text-xs font-semibold text-accent">
                Read process guide →
              </span>
            </div>

            <div
              onClick={() => onNavigate('/industries/heritage-culture/')}
              className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 transition-all cursor-pointer shadow-xs group"
            >
              <h4 className="text-base font-bold text-zinc-900 group-hover:text-accent transition-colors mb-2">
                Digital Heritage
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4">
                How we document Nepal's historic monuments for research and long-term conservation.
              </p>
              <span className="text-xs font-semibold text-accent">
                View heritage records →
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
