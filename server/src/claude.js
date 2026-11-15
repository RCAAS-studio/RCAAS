/**
 * One call to Claude (Anthropic's Messages API, Node's own fetch, no SDK) whose
 * answer is JSON in the shape of `schema` (structured outputs). The concierge,
 * hotspot translation and the studio's suggestions use it. Off until
 * ANTHROPIC_API_KEY is set in server/.env.
 *
 *   ANTHROPIC_API_KEY=sk-ant-...   from console.anthropic.com
 *   CLAUDE_MODEL=claude-opus-5-5   the default (claude-haiku-5-5 costs less)
 *
 * Claude Opus 5.5 refuses a forced tool (tool_choice "tool"), so the shape comes
 * from output_config.format. A safety decline is re-run server-side on the model
 * Anthropic recommends (fallbacks: "default", on the models that take it).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DATA_DIR, writeFileWhole } from './dataDir.js';
import { withWriteLock } from './writeQueue.js';
const API = () => process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com/v1/messages';
export const claudeOn = () => !!process.env.ANTHROPIC_API_KEY;

// Models that take `effort`, and those that take server-side fallbacks.
const EFFORT = /^claude-(fable|mythos|opus-5|opus-4-[678]|sonnet-5|haiku-5)/;
const FALLBACK = /^claude-(fable-5-1|opus-5-5|opus-5|sonnet-5-5)$/;

const fail = (message, status = 502) => Object.assign(new Error(message), { status });

/* Spend: every answer's tokens are counted per calendar month (UTC) in
 * DATA_DIR/ai-usage.json; with AI_MONTHLY_TOKENS set, calls stop (429) once
 * input + output tokens reach it, until the month turns. Unset: no cap. */
const USAGE = path.join(DATA_DIR, 'ai-usage.json');
const thisMonth = () => new Date().toISOString().slice(0, 7);
export async function aiUsage() {
  const fresh = { month: thisMonth(), calls: 0, inputTokens: 0, outputTokens: 0 };
  try {
    const u = JSON.parse(await fs.readFile(USAGE, 'utf8'));
    return { ...(u?.month === fresh.month ? u : fresh), limit: Number(process.env.AI_MONTHLY_TOKENS) || null };
  } catch (e) { if (e.code === 'ENOENT') return { ...fresh, limit: Number(process.env.AI_MONTHLY_TOKENS) || null }; throw e; }
}
const countUsage = (usage) => withWriteLock('ai-usage', async () => {
  const u = await aiUsage();
  await writeFileWhole(USAGE, JSON.stringify({ month: u.month, calls: u.calls + 1, inputTokens: u.inputTokens + (usage?.input_tokens ?? 0), outputTokens: u.outputTokens + (usage?.output_tokens ?? 0) }));
});

/**
 * `content`: the user turn (a string, or blocks with images); `history`: earlier
 * turns. Resolves the parsed JSON; throws (status 502) when Claude can't answer.
 */
export async function askJson({ system, content, history = [], schema, model, effort = 'low', maxTokens = 4000, timeout = 30000 }) {
  const m = model || process.env.CLAUDE_MODEL || 'claude-opus-5-5';
  const headers = { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' };
  if (FALLBACK.test(m)) headers['anthropic-beta'] = 'server-side-fallback-2026-07-01';
  const spent = await aiUsage();
  if (spent.limit && spent.inputTokens + spent.outputTokens >= spent.limit) throw fail('This month’s Claude budget is used up. It starts again next month, or an admin can raise AI_MONTHLY_TOKENS.', 429);
  let r;
  try {
    r = await fetch(API(), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: m,
        max_tokens: maxTokens,
        system,
        ...(FALLBACK.test(m) ? { fallbacks: 'default' } : {}),
        output_config: { ...(EFFORT.test(m) ? { effort } : {}), format: { type: 'json_schema', schema } },
        messages: [...history, { role: 'user', content }]
      }),
      signal: AbortSignal.timeout(timeout)
    });
  } catch {
    throw fail('Claude didn’t answer.');
  }
  if (!r.ok) {
    console.warn('[claude] the API said', r.status, (await r.text().catch(() => '')).slice(0, 300));
    throw fail('Claude couldn’t answer just now.');
  }
  const msg = await r.json();
  await countUsage(msg.usage);
  if (msg.stop_reason === 'refusal') throw fail('Claude declined that.');
  try {
    return JSON.parse(msg.content?.find((c) => c.type === 'text')?.text ?? '');
  } catch {
    throw fail('Claude’s answer was cut short.');
  }
}
