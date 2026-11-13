/**
 * Which public host serves which part of RCAAS (Phase 01, 2026-11-13).
 *
 *   rcaas.tech                    the public site (the (site) catch-all); www.rcaas.tech → here
 *   studio.rcaas.tech             /studio/**, /login (and /tour, which the studio's previews frame)
 *   tours.rcaas.tech              /{project}[/{space}] (served by /t/…), /tour?space=
 *   {project}.sites.rcaas.tech    / , /{space} (served by /s/{project}/…), /tour in its frames
 *
 * Off unless NEXT_PUBLIC_STUDIO_URL, NEXT_PUBLIC_TOURS_URL and NEXT_PUBLIC_SITES_DOMAIN are all set:
 * then everything stays on one origin, exactly as before (development, the GitHub Pages copy, a
 * single-host deploy). src/proxy.ts applies routeFor(); the *Href builders write links for the
 * right host. The reverse proxy (Caddy/IIS) must pass the visitor's Host header through and send
 * /api/* to the API on every one of these hosts.
 */
import { SITE_URL } from './shareMeta';

export interface HostConfig {
  /** The public site's origin (NEXT_PUBLIC_SITE_URL). */
  main: URL;
  studio: URL | null;
  tours: URL | null;
  /** Parent domain of the client websites, e.g. "sites.rcaas.tech". */
  sites: string;
  multi: boolean;
}

const parse = (s?: string) => { try { return s ? new URL(s) : null; } catch { return null; } };

export function hostConfig(env: { site?: string; studio?: string; tours?: string; sites?: string }): HostConfig {
  const main = parse(env.site) ?? new URL('http://localhost:3000');
  const studio = parse(env.studio), tours = parse(env.tours);
  const sites = (env.sites || '').trim().toLowerCase().replace(/^\.+|\.+$/g, '');
  return { main, studio, tours, sites, multi: !!(studio && tours && sites) };
}

// Each NEXT_PUBLIC_ name written out in full, so Next inlines it into the browser's copy.
export const HOSTS = hostConfig({
  site: SITE_URL,
  studio: process.env.NEXT_PUBLIC_STUDIO_URL,
  tours: process.env.NEXT_PUBLIC_TOURS_URL,
  sites: process.env.NEXT_PUBLIC_SITES_DOMAIN
});
export const MULTI_HOST = HOSTS.multi;

/** A project id that can also be a DNS label (project ids are [a-z0-9-]+, which also allows
 *  a leading or trailing "-" or more than 63 characters). Others keep /s/<id> on the main host. */
export const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const SEGMENT = /^[A-Za-z0-9-]+$/;
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]']);

export type HostKind = { kind: 'main' | 'www' | 'studio' | 'tours' } | { kind: 'site'; slug: string };

/** The Host header's name, lower case, without a port or a trailing dot. */
const bare = (host: string | null | undefined) => (host || '').trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');

/** Which of our hosts this is, or null for one we don't serve. Only meaningful with MULTI_HOST. */
export function hostKind(cfg: HostConfig, rawHost: string | null | undefined): HostKind | null {
  const h = bare(rawHost);
  if (!h) return null;
  if (h === cfg.main.hostname) return { kind: 'main' };
  if (cfg.studio && h === cfg.studio.hostname) return { kind: 'studio' };
  if (cfg.tours && h === cfg.tours.hostname) return { kind: 'tours' };
  if (h === `www.${cfg.main.hostname}`) return { kind: 'www' };
  if (cfg.sites && h.endsWith(`.${cfg.sites}`)) {
    const slug = h.slice(0, -cfg.sites.length - 1);
    return LABEL.test(slug) ? { kind: 'site', slug } : null;
  }
  // The server's own requests and on-box health checks.
  if (LOOPBACK.has(h)) return { kind: 'main' };
  return null;
}

/** A client website's origin, in the main site's scheme and port (a port only in local trials). */
export const siteOrigin = (cfg: HostConfig, slug: string) =>
  `${cfg.main.protocol}//${slug}.${cfg.sites}${cfg.main.port ? `:${cfg.main.port}` : ''}`;

export type Route =
  | { type: 'next' }
  | { type: 'rewrite'; path: string }
  | { type: 'redirect'; url: string }
  | { type: 'notFound' };

const NEXT: Route = { type: 'next' };
const NOT_FOUND: Route = { type: 'notFound' };
const redirect = (url: string): Route => ({ type: 'redirect', url });

