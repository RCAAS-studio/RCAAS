import type { Metadata } from 'next';
import { MarketingNotFound } from '../../features/marketing/routing/MarketingNotFound';

export const metadata: Metadata = {
  title: { absolute: 'Page Not Found | RCAAS Technology' },
  robots: { index: false, follow: true }
};

/* Next supplies the 404 status; the compatibility adapter renders the
 * existing not-found content inside the persistent marketing shell. */
export default function NotFound() {
  return <MarketingNotFound />;
}
