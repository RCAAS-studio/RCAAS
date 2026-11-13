import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORY_FORMATS, nextStoryTab, storytellingEnquiry, storytellingFormat } from '../src/features/marketing/content/storytelling.ts';

test('every service format survives the enquiry URL and only known formats can prefill the form', () => {
  assert.equal(new Set(STORY_FORMATS.map(item => item.id)).size, 5);
  for (const format of STORY_FORMATS) {
    const url = new URL(storytellingEnquiry(format.id), 'https://rcaas.test');
    assert.equal(url.pathname, '/contact/');
    assert.equal(url.searchParams.get('type'), 'storytelling');
    assert.equal(storytellingFormat(url.searchParams.get('format')), format);
    assert.equal(url.hash, '#form');
  }
  assert.equal(storytellingFormat(null), undefined);
  assert.equal(storytellingFormat('unknown<script>'), undefined);
  assert.equal(storytellingFormat('constructor'), undefined);
  assert.equal(new URL(storytellingEnquiry(), 'https://rcaas.test').searchParams.has('format'), false);
});

test('storytelling tabs wrap, support endpoints, and leave ordinary keys alone', () => {
  assert.equal(nextStoryTab('ArrowRight', 4, 5), 0);
  assert.equal(nextStoryTab('ArrowLeft', 0, 5), 4);
  assert.equal(nextStoryTab('Home', 3, 5), 0);
  assert.equal(nextStoryTab('End', 1, 5), 4);
  assert.equal(nextStoryTab('Tab', 1, 5), null);
  assert.equal(nextStoryTab('Escape', 1, 5), null);
  assert.equal(nextStoryTab('ArrowRight', 0, 1), 0);
});
