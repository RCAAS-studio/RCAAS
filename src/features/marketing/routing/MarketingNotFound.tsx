'use client';
import { useRouter } from 'next/navigation';
import { NotFoundPage } from '../pages/NotFoundPage';

/** Error boundaries must render without depending on page-selection context. */
export function MarketingNotFound() {
  const router = useRouter();
  return <NotFoundPage onNavigate={path => router.push(path)} />;
}
