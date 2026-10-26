/**
 * Public visit beacons from the tour (stats.js). The tour sends them with
 * navigator.sendBeacon as text/plain — a beacon can't make the preflight a
 * JSON content type would need. Only published spaces count, and the project
 * is looked up here, never taken from the beacon. Rate-limited per IP so a
 * script can't inflate a client's numbers much.
 *
 *   POST /api/stats   { space, visit?: true, seconds?: number }
 *                     { space, hotspot: id, first?: true }   a hotspot opened (the first of the visit: first)
 *                     { space, intent: 'enquire' | 'book' | 'table' | 'room' | 'whatsapp' }   a card (or WhatsApp) opened, once per visit
 *                     visit: + src (where the visitor came from); seconds: + looked: { hotspotId: seconds in view }
 */
import { Router } from 'express';
import express from 'express';
import { getPublishedScene } from '../store.js';
import { count, INTENTS, cleanSource } from '../stats.js';
import { rateLimiter } from '../rateLimit.js';

export const statsRouter = Router();

const rateLimited = rateLimiter(Number(process.env.STATS_RATE_MAX) || 120); // per IP; tests raise it

// Tour beacon: counts visits, time per space, hotspot opens and booking intents. Totals only; always 204.
statsRouter.post('/', express.text({ type: () => true, limit: '2kb' }), async (req, res) => {
  try {
    // Always 204: a beacon doesn't read the answer, and a refusal shouldn't teach anyone anything.
    res.status(204).end();
    if (rateLimited(req.ip || req.socket?.remoteAddress || 'unknown')) return;
    let body;
    try { body = JSON.parse(typeof req.body === 'string' ? req.body : ''); } catch { return; }
    const space = typeof body?.space === 'string' && /^[a-z0-9-]+$/i.test(body.space) ? body.space : null;
    if (!space) return;
    const snap = await getPublishedScene(space).catch(() => null);
    if (!snap?.propertyId) return;
    // A hotspot must be one this published space has; its name comes from there, not the beacon.
    if (typeof body.hotspot === 'string') {
      const h = (snap.hotspots ?? []).find((x) => x.id === body.hotspot);
      if (h) await count(snap.propertyId, space, { hotspot: { id: h.id, label: String(h.label ?? '').slice(0, 80) || h.id }, first: body.first === true });
      return;
    }
    if (INTENTS.includes(body.intent)) return void (await count(snap.propertyId, space, { intent: body.intent }));
    const seconds = Math.max(0, Math.min(1800, Math.round(Number(body.seconds) || 0))); // at most 30 min per beacon
    // looked at: only this published space's hotspots, at most as long as the beacon's time
    const known = new Set((snap.hotspots ?? []).map((h) => h.id));
    const looked = Object.fromEntries(Object.entries(body.looked && typeof body.looked === 'object' ? body.looked : {})
      .filter(([id]) => known.has(id)).slice(0, 40)
      .map(([id, n]) => [id, Math.max(0, Math.min(seconds || 1800, Math.round(Number(n) || 0)))])
      .filter(([, n]) => n > 0));
    const anyLooked = Object.keys(looked).length > 0;
    if (body.visit !== true && !seconds && !anyLooked) return;
    await count(snap.propertyId, space, { visit: body.visit === true, seconds, source: cleanSource(body.src), looked: anyLooked ? looked : null });
  } catch (err) {
    console.warn('[stats]', err.message);
  }
});
