import { FaqEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/faq/');

export default function Page() {
  return <FaqEntry />;
}
