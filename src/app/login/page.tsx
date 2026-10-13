import type { Metadata } from 'next';
import { LoginScreen } from '../../features/marketing/components/LoginScreen';
import '../../features/marketing/rcaas.out.css';
import { NOINDEX } from '../../lib/shareMeta';

export const metadata: Metadata = {
  title: { absolute: 'Sign in | RCAAS Studio' },
  robots: NOINDEX,
  icons: { icon: '/favicon.png', apple: '/apple-touch-icon.png' }
};

/** Sign in, create an account or reset a password (AuthPanel, unchanged), in
 *  the rcaas.tech look (LoginScreen). Static: AuthPanel reads ?mode=/?next=
 *  itself via useSearchParams() inside LoginScreen's Suspense. */
export default function LoginPage() {
  return <LoginScreen />;
}
