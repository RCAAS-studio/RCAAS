import { ServicesEntry } from '@/features/marketing/services/ServiceEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/services/');

export default function Page() {
  return <ServicesEntry />;
}
