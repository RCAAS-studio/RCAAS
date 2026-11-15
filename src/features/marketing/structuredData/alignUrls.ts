/**
 * The schema builders write every address as https://rcaas.tech/<path>/. A page's structured data must name the
 * same address as its canonical link, or crawlers see two URLs for one page. This rebases each rcaas.tech address
 * onto the site's own URL (a preview, or the GitHub Pages copy under /RCAAS) and applies the host's slash form:
 * the static export serves and canonicalises every page with a trailing slash, the Node host without one.
 * Files (anything with an extension), other origins and fragments are left alone; `@id` fragments are kept.
 */
const ORIGIN = 'https://rcaas.tech';

export function alignSchemaUrl(value: string, siteUrl: string, trailingSlash: boolean): string {
  if (value !== ORIGIN && !value.startsWith(`${ORIGIN}/`) && !value.startsWith(`${ORIGIN}#`)) return value;
  const rest = value.slice(ORIGIN.length);
  const hash = rest.indexOf('#');
  const path = hash < 0 ? rest : rest.slice(0, hash);
  const fragment = hash < 0 ? '' : rest.slice(hash);
  const base = siteUrl.replace(/\/$/, '');
  if (/\.[a-z0-9]+$/i.test(path)) return `${base}${path}${fragment}`;
  const bare = path.replace(/\/+$/, '');
  if (trailingSlash) return `${base}${bare}/${fragment}`;
  // Root and no fragment: the Node host's canonical is the bare site URL. An id keeps its "/#name" form.
  return bare === '' && fragment ? `${base}/${fragment}` : `${base}${bare}${fragment}`;
}

export function alignSchemaUrls<T>(node: T, siteUrl: string, trailingSlash: boolean): T {
  if (typeof node === 'string') return alignSchemaUrl(node, siteUrl, trailingSlash) as T;
  if (Array.isArray(node)) return node.map((item) => alignSchemaUrls(item, siteUrl, trailingSlash)) as T;
  if (node && typeof node === 'object') {
    return Object.fromEntries(
      Object.entries(node).map(([key, item]) => [key, alignSchemaUrls(item, siteUrl, trailingSlash)])
    ) as T;
  }
  return node;
}
