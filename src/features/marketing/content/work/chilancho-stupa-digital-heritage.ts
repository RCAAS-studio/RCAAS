import { IMG } from '../../data/images';
import type { CaseStudyContent } from './types';

// Register W01.
export const chilanchoStupa: CaseStudyContent = {
  slug: 'chilancho-stupa-digital-heritage',
  name: 'Chilancho Stupa',
  titleTag: 'Chilancho Stupa 3D Heritage Documentation | RCAAS',
  metaDescription:
    'How RCAAS documented Chilancho Stupa in 3D to preserve its form, proportions and detail, and created a model anyone can explore.',
  h1: 'Chilancho Stupa: a lasting 3D record of a cultural monument',
  heroResult: 'A historic stupa recorded in measurable 3D, ready to be studied and shared.',
  industryLabel: 'Heritage & Culture',
  image: IMG['case-chilancho-stupa/chilancho-stupa'],
  imageAlt: '3D view of Chilancho Stupa',
  placeType: 'LandmarksOrHistoricalBuildings',
  placeName: 'Chilancho Stupa',
  snapshot: [
    { label: 'Client', value: '[[TBI: who commissioned the work]]' },
    { label: 'Goal', value: "Preserve the stupa's form, proportions and detail in an accurate, lasting record" },
    { label: 'Audience', value: 'Conservators, researchers and the public' },
    { label: 'Experience delivered', value: 'Measured 3D record · photorealistic 3D model [[TBC: interactive viewer]]' },
    { label: 'Location', value: '[[TBI]]' },
    { label: 'Date', value: '[[TBI: month and year]]' },
    { label: 'Methods', value: '[[TBC: handheld laser scanning, drone capture, Gaussian splatting]]' },
  ],
  embedUrl: null,
  location: null,
  date: null,
  embedDemo: 'chilancho',
  embedCaption: 'Explore Chilancho Stupa from every angle.',
  challenge:
    "Chilancho Stupa is a cultural monument that deserves a lasting, accurate record. [[TBI: 1–2 sentences on its significance and why documentation was needed now]] Like many heritage structures in Nepal, it changes with weather, time and seismic risk, and photographs alone can't capture its full form.",
  story:
    'We set out to record the stupa as it stands today, so that it can be measured and studied by conservators, and explored by anyone, long after this moment. [[TBC: any narrative or public-facing element added]]',
  built:
    'We captured the stupa and its surroundings, then processed the data into an accurate 3D record and a photorealistic model. [[TBI: area covered, time on site, number of points or images, accuracy achieved]]',
  received: '[[TBI: deliverables, e.g. point cloud, drawings, 3D model, interactive viewer]]',
  resultsPending: '[[TBI: how the record has been used, e.g. research, conservation planning, public views]]',
  clientVoicePending: '[[TBI: quote + name + role, with written permission]]',
  gallery: ['field capture photo', 'drone view', 'model view', 'detail view'],
  galleryAlt: 'Chilancho Stupa — {view} — 3D documentation by RCAAS Technology',
  used: [{ label: 'Digital Twins & Survey', path: '/services/digital-twins/' }],
  usedPending: '[[TBC: 3D laser scanning, drone mapping]]',
  industry: { label: 'Heritage & Culture', path: '/industries/heritage-culture/' },
  nextSlug: 'nepathya-school-college-3d-campus-tour',
};
