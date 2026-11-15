import { PlatformEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/platform/');

export default function Page() {
  return <PlatformEntry />;
}
