import { MarketingPage } from '@/features/marketing/routing/MarketingPage';
import { marketingMetadata } from '@/features/marketing/routing/metadata';
export const metadata = marketingMetadata('/services/game-worlds-assets/');
export default function Page() { return <MarketingPage />; }
