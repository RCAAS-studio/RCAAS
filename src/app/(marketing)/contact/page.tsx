import { ContactEntry } from '@/features/marketing/routing/PageEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/contact/');

export default function Page() {
  return <ContactEntry />;
}
