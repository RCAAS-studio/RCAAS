import { MarketingPage } from '@/features/marketing/routing/MarketingPage';
import { marketingMetadata } from '@/features/marketing/routing/metadata';
export const metadata = marketingMetadata('/industries/hospitality-tourism/');
export default function Page() { return <MarketingPage />; }
