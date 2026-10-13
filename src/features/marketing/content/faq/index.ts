import { RoutePath } from '../../types';

// General FAQ (spec §6.13). Topic questions live on their own pages and are linked from FAQ_TOPICS.
// Answers may contain [[TBI: …]] / [[TBC: …]] placeholders; any answer still containing one is
// left out of the FAQPage schema.

export interface FaqItem {
  question: string;
  answer: string;
  link?: { label: string; path: RoutePath };
  // Shown in the homepage excerpt (rendered there without FAQPage schema).
  onHome?: boolean;
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

// Visible "Last updated", and dateModified in the schema. Change it whenever the answers change.
export const FAQ_UPDATED = '2026-10-08';

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    items: [
      {
        question: 'What does RCAAS Technology do?',
        answer:
          'We turn real places into immersive experiences and stories. Our engineers and game developers capture buildings, campuses, properties and heritage sites with advanced laser and aerial scanning, then create 3D tours, VR, AR, films, measured digital twins and game-ready worlds and assets from them.',
        onHome: true,
      },
      {
        question: 'Who do you work with?',
        answer:
          'Hotels and tourism organisations, schools and colleges, property developers and architects, factories and industrial sites, heritage specialists and museums, municipalities, non-life insurers, game studios, filmmakers, nonprofit and development organisations, and banks and financial institutions. In short, anyone who needs people to see, understand or measure a real place.',
      },
      {
        question: 'Where do you work?',
        answer:
          'We are based in Kathmandu and work across Nepal. [[TBC: "We also take on projects abroad."]] For remote sites, we plan travel, equipment and timing in advance.',
      },
      {
        question: 'How do I start?',
        answer:
          "Tell us about your place and what you want people to do after seeing it. We'll suggest the right experience, then send a clear proposal with scope, timeline and price.",
        link: { label: 'Plan your experience', path: '/contact/?type=project' as RoutePath },
        onHome: true,
      },
      {
        question: "What's the difference between a 3D tour and a 360° tour?",
        answer:
          'A 360° tour is a set of panoramic photos you jump between. A 3D tour is a full model of the place that people move through freely and see from any angle.',
        link: { label: 'Full comparison', path: '/learn/3d-virtual-tour-vs-360-tour-vs-video/' },
        onHome: true,
      },
    ],
  },
  {
    id: 'cost-and-timeline',
    title: 'Cost and timeline',
    items: [
      {
        question: 'How much does a project cost?',
        answer:
          'It depends on the size of the place, the number of spaces and what you want created. [[TBI: pricing basis and, if published, a starting price]]. We send a clear quotation for every project.',
      },
      {
        question: 'How long does a project take?',
        answer:
          'Capture usually takes a few hours to a day on site. [[TBI: typical time from capture to finished experience]]. We confirm the timeline in your proposal.',
      },
      {
        question: 'Can we start small and add more later?',
        answer:
          '[[TBC: "Yes. Many clients start with their most important spaces, then add more spaces, films or VR later, often from the same capture."]]',
      },
      { question: 'Are there ongoing costs?', answer: '[[TBI: hosting fees, renewal and update costs]]' },
    ],
  },
  {
    id: 'audience',
    title: "Your audience's experience",
    items: [
      {
        question: 'Do people need an app or special software?',
        answer:
          'No. Our 3D experiences open from a link in any modern browser on a phone, tablet or computer. A VR headset is only needed for the VR version.',
        onHome: true,
      },
      {
        question: 'Will it work on mobile data?',
        answer:
          'Yes, though a stronger connection gives a smoother first load. A typical experience is about [[TBI: size]] MB. On websites, we set it to load only when the visitor chooses to open it.',
      },
      {
        question: 'Can people experience it in VR or AR?',
        answer: 'VR: yes, with a headset such as [[TBI: models]]. AR: [[TBC: what you offer, or remove]].',
      },
      {
        question: 'Can the experience go on our own website?',
        answer:
          '[[TBC: "Yes. We provide an embed code, and the same link works in messages, social media and QR codes."]]',
      },
    ],
  },
  {
    id: 'ownership',
    title: 'Ownership, privacy and hosting',
    items: [
      {
        question: 'Who owns the finished experience and data?',
        answer: '[[TBI: e.g. "You own the deliverables you paid for."]]',
      },
      {
        question: 'How long is my experience hosted, and what happens if hosting ends?',
        answer: '[[TBI: hosting period, renewal, and what you keep]]',
      },
      {
        question: 'Will people appear in the experience?',
        answer:
          '[[TBI: people and faces policy, e.g. "We capture when spaces are quiet and remove or blur people before publishing."]]',
      },
      { question: 'Will you show our project in your portfolio?', answer: '[[TBI: e.g. "Only with your permission."]]' },
      {
        question: 'Does capture damage anything?',
        answer: 'No. Laser scanning, photography and drone capture are contactless. We never touch the structure.',
        onHome: true,
      },
    ],
  },
  {
    id: 'working-together',
    title: 'Working together',
    items: [
      {
        question: 'Do you work with municipalities and government bodies?',
        answer:
          'Yes. We support mapping, smart-city data, heritage inventories and public engagement, and we are open to pilots, partnerships and joint ventures.',
        link: { label: 'For municipalities', path: '/industries/government-municipalities/' },
      },
      {
        question: 'Can we partner with you on a project?',
        answer:
          'Yes. We work with design firms, tourism and heritage organisations, universities and technology companies through partnerships, subcontracting and joint ventures. Send us a short description of the project.',
        link: { label: 'Partner with us', path: '/about/#partner' as RoutePath },
      },
      {
        question: 'Can you support academic research or a PhD?',
        answer:
          'Yes. We can plan capture around your research question and prepare data in the form your analysis needs.',
        link: { label: 'Heritage research', path: '/industries/heritage-culture/#research' as RoutePath },
      },
    ],
  },
];

