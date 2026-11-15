import { SecurityEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/security/');

export default function Page() {
  return <SecurityEntry />;
}
