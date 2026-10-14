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
const API = () => process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com/v1/messages';
export const claudeOn = () => !!process.env.ANTHROPIC_API_KEY;

// Models that take `effort`, and those that take server-side fallbacks.
const EFFORT = /^claude-(fable|mythos|opus-5|opus-4-[678]|sonnet-5|haiku-5)/;
const FALLBACK = /^claude-(fable-5-1|opus-5-5|opus-5|sonnet-5-5)$/;

const fail = (message, status = 502) => Object.assign(new Error(message), { status });

/**
 * `content`: the user turn (a string, or blocks with images); `history`: earlier
 * turns. Resolves the parsed JSON; throws (status 502) when Claude can't answer.
 */
export async function askJson({ system, content, history = [], schema, model, effort = 'low', maxTokens = 4000, timeout = 30000 }) {
  const m = model || process.env.CLAUDE_MODEL || 'claude-opus-5-5';
  const headers = { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' };
  if (FALLBACK.test(m)) headers['anthropic-beta'] = 'server-side-fallback-2026-07-01';
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
  if (msg.stop_reason === 'refusal') throw fail('Claude declined that.');
  try {
    return JSON.parse(msg.content?.find((c) => c.type === 'text')?.text ?? '');
  } catch {
    throw fail('Claude’s answer was cut short.');
  }
}
