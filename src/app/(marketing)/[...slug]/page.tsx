import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { marketingMetadata } from '../../../features/marketing/routing/metadata';

/* Only legacy redirects and unknown URLs belong here. Content has native routes. */

type Props = { params: Promise<{ slug?: string[] }> };

// The pages they replace, and where their words now live.
const MOVED: Record<string, string> = {
  '/how-it-works': '/how-we-work',
  '/gaussian-splatting': '/learn/what-is-gaussian-splatting'
};

// Keeping the two existing aliases also keeps a company-styled 404 boundary.
export function generateStaticParams() {
  return Object.keys(MOVED).map(path => ({ slug: path.split('/').filter(Boolean) }));
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
  notFound();
}
