/** Match complete paths, never arbitrary descendants of an existing page. */
export function knownMarketingPath(path: string, routes: readonly string[], knownBlog: boolean): boolean {
  const clean = path.split(/[?#]/)[0] || '/';
  const normalized = clean.endsWith('/') ? clean : `${clean}/`;
  return routes.includes(normalized) || (normalized.startsWith('/blog/') && knownBlog);
}
