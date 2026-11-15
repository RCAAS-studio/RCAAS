/**
 * Booking notices that failed for a passing reason (`retry` from notify.js or
 * mailer.js: busy, down, unreachable) are kept here, one file each under
 * DATA_DIR/outbox, and sent again by `retryOutbox` on the API's 30 s tick:
 * after 5 min, 15 min, 1 h and 3 h (5 tries), never later than 2 days after
 * the first. Each retry's result replaces the one shown on the booking
 * (`ref`: project, booking id, field and channel). A refusal (bad number,
 * key, unverified domain) is never queued: it waits for a person.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { DATA_DIR, writeFileWhole } from './dataDir.js';
import { sendSms, sendWhatsApp } from './notify.js';
import { sendMail } from './mailer.js';
import { withReservations } from './reservations.js';

const DIR = path.join(DATA_DIR, 'outbox');
const AFTER = [5, 15, 60, 180].map((m) => m * 60000);
const WITHIN = 2 * 86400000;
const SEND = { sms: (a) => sendSms(a.phone, a.text), whatsapp: (a) => sendWhatsApp(a.phone, a.text), email: (a) => sendMail(a) };

/** Keep one failed send to try again. `ref.key`: the channel's name inside
 *  the booking's field (sms, whatsapp, email), or null when the field is the result itself. */
export async function queueRetry(channel, args, result, ref, now = Date.now()) {
  if (!result || result.sent || !result.retry) return;
  await fs.mkdir(DIR, { recursive: true });
  const item = { id: randomUUID(), channel, args, ref, attempts: 1, createdAt: new Date(now).toISOString(), nextAt: new Date(now + AFTER[0]).toISOString() };
  await writeFileWhole(path.join(DIR, `${item.id}.json`), JSON.stringify(item));
}

/** Queue every failed channel of a textGuest() result. */
export async function queueTexts(texted, phone, text, ref) {
  for (const channel of ['sms', 'whatsapp']) await queueRetry(channel, { phone, text }, texted?.[channel], { ...ref, key: channel });
}

let running = false;
/** Send every due notice again; returns how many went this time. */
export async function retryOutbox(now = Date.now()) {
  if (running) return 0;
  running = true;
  try {
    let names;
    try { names = (await fs.readdir(DIR)).filter((n) => n.endsWith('.json')); } catch (e) { if (e.code === 'ENOENT') return 0; throw e; }
    let sent = 0;
    for (const name of names) {
      const file = path.join(DIR, name);
      const item = JSON.parse(await fs.readFile(file, 'utf8'));
      if (Date.parse(item.nextAt) > now) continue;
      if (now - Date.parse(item.createdAt) > WITHIN || !SEND[item.channel]) { await fs.rm(file, { force: true }); continue; }
      const r = await SEND[item.channel](item.args);
      const attempts = item.attempts + 1;
      const again = !r.sent && r.retry && attempts <= AFTER.length;
      const shown = { ...r, attempts, at: new Date(now).toISOString(), ...(again ? { nextAt: new Date(now + AFTER[attempts - 1]).toISOString() } : {}) };
      await withReservations(item.ref.pid, (list) => {
        const x = list.find((y) => y.id === item.ref.rid);
        if (!x) return;
        const { nextAt, ...field } = x[item.ref.field] ?? {}; // a finished retry drops the old "next try"
        x[item.ref.field] = item.ref.key ? { ...x[item.ref.field], [item.ref.key]: shown } : { ...field, ...shown };
      });
      if (again) await writeFileWhole(file, JSON.stringify({ ...item, attempts, nextAt: shown.nextAt }));
      else await fs.rm(file, { force: true });
      if (r.sent) sent += 1;
    }
    return sent;
  } finally { running = false; }
}
