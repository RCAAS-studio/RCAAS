import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import App from '../../../features/marketing/App';
import { pageMeta, isNotFoundPath } from '../../../features/marketing/meta';

/* Every rcaas.tech page: their App routes by the path itself (and moves
 * between its pages with pushState), so one catch-all serves them all. The
 * studio, tour, /s/, /t/ and /login are their own routes and win over this. */

type Props = { params: Promise<{ slug?: string[] }> };

// The pages they replace, and where their words now live.
const MOVED: Record<string, string> = {
  '/how-it-works': '/how-we-work',
  '/gaussian-splatting': '/learn/what-is-gaussian-splatting'
};

const pathOf = async (params: Props['params']) => `/${((await params).slug ?? []).join('/')}`;
const withSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = await pathOf(params);
  const { title, description, robots } = pageMeta(withSlash(path));
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    twitter: { title, description },
    ...(robots ? { robots } : {})
  };
}

export default async function Page({ params }: Props) {
  const path = await pathOf(params);
  if (MOVED[path]) permanentRedirect(MOVED[path]);
  if (isNotFoundPath(withSlash(path))) notFound();
  return <App />;
}
