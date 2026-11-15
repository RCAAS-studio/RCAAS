'use client';
import { useEffect } from 'react';
import { BLOG_LAUNCHED } from '../content/blog';
import { pageMeta } from '../meta';
import type { RoutePath } from '../types';

export function useMarketingMetadata(currentPath: RoutePath) {
  useEffect(() => {
    const metadata = pageMeta(currentPath);
    const { title, robots } = metadata;
    document.title = title;
    let robotsTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (robots) {
      if (!robotsTag) {
        robotsTag = document.createElement('meta');
        robotsTag.name = 'robots';
        document.head.appendChild(robotsTag);
      }
      robotsTag.content = robots;
    } else if (robotsTag) {
      // Next owns this tag (it wrote the server's robots): reset it rather than remove it.
      robotsTag.content = 'index, follow';
    }

    // RSS feed link, only once the blog has launched (launch rule).
    let rssTag = document.querySelector('link[type="application/rss+xml"]') as HTMLLinkElement | null;
    if (BLOG_LAUNCHED && !rssTag) {
      rssTag = document.createElement('link');
      rssTag.rel = 'alternate';
      rssTag.type = 'application/rss+xml';
      rssTag.title = 'RCAAS Technology Blog';
      rssTag.href = '/blog/rss.xml';
      document.head.appendChild(rssTag);
    }
  }, [currentPath]);
}
