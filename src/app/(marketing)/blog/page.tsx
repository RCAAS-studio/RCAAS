import { BlogIndexEntry } from '@/features/marketing/blog/BlogEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';
export const metadata = marketingMetadata('/blog/');
export default function Page() { return <BlogIndexEntry />; }
