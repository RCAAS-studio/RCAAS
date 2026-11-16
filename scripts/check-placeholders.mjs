#!/usr/bin/env node
/**
 * Publication gate: fail when an indexable page still carries an editorial placeholder.
 *
 * The marketing copy marks unconfirmed facts as [[TBI: ...]] (to be input) or [[TBC: ...]] (to be confirmed).
 * They may stay on draft pages (those are noindex), but never on a page search engines are allowed to index.
 *
 * It scans the HTML that the build actually produced, so it covers visible copy, the title, description and
 * social tags, and any JSON-LD that is rendered into the page, with no list of routes to keep in step:
 *   - Node build:   <distDir>/server/app/**.html   (distDir = NEXT_DIST_DIR or .next)
 *   - Static export: out/**.html                    (when NEXT_OUTPUT_EXPORT=1, as the GitHub Pages workflow sets)
 *
 * Usage: node scripts/check-placeholders.mjs [directory ...]
 * A page whose robots meta says noindex is skipped. Exit 1 on any hit, 2 when there is nothing to scan.
 */
import fs from 'node:fs';
import path from 'node:path';

const MARKER = /\[\[\s*TB[IC]\b[^\]]*\]\]|\[\[\s*TB[IC]\s*\]\]/g;
const NOINDEX = /<meta\s+name="robots"\s+content="[^"]*noindex[^"]*"/i;

function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

export function scanHtml(html) {
  if (NOINDEX.test(html)) return { indexable: false, hits: [] };
  const hits = [...html.matchAll(MARKER)].map((m) => m[0].replace(/\s+/g, ' ').slice(0, 120));
  return { indexable: true, hits: [...new Set(hits)] };
}

export function scanDirs(dirs) {
  const failures = [];
  let pages = 0;
  let indexable = 0;
  for (const dir of dirs) {
    for (const file of htmlFiles(dir)) {
      pages++;
      const { indexable: isIndexable, hits } = scanHtml(fs.readFileSync(file, 'utf8'));
      if (isIndexable) indexable++;
      if (hits.length) failures.push({ file: path.relative(process.cwd(), file), hits });
    }
  }
  return { pages, indexable, failures };
}

function defaultDirs() {
  if (process.env.NEXT_OUTPUT_EXPORT === '1') return ['out'];
  return [path.join(process.env.NEXT_DIST_DIR || '.next', 'server', 'app')];
}

if (process.argv[1]?.endsWith('check-placeholders.mjs')) {
  const dirs = (process.argv.length > 2 ? process.argv.slice(2) : defaultDirs()).filter((d) => fs.existsSync(d));
  if (!dirs.length) {
    console.error('check-placeholders: no build output to scan. Run it after `npm run build`.');
    process.exit(2);
  }
  const { pages, indexable, failures } = scanDirs(dirs);
  if (!pages) {
    console.error('check-placeholders: no HTML pages found in the supplied build output.');
    process.exit(2);
  }
  if (failures.length) {
    console.error(`check-placeholders: ${failures.length} indexable page(s) still show editorial placeholders:\n`);
    for (const f of failures) {
      console.error(`  ${f.file}`);
      for (const h of f.hits) console.error(`    ${h}`);
    }
    console.error('\nResolve the copy, or mark the page draft (noindex) until it is approved.');
    process.exit(1);
  }
  console.log(`check-placeholders: ${indexable} indexable of ${pages} pages scanned, no unresolved placeholders.`);
}
