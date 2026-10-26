import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimiter } from '../src/rateLimit.js';

test('a rate limit lets max calls through per IP, keeps little, and forgets a window later', async () => {
  const limited = rateLimiter(3, 50);
  assert.deepEqual([1, 2, 3, 4].map(() => limited('a')), [false, false, false, true], 'the fourth in the window is refused');
  assert.equal(limited('b'), false, 'each IP counts on its own');
  for (let i = 0; i < 10000; i++) limited('a'); // a flood stays refused without piling up times
  assert.equal(limited('a'), true);
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(limited('a'), false, 'a window later it is let through again');
});
