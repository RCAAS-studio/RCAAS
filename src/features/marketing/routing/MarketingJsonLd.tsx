import { SITE_URL } from '../../../lib/shareMeta';
import { pageMeta } from '../meta';
import { alignSchemaUrls } from '../structuredData/alignUrls';
import { buildMarketingGraph } from '../structuredData/buildMarketingGraph';
import type { RoutePath } from '../types';

/**
 * The page's schema.org graph, written into the HTML the server sends (the shell is a client component,
 * which Next still renders on the server) and updated in place on each client-side move. Crawlers that do
 * not run JavaScript, and AI answer engines, therefore see it. `<` is escaped so no copy can close the tag.
 */
export function MarketingJsonLd({ path }: { path: RoutePath }) {
  // NEXT_PUBLIC_TRAILING_SLASH is set by next.config for the static export only.
  const graph = alignSchemaUrls(buildMarketingGraph(path, pageMeta(path)), SITE_URL, !!process.env.NEXT_PUBLIC_TRAILING_SLASH);
  return (
    <script
      id="schema-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\u003c') }}
    />
  );
}
