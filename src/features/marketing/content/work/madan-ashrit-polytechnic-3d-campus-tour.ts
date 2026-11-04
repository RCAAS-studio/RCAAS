import { IMG } from '../../data/images';
import type { CaseStudyContent } from './types';

// Register W03. Official name and spelling still [[TBC]].
export const madanAshrit: CaseStudyContent = {
  slug: 'madan-ashrit-polytechnic-3d-campus-tour',
  status: 'completed',
  name: 'Madan Ashrit Memorial Polytechnic Institute',
  titleTag: 'Madan Ashrit Memorial Polytechnic 3D Campus Tour | RCAAS',
  metaDescription:
    'An interactive 3D tour that lets prospective students explore the workshops and labs of Madan Ashrit Memorial Polytechnic Institute before they enrol.',
  h1: 'Madan Ashrit Memorial Polytechnic Institute: hands-on learning, made visible',
  heroResult: 'Workshops and labs prospective students can explore for themselves.',
  industryLabel: 'Education',
  image: IMG['case-madan-ashrit-polytechnic/madan-ashrit-polytechnic-institute'],
  imageAlt: '3D view of Madan Ashrit Memorial Polytechnic Institute',
  placeType: 'CollegeOrUniversity',
  placeName: 'Madan Ashrit Memorial Polytechnic Institute',
  snapshot: [
    { label: 'Client', value: 'Madan Ashrit Memorial Polytechnic Institute' },
    { label: 'Goal', value: 'Show the practical facilities that set technical education apart' },
    { label: 'Audience', value: 'Prospective technical students and their families' },
    { label: 'Experience delivered', value: 'Gamified, interactive 3D virtual tour of the institute' },
    { label: 'Channels', value: 'Web link' },
    { label: 'Location', value: 'Kadaghari, Kathmandu' },
    { label: 'Date', value: 'June 2026' },
    { label: 'Methods', value: '[[TBI]]' },
  ],
  embedUrl: null,
  location: 'Kadaghari, Kathmandu',
  date: '2026-06',
  embedDemo: 'madan',
  embedCaption: 'Step into the workshops and labs.',
  challenge:
    "Technical institutes need to show facilities such as workshops and labs, and photos don't convey their scale, equipment or atmosphere well. For students choosing a practical career, those spaces are the deciding factor.",
  story:
    'We built the tour around hands-on learning: leading visitors from the entrance into the workshops and labs where students will actually train. [[TBC: spaces and order]]',
  built: 'We captured the institute and produced an interactive 3D tour of its spaces. [[TBI: areas covered, time on site]]',
  received: 'A shareable interactive 3D tour of the institute. [[TBI: other deliverables]]',
  resultsPending: '[[TBI]]',
  clientVoicePending: '[[TBI]]',
  gallery: ['workshop', 'lab', 'campus exterior', 'capture day'],
  used: [{ label: '3D virtual tours', path: '/services/immersive-experiences/3d-virtual-tours/' }],
  industry: { label: 'Education', path: '/industries/education/' },
  nextSlug: 'basera-boutique-hotel-3d-experience',
};
