import type { BlogPost } from './types';

// Starter post 1 (News). Outline only: needs founding story, founding year, team photo and
// permission to name clients (Register G10, B02).
export const introducingRcaas: BlogPost = {
  slug: 'introducing-rcaas-technology',
  title: "Introducing RCAAS Technology: turning Nepal's places into experiences",
  metaTitle: 'Introducing RCAAS Technology',
  summary:
    'Who we are, why we started and what we create: engineers and game developers turning real places in Nepal into 3D experiences, stories and digital twins.',
  category: 'news',
  author: null,
  published: null,
  heroImage: { src: '/images/blog/placeholder-hero.svg', alt: '[[TBI: team photo on a capture day]]' },
  relatedWork: [
    { label: 'Chilancho Stupa', path: '/work/chilancho-stupa-digital-heritage/' },
    { label: 'Basera Boutique Hotel', path: '/work/basera-boutique-hotel-3d-experience/' },
  ],
  relatedServices: [{ label: 'What we create', path: '/services/' }],
  draft: true,
  body: [
    { type: 'p', text: '[[TBI: founding story — the problem you saw that started RCAAS]]' },
    { type: 'h2', text: 'Two disciplines, one team' },
    { type: 'p', text: '[[TBI: engineers and game developers, in your own words]]' },
    { type: 'h2', text: 'What we create' },
    { type: 'p', text: '[[TBI: immersive experiences, visual storytelling and digital twins, with one real example each]]' },
    { type: 'h2', text: 'Our first projects' },
    {
      type: 'p',
      text: '[[TBI: Chilancho Stupa, two campuses and a boutique hotel — name clients only with their permission, and link each case study]]',
    },
    { type: 'h2', text: "What's next" },
    { type: 'p', text: '[[TBI: platform early access, heritage work and partnerships]]' },
  ],
};
