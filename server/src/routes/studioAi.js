/**
 * Claude in the studio (2026-10-13), for a space the session may edit:
 *
 *   POST /api/scenes/:id/translate  { items: [{ id, label, text?, caption? }] }
 *        -> { items: [{ id, ne: {...}, zh: {...} }] }   hotspot words in Nepali and Chinese
 *   POST /api/scenes/:id/suggest    { image: 'data:image/jpeg;base64,…' }
 *        -> { title, tagline, hotspots: [{ label, text, x, y }] }   from what the view shows
 *
 * The studio sends what it holds (unsaved edits included) and keeps the
 * answer for the author to check: nothing is saved here. Both answer 404 until
 * ANTHROPIC_API_KEY is set (../claude.js).
 */
import { Router } from 'express';
import { requireEditorSession } from '../middleware/auth.js';
import { sceneGuard } from '../access.js';
import { getScene, getProperty } from '../store.js';
import { askJson, claudeOn } from '../claude.js';

export const studioAiRouter = Router();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const OFF = { error: 'Claude isn’t switched on: set ANTHROPIC_API_KEY in server/.env and restart the API.' };
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const WORDS = {
  type: 'object',
  additionalProperties: false,
  required: ['label'],
  properties: { label: { type: 'string' }, text: { type: 'string' }, caption: { type: 'string' } }
};
const TRANSLATED = {
  type: 'object',
  additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, required: ['id', 'ne', 'zh'], properties: { id: { type: 'string' }, ne: WORDS, zh: WORDS } }
    }
  }
};

/** Only the fields that were sent, each trimmed: what the tour shows in that language. */
const cleanWords = (w, sent) => Object.fromEntries(['label', 'text', 'caption']
  .filter((k) => sent[k] && typeof w?.[k] === 'string' && w[k].trim())
  .map((k) => [k, w[k].trim().slice(0, k === 'label' ? 120 : 4000)]));

// Hotspot names and texts in Nepali and Simplified Chinese, for the author to check and save.
studioAiRouter.post('/:id/translate', requireEditorSession, sceneGuard, wrap(async (req, res) => {
  if (!claudeOn()) return res.status(404).json(OFF);
  const items = (Array.isArray(req.body?.items) ? req.body.items : []).slice(0, 150)
    .map((x) => ({ id: str(x?.id, 100), label: str(x?.label, 120), text: str(x?.text, 4000), caption: str(x?.caption, 1000) }))
    .filter((x) => x.id && x.label);
  if (!items.length) return res.status(400).json({ error: 'There is nothing to translate yet: give the hotspots names first.' });
  const out = await askJson({
    system: [
      'You translate the words a visitor reads in a venue’s 3D virtual tour (hotels, restaurants, colleges, heritage sites in Nepal).',
      'Give each item in Nepali (Devanagari script) and in Simplified Chinese, in a warm, natural hospitality tone.',
      'Keep names of the venue, places, brands, dishes and people as they are, or in the usual local spelling. Keep numbers, prices, times and phone numbers exactly.',
      'Translate only the fields each item has, and return every item with its id.'
    ].join('\n'),
    content: JSON.stringify(items.map(({ id, label, text, caption }) => ({ id, label, ...(text ? { text } : {}), ...(caption ? { caption } : {}) }))),
    schema: TRANSLATED,
    maxTokens: 32000,
    timeout: 180000
  }).catch((err) => { res.status(err.status || 502).json({ error: err.message }); return null; });
  if (!out) return;
  const sent = new Map(items.map((x) => [x.id, x]));
  res.json({
    items: (out.items ?? []).filter((x) => sent.has(x.id)).map((x) => ({
      id: x.id, ne: cleanWords(x.ne, sent.get(x.id)), zh: cleanWords(x.zh, sent.get(x.id))
    }))
  });
}));

const SUGGESTED = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'tagline', 'hotspots'],
  properties: {
    title: { type: 'string' },
    tagline: { type: 'string' },
    hotspots: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'text', 'x', 'y'],
        properties: { label: { type: 'string' }, text: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' } }
      }
    }
  }
};
const IMAGE = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/;
const clamp01 = (n) => Math.min(0.98, Math.max(0.02, Number.isFinite(Number(n)) ? Number(n) : 0.5));

// Hotspots worth adding, from a picture of the studio's current view (the author picks which to keep).
studioAiRouter.post('/:id/suggest', requireEditorSession, sceneGuard, wrap(async (req, res) => {
  if (!claudeOn()) return res.status(404).json(OFF);
  const m = IMAGE.exec(typeof req.body?.image === 'string' ? req.body.image : '');
  if (!m) return res.status(400).json({ error: 'Send the view as a JPEG, PNG or WebP picture.' });
  const doc = await getScene(req.params.id);
  const p = doc?.propertyId ? await getProperty(doc.propertyId) : null;
  const out = await askJson({
    system: [
      `This is a view inside "${doc?.title || req.params.id}"${p ? `, a space of ${p.theme?.brand || p.title}` : ''}, in a 3D virtual tour that visitors walk through.`,
      'Suggest up to 6 hotspots worth adding: things in this picture a visitor would want to know about (a feature, a facility, furniture, art, a view, a doorway to another area).',
      'For each: a label of 2 to 4 words, a text of one or two short sentences about what can be seen, and x, y: where it is in the picture as fractions of its width and height (0, 0 is the top left).',
      'Never invent facts you can’t see: no prices, opening hours, names, dates or history. For those, say what the visitor can ask about instead.',
      'Also give the space a short title and a one-line tagline from what it shows.'
    ].join('\n'),
    content: [
      { type: 'image', source: { type: 'base64', media_type: `image/${m[1]}`, data: m[2] } },
      { type: 'text', text: 'Suggest the hotspots for this view.' }
    ],
    schema: SUGGESTED,
    effort: 'medium',
    maxTokens: 8000,
    timeout: 90000
  }).catch((err) => { res.status(err.status || 502).json({ error: err.message }); return null; });
  if (!out) return;
  res.json({
    title: str(out.title, 80),
    tagline: str(out.tagline, 160),
    hotspots: (out.hotspots ?? []).slice(0, 8)
      .map((h) => ({ label: str(h?.label, 60), text: str(h?.text, 600), x: clamp01(h?.x), y: clamp01(h?.y) }))
      .filter((h) => h.label)
  });
}));
