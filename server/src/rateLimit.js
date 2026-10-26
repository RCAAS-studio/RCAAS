/**
 * Per-IP limits for the public routes (sign-in, enquiries, bookings, the
 * concierge, the visit beacon): `rateLimiter(max)` gives a check that is true
 * once an IP has called more than `max` times in the last 10 minutes.
 * Each IP keeps only its last max+1 times, and IPs gone quiet for a whole
 * window are dropped, so neither a flood from one address nor every address
 * that ever visited grows the API's memory.
 */
export function rateLimiter(max, windowMs = 10 * 60 * 1000) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [ip, list] of hits) if (now - list[list.length - 1] >= windowMs) hits.delete(ip);
  }, windowMs).unref();
  return function rateLimited(ip) {
    const now = Date.now();
    const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    list.push(now);
    if (list.length > max + 1) list.splice(0, list.length - max - 1);
    hits.set(ip, list);
    return list.length > max;
  };
}
