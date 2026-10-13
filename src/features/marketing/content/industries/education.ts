import {
  BedDouble,
  BookOpen,
  Box,
  Clapperboard,
  DoorOpen,
  FlaskConical,
  Glasses,
  Globe,
  MessageCircle,
  MousePointerClick,
  Plane,
  Presentation,
  QrCode,
  Route,
  School,
  Share2,
  Trophy,
} from 'lucide-react';
import { IMG } from '../../data/images';
import type { RoutePath } from '../../types';
import type { IndustryContent } from './types';

export const education: IndustryContent = {
  slug: 'education',
  name: 'Education',
  titleTag: 'Virtual Campus Tours for Schools & Colleges | RCAAS',
  metaDescription:
    'Photorealistic 3D campus tours that let students and parents explore classrooms, labs and grounds from anywhere. For schools and colleges across Nepal.',
  h1: 'Let students walk your campus before they apply.',
  answer:
    "Students and parents choose a school or college by how it feels, but many can't visit before they decide. RCAAS Technology creates photorealistic 3D campus tours of schools, colleges and technical institutes across Nepal, so families can explore classrooms, labs, workshops and grounds from anywhere.",
  primaryCta: { label: 'Plan your campus tour', path: '/contact/?type=education' as RoutePath },
  secondaryCta: { label: 'Explore a campus in 3D', anchor: 'live-example' },
  heroQuestions: ["What's the campus really like?", 'What do the labs and workshops look like?', 'Where will students live and eat?'],
  challenge: {
    title: 'Not every family can visit. Every family wants to see.',
    body: 'Parents in another district, students applying from abroad, families comparing several institutions: they all want to know what the campus is really like. Prospectus photos look the same everywhere, and labs and workshops are especially hard to show in a picture. The institution that lets people look around wins their attention first.',
  },
  experience: {
    title: 'Open your campus to every applicant',
    items: [
      { what: '3D campus tour', how: 'Families walk classrooms, labs, libraries, hostels and grounds from a link.', icon: Box },
      {
        what: 'Guided tour with highlights [[TBC]]',
        how: 'A set path with notes at each stop: the new lab, the library, the sports ground.',
        icon: Route,
      },
      {
        what: 'Hotspots and "Apply" buttons [[TBC]]',
        how: 'Tap a lab to see the course, then go straight to admissions.',
        icon: MousePointerClick,
      },
      { what: 'Campus film', how: 'A short fly-through for your website, social media and admissions campaigns.', icon: Clapperboard },
      { what: 'VR at open days and education fairs', how: 'Let visitors stand inside your campus from your stall.', icon: Glasses },
    ],
    links: [
      { label: '3D virtual tours', path: '/services/immersive-experiences/3d-virtual-tours/' },
      { label: 'Visual Storytelling', path: '/services/visual-storytelling/' },
    ],
  },
  liveExample: {
    title: 'Explore a campus in 3D',
    demo: 'nepathya',
    embedUrl: null,
    pending: '[[TBI: embed URL, full-screen URL, poster, file size]]',
    caption: 'Nepathya School and College · a campus tour families can take from home.',
  },
  spaces: {
    title: 'What families want to see',
    items: [
      { space: 'Classrooms', why: 'Size, light and learning environment', icon: School },
      {
        space: 'Labs and workshops',
        why: 'Proof of practical facilities, especially for technical and science programmes',
        icon: FlaskConical,
      },
      { space: 'Library and study spaces', why: 'Where students will spend their time', icon: BookOpen },
      { space: 'Hostels and canteen', why: "Parents' first questions for students living away from home", icon: BedDouble },
      { space: 'Sports grounds and halls', why: 'Life beyond the classroom', icon: Trophy },
      { space: 'Entrance and campus grounds', why: 'The first impression', icon: DoorOpen },
    ],
  },
  channels: {
    title: 'Put it where applicants are deciding',
    items: [
      { channel: 'Admissions page', how: 'Embed the tour beside your courses and application form.', icon: Globe },
      { channel: 'Enquiry replies', how: 'Send the link on WhatsApp or email to every enquiring family.', icon: MessageCircle },
      { channel: 'Social media', how: 'Share campus clips during admissions season.', icon: Share2 },
      { channel: 'Prospectus and posters', how: 'Add a QR code that opens the tour.', icon: QrCode },
      { channel: 'Open days and education fairs', how: 'Show the tour on screen or in VR.', icon: Presentation },
      { channel: 'Overseas and out-of-district applicants', how: "Give them a visit they can't otherwise make.", icon: Plane },
    ],
  },
  proof: {
    title: "Campuses we've opened up",
    cards: [
      {
        name: 'Nepathya School and College',
        tag: 'Education',
        line: 'A campus tour families can take from home.',
        pending: '[[TBI: result once data exists]]',
        path: '/work/nepathya-school-college-3d-campus-tour/',
        image: IMG['industry-education/nepathya-school-and-college'],
      },
      {
        name: 'Madan Ashrit Polytechnic Institute [[TBC: official name]]',
        tag: 'Education',
        line: 'Workshops and labs prospective students can explore for themselves.',
        pending: '[[TBI: result]]',
        path: '/work/madan-ashrit-polytechnic-3d-campus-tour/',
        image: IMG['industry-education/madan-ashrit-polytechnic-institute-tbc-official'],
      },
    ],
  },
  faq: {
    title: 'Questions from schools and colleges',
    items: [
      {
        question: 'When do you capture: during term or holidays?',
        answer:
          'Whichever suits you. Holidays and weekends give the quietest spaces, but we can also work around your timetable, one area at a time.',
      },
      {
        question: 'Will students appear in the tour?',
        answer: '[[TBI: people and faces policy; note that extra care applies to children]]',
      },
      {
        question: 'Can we add "Apply now" or course information inside the tour?',
        answer: '[[TBC: "Yes. We can add information points and buttons that link to your courses and admissions page."]]',
      },
      { question: 'Can the tour include narration in Nepali and English?', answer: '[[TBC: languages offered]]' },
      {
        question: 'Can we update the tour when we open a new building or lab?',
        answer: '[[TBC: "Yes. We capture the new space and add it to your existing tour."]]',
      },
    ],
  },
  cta: {
    title: 'Let every applicant walk your campus',
    body: "Tell us about your institution and the spaces you want to show. We'll plan the tour and send a clear proposal.",
  },
  audienceType: 'Schools, colleges and universities',
  audienceSchemaType: 'EducationalAudience',
  serviceIds: ['https://rcaas.tech/services/immersive-experiences/#service'],
};
