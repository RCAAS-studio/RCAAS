/** Start an isolated Next checkout with test-only routes, never a production fixture route. */
import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, mkdirSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const qa = path.resolve(root, 'qa-bug-hunt');
mkdirSync(qa, { recursive: true });
const scratch = mkdtempSync(path.join(qa, '.browser-fixture-'));
if (!scratch.startsWith(qa + path.sep)) throw new Error('Browser fixture must stay inside workspace QA storage');
for (const name of ['src', 'public', 'package.json', 'next.config.mts', 'tsconfig.json', 'next-env.d.ts']) {
  if (existsSync(path.join(root, name))) cpSync(path.join(root, name), path.join(scratch, name), { recursive: true });
}
symlinkSync(path.join(root, 'node_modules'), path.join(scratch, 'node_modules'), 'junction');
const fixture = path.join(scratch, 'src/app/browser-fixtures/studio');
mkdirSync(fixture, { recursive: true });
cpSync(path.join(root, 'test/browser/fixtures/StudioFixture.tsx'), path.join(fixture, 'page.tsx'));
writeFileSync(path.join(qa, 'browser-fixture-location.txt'), scratch);

const child = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', '3471'], {
  cwd: scratch,
  windowsHide: true,
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_DIST_DIR: '.next', NEXT_OUTPUT_EXPORT: '', NEXT_PUBLIC_BASE_PATH: '',
    NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3471', NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3471',
    API_INTERNAL_URL: 'http://127.0.0.1:39999',
    NEXT_PUBLIC_STUDIO_URL: '', NEXT_PUBLIC_TOURS_URL: '', NEXT_PUBLIC_SITES_DOMAIN: '',
  },
});
let stopping = false;
const stop = () => { if (!stopping) { stopping = true; child.kill(); } };
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
child.once('exit', code => {
  // Unlink the dependency junction before recursive cleanup. Never traverse it.
  try { unlinkSync(path.join(scratch, 'node_modules')); rmSync(scratch, { recursive: true, force: true }); }
  catch { console.warn('Browser fixture cleanup deferred:', scratch); }
  process.exitCode = stopping ? 0 : code ?? 1;
});
