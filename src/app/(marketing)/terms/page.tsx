import { TermsEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/terms/');

export default function Page() {
  return <TermsEntry />;
}
