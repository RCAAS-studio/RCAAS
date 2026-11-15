import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const data = await mkdtemp(path.join(os.tmpdir(), 'rcaas-lead-retry-'));
Object.assign(process.env, { DATA_DIR: data, RESEND_API_KEY: 'fixture-key', LEADS_TO: 'team@example.test', LEADS_FROM: 'RCAAS <notify@example.test>' });
const { saveLead, setLeadDelivery, listLeads } = await import('../src/leadsStore.js');
const { retryLeadEmails } = await import('../src/routes/leads.js');
const MIN = 60000;

test('team emails that failed for a passing reason are sent again on schedule, and only those', async t => {
  t.after(() => rm(data, { recursive: true, force: true }));
  let status = 503, calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; return new Response(JSON.stringify({ message: 'busy' }), { status }); });
  const now = Date.now();
  const lead = await saveLead({ name: 'Retry guest', phone: '9800000000', email: '', propertyId: null, sceneId: 'hub' });
  await setLeadDelivery(lead.id, { sent: false, retry: true, reason: 'The email service said 503', attempts: 1, nextAt: new Date(now - 1000).toISOString() });
  const settings = await saveLead({ name: 'Key problem', phone: '9800000001', email: '', propertyId: null, sceneId: 'hub' });
  await setLeadDelivery(settings.id, { sent: false, reason: 'Resend refused the key (RESEND_API_KEY)', attempts: 1 });
  const delivery = async id => (await listLeads()).find(l => l.id === id).delivery;

  assert.equal(await retryLeadEmails(now), 0);
  assert.equal(calls, 1, 'only the passing failure is tried; a settings problem waits for a person');
  let d = await delivery(lead.id);
  assert.deepEqual([d.sent, d.attempts, d.nextAt], [false, 2, new Date(now + 15 * MIN).toISOString()]);
  assert.equal(await retryLeadEmails(now + 10 * MIN), 0); assert.equal(calls, 1, 'not before it is due');

  status = 200;
  assert.equal(await retryLeadEmails(now + 16 * MIN), 1);
  d = await delivery(lead.id);
  assert.equal(d.sent, true); assert.equal(d.attempts, 3); assert.equal(d.nextAt, undefined);
  assert.equal(await retryLeadEmails(now + 600 * MIN), 0); assert.equal(calls, 2, 'a sent email is never sent twice');

  status = 503;
  const stubborn = await saveLead({ name: 'Always down', phone: '9800000002', email: '', propertyId: null, sceneId: 'hub' });
  await setLeadDelivery(stubborn.id, { sent: false, retry: true, attempts: 4, nextAt: new Date(now).toISOString() });
  await retryLeadEmails(now);
  d = await delivery(stubborn.id);
  assert.deepEqual([d.attempts, d.nextAt], [5, undefined], 'five tries, then it waits for a person');

  const old = await saveLead({ name: 'Old', phone: '9800000003', email: '', propertyId: null, sceneId: 'hub' });
  await setLeadDelivery(old.id, { sent: false, retry: true, attempts: 1, nextAt: new Date(now).toISOString() });
  calls = 0;
  assert.equal(await retryLeadEmails(now + 3 * 86400000), 0);
  assert.equal(calls, 0, 'an enquiry over two days old is not emailed late');
});
