import { WorkIndexEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/work/');

export default function Page() {
  return <WorkIndexEntry />;
}
