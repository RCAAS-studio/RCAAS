import { IMG } from '../../data/images';
import type { CaseStudyContent } from './types';

// Register W02.
export const nepathya: CaseStudyContent = {
  slug: 'nepathya-school-college-3d-campus-tour',
  name: 'Nepathya School and College',
  titleTag: 'Nepathya School & College 3D Campus Tour | RCAAS',
  metaDescription:
    'An interactive 3D campus tour that lets families explore Nepathya School and College from home before they visit or apply.',
  h1: 'Nepathya School and College: a campus families can explore from home',
  heroResult: 'A campus visit any family can take, from anywhere.',
  industryLabel: 'Education',
  image: IMG['case-nepathya-school-college/nepathya-school-and-college'],
  imageAlt: '3D view of the Nepathya School and College campus',
  placeType: 'EducationalOrganization',
  placeName: 'Nepathya School and College',
  snapshot: [
    { label: 'Client', value: 'Nepathya School and College [[TBC: official name]]' },
    { label: 'Goal', value: 'Let parents and students explore the campus before they visit or apply' },
    { label: 'Audience', value: 'Prospective students and their families' },
    { label: 'Experience delivered', value: 'Interactive photorealistic 3D campus tour' },
    { label: 'Channels', value: '[[TBI: e.g. website, social media, admissions enquiries]]' },
    { label: 'Location', value: '[[TBI]]' },
    { label: 'Date', value: '[[TBI]]' },
    { label: 'Methods', value: '[[TBI]]' },
  ],
  embedUrl: null,
  location: null,
  date: null,
  embedDemo: 'nepathya',
  embedCaption: 'Walk the campus as a visiting family would.',
  challenge:
    'Parents and students choose an institution by how it feels, but not everyone can visit before deciding. Photos in a prospectus look much the same from one school to the next.',
  story:
    "We designed the tour as a family's first visit: arriving at the entrance, then moving through the spaces that matter most when choosing a school. [[TBC: spaces and order, e.g. classrooms, labs, library, grounds]]",
  built:
    'We captured the campus and built a photorealistic 3D tour that visitors walk through in a browser. [[TBI: areas covered, time on site]]',
  received: 'A shareable 3D virtual tour of the campus for admissions and promotion. [[TBI: other deliverables]]',
  resultsPending: '[[TBI: tour views, time spent, enquiries or feedback since launch]]',
  clientVoicePending: '[[TBI]]',
  gallery: ['capture day', 'entrance view', 'classroom', 'lab'],
  used: [{ label: '3D virtual tours', path: '/services/immersive-experiences/3d-virtual-tours/' }],
  industry: { label: 'Education', path: '/industries/education/' },
  nextSlug: 'madan-ashrit-polytechnic-3d-campus-tour',
};
