import { DigitalTwinsEntry } from '@/features/marketing/services/ServiceEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/services/digital-twins/');

export default function Page() {
  return <DigitalTwinsEntry />;
}
