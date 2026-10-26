/**
 * A pretend hotel booking engine (2026-10-26), to show on this PC how a room
 * hotspot's Book now works with a hotel's own engine: its availability link
 * (engine.js) and the booking page the visitor is handed to. Not a hotel:
 * about every third night is taken. On in development, or with DEMO_ENGINE=1.
 *
 *   GET /api/demo-engine/availability?checkin=&checkout=&room=   { booked: [nights] }
 *   GET /api/demo-engine/book?checkin=&checkout=&guests=&room=   the booking page
 *
 * In the studio, a room hotspot's Availability link:
 *   /api/demo-engine/availability?checkin={checkin}&checkout={checkout}&room=deluxe
 * and its Booking page: <API>/api/demo-engine/book?checkin={checkin}&checkout={checkout}&guests={guests}&room=deluxe
 */
import { Router } from 'express';
import { demoBooked } from '../engine.js';

export const demoEngineRouter = Router();
demoEngineRouter.use((req, res, next) => { res.set('X-Robots-Tag', 'noindex'); next(); });

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`).slice(0, 80);
const params = (q) => new URLSearchParams(Object.entries(q).filter(([, v]) => typeof v === 'string'));

// Which nights of a stay are taken, in the format engine.js reads.
demoEngineRouter.get('/availability', (req, res) => res.json({ booked: demoBooked(params(req.query)) }));

// The page a visitor lands on from Book now, with what they chose filled in.
demoEngineRouter.get('/book', (req, res) => {
  const q = params(req.query);
  const taken = demoBooked(q);
  res.type('html').send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Demo booking engine</title>
<body style="font:16px/1.5 system-ui,sans-serif;max-width:520px;margin:48px auto;padding:0 16px;color:#18181b">
<p style="font:12px monospace;letter-spacing:.08em;text-transform:uppercase;color:#71717a">Demo booking engine · not a real hotel</p>
<h1 style="font-size:24px">${esc(q.get('room') || 'Room')}</h1>
<p>Check-in <b>${esc(q.get('checkin'))}</b>, check-out <b>${esc(q.get('checkout'))}</b>, ${esc(q.get('guests') || '1')} guest(s).</p>
<p>${taken.length ? `Taken on ${taken.map(esc).join(', ')}: a real engine would offer other dates here.` : 'Free for those nights: a real engine would take the booking and payment here.'}</p>
<p style="color:#71717a">A hotel's own engine opens here, with the dates the visitor picked in the 3D tour.</p>
</body>`);
});
