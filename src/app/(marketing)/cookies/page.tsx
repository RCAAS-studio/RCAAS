import { CookiesEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/cookies/');

export default function Page() {
  return <CookiesEntry />;
}
