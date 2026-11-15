import { GaussianGuideEntry } from '@/features/marketing/learn/GuideEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/learn/what-is-gaussian-splatting/');

export default function Page() {
  return <GaussianGuideEntry />;
}
