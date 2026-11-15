import { MarketingPage } from '@/features/marketing/routing/MarketingPage';
import { marketingMetadata } from '@/features/marketing/routing/metadata';
export const metadata = marketingMetadata('/industries/non-life-insurance/');
export default function Page() { return <MarketingPage />; }
