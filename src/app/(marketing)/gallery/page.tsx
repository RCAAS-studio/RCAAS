import { GalleryEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/gallery/');

export default function Page() {
  return <GalleryEntry />;
}
