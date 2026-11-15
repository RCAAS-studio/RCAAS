import { HowWeWorkEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/how-we-work/');

export default function Page() {
  return <HowWeWorkEntry />;
}
