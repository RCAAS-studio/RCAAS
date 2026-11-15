import './helpers/marketing-typescript.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const { buildMarketingGraph } = await import('../src/features/marketing/structuredData/buildMarketingGraph.ts');
const { ROUTES } = await import('../src/features/marketing/types/index.ts');
const { VISIBLE_POSTS, PUBLISHED_POSTS } = await import('../src/features/marketing/content/blog/index.ts');
const { TEAM_MEMBERS, isMemberPublished, personId } = await import('../src/features/marketing/content/team/index.ts');

test('public structured data is serializable and does not share mutable organization state', () => {
  const paths = [...ROUTES, ...VISIBLE_POSTS.map(post => `/blog/${post.slug}/`)];
  for (const path of paths) {
    const graph = buildMarketingGraph(path);
    assert.deepEqual(JSON.parse(JSON.stringify(graph)), graph, path);
    assert.equal(graph['@graph'][0]['@id'], 'https://rcaas.tech/#organization', path);
    assert.equal(graph['@graph'].filter(node => node['@id'] === 'https://rcaas.tech/#organization').length, 1, path);
  }
  const original = buildMarketingGraph('/');
  const contact = buildMarketingGraph('/contact/');
  assert.ok(contact['@graph'][0].contactPoint);
  contact['@graph'][0].address.addressLocality = 'Mutated test value';
  assert.deepEqual(buildMarketingGraph('/'), original);
});

test('FAQ structured data excludes unresolved placeholders across the site', () => {
  let questions = 0;
  for (const path of ROUTES) {
    for (const faq of buildMarketingGraph(path)['@graph'].filter(node => node['@type'] === 'FAQPage')) {
      for (const question of faq.mainEntity) {
        assert.ok(question.name?.trim(), path);
        assert.ok(question.acceptedAnswer?.text?.trim(), path);
        assert.doesNotMatch(question.acceptedAnswer.text, /\[\[/, path);
        questions++;
      }
    }
  }
  assert.ok(questions > 0);
});

test('blog and team discovery only expose approved publication records', () => {
  const hub = buildMarketingGraph('/blog/')['@graph'].find(node => node['@type'] === 'Blog');
  assert.equal(hub.blogPost.length, PUBLISHED_POSTS.length);
  const about = buildMarketingGraph('/about/')['@graph'];
  assert.deepEqual(about.filter(node => node['@type'] === 'Person').map(node => node['@id']), TEAM_MEMBERS.filter(isMemberPublished).map(personId));
});
