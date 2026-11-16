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
    draft: true,
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
    // The recovered owner decision (3 November, L02) holds educational guides
    // until genuine project observations and editorial approval are supplied.
    draft: true,
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
    // Brief: draft until pricing basis and timelines are input (S01, S02). It was published early at the owner's
    // request, but 31 unresolved placeholders were visible on it (publication-safety audit, 2026-11-15), so it is
    // draft (noindex, out of the sitemap and /learn) again. Set false once S01/S02 are supplied and the check passes.
    draft: true,
  },
];

export const PUBLISHED_GUIDES = GUIDES.filter((guide) => !guide.draft);

export const isGuidePublished = (path: RoutePath) => PUBLISHED_GUIDES.some((guide) => guide.path === path);

// Reading time at 200 words per minute, rounded up.
export const readingMinutes = (texts: string[]) => {
  const words = texts.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};