/**
 * What to do with a request: serve it, serve another path on this host (rewrite), send the
 * browser to the host that owns the path (redirect, query kept), or refuse it. Every redirect
 * lands on a path its target host serves itself, so a link moves at most once (test/hosts.test.mjs).
 */
export function routeFor(cfg: HostConfig, host: string | null | undefined, pathname: string, search = ''): Route {
  if (!cfg.multi || !cfg.studio || !cfg.tours) return NEXT;
  const k = hostKind(cfg, host);
  if (!k) return NOT_FOUND;
  if (k.kind === 'www') {
    // Straight to wherever the bare domain would send it (www/studio → studio, not via rcaas.tech).
    const there = routeFor(cfg, cfg.main.host, pathname, search);
    return there.type === 'redirect' ? there : redirect(`${cfg.main.origin}${pathname}${search}`);
  }

  const seg = pathname.split('/').filter(Boolean);
  const [first, second] = seg;
  const studioPath = first === 'studio' || pathname === '/login';

  // Paths one host owns, reached on another: send the browser there.
  if (studioPath && k.kind !== 'studio') return redirect(`${cfg.studio.origin}${pathname}${search}`);
  if (first === 't' && k.kind !== 'tours') return redirect(`${cfg.tours.origin}/${seg.slice(1).join('/')}${search}`);
  if (first === 's' && second && k.kind !== 'site') {
    if (LABEL.test(second)) return redirect(`${siteOrigin(cfg, second)}/${seg.slice(2).join('/')}${search}`);
    return k.kind === 'main' ? NEXT : redirect(`${cfg.main.origin}${pathname}${search}`);
  }

  switch (k.kind) {
    case 'main':
      return pathname === '/tour' ? redirect(`${cfg.tours.origin}/tour${search}`) : NEXT;
    case 'studio':
      if (pathname === '/') return redirect(`${cfg.studio.origin}/studio${search}`);
      if (studioPath || pathname === '/tour') return NEXT;
      return redirect(`${cfg.main.origin}${pathname}${search}`);
    case 'tours':
      if (pathname === '/') return redirect(`${cfg.main.origin}/gallery${search}`);
      if (pathname === '/tour' || first === 't') return NEXT;
      if (seg.length <= 2 && seg.every((s) => SEGMENT.test(s))) return { type: 'rewrite', path: `/t/${seg.join('/')}` };
      return NOT_FOUND;
    case 'site':
      if (pathname === '/') return { type: 'rewrite', path: `/s/${k.slug}` };
      if (pathname === '/tour') return NEXT;
      // Its own /s/<slug>/… paths still work (in-page links use them); another project's never do.
      if (first === 's') return second === k.slug ? NEXT : NOT_FOUND;
      if (seg.length === 1 && SEGMENT.test(first)) return { type: 'rewrite', path: `/s/${k.slug}/${first}` };
      return NOT_FOUND;
  }
}

/* ---- links ---------------------------------------------------------- */

/** This page's origin in a browser; on the server, the public site's address (with any sub-path). */
const here = () => (typeof window !== 'undefined' ? window.location.origin : SITE_URL);
const enc = encodeURIComponent;

/** A path on the studio. Absolute when asked, or when the studio has its own host. */
export const studioHref = (path: string, absolute = false) =>
  MULTI_HOST ? `${HOSTS.studio!.origin}${path}` : `${absolute ? here() : ''}${path}`;

/** One space's tour (`/tour?space=`), e.g. for embed snippets and share links. */
export const tourHref = (space: string, absolute = false, query = '') => {
  const path = `/tour?space=${enc(space)}${query}`;
  return MULTI_HOST ? `${HOSTS.tours!.origin}${path}` : `${absolute ? here() : ''}${path}`;
};

/** A project's tour page, or one space of it. */
export const projectToursHref = (project: string, space?: string, absolute = false) => {
  const rest = `${enc(project)}${space ? `/${enc(space)}` : ''}`;
  return MULTI_HOST ? `${HOSTS.tours!.origin}/${rest}` : `${absolute ? here() : ''}/t/${rest}`;
};

/** A client website, or a page under it: `rest` is "", "/<space>" or "?src=qr". */
export const siteHref = (project: string, rest = '', absolute = false) => {
  if (MULTI_HOST && LABEL.test(project)) return `${siteOrigin(HOSTS, project)}${rest.startsWith('/') ? rest : `/${rest}`}`;
  return `${absolute ? here() : ''}/s/${enc(project)}${rest}`;
};
