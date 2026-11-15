import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const data = await mkdtemp(path.join(os.tmpdir(), 'rcaas-ai-budget-'));
Object.assign(process.env, { DATA_DIR: data, ANTHROPIC_API_KEY: 'fixture', ANTHROPIC_API_URL: 'http://claude.test/v1/messages', AI_MONTHLY_TOKENS: '1000' });
const { askJson, aiUsage } = await import('../src/claude.js');

test('Claude tokens are counted per month and calls stop at AI_MONTHLY_TOKENS', async t => {
  t.after(() => rm(data, { recursive: true, force: true }));
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; return new Response(JSON.stringify({ stop_reason: 'end_turn', usage: { input_tokens: 400, output_tokens: 200 }, content: [{ type: 'text', text: '{"ok":true}' }] }), { status: 200 }); });
  const ask = () => askJson({ system: 's', content: 'hi', schema: { type: 'object' } });
  assert.deepEqual(await ask(), { ok: true });
  let u = await aiUsage();
  assert.deepEqual([u.calls, u.inputTokens, u.outputTokens, u.limit, u.month], [1, 400, 200, 1000, new Date().toISOString().slice(0, 7)]);
  await ask(); // 1,200 tokens now: over the budget after this answer
  await assert.rejects(ask(), (e) => e.status === 429 && /budget is used up/.test(e.message));
  assert.equal(calls, 2, 'no request is sent once the budget is spent');
  delete process.env.AI_MONTHLY_TOKENS;
  await ask();
  u = await aiUsage();
  assert.deepEqual([u.calls, u.limit], [3, null], 'unset: no cap, still counted');
});
