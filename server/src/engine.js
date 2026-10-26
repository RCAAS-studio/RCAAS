/**
 * A hotel's own booking engine, asked which nights a room is taken
 * (2026-10-26). A room hotspot can name an availability link
 * (payload.availabilityUrl) with {checkin} {checkout} {guests} {nights}
 * filled in, which answers JSON:
 *   { "booked": ["2026-11-02", …] }   the nights taken, or
 *   { "available": false }            every night of the stay taken.
 * Engines differ, so a real one needs a small adapter that answers this. The
 * demo engine (`/api/demo-engine/…`, routes/demoEngine.js) does, for showing
 * it on this PC. Answers are kept a minute. Anything wrong (down, slow, not
 * JSON) means "don't know": nothing is struck out, and the hotel's own page
 * has the last word.
 */
import { nightsOf } from './stays.js';

const day = (d) => Math.floor(Date.parse(`${d}T12:00:00Z`) / 86400000);
const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** The demo engine's calendar: about every third night taken, the same each time, different per room. */
export function demoBooked(params) {
  const checkin = params.get('checkin') ?? '', checkout = params.get('checkout') ?? '';
  const salt = hash(params.get('room') ?? '');
  return nightsOf(checkin, checkout).filter((n) => (day(n) + salt) % 3 === 0);
}

const cache = new Map(); // filled-in link -> { at, booked }
// ponytail: names, not resolved addresses; a hostname pointing at a private address still passes. Resolve first if links come from strangers.
const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[)/i;

/** The nights of a stay the engine says are taken, or null when it can't say. */
export async function engineBooked(template, stay) {
  if (typeof template !== 'string' || !template.trim()) return null;
  const nights = nightsOf(stay.checkin, stay.checkout);
  if (!nights.length) return [];
  const values = { checkin: stay.checkin, checkout: stay.checkout, guests: String(stay.guests ?? ''), nights: String(nights.length) };
  const url = template.trim().replace(/\{(checkin|checkout|guests|nights)\}/g, (_, k) => encodeURIComponent(values[k]));
  if (url.startsWith('/api/demo-engine/')) return demoBooked(new URL(url, 'http://demo').searchParams);

  let u;
  try { u = new URL(url); } catch { return null; }
  const dev = process.env.NODE_ENV !== 'production';
  if (!(u.protocol === 'https:' || (dev && u.protocol === 'http:')) || (!dev && PRIVATE_HOST.test(u.hostname))) return null;
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < 60000) return hit.booked;
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(4000), redirect: 'error', headers: { accept: 'application/json' } });
    if (!r.ok) return null;
    const body = await r.text();
    if (body.length > 65536) return null;
    const j = JSON.parse(body);
    const booked = j?.available === false ? nights
      : Array.isArray(j?.booked) ? j.booked.filter((d) => typeof d === 'string' && nights.includes(d)) : null;
    if (booked) {
      if (cache.size > 500) cache.clear();
      cache.set(url, { at: Date.now(), booked });
    }
    return booked;
  } catch {
    return null;
  }
}
