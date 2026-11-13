// Public links in emails and the origin rule for API calls (src/publicUrls.js): Phase 01.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { studioLink, tourLink, siteLink, originAllowed } from '../src/publicUrls.js';

const KEYS = ['CLIENT_ORIGIN', 'STUDIO_URL', 'TOURS_URL', 'SITES_DOMAIN'];
const withEnv = (env, fn) => {
  const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
  Object.assign(process.env, env);
  try { fn(); } finally { for (const k of KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } }
};
const SPLIT = { CLIENT_ORIGIN: 'https://rcaas.tech', STUDIO_URL: 'https://studio.rcaas.tech/', TOURS_URL: 'https://tours.rcaas.tech', SITES_DOMAIN: 'sites.rcaas.tech' };

test('one host: links stay on CLIENT_ORIGIN, as before', () => withEnv({ CLIENT_ORIGIN: 'https://rcaas.tech/' }, () => {
  assert.equal(studioLink('/login?reset=t'), 'https://rcaas.tech/login?reset=t');
  assert.equal(tourLink('basera', 'lobby'), 'https://rcaas.tech/t/basera/lobby');
  assert.equal(siteLink('basera'), 'https://rcaas.tech/s/basera');
}));

test('separate hosts: reset links go to the studio, tours and websites to their own hosts', () => withEnv(SPLIT, () => {
  assert.equal(studioLink('/login?reset=t'), 'https://studio.rcaas.tech/login?reset=t');
  assert.equal(tourLink('basera', 'lobby'), 'https://tours.rcaas.tech/basera/lobby');
  assert.equal(`${siteLink('basera')}#events`, 'https://basera.sites.rcaas.tech/#events');
  assert.equal(siteLink('bad-'), 'https://rcaas.tech/s/bad-');
}));

test('pages on our own hosts may call the API; other sites may not', () => {
  withEnv({ CLIENT_ORIGIN: 'https://rcaas.tech' }, () => {
    assert.equal(originAllowed(undefined, 'rcaas.tech'), true);
    assert.equal(originAllowed('https://rcaas.tech', 'api.internal'), true);
    assert.equal(originAllowed('https://studio.rcaas.tech', 'studio.rcaas.tech'), true); // same host: /api proxied there
    assert.equal(originAllowed('https://studio.rcaas.tech', 'rcaas.tech'), false); // one host: no studio host yet
    assert.equal(originAllowed('http://localhost:3001', 'localhost'), true, 'localhost: same host');
    assert.equal(originAllowed('http://localhost:3001', '127.0.0.1', true), true, 'dev: any localhost port');
    assert.equal(originAllowed('http://localhost:3001', '127.0.0.1', false), false);
    assert.equal(originAllowed('https://evil.test', 'rcaas.tech'), false);
    assert.equal(originAllowed('null', 'rcaas.tech'), false);
  });
  withEnv(SPLIT, () => {
    for (const ok of ['https://studio.rcaas.tech', 'https://tours.rcaas.tech', 'https://basera.sites.rcaas.tech']) assert.equal(originAllowed(ok, 'rcaas.tech'), true, ok);
    for (const bad of ['http://basera.sites.rcaas.tech', 'https://a.b.sites.rcaas.tech', 'https://-x.sites.rcaas.tech', 'https://sites.rcaas.tech',
      'https://evilsites.rcaas.tech', 'https://basera.sites.rcaas.tech.evil.test', 'https://rcaas.tech.evil.test', 'https://evil.test']) {
      assert.equal(originAllowed(bad, 'rcaas.tech'), false, bad);
    }
  });
});
