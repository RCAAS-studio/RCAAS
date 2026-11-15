/** Real browser verification against a production frontend and disposable API.
 * Usage: node scripts/critical-studio-runtime.mjs <scene.json> <asset-root>
 * Inputs are read-only; only the referenced capture is copied. Never uses a live DB.
 */
import { spawn, execFileSync } from 'node:child_process';
import { cpSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, symlinkSync, readdirSync, unlinkSync, rmSync, existsSync, lstatSync, rmdirSync } from 'node:fs';
import { randomBytes, createHash } from 'node:crypto';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';

if (!process.argv[2] || !process.argv[3]) throw Error('Provide a real source scene JSON and its local asset root. Inputs are copied read-only into disposable QA storage.');
const root = process.cwd(), qa = path.resolve(root, 'qa-bug-hunt');
const sourceScenePath = path.resolve(process.argv[2]), assetRoot = path.resolve(process.argv[3]);
const sourceSceneBytes = readFileSync(sourceScenePath), sourceScene = JSON.parse(sourceSceneBytes);
const originalAssetId = sourceScene.splat?.variants?.high?.assetId;
if (!/^ast_[a-zA-Z0-9_-]+$/.test(originalAssetId ?? '')) throw Error('A genuine uploaded capture asset ID is required.');
const sourceAsset = path.resolve(assetRoot, originalAssetId);
if (!sourceAsset.startsWith(assetRoot + path.sep)) throw Error('Source asset escaped the supplied asset root.');
mkdirSync(qa, { recursive: true });
const work = mkdtempSync(path.join(qa, '.critical-runtime-'));
if (!work.startsWith(qa + path.sep)) throw Error('Runtime must remain inside workspace QA storage.');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const inventory = folder => readdirSync(folder, { withFileTypes: true }).flatMap(item => {
  const file = path.join(folder, item.name);
  if (item.isDirectory()) return inventory(file);
  if (!item.isFile()) throw Error('Capture fixtures must contain regular files only.');
  const bytes = readFileSync(file);
  return [{ path: path.relative(sourceAsset, file).replaceAll('\\', '/'), bytes: bytes.length, sha256: digest(bytes) }];
}).sort((a, b) => a.path.localeCompare(b.path));
const originalAssetFiles = inventory(sourceAsset);
const freePort = () => new Promise(resolve => {
  const server = http.createServer().listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); });
});
const apiPort = await freePort(), webPort = await freePort();
const apiBase = `http://127.0.0.1:${apiPort}`, base = `http://127.0.0.1:${webPort}`;
const data = path.join(work, 'data'), assets = path.join(work, 'assets'), secret = randomBytes(32).toString('hex');
mkdirSync(data); mkdirSync(assets);
const children = [];
function start(name, args, cwd, env) {
  const child = spawn(process.execPath, args, { cwd, env: { ...process.env, ...env }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const log = []; child.stdout.on('data', chunk => log.push(chunk)); child.stderr.on('data', chunk => log.push(chunk));
  const record = { child, name, log }; children.push(record); return record;
}
async function run(name, args, cwd, env) {
  const record = start(name, args, cwd, env);
  const code = await new Promise(resolve => record.child.once('exit', resolve));
  writeFileSync(path.join(qa, `critical-${name}.log`), Buffer.concat(record.log));
  if (code !== 0) throw Error(`${name} failed (${code}); see qa-bug-hunt/critical-${name}.log`);
}
async function ready(url) {
  const end = Date.now() + 30000;
  while (Date.now() < end) {
    try { if ((await fetch(url, { signal: AbortSignal.timeout(1500) })).ok) return; } catch { /* starting */ }
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw Error('Runtime did not become ready: ' + url);
}
let cookie = '';
async function request(method, url, body) {
  const response = await fetch(apiBase + url, { method, headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: body === undefined ? undefined : JSON.stringify(body) });
  const value = await response.json();
  if (!response.ok) throw Error(`${method} ${url}: ${response.status} ${JSON.stringify(value)}`);
  cookie = response.headers.get('set-cookie')?.split(';')[0] ?? cookie; return value;
}
try {
  start('api', ['server/src/index.js'], root, {
    NODE_ENV: 'development', HOST: '127.0.0.1', PORT: String(apiPort), DATA_DIR: data, ASSET_DIR: assets,
    ASSET_DRIVER: 'local', DATABASE_URL: '', DATABASE_CA_FILE: '', SESSION_SECRET: secret, EMBED_TOKEN_SECRET: secret,
    EDITOR_PASSWORD: secret, SHARED_TEAM_LOGIN: '0', CLIENT_ORIGIN: base, STUDIO_URL: '', TOURS_URL: '', SITES_DOMAIN: '',
    RESEND_API_KEY: '', SMS_TOKEN: '', WHATSAPP_TOKEN: '', ANTHROPIC_API_KEY: '', LEADS_TO: '', AUTH_RATE_MAX: '100',
  });
  await ready(apiBase + '/api/health');
  const user = await request('POST', '/api/auth/signup', { name: 'Architecture audit', email: 'architecture@example.test', password: 'Disposable-Audit-2026!', accessCode: secret });
  const project = await request('POST', '/api/properties', { title: 'Architecture audit project' });
  const asset = await request('POST', '/api/assets', {});
  cpSync(sourceAsset, path.join(assets, asset.assetId), { recursive: true });
  writeFileSync(path.join(data, 'asset-records', asset.assetId + '.json'), JSON.stringify({ version: 1, assetId: asset.assetId, ownerId: user.user.id, status: 'ready', createdAt: new Date().toISOString(), files: originalAssetFiles.map(file => ({ relPath: file.path, bytes: file.bytes, sha256: file.sha256 })) }));
  const sceneId = 'architecture-capture';
  await request('PUT', '/api/scenes/' + sceneId, {
    id: sceneId, version: 2, title: 'Audit Capture', propertyId: project.id,
    splat: { format: sourceScene.splat.format, variants: { high: { ...sourceScene.splat.variants.high, assetId: asset.assetId } } },
    transform: sourceScene.transform, unitScale: sourceScene.unitScale, spawn: sourceScene.spawn, camera: sourceScene.camera,
    viewpoints: [], tracks: [], hotspots: [], colliders: [], neighbours: [], building: 'Audit', floor: 'Ground',
  });
  await request('POST', '/api/scenes/' + sceneId + '/publish', {});
  const baseline = await request('GET', '/api/scenes/' + sceneId + '/published');
  const baselineHash = digest(readFileSync(path.join(data, 'scenes', sceneId + '@1.json')));
  for (const name of ['src', 'public', 'package.json', 'next.config.mts', 'tsconfig.json', 'next-env.d.ts']) cpSync(path.join(root, name), path.join(work, name), { recursive: true });
  symlinkSync(path.join(root, 'node_modules'), path.join(work, 'node_modules'), 'junction');
  const configPath = path.join(work, 'runtime.json');
  writeFileSync(configPath, JSON.stringify({ work, data, assets, apiPort, webPort, base, apiBase, projectId: project.id, sceneId, assetId: asset.assetId, baselineHash, baseline, email: 'architecture@example.test', password: 'Disposable-Audit-2026!' }));
  const env = { NEXT_DIST_DIR: '.next', NEXT_OUTPUT_EXPORT: '', NEXT_PUBLIC_BASE_PATH: '', NEXT_PUBLIC_SITE_URL: base, NEXT_PUBLIC_API_URL: base, API_INTERNAL_URL: apiBase, NEXT_PUBLIC_STUDIO_URL: '', NEXT_PUBLIC_TOURS_URL: '', NEXT_PUBLIC_SITES_DOMAIN: '' };
  await run('production-build', [path.join(root, 'node_modules/next/dist/bin/next'), 'build', '--webpack'], work, env);
  start('frontend', [path.join(root, 'node_modules/next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(webPort)], work, env);
  await ready(base + '/login');
  await run('browser', [path.join(root, 'node_modules/playwright/cli.js'), 'test', '--config', 'playwright.critical.config.ts'], root, { RCAAS_CRITICAL_CONFIG: configPath });
  console.log('Production build and real critical Studio workflows passed.');
} finally {
  for (const { child, name, log } of children) {
    if (child.exitCode === null) {
      if (process.platform === 'win32') { try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }); } catch { /* already stopped */ } }
      else child.kill('SIGTERM');
    }
    writeFileSync(path.join(qa, `critical-${name}.log`), Buffer.concat(log));
  }
  const intact = digest(readFileSync(sourceScenePath)) === digest(sourceSceneBytes) && JSON.stringify(inventory(sourceAsset)) === JSON.stringify(originalAssetFiles);
  writeFileSync(path.join(qa, 'critical-source-integrity.json'), JSON.stringify({ sourceSceneUnchanged: digest(readFileSync(sourceScenePath)) === digest(sourceSceneBytes), captureFilesUnchanged: intact, files: originalAssetFiles.length, bytes: originalAssetFiles.reduce((total, file) => total + file.bytes, 0) }, null, 2));
  // Unlink only our dependency junction before deleting our verified QA directory.
  try {
    const link = path.join(work, 'node_modules');
    if (existsSync(link)) {
      if (!lstatSync(link).isSymbolicLink()) throw Error('Refusing to clean a real dependency directory');
      if (process.platform === 'win32') rmdirSync(link); else unlinkSync(link);
    }
    rmSync(work, { recursive: true, force: true });
  } catch { console.warn('Cleanup deferred:', work); }
  assert.ok(intact, 'Read-only source fixture integrity changed during verification');
}
