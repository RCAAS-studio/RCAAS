import { CostGuideEntry } from '@/features/marketing/learn/GuideEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/learn/planning-a-3d-experience-cost-and-timeline/');

export default function Page() {
  return <CostGuideEntry />;
}
