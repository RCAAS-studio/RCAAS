import type { RoutePath } from '../../types';
import type { BlogBlock, BlogCategory, BlogPost } from './types';
import { introducingRcaas } from './introducing-rcaas-technology';
import { behindTheCaptureChilancho } from './behind-the-capture-chilancho-stupa';
import { photosArentEnough } from './why-photos-arent-enough-to-choose-a-school';

export type { BlogBlock, BlogCategory, BlogLink, BlogPost } from './types';

// Add new posts here (one file per post).
const ALL_POSTS: BlogPost[] = [introducingRcaas, behindTheCaptureChilancho, photosArentEnough];

export const BLOG_PAGE_SIZE = 12;

// Launch rule: the blog stays draft (out of navigation, footer, search and RSS) until 3 posts are published.
export const BLOG_LAUNCH_THRESHOLD = 3;

export const CATEGORIES: Record<
  BlogCategory,
  { label: string; description: string; ctaTitle: string; ctaLabel: string; ctaPath: RoutePath }
> = {
  'behind-the-capture': {
    label: 'Behind the capture',
    description: 'Stories from site: how a project was captured, what was hard, what we learned',
    ctaTitle: 'Want your place captured like this?',
    ctaLabel: 'Plan your experience',
    ctaPath: '/contact/?type=project' as RoutePath,
  },
  news: {
    label: 'News',
    description: 'Launches, new projects, platform updates, team news',
    ctaTitle: 'Want to work with us?',
    ctaLabel: 'Get in touch',
    ctaPath: '/contact/?type=project' as RoutePath,
  },
  ideas: {
    label: 'Ideas',
    description: 'Our point of view on immersive experiences, heritage, tourism, education and technology in Nepal',
    ctaTitle: 'Have a place with a story to tell?',
    ctaLabel: 'Plan your experience',
    ctaPath: '/contact/?type=project' as RoutePath,
  },
  events: {
    label: 'Events',
    description: "Fairs, talks, exhibitions and workshops we've taken part in",
    ctaTitle: 'Want us at your event or fair?',
    ctaLabel: 'Talk to us',
    ctaPath: '/contact/?type=partnership' as RoutePath,
  },
};

const isPublished = (post: BlogPost) => !post.draft && Boolean(post.published);

// Newest first; unpublished drafts last.
const byDate = (a: BlogPost, b: BlogPost) => (b.published ?? '').localeCompare(a.published ?? '');

export const PUBLISHED_POSTS = ALL_POSTS.filter(isPublished).sort(byDate);

export const BLOG_LAUNCHED = PUBLISHED_POSTS.length >= BLOG_LAUNCH_THRESHOLD;

// While the blog is in draft, the hub and posts show every post (marked as drafts) so they can be reviewed.
export const VISIBLE_POSTS = BLOG_LAUNCHED ? PUBLISHED_POSTS : [...ALL_POSTS].sort(byDate);

export const findPost = (slug: string) => ALL_POSTS.find((post) => post.slug === slug);

export const postPath = (post: BlogPost) => `/blog/${post.slug}/` as RoutePath;

export const postIsIndexable = (post: BlogPost) => BLOG_LAUNCHED && isPublished(post);

// Featured post: pinned if set, otherwise the newest.
export const featuredPost = (posts: BlogPost[]) => posts.find((post) => post.featured) ?? posts[0];

const blockText = (block: BlogBlock) =>
  block.type === 'list' ? block.items.join(' ') : block.type === 'h2' || block.type === 'p' ? block.text : block.caption ?? '';

// Reading time at 200 words per minute, rounded up; placeholders don't count.
export const readingMinutes = (post: BlogPost) => {
  const text = [post.title, post.summary, ...post.body.map(blockText)].join(' ').replace(/\[\[[\s\S]*?\]\]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

// More from the blog: same category first, then the newest of the rest.
export const relatedPosts = (post: BlogPost, count = 3) => {
  const others = VISIBLE_POSTS.filter((p) => p.slug !== post.slug);
  return [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, count);
};

export const formatPostDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export const metaTitleFor = (post: BlogPost) => `${post.metaTitle ?? post.title} | RCAAS Blog`;
