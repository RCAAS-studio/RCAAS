import {
  Building2,
  Clapperboard,
  Combine,
  Database,
  FlaskConical,
  Handshake,
  Landmark,
  Layers,
  Map as MapIcon,
  Network,
  PackageCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { IMG } from '../../data/images';
import type { RoutePath } from '../../types';
import type { IndustryContent } from './types';

export const governmentMunicipalities: IndustryContent = {
  slug: 'government-municipalities',
  name: 'Government & Municipalities',
  titleTag: '3D Mapping & Digital Twins for Municipalities | RCAAS',
  metaDescription:
    "Reliable 3D maps, digital twins and heritage records for Nepal's municipalities, plus public experiences that help residents understand plans and projects.",
  h1: 'Plan better and bring citizens along.',
  answer:
    'Good planning needs reliable data, and good projects need public understanding. RCAAS Technology helps municipalities and public bodies in Nepal build accurate 3D maps and digital twins of their built environment and cultural assets, and turns plans and places into experiences residents can see and understand.',
  primaryCta: { label: 'Discuss a municipal project', path: '/contact/?type=government' as RoutePath },
  secondaryCta: { label: 'Ways to work together', anchor: 'work-together' },
  heroQuestions: ['How old is the map we plan from?', 'Do the drawings match what was built?', 'Can residents picture the project?'],
  challenge: {
    title: 'Plans built on old maps. Projects people struggle to picture.',
    body: 'Many towns are growing faster than their maps are updated. Buildings change without drawings, heritage sites are poorly recorded, and planning decisions rely on data that is years old. At the same time, residents are asked to support projects they can only see as technical drawings.',
  },
  experience: {
    eyebrow: 'What we provide',
    title: 'Data for planners. Clarity for citizens.',
    items: [
      {
        what: 'Drone mapping and orthomosaics',
        how: 'Up-to-date, true-scale maps of wards, roads, river corridors and growth areas',
        icon: MapIcon,
      },
      {
        what: '3D city and site models',
        how: 'A measured 3D picture of the built environment for planning and asset records',
        icon: Building2,
      },
      {
        what: 'Heritage inventories',
        how: 'Measured 3D records of temples, squares and historic buildings in your area',
        icon: Landmark,
      },
      { what: 'GIS-ready data', how: 'Layers that fit your existing mapping and smart-city systems', icon: Layers },
      {
        what: 'Public 3D experiences and films',
        how: 'Show residents a heritage site, a public space or a project in a way they understand',
        icon: Clapperboard,
      },
    ],
    links: [
      { label: 'Digital Twins & Survey', path: '/services/digital-twins/' },
      { label: 'Drone mapping', path: '/services/digital-twins/drone-mapping/' },
      { label: 'Visual Storytelling', path: '/services/visual-storytelling/' },
    ],
  },
  spaces: {
    eyebrow: 'Typical uses',
    position: 'beforeLive',
    title: 'Where it helps',
    items: [
      { space: 'Municipal mapping', why: 'Current base maps and terrain for planning and infrastructure', icon: MapIcon },
      { space: 'Smart-city initiatives', why: 'Reliable 3D base data to build services on', icon: Network },
      { space: 'Heritage inventories', why: 'A record of cultural assets before they change or are lost', icon: Landmark },
      { space: 'Asset records', why: 'Measured documentation of public buildings and spaces', icon: Database },
      { space: 'Monitoring change', why: 'Repeat surveys to track growth, construction or erosion over time', icon: TrendingUp },
      { space: 'Public engagement', why: '3D experiences and films for consultations, exhibitions and websites', icon: Users },
    ],
  },
  liveExample: {
    title: 'See what a 3D record looks like',
    // Chilancho Stupa as a heritage-inventory example until a municipal or public-space project exists.
    demo: 'chilancho',
    embedUrl: null,
    pending: '[[TBI: municipal or public-space project; otherwise Chilancho Stupa as a heritage-inventory example]]',
    caption: '[[TBI]]',
  },
  workTogether: {
    id: 'work-together',
    title: 'Flexible ways to work together',
    models: [
      { model: 'Project delivery', description: 'We capture, process and deliver a defined area or set of sites.', icon: PackageCheck },
      { model: 'Pilot projects', description: 'Start with one ward, square or heritage site to test the approach.', icon: FlaskConical },
      { model: 'Partnerships', description: 'Long-term collaboration on mapping, heritage or smart-city programmes.', icon: Handshake },
      { model: 'Joint ventures', description: 'Combine our capability with your institution or partners for larger projects.', icon: Combine },
    ],
    note: '[[TBC: "We can respond to tenders and requests for proposals." — keep only if registered and eligible.]]',
    cta: { label: 'Partner with us', path: '/about/#partner' as RoutePath },
  },
  // Until a public-sector project exists (W05), Chilancho Stupa stands in as a heritage documentation example.
  proof: {
    title: 'In practice',
    cards: [
      {
        name: 'Chilancho Stupa',
        tag: 'Heritage documentation example',
        line: 'A cultural monument documented in 3D to preserve its form, proportions and detail.',
        pending: '[[TBI: municipal or public-sector project]]',
        path: '/work/chilancho-stupa-digital-heritage/',
        image: IMG['industry-government-municipalities/chilancho-stupa'],
      },
    ],
  },
  faq: {
    title: 'Questions from public bodies',
    items: [
      {
        question: 'Can you map a whole municipality?',
        answer:
          '[[TBI: largest areas you take on and how coverage is planned]]. For large areas, we usually start with a pilot ward or priority zone, then scale.',
      },
      {
        question: 'Will the data work with our GIS systems?',
        answer:
          'Yes. We deliver georeferenced data in standard GIS formats [[TBC: e.g. GeoTIFF, SHP, GeoPackage]] so it fits your existing systems.',
      },
      {
        question: 'How do you handle drone permissions?',
        answer: '[[TBI: approval process and typical lead time]]. We build approval time into the project plan.',
      },
      { question: 'Who owns the data?', answer: '[[TBI: ownership terms for public-sector projects]]' },
      {
        question: 'Can residents see the results?',
        answer:
          'Yes. Alongside the technical data, we can create 3D experiences and films for your website, consultations and exhibitions.',
      },
    ],
  },
  cta: {
    title: "Build your municipality's 3D picture",
    body: "Tell us about your area and your priorities. We'll suggest a practical starting point and send a clear proposal.",
  },
  audienceType: 'Municipalities and public bodies',
  serviceIds: ['https://rcaas.tech/services/digital-twins/#service', 'https://rcaas.tech/services/visual-storytelling/#service'],
};
