import {
  Box,
  Drone,
  FileText,
  Glasses,
  Ruler,
  ScanLine,
  ShieldCheck,
  Users,
  Wrench,
  Expand,
  Eye,
} from 'lucide-react';
import type { RoutePath } from '../../types';
import type { IndustryContent } from './types';

// DRAFT copy written from RCAAS's confirmed services (laser scanning, drone mapping, digital twins,
// 3D tours, VR), applied to factories. No approved copy yet: review before publishing (see docs/copy).
export const factories: IndustryContent = {
  slug: 'factories',
  name: 'Factories',
  draft: true,
  titleTag: '3D Scanning & Digital Twins for Factories in Nepal | RCAAS',
  metaDescription:
    'Measured 3D scans and digital twins of factories and industrial sites in Nepal for layout planning, maintenance and safety, plus tours that show your plant.',
  h1: 'Plan, maintain and show your plant from reality.',
  answer:
    'Factories change constantly: new lines, new equipment, new safety layouts. RCAAS Technology captures plants, warehouses and industrial sites across Nepal as measured 3D records for planning and maintenance, and turns them into tours that show your facility to buyers, partners and new staff.',
  primaryCta: { label: 'Plan your project', path: '/contact/?type=factories' as RoutePath },
  secondaryCta: { label: 'See a space in 3D', anchor: 'live-example' },
  heroQuestions: ['Do the drawings match the plant floor?', 'Will the new line fit?', 'How do we show the site to buyers abroad?'],
  challenge: {
    title: 'Your plant has changed since the drawings were made.',
    body: 'Equipment moves, lines are added and services are rerouted, but drawings are rarely updated. Planning a new line or a renovation from out-of-date plans risks clashes and delays, and measuring a busy plant by hand takes time. At the same time, buyers, partners and new staff often cannot visit before they decide.',
  },
  experience: {
    eyebrow: 'What we provide',
    title: 'Accurate data for engineers. A clear view for everyone else.',
    items: [
      {
        what: '3D laser scan of the plant',
        how: 'Machines, walls, racks and service runs captured in one visit. [[TBC: whether capture can run during production]]',
        icon: ScanLine,
      },
      {
        what: 'As-built drawings and CAD-ready files [[TBC: scope, formats]]',
        how: 'Plan layouts and retrofits in your own software from real measurements.',
        icon: FileText,
      },
      { what: 'Drone survey of the site', how: 'Roofs, yards, stockpiles and surroundings for expansions and site planning.', icon: Drone },
      { what: 'Facility 3D tour', how: 'Show your plant to buyers, partners and new staff from a link.', icon: Box },
      {
        what: 'VR induction walkthroughs [[TBC]]',
        how: 'Let new staff learn the layout and safety routes before they step onto the floor.',
        icon: Glasses,
      },
    ],
    links: [
      { label: '3D laser scanning', path: '/services/digital-twins/3d-laser-scanning/' },
      { label: 'Drone mapping', path: '/services/digital-twins/drone-mapping/' },
      { label: 'Digital Twins & Survey', path: '/services/digital-twins/' },
    ],
  },
  spaces: {
    eyebrow: 'Typical uses',
    position: 'beforeLive',
    title: 'Where it helps',
    items: [
      { space: 'Layout planning', why: 'Fit a new line or machine against real measurements', icon: Ruler },
      { space: 'Retrofit and expansion', why: 'Design changes from the plant as it really is', icon: Expand },
      { space: 'Maintenance and asset records', why: 'A measured record of equipment and services', icon: Wrench },
      { space: 'Health and safety planning', why: 'Review routes, access and clearances in 3D', icon: ShieldCheck },
      { space: 'Buyer and partner visits', why: 'Remote walkthroughs for people who cannot travel', icon: Eye },
      { space: 'Recruitment and induction', why: 'Show new staff the site before their first day', icon: Users },
    ],
  },
  liveExample: {
    title: 'See a space in 3D',
    // Best available demo until a factory or industrial project exists.
    demo: 'madan',
    embedUrl: null,
    pending: '[[TBI: factory or industrial project; if none, use the best available demo]]',
    caption: '[[TBI]]',
  },
  // Hidden until a factory or industrial project exists.
  proof: { title: 'In practice', cards: [] },
  faq: {
    title: 'Questions from factory and facility teams',
    items: [
      {
        question: 'Do we need to stop production while you scan?',
        answer: '[[TBC: whether capture can run during operations, and which areas need to pause]]',
      },
      {
        question: 'Can you capture the outside of the site too?',
        answer: 'Yes. We combine ground scanning inside with drone capture of roofs, yards and the surrounding site.',
      },
      {
        question: 'Which files will our engineers receive?',
        answer: '[[TBC: formats, e.g. E57 and LAS point clouds, DWG/DXF drawings]]',
      },
      {
        question: 'How accurate is the scan?',
        answer: '[[TBI: accuracy and conditions]]. We agree the accuracy your project needs at the start.',
      },
      {
        question: 'Is our site data kept confidential?',
        answer: '[[TBI: confidentiality terms, e.g. NDAs and who can access the data]]',
      },
    ],
  },
  cta: {
    title: 'Plan from your plant as it really is',
    body: "Tell us about your site and what you need to plan, maintain or show. We'll recommend the right capture and send a clear proposal.",
  },
  audienceType: 'Factories, manufacturers and industrial site operators',
  serviceIds: ['https://rcaas.tech/services/digital-twins/#service', 'https://rcaas.tech/services/immersive-experiences/#service'],
};

