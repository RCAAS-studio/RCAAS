import { Box, Building2, Clapperboard, DraftingCompass, Drone, FileText, Glasses, MousePointerClick, Ruler, ScanLine, Share2 } from 'lucide-react';
import type { RoutePath } from '../../types';
import type { IndustryContent } from './types';

export const realEstateArchitecture: IndustryContent = {
  slug: 'real-estate-architecture',
  name: 'Real Estate & Architecture',
  titleTag: '3D Tours & As-Built Scans for Real Estate | RCAAS',
  metaDescription:
    '3D property tours that help buyers decide, and accurate as-built scans that help architects design. For developers, agents and designers in Nepal.',
  h1: 'Sell, design and renovate from reality.',
  answer:
    'Property buyers want a true sense of space, and designers need accurate measurements. RCAAS Technology creates photorealistic 3D property tours for developers and agents, and measured as-built scans for architects and interior designers across Nepal, often from the same site visit.',
  primaryCta: { label: 'Plan your project', path: '/contact/?type=real-estate' as RoutePath },
  secondaryCta: { label: 'Jump to architects', anchor: 'architects' },
  heroQuestions: ['How big does the flat really feel?', 'How much light does it get?', 'Do the old drawings match what was built?'],
  tracks: [
    {
      id: 'developers',
      label: 'For developers and agents',
      tone: 'light',
      icon: Building2,
      challengeTitle: 'Buyers want to walk through before they commit.',
      challengeBody:
        "A flat or a house is a large decision. Floor plans and photos leave buyers guessing about size, light and flow, and many serious buyers can't visit easily, including families living abroad. Every extra site visit slows the sale.",
      itemsTitle: 'The experience we create',
      items: [
        { what: '3D property tour', how: 'Buyers walk show flats, finished units and amenities from a link.', icon: Box },
        {
          what: 'Hotspots and enquiry buttons [[TBC]]',
          how: 'Show unit details and send buyers straight to your sales team or WhatsApp.',
          icon: MousePointerClick,
        },
        {
          what: 'Fly-through film and aerials',
          how: 'Show the building, the neighbourhood and the view for launches and ads.',
          icon: Clapperboard,
        },
        { what: 'VR in your sales gallery [[TBC]]', how: 'Let visitors stand inside a finished unit.', icon: Glasses },
      ],
      lists: [
        {
          title: 'What to capture',
          items: [
            'show flats and sample units',
            'completed apartments and houses',
            'lobbies, gyms, rooftops and amenities',
            'the site and its surroundings from the air',
          ],
        },
        {
          title: 'Where it works',
          items: [
            'Your project website and listing pages',
            'replies to enquiries on WhatsApp',
            'social media and ads',
            'QR codes on hoardings and brochures',
            'screens and VR in your sales office',
            'buyers abroad',
          ],
        },
      ],
    },
    {
      id: 'architects',
      label: 'For architects and interior designers',
      tone: 'dark',
      icon: DraftingCompass,
      challengeTitle: 'Good design starts with accurate existing conditions.',
      challengeBody:
        'Measuring an existing building by hand takes days, and missed or wrong dimensions turn into costly changes later. Old drawings rarely match what was built.',
      itemsTitle: 'What we provide',
      items: [
        { what: '3D laser scan', how: 'Every wall, opening, level and irregularity captured in one visit.', icon: ScanLine },
        {
          what: 'As-built drawings and CAD-ready files [[TBC: scope, formats]]',
          how: 'Start design in your own software from real measurements.',
          icon: FileText,
        },
        { what: 'Drone survey', how: 'Roofs, site and surroundings for extensions and new builds.', icon: Drone },
        {
          what: 'Shareable 3D view',
          how: 'Walk your client through the existing space, then present your proposal in context.',
          icon: Share2,
        },
      ],
      lists: [
        {
          title: 'Typical uses',
          items: ['renovation and fit-out', 'interior design', 'extensions and alterations', 'as-built records', 'space planning'],
        },
      ],
      links: [
        { label: '3D laser scanning', path: '/services/digital-twins/3d-laser-scanning/' },
        { label: 'Drone mapping', path: '/services/digital-twins/drone-mapping/' },
        { label: 'Digital Twins & Survey', path: '/services/digital-twins/' },
      ],
    },
  ],
  oneVisit: {
    title: 'Measurements for your designers, a tour for your buyers',
    body: 'The same capture that gives your architect accurate as-built data can become a photorealistic tour for marketing. For developers renovating or repositioning a property, that means one site visit serves both design and sales.',
    outputs: [
      { label: 'As-built data', line: 'for your designers', icon: Ruler },
      { label: 'Photorealistic tour', line: 'for your buyers', icon: Box },
    ],
  },
  liveExample: {
    title: 'See a space in 3D',
    // Best available demo until a property or interior project exists.
    demo: 'basera',
    embedUrl: null,
    pending: '[[TBI: property or interior project; if none, use the best available demo]]',
    caption: '[[TBI]]',
  },
  // W05: until a real estate or architecture project exists, this section stays hidden (page stays P2, spec §3.3).
  proof: { title: 'In practice', cards: [] },
  faq: {
    title: 'Questions from developers and designers',
    items: [
      {
        question: "Can you show a building that isn't built yet?",
        answer:
          'We capture what exists: the site, the surroundings and finished show flats or sample units. [[TBC: "Our game developers can also present your design model inside an interactive experience." — keep only if offered]]',
      },
      {
        question: 'How quickly can you scan an existing building?',
        answer:
          'Most buildings are scanned in a few hours to a day, depending on size. [[TBI: typical delivery time for data and drawings]].',
      },
      {
        question: 'Which files will our design team receive?',
        answer: '[[TBC: formats, e.g. E57 and LAS point clouds, DWG/DXF drawings]]',
      },
      {
        question: 'How accurate is the scan?',
        answer: '[[TBI: accuracy and conditions]]. We agree the accuracy your project needs at the start.',
      },
      {
        question: 'Can buyers abroad use the tour easily?',
        answer: 'Yes. It opens from a link in any browser, on a phone or a computer, with nothing to install.',
      },
    ],
  },
  cta: {
    // "Sell faster" is a goal headline, not a measured claim. Alternative: "Help buyers decide. Design from reality."
    title: 'Sell faster. Design from reality.',
    body: "Tell us about your property or project and what you need. We'll recommend the right capture and send a clear proposal.",
  },
  audienceType: 'Property developers, real estate agents, architects and interior designers',
  serviceIds: ['https://rcaas.tech/services/immersive-experiences/#service', 'https://rcaas.tech/services/digital-twins/#service'],
};
