import { IMG } from '../../data/images';
import type { CaseStudyContent } from './types';

// Register W04.
export const basera: CaseStudyContent = {
  slug: 'basera-boutique-hotel-3d-experience',
  name: 'Basera Boutique Hotel',
  titleTag: 'Basera Boutique Hotel Interactive 3D Experience | RCAAS',
  metaDescription:
    'How RCAAS built a photorealistic 3D experience of Basera Boutique Hotel so guests can explore its spaces and atmosphere before they book.',
  h1: 'Basera Boutique Hotel: arrive before you arrive',
  heroResult: 'Guests can look around the hotel before they book.',
  industryLabel: 'Hospitality & Tourism',
  image: IMG['case-basera-boutique-hotel/basera-boutique-hotel'],
  imageAlt: '3D view of Basera Boutique Hotel',
  placeType: 'Hotel',
  placeName: 'Basera Boutique Hotel',
  snapshot: [
    { label: 'Client', value: 'Basera Boutique Hotel' },
    { label: 'Goal', value: "Let guests feel the hotel's atmosphere before they book" },
    { label: 'Audience', value: 'Prospective guests, travel planners' },
    { label: 'Experience delivered', value: 'Photorealistic, explorable 3D experience on the RCAAS platform' },
    { label: 'Channels', value: '[[TBI: e.g. hotel website, booking enquiries, social media]]' },
    { label: 'Location', value: '[[TBI]]' },
    { label: 'Date', value: '[[TBI]]' },
    { label: 'Methods', value: '[[TBI]]' },
  ],
  embedUrl: null,
  location: null,
  date: null,
  embedDemo: 'basera',
  embedCaption: 'Look around Basera as a guest would.',
  challenge:
    'A boutique hotel sells atmosphere. Photos show only what the photographer chose to show, and guests still wonder what the spaces really feel like.',
  story:
    'We framed the experience as an arrival: entering the hotel and moving through the spaces a guest would discover on their first evening. [[TBC: spaces and order, e.g. lobby, rooms, restaurant]]',
  built:
    "We captured the hotel's spaces and published them as a photorealistic, explorable 3D experience on our platform. [[TBI: spaces covered, time on site]]",
  received: "A shareable 3D experience for the hotel's website and marketing. [[TBI: other deliverables]]",
  resultsPending: '[[TBI: views, time spent, booking enquiries since launch]]',
  clientVoicePending: '[[TBI]]',
  gallery: ['lobby', 'room', 'restaurant', 'capture day'],
  used: [
    { label: '3D virtual tours', path: '/services/immersive-experiences/3d-virtual-tours/' },
    { label: 'Our platform', path: '/platform/' },
  ],
  industry: { label: 'Hospitality & Tourism', path: '/industries/hospitality-tourism/' },
  nextSlug: 'chilancho-stupa-digital-heritage',
};
