import { AboutEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/about/');

export default function Page() {
  return <AboutEntry />;
}
