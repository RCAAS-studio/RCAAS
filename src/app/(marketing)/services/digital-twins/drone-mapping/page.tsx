import { DroneMappingEntry } from '@/features/marketing/services/ServiceEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/services/digital-twins/drone-mapping/');

export default function Page() {
  return <DroneMappingEntry />;
}
