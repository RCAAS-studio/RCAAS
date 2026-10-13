import type { BlogPost } from './types';

// Starter post 2 (Behind the capture). Outline only: needs date, team, methods, time on site,
// 4–6 photos and lessons (Register W01, B02).
export const behindTheCaptureChilancho: BlogPost = {
  slug: 'behind-the-capture-chilancho-stupa',
  title: 'Behind the capture: documenting Chilancho Stupa in 3D',
  metaTitle: 'Behind the capture: Chilancho Stupa',
  summary:
    'A day on site at a heritage monument in Kirtipur: planning, permissions, ground and aerial capture, respect for the site, and what the 3D record makes possible.',
  category: 'behind-the-capture',
  author: null,
  published: null,
  heroImage: { src: '/images/blog/placeholder-hero.svg', alt: '[[TBI: photo from site at Chilancho Stupa]]' },
  relatedWork: [{ label: 'Chilancho Stupa case study', path: '/work/chilancho-stupa-digital-heritage/' }],
  relatedIndustries: [{ label: 'Heritage and culture', path: '/industries/heritage-culture/' }],
  aboutPlace: 'Chilancho Stupa, Kirtipur',
  draft: true,
  body: [
    { type: 'h2', text: 'Why this stupa' },
    { type: 'p', text: '[[TBI: significance of Chilancho Stupa]]' },
    { type: 'h2', text: 'Before we arrived: permissions and planning' },
    { type: 'p', text: '[[TBI: who gave permission, and how the capture was planned]]' },
    { type: 'h2', text: 'On site' },
    { type: 'p', text: '[[TBI: real details — laser scanning, drone flights, timing around visitors, date, team, time on site]]' },
    { type: 'image', src: '/images/blog/placeholder-hero.svg', alt: '[[TBI: photo from site]]', caption: '[[TBI: caption]]' },
    { type: 'h2', text: 'What was hard' },
    { type: 'p', text: '[[TBI: e.g. light, crowds, fine carvings]]' },
    { type: 'h2', text: 'From capture to record' },
    { type: 'p', text: '[[TBI: what conservators and the public get]]' },
    { type: 'splat', demo: 'chilancho', caption: '[[TBI: caption for the 3D embed]]' },
  ],
};
