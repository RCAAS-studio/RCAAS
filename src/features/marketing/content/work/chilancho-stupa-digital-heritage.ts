import { IMG } from '../../data/images';
import type { CaseStudyContent } from './types';

// Register W01.
export const chilanchoStupa: CaseStudyContent = {
  slug: 'chilancho-stupa-digital-heritage',
  status: 'completed',
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
    { label: 'Client', value: 'In-house research by RCAAS Technology' },
    { label: 'Goal', value: "Preserve the stupa's form, proportions and detail in an accurate, lasting record" },
    { label: 'Audience', value: 'The public' },
    { label: 'Experience delivered', value: 'Web-based 3D visualisation and VR development' },
    { label: 'Channels', value: 'Website' },
    { label: 'Location', value: 'Kirtipur, Kathmandu Valley' },
    { label: 'Date', value: 'October 2025' },
    { label: 'Methods', value: '[[TBC: handheld laser scanning, drone capture, Gaussian splatting]]' },
  ],
  // the existing XGRIDS viewer (owner-confirmed demo, 2026-11-03); never labelled as hosted on RCAAS Studio
  embedUrl: 'https://lcc-viewer.xgrids.com/pub/dbdxnc-chalincho_hd',
  location: 'Kirtipur, Kathmandu Valley',
  date: '2025-10',
  embedDemo: 'chilancho',
  embedCaption: 'Explore Chilancho Stupa from every angle.',
  challenge:
    "Chilancho Stupa is a historic Buddhist chaitya complex in Kirtipur, known for its group of stupas and traditional brick-and-stone architecture, and it deserves a lasting, accurate record. We documented it as an in-house research project. Like many heritage structures in Nepal, it changes with weather, time and seismic risk, and photographs alone can't capture its full form.",
  story:
    'We set out to record the stupa as it stands today, so that it can be measured and studied by conservators, and explored by anyone, long after this moment. The record became a 3D experience anyone can explore in a web browser, and the starting point for our VR development.',
  built:
    'We captured the stupa and its surroundings, then processed the data into an accurate 3D record and a photorealistic model. [[TBI: area covered, time on site, number of points or images, accuracy achieved]]',
  received: 'An in-house project, so there was no client handover: the result is a web-based 3D experience of the stupa, shown on our website.',
  resultsPending: '[[TBI: how the record has been used, e.g. research, conservation planning, public views]]',
  clientVoicePending: '[[TBI: quote + name + role, with written permission]]',
  gallery: ['field capture photo', 'drone view', 'model view', 'detail view'],
  galleryAlt: 'Chilancho Stupa — {view} — 3D documentation by RCAAS Technology',
  used: [{ label: 'Digital Twins & Survey', path: '/services/digital-twins/' }],
  usedPending: '[[TBC: 3D laser scanning, drone mapping]]',
  industry: { label: 'Heritage & Culture', path: '/industries/heritage-culture/' },
  nextSlug: 'nepathya-school-college-3d-campus-tour',
};
