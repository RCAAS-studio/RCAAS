import { VisualStorytellingEntry } from '@/features/marketing/services/ServiceEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/services/visual-storytelling/');

export default function Page() {
  return <VisualStorytellingEntry />;
}
