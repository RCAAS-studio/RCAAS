/**
 * Public lead intake (CLAUDE.md §6.4). Hostile-facing by definition — no
 * auth, reachable from any embed — so: rate limit by IP, a honeypot field,
 * a submission-time check, a size cap per field, and nothing stored or
 * echoed back that could carry HTML.
 *
 * The rate limiter and the timing check are both in-memory: fine for one
 * process; a real deployment behind multiple instances needs a shared store
 * (Redis, or a column on the Postgres this is standing in for) — noted, not
 * built, since there's exactly one Node process today.
 */
import { Router } from 'express';
import { saveLead, listLeads, setLeadDelivery } from '../leadsStore.js';
import { requireAdmin } from '../middleware/auth.js';
import { getScene, getProperty } from '../store.js';
import { sendLeadEmail } from '../mailer.js';
import { cleanSource } from '../stats.js';
import { validPhone, validEmail, PHONE_WRONG } from '../notify.js';
import { rateLimiter } from '../rateLimit.js';

export const leadsRouter = Router();

const FIELD_LIMITS = { name: 100, phone: 30, email: 200, requirement: 200, dates: 100, message: 2000, hotspotId: 100, hotspotLabel: 120 };
const MIN_FILL_TIME_MS = 1200; // a bot fills the form instantly; a person doesn't

const rateLimited = rateLimiter(Number(process.env.LEADS_RATE_MAX) || 5); // per IP; tests raise it

/** No HTML in anything we store or ever render back. */
const clean = (s) => String(s ?? '').replace(/[<>]/g, '').trim();

/* A team email that failed for a passing reason (mailer.js `retry`) is sent
 * again by `retryLeadEmails`, run with the scheduled-publish tick: after 5 min,
 * 15 min, 1 h and 3 h, so 5 tries in all, and never for an enquiry over 2 days
 * old. Settings problems (no key, no recipients, an unverified domain) wait
 * for a person; the lead shows why. */
const RETRY_AFTER = [5, 15, 60, 180].map((m) => m * 60000);
const RETRY_WITHIN = 2 * 86400000;

async function emailLead(lead, tried, now = Date.now()) {
  const p = lead.propertyId ? await getProperty(lead.propertyId) : null;
  const r = await sendLeadEmail(lead, p?.leadEmails ?? [], p ? p.theme?.brand || p.title : '');
  const attempts = tried + 1;
  const again = !r.sent && r.retry && attempts <= RETRY_AFTER.length ? new Date(now + RETRY_AFTER[attempts - 1]).toISOString() : null;
  await setLeadDelivery(lead.id, { ...r, at: new Date(now).toISOString(), attempts, ...(again ? { nextAt: again } : {}) });
  return r.sent;
}

let retrying = false;
/** Send again every team email due a retry; returns how many went this time. */
export async function retryLeadEmails(now = Date.now()) {
  if (retrying) return 0;
  retrying = true;
  try {
    let sent = 0;
    for (const lead of await listLeads()) {
      const d = lead.delivery;
      if (!d || d.sent || !d.nextAt || Date.parse(d.nextAt) > now || now - Date.parse(lead.createdAt) > RETRY_WITHIN) continue;
      if (await emailLead(lead, d.attempts ?? 1, now)) sent += 1;
    }
    return sent;
  } finally { retrying = false; }
}

// An enquiry from a tour or website: filed with its project and emailed to its team (rate-limited).
leadsRouter.post('/', async (req, res, next) => {
  try {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    if (rateLimited(ip)) {
      return res.status(429).json({ error: 'Too many enquiries from this connection. Try again shortly.' });
    }

    const body = req.body || {};

    // Bot-catches fail SILENTLY (200, nothing stored) — telling an attacker
    // which check tripped just teaches them to route around it.
    if (clean(body.website)) return res.json({ ok: true });
    const renderedAt = Number(body.formRenderedAt);
    if (!renderedAt || Date.now() - renderedAt < MIN_FILL_TIME_MS) return res.json({ ok: true });

    if (!clean(body.name)) return res.status(400).json({ error: 'Name is required.' });
    // A phone, an email or both (a client website's form takes either in one box).
    if (!clean(body.phone) && !clean(body.email)) return res.status(400).json({ error: 'Add a phone number or email so we can reach you.' });
    for (const [field, max] of Object.entries(FIELD_LIMITS)) {
      if (clean(body[field]).length > max) {
        return res.status(400).json({ error: `${field} is too long — keep it under ${max} characters.` });
      }
    }
    if (clean(body.phone) && !validPhone(body.phone)) return res.status(400).json({ error: PHONE_WRONG });
    if (clean(body.email) && !validEmail(body.email)) return res.status(400).json({ error: 'That email address doesn’t look right.' });
    if (!body.sceneId) return res.status(400).json({ error: 'Missing which space this enquiry is about.' });

    // Which project it's for: the space's own (resolved here, never taken on
    // trust), or, from a project's hub page, that project if it exists.
    const sceneId = clean(body.sceneId);
    let propertyId = null;
    const scene = sceneId !== 'hub' ? await getScene(sceneId).catch(() => null) : null;
    if (scene) propertyId = scene.propertyId ?? null;
    else if (sceneId === 'hub' && typeof body.propertyId === 'string' && (await getProperty(body.propertyId))) propertyId = body.propertyId;
    // A project that switched enquiries off takes none, even from a page published before.
    if (propertyId && !(await getProperty(propertyId))?.features.enquiries) {
      return res.status(403).json({ error: 'This place doesn’t take enquiries here. Contact it directly.' });
    }

    const lead = await saveLead({
      propertyId,
      sceneId,
      sceneName: clean(body.sceneName),
      name: clean(body.name),
      phone: clean(body.phone),
      email: clean(body.email),
      requirement: clean(body.requirement),
      dates: clean(body.dates),
      message: clean(body.message),
      // what they were looking at before asking (the tour's last hotspot)
      hotspotId: clean(body.hotspotId),
      hotspotLabel: clean(body.hotspotLabel),
      // where the visitor came from (stats.js cleanSource): the report counts enquiries per source
      source: cleanSource(body.source),
      ip
    });

    res.json({ ok: true, id: lead.id });

    // Email after answering the visitor: a slow mail service never makes them
    // wait, and a failed send is recorded on the lead, not lost.
    emailLead(lead, 0).catch((err) => console.warn('[leads] email:', err.message));
  } catch (err) {
    next(err);
  }
});

// Every project's enquiries: admins only. A project's own are at
// /api/properties/:id/leads, for anyone who can see that project.
leadsRouter.get('/', requireAdmin, async (req, res, next) => {
  try {
    res.json(await listLeads());
  } catch (err) {
    next(err);
  }
});
