import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const runtime = JSON.parse(readFileSync(process.env.RCAAS_CRITICAL_CONFIG!, 'utf8'));
const projectPath = `/studio/${runtime.projectId}`;
function observeNativeDraws() {
  const target = window as typeof window & { __auditDraws?: { method: string; count: number; instances: number }[] };
  target.__auditDraws = [];
  for (const method of ['drawArraysInstanced', 'drawElementsInstanced'] as const) {
    const original = WebGL2RenderingContext.prototype[method];
    WebGL2RenderingContext.prototype[method] = function (...args: number[]) {
      if (target.__auditDraws!.length < 100) target.__auditDraws!.push({ method, count: args[method === 'drawArraysInstanced' ? 2 : 1], instances: args[method === 'drawArraysInstanced' ? 3 : 4] });
      return Reflect.apply(original, this, args);
    };
  }
}
async function signIn(page: Page) {
  await page.goto(`/login?next=${encodeURIComponent(projectPath)}`);
  await page.getByLabel('Email', { exact: true }).fill(runtime.email);
  await page.locator('input[name="password"]').fill(runtime.password);
  await page.locator('form').getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${projectPath}/?$`));
  await expect(page.getByRole('heading', { name: 'Architecture audit project', exact: true })).toBeVisible();
}

test('real login, session persistence, invalid session and logout access control', async ({ page, context }) => {
  await page.goto(projectPath);
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.getByLabel('Email', { exact: true }).fill(runtime.email);
  await page.locator('input[name="password"]').fill('deliberately-wrong-password');
  await page.locator('form').getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await signIn(page);
  const session = (await context.cookies()).find(cookie => cookie.name === 'splatspace_session');
  expect(session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe('Lax');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Architecture audit project', exact: true })).toBeVisible();
  await context.addCookies([{ ...session!, value: 'invalid-audit-session' }]);
  await page.reload();
  await expect(page).toHaveURL(/\/login\?next=/);
  await signIn(page);
  expect((await page.request.post('/api/auth/logout')).ok()).toBe(true);
  await page.goto(projectPath);
  await expect(page).toHaveURL(/\/login\?next=/);
});

test('genuine capture, editor undo/redo/save/publish, intact prior snapshot and anonymous tour', async ({ page, context, browser }, testInfo) => {
  const responses: { path: string; status: number }[] = [];
  const errors: string[] = [];
  page.on('response', response => { if (response.url().includes(`/api/assets/${runtime.assetId}/`)) responses.push({ path: new URL(response.url()).pathname, status: response.status() }); });
  page.on('pageerror', error => errors.push(error.message));
  // Observe native GPU calls without replacing the renderer or its results.
  await context.addInitScript(observeNativeDraws);
  await signIn(page);
  // Each rerun gets a fresh disposable scene and a real published version 1.
  const originalId = runtime.sceneId;
  runtime.sceneId = `architecture-capture-${Date.now()}`;
  const seed = { ...runtime.baseline, id: runtime.sceneId, title: 'Audit Capture', status: 'draft' };
  delete seed.publishedVersion; delete seed.publishedAt;
  expect((await page.request.put(`/api/scenes/${runtime.sceneId}`, { data: seed })).ok()).toBe(true);
  expect((await page.request.post(`/api/scenes/${runtime.sceneId}/publish`, { data: {} })).ok()).toBe(true);
  const previousHash = createHash('sha256').update(readFileSync(path.join(runtime.data, 'scenes', `${runtime.sceneId}@1.json`))).digest('hex');
  await page.goto(`${projectPath}/edit?space=${runtime.sceneId}`);
  await expect(page.locator('.ed2-top')).toBeVisible({ timeout: 60000 });
  await expect(page.locator('canvas[data-engine]')).toBeVisible();
  const webgl = await page.locator('canvas[data-engine]').evaluate(canvas => {
    const gl = (canvas as HTMLCanvasElement).getContext('webgl2');
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    return { available: !!gl, renderer: info ? gl!.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl?.getParameter(gl.RENDERER) };
  });
  await testInfo.attach('webgl.json', { body: JSON.stringify(webgl), contentType: 'application/json' });
  expect(webgl.available).toBe(true);
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __auditDraws?: { instances: number }[] }).__auditDraws?.some(draw => draw.instances > 1000)), { timeout: 90000, message: 'The actual Gaussian capture must reach native instanced rendering' }).toBe(true);
  expect(responses.some(response => response.path.endsWith('.lcc2') && response.status === 200)).toBe(true);
  expect(responses.some(response => /\.(bin|lcc|ply|data)/i.test(response.path) && [200, 206].includes(response.status))).toBe(true);
  await page.locator('canvas[data-engine]').screenshot({ path: testInfo.outputPath('genuine-capture.png') });
  const sceneRow = page.locator('.ed2-left .ed2-tree-row.on');
  await sceneRow.dblclick();
  const rename = page.getByRole('textbox', { name: 'Rename Audit Capture' });
  await rename.fill('Audit Capture Edited'); await rename.press('Enter');
  const undo = page.getByRole('button', { name: 'Undo', exact: true });
  await expect(undo).toBeEnabled(); await undo.click();
  await expect(page.locator('.ed2-tree-row.on .ed2-tree-nm')).toHaveText('Audit Capture');
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(page.locator('.ed2-tree-row.on .ed2-tree-nm')).toHaveText('Audit Capture Edited');
  await page.getByRole('button', { name: 'Add a hotspot', exact: true }).click();
  await page.locator('.ed2-tree-addmenu').getByRole('button', { name: 'text', exact: true }).click();
  await page.locator('input.ed2-name:visible').first().fill('Audit hotspot');
  await page.locator('.ed2-step-x input').fill('1.25');
  await page.locator('.ed2-step-x input').press('Enter');
  await page.getByRole('button', { name: 'Save space', exact: true }).click();
  await expect(page.locator('.ed2-save-state')).toContainText('All changes saved');
  const saved = await (await page.request.get(`/api/scenes/${runtime.sceneId}`)).json();
  expect(saved.title).toBe('Audit Capture Edited');
  expect(saved.splat).toEqual(runtime.baseline.splat);
  expect(saved.hotspots).toHaveLength(1);
  expect(saved.hotspots[0]).toMatchObject({ label: 'Audit hotspot', position: [1.25, expect.any(Number), expect.any(Number)] });
  const oldPublic = await (await page.request.get(`/api/scenes/${runtime.sceneId}/published`)).json();
  expect(oldPublic.title).toBe('Audit Capture');
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Publish changes', exact: true }).click();
  await expect(dialog).toContainText('Published version 2.');
  expect(createHash('sha256').update(readFileSync(path.join(runtime.data, 'scenes', `${runtime.sceneId}@1.json`))).digest('hex')).toBe(previousHash);
  expect(createHash('sha256').update(readFileSync(path.join(runtime.data, 'scenes', `${originalId}@1.json`))).digest('hex')).toBe(runtime.baselineHash);
  const publicContext = await browser.newContext();
  try {
    await publicContext.addInitScript(observeNativeDraws);
    const tour = await publicContext.newPage();
    expect((await publicContext.request.get(`${runtime.base}/api/scenes/${runtime.sceneId}`)).status()).toBe(401);
    const publicDoc = await (await publicContext.request.get(`${runtime.base}/api/scenes/${runtime.sceneId}/published`)).json();
    expect(publicDoc.title).toBe('Audit Capture Edited'); expect(publicDoc.splat).toEqual(runtime.baseline.splat);
    expect(publicDoc.hotspots[0].label).toBe('Audit hotspot');
    await tour.goto(`${runtime.base}/t/${runtime.projectId}/${runtime.sceneId}`);
    await expect(tour).toHaveURL(new RegExp(`/tour\\?space=${runtime.sceneId}`));
    await expect(tour.locator('canvas[data-engine]')).toBeVisible({ timeout: 60000 });
    const start = tour.getByRole('button', { name: /Start|Enter|Explore/i }).first();
    await expect(start).toBeEnabled({ timeout: 90000 }); await start.click();
    await expect(tour.locator('.vw-enter')).toHaveCount(0);
    await expect.poll(() => tour.evaluate(() => (window as typeof window & { __auditDraws?: { instances: number }[] }).__auditDraws?.some(draw => draw.instances > 1000)), { timeout: 90000 }).toBe(true);
    await expect(tour.locator('.vw-failed')).toHaveCount(0);
    await tour.screenshot({ path: testInfo.outputPath('published-tour.png') });
  } finally { await publicContext.close(); }
  await testInfo.attach('asset-responses.json', { body: JSON.stringify(responses), contentType: 'application/json' });
  expect(errors).toEqual([]);
});
