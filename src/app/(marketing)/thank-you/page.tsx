import { ThankYouEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/thank-you/');

export default function Page() {
  return <ThankYouEntry />;
}
