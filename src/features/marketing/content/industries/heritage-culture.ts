import { Globe, GraduationCap, Handshake, Heart, Microscope, Users } from 'lucide-react';
import { IMG } from '../../data/images';
import type { RoutePath } from '../../types';
import type { IndustryContent } from './types';

// Flagship industry page: measured record (Digital Twins) + story (Visual Storytelling) + public access (Immersive Experiences).
export const heritageCulture: IndustryContent = {
  slug: 'heritage-culture',
  name: 'Heritage & Culture',
  titleTag: 'Digital Heritage: 3D Documentation & Experiences | RCAAS',
  metaDescription:
    "Measured 3D records of Nepal's temples, stupas and historic sites for conservation and research, and immersive experiences that share them with the world.",
  h1: 'Preserve heritage and share it with the world.',
  answer:
    'Digital heritage documentation creates an accurate, measurable 3D record of a monument or historic site, so its form, proportions and condition are kept even if the site changes. RCAAS Technology documents temples, stupas, palaces and historic towns across Nepal, and turns those records into experiences that let people everywhere explore them.',
  primaryCta: { label: 'Discuss a heritage project', path: '/contact/?type=heritage' as RoutePath },
  secondaryCta: { label: 'Explore Chilancho Stupa in 3D', anchor: 'live-example' },
  heroQuestions: [
    'What if the structure is damaged?',
    'Can an old drawing guide its restoration?',
    'How can people far away experience it?',
  ],
  challenge: {
    id: 'why-now',
    eyebrow: 'Why now',
    title: 'Documenting what cannot be replaced',
    body: "Nepal's temples, stupas, palaces and historic towns are living records of its history. Weather, earthquakes, development and time all change them, and the 2015 earthquake showed how quickly irreplaceable structures can be damaged or lost. When that happens, a photograph or an old drawing is rarely enough to understand what a place truly was, or to guide its restoration.",
    more: [
      'A measured 3D record keeps that knowledge. It can be studied from any angle, measured years later and compared over time. And when it is shared, it lets people who may never stand in a courtyard in Kathmandu experience it for themselves.',
    ],
  },
  twoLives: {
    id: 'two-lives',
    title: 'One capture. A record for experts, an experience for everyone.',
    columns: [
      {
        title: 'For conservators and researchers',
        icon: Microscope,
        items: [
          'Measured 3D geometry of the structure, inside and out',
          'Roofs, courtyards and surroundings captured from the air',
          'Condition and measurement data to study and compare over time',
          'Drawings and data for restoration planning',
          'A permanent digital archive [[TBI]]',
        ],
      },
      {
        title: 'For the public',
        icon: Users,
        items: [
          'A photorealistic 3D experience anyone can open from a link',
          'Guided tours with stories at each stop [[TBC]]',
          'VR at museums, exhibitions and visitor centres',
          'Films and content for awareness and fundraising',
          "A way to visit for people who can't travel or climb",
        ],
      },
    ],
  },
  liveExample: {
    title: 'Explore Chilancho Stupa',
    demo: 'chilancho',
    embedUrl: null,
    pending: '[[TBI: embed URL, full-screen URL, poster, file size]]',
    caption: 'Chilancho Stupa · documented in 3D to preserve its form, proportions and detail.',
    description: 'An interactive 3D model of Chilancho Stupa in [[TBI: location]], created by RCAAS Technology.',
    place: { type: 'LandmarksOrHistoricalBuildings', name: 'Chilancho Stupa' },
  },
  record: {
    id: 'record',
    title: 'What a heritage record includes',
    items: [
      'A measured 3D scan of the structure, inside and out',
      'Aerial coverage of roofs, courtyards and the surrounding area',
      'A photorealistic 3D model for viewing and sharing',
      'Measurement and condition data for conservation, restoration and study',
      '[[TBI: archive and handover, e.g. data formats, storage and who holds the master copy]]',
    ],
    madeWith:
      'Handheld laser scanning for interiors and fine detail, survey drones for roofs and context, survey-grade GNSS for real-world coordinates, and photorealistic reconstruction (Gaussian splatting) for the visual record.',
    link: { label: 'Digital Twins & Survey', path: '/services/digital-twins/#heritage-records' as RoutePath },
  },
  textSections: [
    {
      id: 'public',
      eyebrow: 'Sharing heritage with the world',
      title: 'A record is more valuable when people can see it',
      body: 'We turn heritage records into experiences: 3D tours that open in any browser, guided journeys that tell the story of each shrine and carving, VR for exhibitions, and films for awareness and fundraising campaigns. Students, researchers, visitors and the global diaspora can explore Nepal\'s heritage from wherever they are. [[TBC: "We are exploring subscription access to heritage 3D models so people around the world can experience Nepal\'s cultural sites." — publish only if you want this stated now (Register H04).]]',
      icon: Globe,
      layout: 'feature',
      image: { src: IMG['industry-heritage-culture/a-record-is-more-valuable-when-people-can-see-it'], alt: 'Visitor in a VR headset exploring a 3D heritage courtyard' },
      links: [
        { label: 'Immersive Experiences', path: '/services/immersive-experiences/' },
        { label: 'Visual Storytelling', path: '/services/visual-storytelling/' },
      ],
    },
    {
      id: 'research',
      eyebrow: 'For researchers and students',
      title: 'Support for research, theses and publications',
      body: "Conservation and research have specific needs. We can plan capture around your research question, advise on the accuracy the data can support, and prepare it in the form your analysis, thesis or publication needs. As engineers, we'll tell you honestly what the data can and cannot show.",
      icon: GraduationCap,
      layout: 'card',
      cta: { label: 'Discuss a research project', path: '/contact/?type=research' as RoutePath },
    },
    {
      id: 'respect',
      eyebrow: 'Respect and permission',
      title: 'Working with care on sacred and protected sites',
      body: 'Heritage sites are places of worship, memory and community. We work only with proper permission, follow the rules of each site, and plan our visits with the people and guthis who care for them. Our capture is contactless: we never touch or disturb the structure. [[TBI: approvals typically needed for heritage sites and drone flights, and how you handle them]]',
      icon: Heart,
      layout: 'card',
    },
    {
      id: 'partners',
      eyebrow: 'Working with local bodies',
      title: 'Partnering to document heritage at risk',
      body: 'We want to work with municipalities, heritage bodies, universities and cultural organisations to document sites that are at risk, and to make those records available to the public. We are open to project delivery, research partnerships and joint ventures.',
      icon: Handshake,
      layout: 'card',
      cta: { label: 'Partner with us', path: '/about/#partner' as RoutePath },
    },
  ],
  proof: {
    title: 'In practice',
    cards: [
      {
        name: 'Chilancho Stupa',
        tag: 'Heritage',
        line: 'A cultural monument documented in 3D to preserve its form, proportions and detail.',
        pending: '[[TBI: significance, who commissioned it, results]]',
        path: '/work/chilancho-stupa-digital-heritage/',
        image: IMG['industry-heritage-culture/chilancho-stupa'],
      },
    ],
  },
  faq: {
    title: 'Questions about heritage documentation',
    items: [
      {
        question: 'Why document heritage in 3D?',
        answer:
          'Photos and drawings show a place from fixed viewpoints. A 3D record can be measured, studied from any angle and compared over time. If a structure is damaged or lost, the record can guide its restoration.',
      },
      {
        question: 'Does scanning damage monuments?',
        answer: 'No. Laser scanning and drone capture are completely contactless. We never touch the structure.',
      },
      {
        question: 'Do you work on sacred or protected sites?',
        answer: 'Yes, with respect and with proper permission. We follow the rules of each site and work with the people who care for it.',
      },
      {
        question: 'How accurate is a heritage record?',
        answer:
          '[[TBI: accuracy by method]]. We agree the accuracy your conservation or research work needs at the start and tell you if it is achievable.',
      },
      {
        question: 'Who owns the heritage data?',
        answer: '[[TBI: ownership and access terms, e.g. client, heritage body, public access]]',
      },
      {
        question: 'Can the public see the record?',
        answer:
          "Yes, if the site's custodians agree. We can publish a photorealistic 3D experience separately from the technical data, so access to each can be managed.",
      },
    ],
  },
  cta: {
    title: 'Help a place outlast the changes around it',
    body: "Tell us about the site, why it matters and what the record is for. We'll plan the documentation and send a clear proposal.",
  },
  audienceType: 'Heritage conservators, researchers, museums and cultural organisations',
  serviceIds: [
    'https://rcaas.tech/services/immersive-experiences/#service',
    'https://rcaas.tech/services/visual-storytelling/#service',
    'https://rcaas.tech/services/digital-twins/#service',
  ],
};
