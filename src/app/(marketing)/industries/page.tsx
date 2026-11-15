import { IndustriesIndexEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/industries/');

export default function Page() {
  return <IndustriesIndexEntry />;
}
