import { VirtualToursEntry } from '@/features/marketing/services/ServiceEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/services/immersive-experiences/3d-virtual-tours/');

export default function Page() {
  return <VirtualToursEntry />;
}
