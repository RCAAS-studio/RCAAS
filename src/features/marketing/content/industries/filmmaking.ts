import { Camera, Clapperboard, Film, Landmark, MapPin, Share2, Sparkles, Video } from 'lucide-react';
import type { RoutePath } from '../../types';
import type { IndustryContent } from './types';

// Approved. No approved source copy exists for this industry. It is built only from RCAAS's confirmed
// Visual Storytelling work (guided tours, cinematic fly-through films, social content, exhibition content)
// and Game Worlds & Assets (real places as real-time scenes). Everything else is [[TBC]]/[[TBI]].
// See docs/copy/industries-filmmaking.md.
export const filmmaking: IndustryContent = {
  slug: 'filmmaking',
  name: 'Filmmaking',
  titleTag: 'Real Locations for Film & Content Production | RCAAS',
  metaDescription:
    'Real locations captured in 3D and turned into cinematic fly-through films, guided tours and real-time scenes for filmmakers and content producers.',
  h1: 'Take your camera anywhere in a real place.',
  answer:
    'Filmmakers and content teams use RCAAS Technology to capture real locations in 3D, then create cinematic fly-through films, guided tours and social content from that capture, or scout and plan a shoot before anyone travels.',
  primaryCta: { label: 'Discuss a film project', path: '/contact/?type=filmmaking' as RoutePath },
  secondaryCta: { label: 'See a real place in 3D', anchor: 'live-example' },
  heroQuestions: ['Can we scout a location before travelling?', 'Can we film a camera move through a real place?', 'Can the same capture serve other formats?'],
  challenge: {
    title: 'Start from the real location, not a guess.',
    body: 'Locations are hard to revisit, hard to access and hard to re-shoot. Capturing a place once in 3D gives your team a faithful record to plan from and to create from, long after the visit.',
  },
  experience: {
    eyebrow: 'What we provide',
    title: 'From real capture to finished film.',
    items: [
      {
        what: 'Cinematic fly-through films',
        how: 'Smooth camera moves through a captured place, shaped around what you want your audience to feel.',
        icon: Film,
      },
      {
        what: 'Guided and narrated tours',
        how: 'Tours that lead viewers through a location with a story, made from your 3D capture.',
        icon: Video,
      },
      {
        what: 'Social and exhibition content',
        how: 'Short cuts and visuals for campaigns, screens and events, made from the same capture. [[TBC: formats and lengths]]',
        icon: Share2,
      },
      {
        what: 'Location scouting and planning',
        how: 'Explore a captured location from a link before the shoot. [[TBC: confirm as a delivered service]]',
        icon: MapPin,
      },
    ],
    links: [
      { label: 'Visual Storytelling', path: '/services/visual-storytelling/' },
      { label: 'Game Worlds & Assets', path: '/services/game-worlds-assets/' as RoutePath },
      { label: 'Immersive Experiences', path: '/services/immersive-experiences/' },
    ],
  },
  spaces: {
    eyebrow: 'Typical uses',
    position: 'beforeLive',
    title: 'Where it helps',
    items: [
      { space: 'Feature and short films', why: 'Real locations to plan and create from [[TBC]]', icon: Clapperboard },
      { space: 'Documentaries', why: 'Places explored and explained on screen', icon: Camera },
      { space: 'Heritage films', why: 'Sites shown in detail without disturbing them', icon: Landmark },
      { space: 'Promotional films', why: 'Cinematic views of hotels, campuses and destinations', icon: Film },
      { space: 'Virtual production', why: 'Real locations as real-time backdrops [[TBC]]', icon: Sparkles },
      { space: 'Social content', why: 'Short visuals made from one capture', icon: Share2 },
    ],
  },
  liveExample: {
    title: 'See a real place captured in 3D',
    // Best available demo until a film project exists.
    demo: 'chilancho',
    embedUrl: null,
    pending: '[[TBI: a fly-through film or production example; if none, use the best available demo]]',
    caption: '[[TBI]]',
  },
  // Hidden until a film project exists.
  proof: { title: 'In practice', cards: [] },
  faq: {
    title: 'Questions from filmmakers and content teams',
    items: [
      {
        question: 'Can you capture a location we want to film in?',
        answer:
          "Yes, with permission from the people who care for or own the place. We follow each site's rules and capture without touching or disturbing it.",
      },
      { question: 'Do you shoot live-action footage?', answer: '[[TBC: whether RCAAS films live action or works only from 3D capture]]' },
      { question: 'What do we receive?', answer: '[[TBC: films, renders, 3D files and formats]]' },
      { question: 'Who owns the footage and the capture?', answer: '[[TBI: ownership and licensing terms]]' },
      { question: 'How long does a film take?', answer: '[[TBI: typical time by scope]]' },
    ],
  },
  cta: {
    title: 'Bring your location to the screen',
    body: "Tell us about your film or content project and the place you want to capture. We'll suggest the right approach and send a clear proposal.",
  },
  audienceType: 'Filmmakers, production companies and content creators',
  serviceIds: [
    'https://rcaas.tech/services/visual-storytelling/#service',
    'https://rcaas.tech/services/immersive-experiences/#service',
  ],
};
