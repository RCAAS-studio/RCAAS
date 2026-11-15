import { PrivacyEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/privacy/');

export default function Page() {
  return <PrivacyEntry />;
}
