import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';

// images.ts imports without extensions, as Next resolves them
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && context.parentURL?.includes('/src/')) {
    const ts = new URL(`${specifier}.ts`, context.parentURL);
    if (existsSync(ts)) return next(ts.href, context);
  }
  return next(specifier, context);
} });
const { IMG, srcSetFor } = await import('../src/features/marketing/data/images.ts');

test('every site photo has its phone and tablet copies on disk (rerun scripts/image-variants.mjs after adding one)', () => {
  const missing = [];
  for (const src of Object.values(IMG)) {
    if (!/\.(webp|jpe?g|png)$/i.test(src)) continue;
    const set = srcSetFor(src);
    if (!set) { missing.push(`${src}: no width recorded`); continue; }
    for (const entry of set.split(', ')) { const file = `public${entry.split(' ')[0]}`; if (!existsSync(file)) missing.push(file); }
  }
  assert.deepEqual(missing, []);
  assert.equal(srcSetFor('/logo.png'), undefined, 'logos and other files keep a plain src');
  assert.match(srcSetFor(IMG['home/industry-education']), /-640w\.webp 640w, .*-960w\.webp 960w, .*industry-education\.webp 1080w$/);
});
