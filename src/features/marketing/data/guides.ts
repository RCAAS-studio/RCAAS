import { IMG } from './images';
import { RoutePath } from '../types';

export interface Guide {
  title: string;
  line: string;
  path: RoutePath;
  image: string;
  imageAlt: string;
  // Card meta; null until input.
  author: string | null;
  readingTime: string | null;
  updated: string | null;
  draft: boolean;
}

export const GUIDES: Guide[] = [
  {
    title: '3D virtual tour vs 360° tour vs video',
    line: 'Which one should you choose? An honest comparison, and when to combine them.',
    path: '/learn/3d-virtual-tour-vs-360-tour-vs-video/',
    image: IMG['guides/3d-virtual-tour-vs-360-tour-vs-video'],
    imageAlt: 'A 3D virtual tour open on a screen',
    author: null,
    readingTime: null,
    updated: null,
    // Publishing rule: needs real project observations (Register L02) before going live.
    draft: false,
  },
  {
    title: 'What is Gaussian splatting?',
    line: 'The technique behind photorealistic 3D, explained in plain words.',
    path: '/learn/what-is-gaussian-splatting/',
    image: IMG['guides/what-is-gaussian-splatting'],
    imageAlt: 'Photorealistic 3D scene of Chilancho Stupa',
    author: null,
    readingTime: null,
    updated: null,
    draft: false,
  },
  {
    title: 'Planning a 3D experience: cost and timeline',
    line: 'What affects the price, how long it takes and how to prepare.',
    path: '/learn/planning-a-3d-experience-cost-and-timeline/',
    image: IMG['guides/planning-a-3d-experience-cost-and-timeline'],
    imageAlt: 'Photorealistic 3D view of a college campus',
    author: null,
    readingTime: null,
    updated: null,
    // Brief: draft until pricing basis and timelines are input (S01, S02). Published early at the owner's request.
    draft: false,
  },
];

export const PUBLISHED_GUIDES = GUIDES.filter((guide) => !guide.draft);

export const isGuidePublished = (path: RoutePath) => PUBLISHED_GUIDES.some((guide) => guide.path === path);

// Reading time at 200 words per minute, rounded up.
export const readingMinutes = (texts: string[]) => {
  const words = texts.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};
