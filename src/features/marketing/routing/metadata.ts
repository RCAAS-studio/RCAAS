import type { Metadata } from 'next';
import { pageMeta } from '../meta';
import { OG_IMAGE } from '../../../lib/shareMeta';
export function marketingMetadata(path: string): Metadata {
  const { title, description, robots } = pageMeta(path);
  const canonical = process.env.NEXT_OUTPUT_EXPORT ? path : path.replace(/\/$/, '') || '/';
  return {
    title: { absolute: title }, description,
    alternates: { canonical },
    openGraph: { siteName: 'RCAAS.tech', type: 'website', locale: 'en_US', title, description, url: canonical, images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE.url] },
    ...(robots ? { robots } : {}),
  };
}
