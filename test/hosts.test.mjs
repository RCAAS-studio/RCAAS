// Host routing (src/lib/hosts.ts, applied by src/proxy.ts): Phase 01.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';

// The application uses bundler-style extensionless TypeScript imports.
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && context.parentURL?.includes('/src/')) {
    const ts = new URL(`${specifier}.ts`, context.parentURL);
    if (existsSync(ts)) return next(ts.href, context);
  }
  return next(specifier, context);
} });

Object.assign(process.env, {
  NEXT_PUBLIC_SITE_URL: 'https://rcaas.tech',
  NEXT_PUBLIC_STUDIO_URL: 'https://studio.rcaas.tech',
  NEXT_PUBLIC_TOURS_URL: 'https://tours.rcaas.tech',
  NEXT_PUBLIC_SITES_DOMAIN: 'sites.rcaas.tech'
});
const { hostConfig, hostKind, routeFor, tourHref, siteHref, projectToursHref, studioHref, HOSTS } = await import('../src/lib/hosts.ts');

const cfg = hostConfig({ site: 'https://rcaas.tech', studio: 'https://studio.rcaas.tech', tours: 'https://tours.rcaas.tech', sites: 'sites.rcaas.tech' });
const go = (host, path, search = '') => routeFor(cfg, host, path, search);
const next = { type: 'next' }, notFound = { type: 'notFound' };
const to = (url) => ({ type: 'redirect', url });
const rewrite = (path) => ({ type: 'rewrite', path });

test('with no separate hosts configured, every request passes untouched (dev, Pages, one-host deploy)', () => {
  for (const c of [hostConfig({ site: 'https://rcaas.tech' }), hostConfig({ site: 'https://rcaas.tech', studio: 'https://studio.rcaas.tech', tours: 'https://tours.rcaas.tech' }), hostConfig({ site: 'x', studio: 'not a url', tours: 'https://t.test', sites: 'sites.test' })]) {
    assert.equal(c.multi, false);
    for (const [h, p] of [['evil.test', '/studio'], ['rcaas.tech', '/s/basera'], [null, '/'], ['studio.rcaas.tech', '/about']]) assert.deepEqual(routeFor(c, h, p), next);
  }
});

test('hosts are recognised case-insensitively, with ports and trailing dots; anything else is unknown', () => {
  assert.deepEqual(hostKind(cfg, 'RCAAS.tech:443'), { kind: 'main' });
  assert.deepEqual(hostKind(cfg, 'studio.rcaas.tech.'), { kind: 'studio' });
  assert.deepEqual(hostKind(cfg, 'www.rcaas.tech'), { kind: 'www' });
  assert.deepEqual(hostKind(cfg, 'Basera.Sites.Rcaas.Tech'), { kind: 'site', slug: 'basera' });
  assert.deepEqual(hostKind(cfg, '127.0.0.1:3000'), { kind: 'main' });
  for (const bad of ['evil.test', 'rcaas.tech.evil.test', 'sites.rcaas.tech', 'a.b.sites.rcaas.tech', '-x.sites.rcaas.tech',
    'x-.sites.rcaas.tech', 'a_b.sites.rcaas.tech', `${'a'.repeat(64)}.sites.rcaas.tech`, 'xsites.rcaas.tech', '', null]) {
    assert.equal(hostKind(cfg, bad), null, String(bad));
    assert.deepEqual(go(bad, '/'), notFound, String(bad));
  }
  assert.deepEqual(hostKind(cfg, `${'a'.repeat(63)}.sites.rcaas.tech`), { kind: 'site', slug: 'a'.repeat(63) });
});

