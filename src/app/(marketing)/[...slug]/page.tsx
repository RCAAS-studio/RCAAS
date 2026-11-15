import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import App from '../../../features/marketing/App';
import { isNotFoundPath, blogPageCount } from '../../../features/marketing/meta';
import { ROUTES } from '../../../features/marketing/types';
import { VISIBLE_POSTS, postPath } from '../../../features/marketing/content/blog';
import { marketingMetadata } from '../../../features/marketing/routing/metadata';

/* Compatibility owner for moved URLs, dynamic blog pages and unknown paths.
 * Ordinary marketing URLs have native route entries; the layout owns chrome. */

type Props = { params: Promise<{ slug?: string[] }> };

// The pages they replace, and where their words now live.
const MOVED: Record<string, string> = {
  '/how-it-works': '/how-we-work',
  '/gaussian-splatting': '/learn/what-is-gaussian-splatting'
};

// Only fallback-owned URLs are generated here. Native entries own ROUTES.
export function generateStaticParams() {
  const pages = Array.from({ length: blogPageCount() - 1 }, (_, i) => `/blog/page/${i + 2}/`);
  return [...ROUTES, ...VISIBLE_POSTS.map(postPath), ...pages, ...Object.keys(MOVED)]
    .filter(path => !ROUTES.includes(path as (typeof ROUTES)[number]))
    .map((path) => ({ slug: path.split('/').filter(Boolean) }));
}

const pathOf = async (params: Props['params']) => `/${((await params).slug ?? []).join('/')}`;
const withSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = await pathOf(params);
  return marketingMetadata(withSlash(path));
}

export default async function Page({ params }: Props) {
  const path = await pathOf(params);
  if (MOVED[path]) permanentRedirect(MOVED[path]);
  if (isNotFoundPath(withSlash(path))) notFound();
  return <App />;
}
