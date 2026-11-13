import { AsyncLocalStorage } from 'node:async_hooks';

// Read/modify/write operations must share a queue, not just atomic file writes.
// These queues coordinate one API process; run a single file-store API worker.
const queues = new Map();
const context = new AsyncLocalStorage();

export function withWriteLock(key, change) {
  if (context.getStore()?.get(key)?.active) return Promise.resolve().then(change);
  const run = (queues.get(key) ?? Promise.resolve()).then(async () => {
    const held = new Map(context.getStore());
    const token = { active: true };
    held.set(key, token);
    try { return await context.run(held, change); }
    finally { token.active = false; }
  });
  const tail = run.catch(() => {});
  queues.set(key, tail);
  void tail.then(() => { if (queues.get(key) === tail) queues.delete(key); });
  return run;
}

export const serialized = (key, change) => (...args) => withWriteLock(typeof key === 'function' ? key(...args) : key, () => change(...args));
