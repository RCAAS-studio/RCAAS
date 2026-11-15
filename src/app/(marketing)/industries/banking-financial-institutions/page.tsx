import { MarketingPage } from '@/features/marketing/routing/MarketingPage';
import { marketingMetadata } from '@/features/marketing/routing/metadata';
export const metadata = marketingMetadata('/industries/banking-financial-institutions/');
export default function Page() { return <MarketingPage />; }
