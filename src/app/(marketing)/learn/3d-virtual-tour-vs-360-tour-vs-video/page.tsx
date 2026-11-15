import { ComparisonGuideEntry } from '@/features/marketing/learn/GuideEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/learn/3d-virtual-tour-vs-360-tour-vs-video/');

export default function Page() {
  return <ComparisonGuideEntry />;
}
