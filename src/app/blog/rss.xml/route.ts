import { buildBlogRss } from '../../../features/marketing/content/blog/rss';
import { SITE_URL } from '../../../lib/shareMeta';

/** /blog/rss.xml: the blog page links it and App advertises it once the blog
 *  has launched. Their Vite plugin built it; here it's a plain route, as
 *  robots.txt is. The catch-all can't serve it (a slug has no dot). */
export const dynamic = 'force-static';

export function GET() {
  return new Response(buildBlogRss(SITE_URL), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
  });
}
