import { ImmersiveExperiencesEntry } from '@/features/marketing/services/ServiceEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/services/immersive-experiences/');

export default function Page() {
  return <ImmersiveExperiencesEntry />;
}