test('each host serves its own paths and sends old links to the right host, query kept', () => {
  const cases = [
    // public site
    ['rcaas.tech', '/', '', next], ['rcaas.tech', '/about', '', next], ['rcaas.tech', '/s/bad-', '', next],
    ['rcaas.tech', '/studio', '', to('https://studio.rcaas.tech/studio')],
    ['rcaas.tech', '/studio/basera/edit', '?space=lobby', to('https://studio.rcaas.tech/studio/basera/edit?space=lobby')],
    ['rcaas.tech', '/login', '?next=%2Fstudio', to('https://studio.rcaas.tech/login?next=%2Fstudio')],
    ['rcaas.tech', '/tour', '?space=lobby&embed=1&key=k', to('https://tours.rcaas.tech/tour?space=lobby&embed=1&key=k')],
    ['rcaas.tech', '/t/basera', '', to('https://tours.rcaas.tech/basera')],
    ['rcaas.tech', '/t/basera/lobby', '?src=qr', to('https://tours.rcaas.tech/basera/lobby?src=qr')],
    ['rcaas.tech', '/s/basera', '?src=qr', to('https://basera.sites.rcaas.tech/?src=qr')],
    ['rcaas.tech', '/s/basera/lobby', '', to('https://basera.sites.rcaas.tech/lobby')],
    ['rcaas.tech', '/s/basera/lobby', '?src=qr', to('https://basera.sites.rcaas.tech/lobby?src=qr')],
    ['www.rcaas.tech', '/contact', '?a=1', to('https://rcaas.tech/contact?a=1')],
    // studio
    ['studio.rcaas.tech', '/', '', to('https://studio.rcaas.tech/studio')],
    ['studio.rcaas.tech', '/studio', '', next], ['studio.rcaas.tech', '/studio/basera/site', '', next],
    ['studio.rcaas.tech', '/login', '?reset=t', next], ['studio.rcaas.tech', '/tour', '?space=x', next],
    ['studio.rcaas.tech', '/about', '', to('https://rcaas.tech/about')],
    ['studio.rcaas.tech', '/s/basera/lobby', '', to('https://basera.sites.rcaas.tech/lobby')],
    ['studio.rcaas.tech', '/s/bad-', '', to('https://rcaas.tech/s/bad-')],
    // tours
    ['tours.rcaas.tech', '/', '', to('https://rcaas.tech/gallery')],
    ['tours.rcaas.tech', '/basera', '', rewrite('/t/basera')],
    ['tours.rcaas.tech', '/basera/lobby', '?src=qr', rewrite('/t/basera/lobby')],
    ['tours.rcaas.tech', '/tour', '?space=x', next], ['tours.rcaas.tech', '/t/basera', '', next],
    ['tours.rcaas.tech', '/a/b/c', '', notFound], ['tours.rcaas.tech', '/bad_id', '', notFound],
    ['tours.rcaas.tech', '/studio', '', to('https://studio.rcaas.tech/studio')],
    // a client website
    ['basera.sites.rcaas.tech', '/', '', rewrite('/s/basera')],
    ['basera.sites.rcaas.tech', '/lobby', '', rewrite('/s/basera/lobby')],
    ['basera.sites.rcaas.tech', '/bar', '?src=qr', rewrite('/s/basera/bar')],
    ['basera.sites.rcaas.tech', '/tour', '?space=x&embed=1', next],
    ['basera.sites.rcaas.tech', '/s/basera/lobby', '', next],
    ['basera.sites.rcaas.tech', '/s/other', '', notFound], ['basera.sites.rcaas.tech', '/s/other/lobby', '', notFound],
    ['basera.sites.rcaas.tech', '/a/b', '', notFound],
    ['basera.sites.rcaas.tech', '/login', '', to('https://studio.rcaas.tech/login')],
    ['basera.sites.rcaas.tech', '/t/basera', '', to('https://tours.rcaas.tech/basera')]
  ];
  for (const [host, path, search, want] of cases) assert.deepEqual(go(host, path, search), want, `${host}${path}${search}`);
});

test('every redirect lands where it is served: one move, never a loop', () => {
  const hosts = ['rcaas.tech', 'www.rcaas.tech', 'studio.rcaas.tech', 'tours.rcaas.tech', 'basera.sites.rcaas.tech'];
  const paths = ['/', '/about', '/gallery', '/studio', '/studio/basera', '/login', '/tour', '/t/basera', '/t/basera/lobby',
    '/s/basera', '/s/basera/lobby', '/s/basera/bar', '/basera', '/basera/lobby', '/lobby', '/bar'];
  for (const host of hosts) for (const path of paths) {
    const first = go(host, path, '?q=1');
    if (first.type !== 'redirect') continue;
    const u = new URL(first.url);
    assert.equal(u.searchParams.get('q'), '1', `${host}${path} lost its query`);
    const second = go(u.host, u.pathname, u.search);
    assert.notEqual(second.type, 'redirect', `${host}${path} → ${first.url} → ${second.url}`);
    assert.notEqual(second.type, 'notFound', `${host}${path} → ${first.url} is not served`);
  }
});

test('links point at the host that serves them', () => {
  assert.equal(HOSTS.multi, true);
  assert.equal(tourHref('lobby'), 'https://tours.rcaas.tech/tour?space=lobby');
  assert.equal(tourHref('a b', true, '&embed=1'), 'https://tours.rcaas.tech/tour?space=a%20b&embed=1');
  assert.equal(projectToursHref('basera'), 'https://tours.rcaas.tech/basera');
  assert.equal(projectToursHref('basera', 'lobby'), 'https://tours.rcaas.tech/basera/lobby');
  assert.equal(siteHref('basera'), 'https://basera.sites.rcaas.tech/');
  assert.equal(siteHref('basera', '?src=qr'), 'https://basera.sites.rcaas.tech/?src=qr');
  assert.equal(siteHref('basera', '/lobby'), 'https://basera.sites.rcaas.tech/lobby');
  assert.equal(siteHref('bad-'), '/s/bad-'); // not a DNS label: stays on the public site
  assert.equal(studioHref('/login'), 'https://studio.rcaas.tech/login');
  // A local trial keeps the port on client-website hosts.
  const local = hostConfig({ site: 'http://rcaas.localhost:3300', studio: 'http://studio.rcaas.localhost:3300', tours: 'http://tours.rcaas.localhost:3300', sites: 'sites.rcaas.localhost' });
  assert.deepEqual(routeFor(local, 'rcaas.localhost:3300', '/s/basera'), to('http://basera.sites.rcaas.localhost:3300/'));
});
