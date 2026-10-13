import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Rss, Share2 } from 'lucide-react';
import { RoutePath } from '../types';
import {
  BLOG_LAUNCHED,
  BLOG_LAUNCH_THRESHOLD,
  BLOG_PAGE_SIZE,
  CATEGORIES,
  PUBLISHED_POSTS,
  VISIBLE_POSTS,
  featuredPost,
} from '../content/blog';
import type { BlogCategory } from '../content/blog';
import { BlogCard } from '../components/BlogCard';
import { Placeholder } from '../components/Placeholder';
import { fadeUp, linkHandler, pageShellClass } from '../components/GuideParts';

interface BlogHubPageProps {
  page: number;
  onNavigate: (path: RoutePath) => void;
}

import { blogPageCount } from '../meta';
export { blogPageCount };

const pagePath = (page: number) => (page <= 1 ? '/blog/' : `/blog/page/${page}/`) as RoutePath;

export const BlogHubPage: React.FC<BlogHubPageProps> = ({ page, onNavigate }) => {
  const [filter, setFilter] = useState<BlogCategory | 'all'>('all');
  const goToLink = (path: RoutePath) => linkHandler(onNavigate, path);

  const pageCount = blogPageCount();
  const pagePosts = VISIBLE_POSTS.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);
  const filtered = filter === 'all' ? pagePosts : pagePosts.filter((post) => post.category === filter);
  const featured = page === 1 ? featuredPost(filtered) : undefined;
  const gridPosts = filtered.filter((post) => post !== featured);

  const chips: { id: BlogCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    ...(Object.keys(CATEGORIES) as BlogCategory[]).map((id) => ({ id, label: CATEGORIES[id].label })),
  ];

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-10 overflow-x-auto whitespace-nowrap pb-1">
          <button type="button" onClick={() => onNavigate('/')} className="hover:text-zinc-900 transition-colors">
            Home
          </button>
          <span className="text-zinc-400" aria-hidden="true">›</span>
          <span className="text-accent font-semibold" aria-current="page">
            Blog
          </span>
        </nav>

        {!BLOG_LAUNCHED && (
          <div role="note" className="mb-8 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-5 py-3.5 text-xs font-mono text-amber-900 leading-relaxed">
            Draft · the blog is hidden from navigation, search and RSS until {BLOG_LAUNCH_THRESHOLD} posts are published (
            {PUBLISHED_POSTS.length} of {BLOG_LAUNCH_THRESHOLD} so far). Draft posts are shown here for review.
          </div>
        )}

        {/* HERO */}
        <section className="max-w-4xl mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-line bg-surface text-xs font-mono text-zinc-700 mb-6 shadow-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-semibold text-zinc-900">Blog</span>
            {page > 1 && (
              <>
                <span className="text-zinc-400">·</span>
                <span>
                  Page {page} of {pageCount}
                </span>
              </>
            )}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-display text-balance mb-6 leading-[1.12]"
          >
            Stories from <span className="text-accent">the field</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl"
          >
            What happens when we capture a temple at dawn, a campus during holidays or a hotel between guests. Plus news,
            ideas and where you can find us next.
          </motion.p>
        </section>

        {/* FILTER CHIPS */}
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2 mb-8">
          {chips.map((chip) => {
            const count = chip.id === 'all' ? pagePosts.length : pagePosts.filter((p) => p.category === chip.id).length;
            const active = filter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(chip.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                  active
                    ? 'border-accent bg-accent text-white shadow-[0_4px_14px_-6px_rgba(225,29,72,0.5)]'
                    : 'border-line bg-white text-zinc-700 hover:border-zinc-300'
                }`}
              >
                {chip.label}
                <span className={`font-mono text-[11px] ${active ? 'text-white/80' : 'text-zinc-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* FEATURED + GRID */}
        {filtered.length === 0 ? (
          <div className="mb-20 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="text-base font-bold text-zinc-900 font-display">No posts here yet.</p>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="mt-3 inline-flex items-center gap-1 text-xs font-mono font-semibold text-accent hover:text-accent-strong"
            >
              See all stories <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="mb-20 sm:mb-24 space-y-6">
            {featured && (
              <motion.div key={`featured-${filter}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <BlogCard post={featured} onNavigate={onNavigate} featured />
              </motion.div>
            )}
            {gridPosts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((post, i) => (
                  <motion.div
                    key={`${post.slug}-${filter}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    <BlogCard post={post} onNavigate={onNavigate} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAGINATION (only when there are more than 12 posts) */}
        {pageCount > 1 && (
          <nav aria-label="Blog pages" className="-mt-12 mb-20 flex items-center justify-between">
            {page > 1 ? (
              <a href={pagePath(page - 1)} onClick={goToLink(pagePath(page - 1))} className="inline-flex items-center gap-1.5 text-sm font-mono text-zinc-700 hover:text-accent">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Newer stories
              </a>
            ) : (
              <span />
            )}
            {page < pageCount && (
              <a href={pagePath(page + 1)} onClick={goToLink(pagePath(page + 1))} className="inline-flex items-center gap-1.5 text-sm font-mono text-zinc-700 hover:text-accent">
                Older stories <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            )}
          </nav>
        )}

        {/* LEARN + FOLLOW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.section {...fadeUp} className="rounded-2xl border border-line bg-surface p-7 sm:p-9 flex flex-col">
            <span className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shadow-sm mb-5">
              <BookOpen className="w-5 h-5 text-white" aria-hidden="true" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-ink font-display">Looking for straight answers?</h2>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
              Our guides explain 3D tours, Gaussian splatting and planning a project.
            </p>
            <a
              href="/learn/"
              onClick={goToLink('/learn/')}
              className="mt-6 inline-flex w-fit items-center gap-1 text-xs font-mono font-semibold text-accent hover:text-accent-strong"
            >
              Visit Learn <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </motion.section>

          <motion.section {...fadeUp} transition={{ duration: 0.45, delay: 0.1 }} className="rounded-2xl border border-line bg-white p-7 sm:p-9 flex flex-col shadow-xs">
            <span className="w-11 h-11 rounded-xl border border-line bg-surface flex items-center justify-center mb-5">
              <Share2 className="w-5 h-5 text-accent" aria-hidden="true" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-ink font-display">Follow our work</h2>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
              We share capture days and new projects on <Placeholder>[[TBI: LinkedIn, Facebook, Instagram, YouTube links]]</Placeholder>.
            </p>
            {BLOG_LAUNCHED ? (
              <a href="/blog/rss.xml" className="mt-6 inline-flex w-fit items-center gap-1.5 text-xs font-mono font-semibold text-accent hover:text-accent-strong">
                <Rss className="w-3.5 h-3.5" aria-hidden="true" /> RSS feed
              </a>
            ) : (
              <span className="mt-6 inline-flex w-fit items-center gap-1.5 text-xs font-mono text-zinc-400">
                <Rss className="w-3.5 h-3.5" aria-hidden="true" /> RSS feed (available when the blog launches)
              </span>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
};
