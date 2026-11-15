import { notFound } from 'next/navigation';
import { VISIBLE_POSTS } from '@/features/marketing/content/blog';
import { blogPageCount, resolveBlogRoute } from '@/features/marketing/meta';
import { BlogIndexEntry, BlogPostEntry } from '@/features/marketing/blog/BlogEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

type Props = { params: Promise<{ slug: string[] }> };
export function generateStaticParams() {
  return [
    ...VISIBLE_POSTS.map(post => ({ slug: [post.slug] })),
    ...Array.from({ length: blogPageCount() - 1 }, (_, index) => ({ slug: ['page', String(index + 2)] })),
  ];
}
async function blogFor(params: Props['params']) {
  const { slug } = await params;
  const path = `/blog/${slug.join('/')}/`;
  const blog = resolveBlogRoute(path);
  if (!blog || blog.kind === 'missing') notFound();
  return { path, blog };
}
export async function generateMetadata({ params }: Props) {
  return marketingMetadata((await blogFor(params)).path);
}
export default async function Page({ params }: Props) {
  const { blog } = await blogFor(params);
  return blog.kind === 'post' ? <BlogPostEntry slug={blog.post.slug} /> : <BlogIndexEntry page={blog.page} />;
}