export const FAQ_TOPICS: { topic: string; path: RoutePath }[] = [
  { topic: 'Accuracy, formats and drawings', path: '/services/digital-twins/#faq' as RoutePath },
  { topic: 'Laser scanning', path: '/services/digital-twins/3d-laser-scanning/#faq' as RoutePath },
  { topic: 'Drone flights and permissions', path: '/services/digital-twins/drone-mapping/#faq' as RoutePath },
  { topic: '3D virtual tours', path: '/services/immersive-experiences/3d-virtual-tours/#faq' as RoutePath },
  { topic: 'VR, AR and interactive experiences', path: '/services/immersive-experiences/#faq' as RoutePath },
  { topic: 'Films and storytelling', path: '/services/visual-storytelling/#faq' as RoutePath },
  { topic: 'Heritage and sacred sites', path: '/industries/heritage-culture/#faq' as RoutePath },
  { topic: 'Hotels', path: '/industries/hospitality-tourism/#faq' as RoutePath },
  { topic: 'Schools and colleges', path: '/industries/education/#faq' as RoutePath },
  { topic: 'Factories', path: '/industries/factories/#faq' as RoutePath },
  { topic: 'Game worlds and assets', path: '/services/game-worlds-assets/#faq' as RoutePath },
  { topic: 'Non-life insurance', path: '/industries/non-life-insurance/#faq' as RoutePath },
  { topic: 'Filmmaking and production', path: '/industries/filmmaking/#faq' as RoutePath },
  { topic: 'Nonprofits and development', path: '/industries/nonprofit-international-development/#faq' as RoutePath },
  { topic: 'Banks and lenders', path: '/industries/banking-financial-institutions/#faq' as RoutePath },
  { topic: 'Our 3D platform', path: '/platform/#faq' as RoutePath },
];

export const isResolved = (item: FaqItem) => !item.answer.includes('[[');

export const RESOLVED_FAQS = FAQ_GROUPS.flatMap((group) => group.items).filter(isResolved);

export const HOME_FAQS = FAQ_GROUPS.flatMap((group) => group.items).filter((item) => item.onHome);
