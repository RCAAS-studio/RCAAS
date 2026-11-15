import { LearnIndexEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/learn/');

export default function Page() {
  return <LearnIndexEntry />;
}
