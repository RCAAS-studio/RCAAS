'use client';
import { findPost } from '../content/blog';
import { BlogHubPage } from '../pages/BlogHubPage';
import { BlogPostPage } from '../pages/BlogPostPage';
import { useMarketingActions } from '../routing/MarketingActions';
import { MarketingNotFound } from '../routing/MarketingNotFound';

export function BlogIndexEntry({ page = 1 }: { page?: number }) {
  const { navigateTo } = useMarketingActions();
  return <BlogHubPage key={page} page={page} onNavigate={navigateTo} />;
}

export function BlogPostEntry({ slug }: { slug: string }) {
  const { navigateTo } = useMarketingActions();
  const post = findPost(slug);
  return post ? <BlogPostPage key={slug} post={post} onNavigate={navigateTo} /> : <MarketingNotFound />;
}
