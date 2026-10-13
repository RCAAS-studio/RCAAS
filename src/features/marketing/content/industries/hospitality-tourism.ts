import {
  BedDouble,
  Box,
  Clapperboard,
  Glasses,
  Globe,
  Landmark,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Presentation,
  QrCode,
  Share2,
} from 'lucide-react';
import { IMG } from '../../data/images';
import type { RoutePath } from '../../types';
import type { IndustryContent } from './types';

export const hospitalityTourism: IndustryContent = {
  slug: 'hospitality-tourism',
  name: 'Hospitality & Tourism',
  titleTag: '3D Tours & VR for Hotels and Tourism in Nepal | RCAAS',
  metaDescription:
    'Photorealistic 3D tours, VR and films that let guests explore your hotel or destination before they book or travel. For hotels, resorts and tourism in Nepal.',
  h1: 'Fill rooms and inspire visits.',
  answer:
    'Guests choose a hotel, and travellers choose a destination, when they can picture themselves there. RCAAS Technology creates photorealistic 3D tours, VR experiences and fly-through films of hotels, resorts and destinations across Nepal, so people can explore before they book or travel.',
  primaryCta: { label: 'Plan your hotel tour', path: '/contact/?type=hospitality' as RoutePath },
  secondaryCta: { label: 'Explore a hotel in 3D', anchor: 'live-example' },
  heroQuestions: ['How big is the room?', "What's the view from the window?", 'How far is the restaurant from reception?'],
  challenge: {
    title: "Photos show what you chose. Guests want to know what it's really like.",
    body: 'A boutique hotel sells atmosphere. A destination sells a feeling. Photos and listings only show a few chosen angles, and guests still wonder about the size of the room, the view from the window or the walk from reception to the restaurant. Every unanswered question is a reason to keep scrolling.',
  },
  experience: {
    title: 'Let guests step inside before they arrive',
    items: [
      {
        what: '3D virtual tour',
        how: 'Guests walk your rooms, lobby, restaurant and grounds at their own pace, from a link.',
        icon: Box,
      },
      {
        what: 'Hotspots and booking buttons [[TBC]]',
        how: 'Tap a room to see details, then go straight to your booking page or WhatsApp.',
        icon: MousePointerClick,
      },
      {
        what: 'Fly-through film',
        how: 'A one-minute journey through your property for your website, ads and social media.',
        icon: Clapperboard,
      },
      { what: 'VR experience', how: 'Bring your hotel or destination to travel fairs and tourism offices.', icon: Glasses },
    ],
    links: [
      { label: '3D virtual tours', path: '/services/immersive-experiences/3d-virtual-tours/' },
      { label: 'Visual Storytelling', path: '/services/visual-storytelling/' },
      { label: 'VR', path: '/services/immersive-experiences/#vr' as RoutePath },
    ],
  },
  liveExample: {
    title: 'Explore a hotel in 3D',
    demo: 'basera',
    embedUrl: null,
    pending: '[[TBI: embed URL, full-screen URL, poster, file size]]',
    caption: 'Basera Boutique Hotel · built so guests can look around before they book.',
  },
  audiences: [
    {
      title: 'For hotels and resorts',
      body: 'Show every room type, the view, the restaurant, the spa and your event spaces as they really are. Use one tour on your website, booking pages, social media and in replies to enquiries.',
      capture: ['rooms and suites', 'lobby and lounges', 'restaurant and bar', 'pool, spa and gardens', 'event and conference spaces', 'rooftop and views'],
      image: IMG['industry-hospitality-tourism/for-hotels-and-resorts'],
      imageAlt: '3D view of a boutique hotel',
      icon: BedDouble,
    },
    {
      title: 'For destinations and tourism boards',
      body: 'Let international travellers stand inside a temple courtyard, walk a heritage town or see a viewpoint before they plan their trip. Use VR at fairs and visitor centres, and 3D tours in destination campaigns online.',
      capture: ['heritage squares and monuments', 'museums and cultural sites', 'trails and viewpoints [[TBC]]', 'visitor centres'],
      image: IMG['industry-hospitality-tourism/for-destinations-and-tourism-boards'],
      imageAlt: '3D view of a heritage monument',
      icon: Landmark,
    },
  ],
  channels: {
    title: 'Put it where guests are deciding',
    items: [
      { channel: 'Your website', how: 'Embed the tour on your home and room pages.', icon: Globe },
      { channel: 'Booking and enquiry replies', how: 'Send the link on WhatsApp or email instead of a set of photos.', icon: MessageCircle },
      { channel: 'Social media', how: 'Share fly-through clips and the tour link in posts.', icon: Share2 },
      { channel: 'Google Business Profile', how: 'Link the tour in your updates so searchers can step inside.', icon: MapPin },
      { channel: 'Travel fairs and offices', how: 'Show the experience in VR or on a big screen.', icon: Presentation },
      { channel: 'Print and signage', how: 'Add a QR code to brochures and in-room materials.', icon: QrCode },
    ],
  },
  proof: {
    title: 'In practice',
    cards: [
      {
        name: 'Basera Boutique Hotel',
        tag: 'Hospitality',
        line: 'A hotel sells atmosphere. We built an explorable 3D experience so guests can look around before they book.',
        pending: '[[TBI: result once data exists]]',
        path: '/work/basera-boutique-hotel-3d-experience/',
        image: IMG['industry-hospitality-tourism/basera-boutique-hotel'],
      },
    ],
  },
  faq: {
    title: 'Questions from hotels and tourism teams',
    items: [
      {
        question: 'Do we need to close rooms while you capture?',
        answer: 'No. We schedule capture around your occupancy and work room by room. Someone to open doors is all we need.',
      },
      { question: 'Will guests appear in the tour?', answer: '[[TBI: people and faces policy]]' },
      {
        question: 'Can guests book from inside the tour?',
        answer: '[[TBC: "Yes. We can add buttons that link to your booking page, WhatsApp or enquiry form."]]',
      },
      {
        question: 'Can we update the tour after a renovation or a new season?',
        answer: '[[TBC: "Yes. We rescan changed areas and update your tour."]]',
      },
      {
        question: 'Can you create an experience for a whole destination?',
        answer:
          'Yes. We can capture heritage sites, squares and visitor attractions and present them as 3D tours, VR experiences and films for tourism campaigns. Tell us the places and the audience.',
      },
    ],
  },
  cta: {
    title: 'Let guests see your place before they book',
    body: "Tell us about your hotel or destination and who you want to attract. We'll suggest the right experience and send a clear proposal.",
  },
  audienceType: 'Hotels, resorts and tourism organisations',
  serviceIds: ['https://rcaas.tech/services/immersive-experiences/#service', 'https://rcaas.tech/services/visual-storytelling/#service'],
};
