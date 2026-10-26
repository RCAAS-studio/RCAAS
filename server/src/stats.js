/**
 * Visit counts for the monthly client report (2026-09-27). Totals only: no
 * cookies, no IPs, nothing about a person — per project, per month, per
 * space: how many visits, how many seconds, and visits per day. One small
 * file per project-month under data/stats/ (gitignored). Writes to one file
 * are queued, so beacons arriving together can't lose each other's counts.
 *
 * The path to a booking (2026-09-28), totals too: how often each hotspot was
 * opened, how many visits opened any hotspot ("engaged"), and how many
 * opened each booking or enquiry card ("intent"). Enquiries and booking
 * requests themselves are counted from what was saved, not from here.
 *
 * Where visitors came from (2026-10-13): each visit's source (a ?src= or
 * utm_source on the link, else the site that linked to it, else "direct"), and
 * how long each hotspot was in the middle of the view ("looked at"), per space. */
const MAX_SOURCES = 40; // a month keeps at most this many names; the rest count as "other"
export const INTENTS = ['enquire', 'book', 'table', 'room', 'whatsapp', 'event', 'handoff'];
import { promises as fs } from 'fs';
import path from 'path';
import { DATA_DIR, writeFileWhole } from './dataDir.js';

const DIR = path.join(DATA_DIR, 'stats');
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const monthOf = (d = new Date()) => d.toISOString().slice(0, 7);
const fileFor = (propertyId, month) => path.join(DIR, propertyId, `${month}.json`);

const empty = () => ({ visits: 0, seconds: 0, days: {}, spaces: {}, engaged: 0, intent: {}, hotspots: {}, sources: {}, looked: {} });

// A site that links from several hosts counts as one source (l.facebook.com, m.facebook.com…).
const KNOWN = [
  ['facebook', /(^|.)(facebook.com|fb.me|fb.com)$/], ['instagram', /(^|.)instagram.com$/], ['google', /(^|.)google.[a-z.]+$/],
  ['whatsapp', /(^|.)whatsapp.(com|net)$/], ['youtube', /(^|.)(youtube.com|youtu.be)$/], ['tiktok', /(^|.)tiktok.com$/],
  ['linkedin', /(^|.)(linkedin.com|lnkd.in)$/], ['x', /(^|.)(t.co|x.com|twitter.com)$/], ['bing', /(^|.)bing.com$/]
];

/** "Facebook", "www.google.com", "utm source" -> facebook, google, utm-source; nonsense -> null. */
export function cleanSource(v) {
  if (typeof v !== 'string') return null;
  const s = v.trim().toLowerCase().replace(/^www\./, '').replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return KNOWN.find(([, re]) => re.test(s))?.[0] ?? (s || null);
}

async function read(propertyId, month) {
  try {
    return JSON.parse(await fs.readFile(fileFor(propertyId, month), 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return empty();
    throw err;
  }
}

const queues = new Map();
function queued(key, fn) {
  const run = (queues.get(key) ?? Promise.resolve()).then(fn, fn);
  queues.set(key, run.catch(() => {}));
  return run;
}

/** One visit to a space (with its `source`), or `seconds` more spent in it and
 *  `looked` ({ hotspotId: seconds }); or a hotspot opened (`hotspot`: { id, label },
 *  `first` for a visit's first), or a card opened (`intent`: one of INTENTS). */
export function count(propertyId, sceneId, { visit = false, seconds = 0, hotspot = null, first = false, intent = null, source = null, looked = null }) {
  const month = monthOf();
  return queued(`${propertyId}/${month}`, async () => {
    const s = { ...empty(), ...(await read(propertyId, month)) };
    if (hotspot) {
      const bySpace = (s.hotspots[sceneId] ??= {});
      const h = (bySpace[hotspot.id] ??= { opens: 0, label: '' });
      h.opens += 1;
      h.label = hotspot.label;
      if (first) s.engaged += 1;
    }
    if (intent) s.intent[intent] = (s.intent[intent] ?? 0) + 1;
    const sp = (s.spaces[sceneId] ??= { visits: 0, seconds: 0 });
    if (visit) {
      s.visits += 1;
      sp.visits += 1;
      const day = new Date().toISOString().slice(0, 10);
      s.days[day] = (s.days[day] ?? 0) + 1;
      const src = source ?? 'direct';
      const key = src in s.sources || Object.keys(s.sources).length < MAX_SOURCES ? src : 'other';
      s.sources[key] = (s.sources[key] ?? 0) + 1;
    }
    if (looked) {
      const bySpace = (s.looked[sceneId] ??= {});
      for (const [id, secs] of Object.entries(looked)) bySpace[id] = (bySpace[id] ?? 0) + secs;
    }
    if (seconds > 0) {
      s.seconds += seconds;
      sp.seconds += seconds;
    }
    await fs.mkdir(path.dirname(fileFor(propertyId, month)), { recursive: true });
    await writeFileWhole(fileFor(propertyId, month), JSON.stringify(s));
  });
}

export async function monthStats(propertyId, month) {
  if (!MONTH.test(month)) return null;
  return { ...empty(), ...(await read(propertyId, month)) };
}

export { MONTH, monthOf };
