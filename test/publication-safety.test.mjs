import './helpers/marketing-typescript.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const { scanHtml, scanDirs } = await import('../scripts/check-placeholders.mjs');
const { pageMeta } = await import('../src/features/marketing/meta.ts');
const { buildMarketingGraph } = await import('../src/features/marketing/structuredData/buildMarketingGraph.ts');
const { ROUTES } = await import('../src/features/marketing/types/index.ts');
const { VISIBLE_POSTS } = await import('../src/features/marketing/content/blog/index.ts');

const page = (head, body = '') => `<!DOCTYPE html><html><head><title>t</title>${head}</head><body>${body}</body></html>`;

test('the build gate flags a placeholder on an indexable page', () => {
  const result = scanHtml(page('', '<p>Typical time: <span>[[TBI: typical time by scope]]</span></p>'));
  assert.equal(result.indexable, true);
  assert.deepEqual(result.hits, ['[[TBI: typical time by scope]]']);
});

test('the build gate flags placeholders in metadata and JSON-LD, not just visible copy', () => {
  assert.equal(scanHtml(page('<meta name="description" content="Costs [[TBC]]"/>')).hits.length, 1);
  assert.equal(scanHtml(page('<script type="application/ld+json">{"name":"[[TBI]]"}</script>')).hits.length, 1);
});

test('the build gate leaves draft (noindex) pages alone and passes clean pages', () => {
  const draft = scanHtml(page('<meta name="robots" content="noindex, nofollow"/>', '<p>[[TBC: later]]</p>'));
  assert.equal(draft.indexable, false);
  assert.deepEqual(draft.hits, []);
  assert.deepEqual(scanHtml(page('<meta name="robots" content="index, follow"/>', '<p>All confirmed.</p>')).hits, []);
});

test('scanDirs walks nested output and reports the offending file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rcaas-gate-'));
  try {
    fs.mkdirSync(path.join(dir, 'services'));
    fs.writeFileSync(path.join(dir, 'index.html'), page('', '<p>ok</p>'));
    fs.writeFileSync(path.join(dir, 'services', 'index.html'), page('', '<p>[[TBC]]</p>'));
    fs.writeFileSync(path.join(dir, 'draft.html'), page('<meta name="robots" content="noindex"/>', '<p>[[TBI]]</p>'));
    const { pages, indexable, failures } = scanDirs([dir]);
    assert.equal(pages, 3);
    assert.equal(indexable, 2);
    assert.equal(failures.length, 1);
    assert.match(failures[0].file, /services/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('every indexable route has placeholder-free metadata and structured data', () => {
  const paths = [...ROUTES, ...VISIBLE_POSTS.map((post) => `/blog/${post.slug}/`)];
  let indexable = 0;
  for (const path of paths) {
    const meta = pageMeta(path);
    if (meta.robots && /noindex/i.test(meta.robots)) continue;
    indexable++;
    assert.doesNotMatch(`${meta.title} ${meta.description}`, /\[\[/, `${path} metadata`);
    assert.doesNotMatch(JSON.stringify(buildMarketingGraph(path, meta)), /\[\[/, `${path} structured data`);
  }
  assert.ok(indexable > 20, 'expected most routes to be indexable');
});

const { alignSchemaUrl, alignSchemaUrls } = await import('../src/features/marketing/structuredData/alignUrls.ts');

test('schema URLs take the host\'s canonical form: slash-less on the Node host, slash on the static export', () => {
  const node = (u) => alignSchemaUrl(u, 'https://rcaas.tech', false);
  const pages = (u) => alignSchemaUrl(u, 'https://owner.github.io/RCAAS', true);
  assert.equal(node('https://rcaas.tech/services/digital-twins/'), 'https://rcaas.tech/services/digital-twins');
  assert.equal(node('https://rcaas.tech/services/digital-twins/#service'), 'https://rcaas.tech/services/digital-twins#service');
  assert.equal(node('https://rcaas.tech/'), 'https://rcaas.tech');
  assert.equal(node('https://rcaas.tech/#organization'), 'https://rcaas.tech/#organization');
  assert.equal(node('https://rcaas.tech/logo.png'), 'https://rcaas.tech/logo.png');
  assert.equal(pages('https://rcaas.tech/services/'), 'https://owner.github.io/RCAAS/services/');
  assert.equal(pages('https://rcaas.tech/'), 'https://owner.github.io/RCAAS/');
  assert.equal(pages('https://rcaas.tech/logo.png'), 'https://owner.github.io/RCAAS/logo.png');
  assert.equal(node('https://linkedin.com/company/rcaas-technology'), 'https://linkedin.com/company/rcaas-technology');
  assert.deepEqual(alignSchemaUrls({ a: ['https://rcaas.tech/faq/'], n: 3 }, 'https://rcaas.tech', false), { a: ['https://rcaas.tech/faq'], n: 3 });
});

test('every indexable page has its own title and description, and no unsupported timing in either', () => {
  const titles = new Map();
  const descriptions = new Map();
  for (const path of ROUTES) {
    const meta = pageMeta(path);
    if (meta.robots && /noindex/i.test(meta.robots)) continue;
    assert.ok(!titles.has(meta.title), `${path} repeats the title of ${titles.get(meta.title)}`);
    assert.ok(!descriptions.has(meta.description), `${path} repeats the description of ${descriptions.get(meta.description)}`);
    titles.set(meta.title, path);
    descriptions.set(meta.description, path);
    assert.doesNotMatch(`${meta.title} ${meta.description}`, /hours, not days|within 24|in \d+ days/i, path);
  }
  assert.ok(titles.size > 20);
});

test('a page\'s schema URL equals its canonical form', () => {
  for (const [trailing, site, canonical] of [[false, 'https://rcaas.tech', 'https://rcaas.tech/services/digital-twins'], [true, 'https://owner.github.io/RCAAS', 'https://owner.github.io/RCAAS/services/digital-twins/']]) {
    const service = alignSchemaUrls(buildMarketingGraph('/services/digital-twins/'), site, trailing)['@graph'].find((n) => n['@type'] === 'Service');
    assert.equal(service.url, canonical);
    assert.ok(service['@id'].startsWith(canonical), service['@id']);
  }
});
