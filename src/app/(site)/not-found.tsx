import type { Metadata } from 'next';
import App from '../../features/marketing/App';

export const metadata: Metadata = {
  title: { absolute: 'Page Not Found | RCAAS Technology' },
  robots: { index: false, follow: true }
};

/* An unknown path: their App draws its own 404 page (NotFoundPage) inside
 * the header and footer; Next sends the 404 status. */
export default function NotFound() {
  return <App />;
}
