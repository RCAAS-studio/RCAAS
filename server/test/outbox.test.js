import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const data = await mkdtemp(path.join(os.tmpdir(), 'rcaas-outbox-'));
Object.assign(process.env, { DATA_DIR: data, SMS_TOKEN: 'fixture', SMS_FROM: 'RCAAS', WHATSAPP_TOKEN: '', RESEND_API_KEY: 'fixture', LEADS_FROM: 'RCAAS <n@example.test>' });
const { queueRetry, queueTexts, retryOutbox } = await import('../src/outbox.js');
const { withReservations } = await import('../src/reservations.js');
const MIN = 60000;

test('booking notices that failed for a passing reason are retried and the booking shows the latest result', async t => {
  t.after(() => rm(data, { recursive: true, force: true }));
  let status = 503, calls = [];
  t.mock.method(globalThis, 'fetch', async (url) => { calls.push(String(url)); return new Response('{}', { status }); });
  await withReservations('hotel', (list) => { list.push({ id: 'b1', name: 'Guest', guestDelivery: { sent: false, reason: 'down', sms: { sent: false, reason: 'down', retry: true } } }); });
  const ref = { pid: 'hotel', rid: 'b1', field: 'guestDelivery' };
  const now = Date.now();
  await queueTexts({ sms: { sent: false, retry: true, reason: 'the service said 503' } }, '9800000000', 'Your table is confirmed.', ref, now);
  await queueRetry('email', { to: ['g@example.test'], subject: 'Confirmed', text: 'Hello' }, { sent: false, retry: true, reason: 'busy' }, { ...ref, key: null }, now);
  await queueRetry('email', { to: ['g@example.test'], subject: 'x', text: 'x' }, { sent: false, reason: 'Resend refused the key (RESEND_API_KEY)' }, { ...ref, key: null }, now);
  assert.equal((await readdir(path.join(data, 'outbox'))).length, 2, 'a refusal is never queued');

  assert.equal(await retryOutbox(now + MIN), 0); assert.equal(calls.length, 0, 'not before 5 minutes');
  assert.equal(await retryOutbox(now + 6 * MIN), 0); assert.equal(calls.length, 2);
  let b = await withReservations('hotel', (list) => list.find((x) => x.id === 'b1'));
  assert.equal(b.guestDelivery.sms.attempts, 2); assert.ok(b.guestDelivery.sms.nextAt); assert.equal(b.guestDelivery.attempts, 2);

  status = 200;
  assert.equal(await retryOutbox(now + 6 * MIN + 16 * MIN), 2);
  b = await withReservations('hotel', (list) => list.find((x) => x.id === 'b1'));
  assert.equal(b.guestDelivery.sms.sent, true); assert.equal(b.guestDelivery.sent, true); assert.equal(b.guestDelivery.nextAt, undefined);
  assert.deepEqual(await readdir(path.join(data, 'outbox')), [], 'sent notices leave the outbox');

  status = 503; calls = [];
  await queueTexts({ sms: { sent: false, retry: true } }, '9800000000', 'Late', ref, now);
  assert.equal(await retryOutbox(now + 3 * 86400000), 0);
  assert.equal(calls.length, 0, 'never sent more than 2 days late');
  assert.deepEqual(await readdir(path.join(data, 'outbox')), []);
});
