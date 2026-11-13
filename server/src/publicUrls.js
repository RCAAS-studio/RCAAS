/**
 * The site's public addresses, as the API needs them (Phase 01, 2026-11-13): links it writes into
 * emails and texts, and which pages may call it. CLIENT_ORIGIN is the public site. STUDIO_URL,
 * TOURS_URL and SITES_DOMAIN repeat the site's NEXT_PUBLIC_STUDIO_URL / _TOURS_URL / _SITES_DOMAIN
 * once the studio, tours and client websites have hosts of their own (src/lib/hosts.ts); unset,
 * every link stays on CLIENT_ORIGIN, as before.
 */
const trim = (s) => String(s ?? '').trim().replace(/\/+$/, '');
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const LOCALHOST = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export const mainUrl = () => trim(process.env.CLIENT_ORIGIN) || 'http://localhost:3000';
const sitesDomain = () => trim(process.env.SITES_DOMAIN).toLowerCase().replace(/^\.+/, '');
const multi = () => !!(trim(process.env.STUDIO_URL) && trim(process.env.TOURS_URL) && sitesDomain());

/** A page on the studio (sign-in, reset links). */
export const studioLink = (path) => `${multi() ? trim(process.env.STUDIO_URL) : mainUrl()}${path}`;

/** One space in a project's tours. */
export const tourLink = (project, space) =>
  multi() ? `${trim(process.env.TOURS_URL)}/${project}/${space}` : `${mainUrl()}/t/${project}/${space}`;

/** A client website's home (a "#section" may follow). */
export function siteLink(project) {
  if (multi() && LABEL.test(project)) {
    const u = new URL(mainUrl());
    return `${u.protocol}//${project}.${sitesDomain()}${u.port ? `:${u.port}` : ''}/`;
  }
  return `${mainUrl()}/s/${project}`;
}

const originOf = (s) => { try { return new URL(s).origin; } catch { return ''; } };

/**
 * May a page from `origin` call the API (CORS, and the cross-site write check)? Yes for no origin,
 * the public site, our own studio/tours/client-website hosts, localhost in development, and the
 * API's own host: each public host hands /api to the API, so a page there is same-origin.
 * `hostname` is the request's (Express req.hostname: Host, or X-Forwarded-Host from a proxy on
 * this machine).
 */
export function originAllowed(origin, hostname, dev = false) {
  if (!origin) return true;
  if (origin === mainUrl() || (dev && LOCALHOST.test(origin))) return true;
  let url;
  try { url = new URL(origin); } catch { return false; }
  if (hostname && url.hostname === String(hostname).toLowerCase()) return true;
  if (!multi()) return false;
  if (origin === originOf(process.env.STUDIO_URL) || origin === originOf(process.env.TOURS_URL)) return true;
  const sites = sitesDomain(), main = new URL(mainUrl());
  if (url.protocol !== main.protocol || !url.hostname.endsWith(`.${sites}`)) return false;
  return LABEL.test(url.hostname.slice(0, -sites.length - 1));
}
