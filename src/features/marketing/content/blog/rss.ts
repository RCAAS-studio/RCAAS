import { CATEGORIES, PUBLISHED_POSTS, postPath } from './index';

const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// RSS 2.0 feed of published posts, newest first. Used by the blog-rss Vite plugin.
export const buildBlogRss = (siteUrl: string) => {
  const items = PUBLISHED_POSTS.map((post) => {
    const url = `${siteUrl}${postPath(post)}`;
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.summary)}</description>
      <category>${escapeXml(CATEGORIES[post.category].label)}</category>
      <pubDate>${new Date(`${post.published}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RCAAS Technology Blog</title>
    <link>${siteUrl}/blog/</link>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>Stories from the field: capture days, launches, ideas and events from RCAAS Technology.</description>
    <language>en-gb</language>
${items}
  </channel>
</rss>
`;
};
