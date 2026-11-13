/**
 * Host routing (Phase 01): the studio, tours and client websites on their own hosts.
 * The decisions live in lib/hosts.ts routeFor() (tested in test/hosts.test.mjs); this file only
 * applies them. With NEXT_PUBLIC_STUDIO_URL/TOURS_URL/SITES_DOMAIN unset, every request passes.
 *
 * Only the Host header is read: X-Forwarded-Host is the visitor's to set, so a reverse proxy in
 * front must pass the original Host through (Caddy does; IIS ARR needs preserveHostHeader).
 * Redirects are 307 until LEGACY_REDIRECT_STATUS=308 (set it once every old link is checked:
 * browsers keep a 308 for good, so a mistake there can't be taken back).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { HOSTS, routeFor } from './lib/hosts';

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const route = routeFor(HOSTS, req.headers.get('host'), pathname, search);
  switch (route.type) {
    case 'next': return NextResponse.next();
    case 'rewrite': return NextResponse.rewrite(new URL(`${route.path}${search}`, req.url));
    case 'redirect': return NextResponse.redirect(route.url, process.env.LEGACY_REDIRECT_STATUS === '308' ? 308 : 307);
    default: return new NextResponse('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

// Pages only: Next's own files, the API and anything with a dot (pictures, robots.txt,
// sitemap.xml) are the same on every host.
export const config = { matcher: ['/((?!_next/|api/|.*\\..*).*)'] };
