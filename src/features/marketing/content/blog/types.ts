import type { RoutePath } from '../../types';

export type BlogCategory = 'behind-the-capture' | 'news' | 'ideas' | 'events';

// Post body. Text may contain [[TBI: …]] / [[TBC: …]] placeholders.
export type BlogBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'splat'; demo: 'chilancho' | 'basera' | 'nepathya' | 'madan'; caption?: string };

export interface BlogLink {
  label: string;
  path: RoutePath;
}

// Mirrors the blog frontmatter in the spec addendum (§9.3).
export interface BlogPost {
  slug: string;
  // H1, ≤ 70 characters.
  title: string;
  // ≤ 60 characters including " | RCAAS Blog"; defaults to the title.
  metaTitle?: string;
  // 140–160 characters; also the meta description.
  summary: string;
  category: BlogCategory;
  // Team member slug (src/content/team); null until chosen.
  author: string | null;
  // ISO date; null until published.
  published: string | null;
  updated?: string;
  heroImage: { src: string; alt: string };
  featured?: boolean;
  relatedWork?: BlogLink[];
  relatedServices?: BlogLink[];
  relatedIndustries?: BlogLink[];
  // Place the post is about, for BlogPosting "about".
  aboutPlace?: string;
  draft: boolean;
  body: BlogBlock[];
}
