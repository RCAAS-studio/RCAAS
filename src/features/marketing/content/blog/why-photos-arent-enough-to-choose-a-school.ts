import type { BlogPost } from './types';

// Starter post 3 (Ideas). Outline only: needs client permission and any feedback or engagement
// figures from the Nepathya and Madan Ashrit projects (Register W02, W03, B02).
export const photosArentEnough: BlogPost = {
  slug: 'why-photos-arent-enough-to-choose-a-school',
  title: "Why photos aren't enough to choose a school",
  summary:
    'Families in Nepal often choose a school or college without visiting. What a 3D campus tour changes, drawn from our work with two educational institutions.',
  category: 'ideas',
  author: null,
  published: null,
  heroImage: { src: '/images/blog/placeholder-hero.svg', alt: '[[TBI: 3D still of a campus]]' },
  relatedWork: [
    { label: 'Nepathya School and College', path: '/work/nepathya-school-college-3d-campus-tour/' },
    { label: 'Madan Ashrit Polytechnic Institute', path: '/work/madan-ashrit-polytechnic-3d-campus-tour/' },
  ],
  relatedIndustries: [{ label: 'Education', path: '/industries/education/' }],
  draft: true,
  body: [
    { type: 'h2', text: 'The decision families face' },
    { type: 'p', text: '[[TBC: observations from the Nepathya and Madan Ashrit clients]]' },
    { type: 'h2', text: "What prospectus photos can't show" },
    { type: 'p', text: '[[TBI: in your own words]]' },
    { type: 'h2', text: 'What we built for two institutions' },
    { type: 'p', text: '[[TBI: with client permission, and any feedback or engagement figures]]' },
    { type: 'h2', text: 'How schools can use a tour in admissions season' },
    { type: 'p', text: '[[TBI: practical uses]]' },
  ],
};
