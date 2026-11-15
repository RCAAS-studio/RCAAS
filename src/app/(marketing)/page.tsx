import { HomeRoute } from '@/features/marketing/home/HomeRoute';
import { marketingMetadata } from '@/features/marketing/routing/metadata';
export const metadata = marketingMetadata('/');
export default function Page() { return <HomeRoute />; }
