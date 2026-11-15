import { test, expect, type Page } from '@playwright/test';

// These fixtures do not ship to either Node production or the static export.
test.skip(!!process.env.PLAYWRIGHT_BASE_URL, 'Studio fixture is available only in the isolated test checkout');

const scene = {
  id: 'fixture', version: 2, title: 'Fixture lobby', propertyId: 'fixture-project', unitScale: 1,
  splat: { format: 'glb', variants: { high: { assetId: 'ast_fixture', meta: 'fixture.glb' } } },
  transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
  spawn: { position: [0, 1.65, 0], yaw: 0, eyeHeight: 1.65 },
  camera: { fov: 60, near: 0.25, far: 300, mode: 'viewpoint' },
  viewpoints: [], hotspots: [], colliders: [{ id: 'box_fixture', label: 'Boundary wall', position: [0, 1, 0], size: [1, 2, 0.2], yaw: 0, color: '#22c55e' }], tracks: [], neighbours: [],
  audio: null, cta: null, theme: null, booking: null, status: 'draft', night: null, building: 'Main', floor: 'Ground',
};

async function fixture(page: Page, options: { blocked?: boolean; conflict?: boolean } = {}) {
  const writes: { method: string; path: string; body: Record<string, unknown> | null; revision: string | undefined }[] = [];
  let live = false;
  let revision = 'fixture-v1';
  await page.route('**/api/**', async route => {
    const request = route.request(), url = new URL(request.url()), method = request.method(), path = url.pathname;
    const reply = (body: unknown, status = 200) => route.fulfill({ status, headers: { 'X-Draft-Revision': revision }, contentType: 'application/json', body: JSON.stringify(body) });
    if (method !== 'GET') writes.push({ method, path, body: request.postDataJSON(), revision: request.headers()['x-expected-revision'] });
    if (path === '/api/scenes/fixture' && method === 'GET') return reply(scene);
    if (path.endsWith('/embed') && method === 'GET') return reply({ key: 'fixture-embed-key', sites: [] });
    if (path.endsWith('/versions') && method === 'GET') return reply([]);
    if (path.endsWith('/publish') && method === 'GET') return reply({ status: live ? 'published' : 'draft', publishedVersion: live ? 1 : null, publishedAt: live ? '2026-11-15T00:00:00Z' : null, blockers: options.blocked ? ['Start view is missing.'] : [], warnings: [], ready: [] });
    if (path === '/api/scenes/fixture' && method === 'PUT') { revision = 'fixture-v2'; return reply({ ok: true }); }
    if (path.endsWith('/publish') && method === 'POST') {
      if (options.conflict) return reply({ error: 'Draft changed elsewhere. Reload before publishing.' }, 409);
      live = true; revision = 'fixture-v3'; return reply({ published: true, version: 1 });
    }
    if (path.endsWith('/unpublish') && method === 'POST') { live = false; return reply({ ok: true }); }
    // Unhandled calls never reach a running API or provider.
    return reply({ error: `Unexpected fixture request: ${method} ${path}` }, 501);
  });
  await page.goto('./browser-fixtures/studio');
  await expect(page.getByTestId('fixture-ready')).toBeVisible();
  return writes;
}

test('editor controls keep typed commit, cancel, clamping and selection behavior', async ({ page }) => {
  await fixture(page);
  const input = page.getByRole('spinbutton', { name: 'Eye level (m)' });
  await input.fill('4.2'); await input.press('Enter');
  await expect(page.getByTestId('height')).toHaveText('4.2');
  await input.fill('2.0'); await input.press('Escape');
  await expect(input).toHaveValue('4.2');
  await expect(page.getByTestId('height')).toHaveText('4.2');
  await input.fill('99'); await input.press('Enter');
  await expect(page.getByTestId('height')).toHaveText('6');
  await page.getByRole('button', { name: 'fly', exact: true }).click();
  await expect(page.getByTestId('mode')).toHaveText('fly');
  await page.getByRole('button', { name: 'Audio', exact: true }).click();
  await expect(page.getByTestId('audio')).toHaveText('true');
});

test('publishing saves unsaved edits first and keeps asset references', async ({ page }) => {
  const writes = await fixture(page);
  await page.getByRole('button', { name: 'Make unsaved change' }).click();
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Publish', exact: true });
  await dialog.getByRole('button', { name: 'Publish space', exact: true }).click();
  await expect(dialog).toContainText('Published version 1.');
  expect(writes.map(write => `${write.method} ${write.path}`)).toEqual(['PUT /api/scenes/fixture', 'POST /api/scenes/fixture/publish']);
  expect(writes[0].body?.splat).toEqual(scene.splat);
  expect(writes[0].body?.look).toMatchObject({ brightness: 1.2 });
  expect(writes[1].revision).toBe('fixture-v2');
  await dialog.getByRole('button', { name: 'Unpublish', exact: true }).click();
  await expect(dialog).toContainText('Not published.');
});

test('publish blockers prevent writes and stale drafts expose recovery', async ({ page }) => {
  let writes = await fixture(page, { blocked: true });
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Publish space', exact: true })).toBeDisabled();
  await expect(page.getByRole('dialog', { name: 'Publish', exact: true })).toContainText('Start view is missing.');
  expect(writes).toHaveLength(0);
  writes = await fixture(page, { conflict: true });
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await page.getByRole('button', { name: 'Publish space', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Publish', exact: true })).toContainText('Draft changed elsewhere.');
  expect(writes).toHaveLength(1);
  expect(writes[0].path).toBe('/api/scenes/fixture/publish');
});

test('hierarchy keeps search, selection and rename commit/cancel behavior', async ({ page }) => {
  await fixture(page);
  const hierarchy = page.getByTestId('hierarchy');
  const search = hierarchy.getByRole('searchbox');
  await search.fill('welcome');
  await expect(hierarchy.getByRole('button', { name: /Welcome hotspot/ })).toBeVisible();
  await expect(hierarchy.getByRole('button', { name: /Lobby track/ })).toHaveCount(0);
  await hierarchy.getByRole('button', { name: /Welcome hotspot/ }).click();
  await expect(page.getByTestId('selection')).toHaveText('{"type":"hotspot","id":"hs_fixture"}');
  await search.press('Escape');
  await expect(search).toHaveValue('');
  const scene = hierarchy.getByRole('button').filter({ hasText: 'Fixture lobby' });
  await scene.dblclick();
  await hierarchy.getByRole('textbox', { name: 'Rename Fixture lobby' }).fill('Discard this');
  await hierarchy.getByRole('textbox', { name: 'Rename Fixture lobby' }).press('Escape');
  await expect(scene).toBeVisible();
  await scene.focus(); await scene.press('F2');
  await hierarchy.getByRole('textbox', { name: 'Rename Fixture lobby' }).fill('Renamed lobby');
  await hierarchy.getByRole('textbox', { name: 'Rename Fixture lobby' }).press('Enter');
  await expect(hierarchy.getByRole('button').filter({ hasText: 'Renamed lobby' })).toBeVisible();
});

test('hotspot and collision inspectors preserve coordinates, payload and minimum wall size', async ({ page }) => {
  await fixture(page);
  const inspector = page.getByTestId('inspector');
  const x = inspector.locator('.ed2-step-x input');
  await x.fill('2.5'); await x.press('Enter');
  const hotspot = JSON.parse(await page.getByTestId('hotspot-doc').innerText());
  expect(hotspot.position).toEqual([2.5, 2, 3]);
  expect(hotspot.payload).toEqual({ text: 'Original welcome', url: 'https://example.test/preserved' });
  await inspector.getByRole('button', { name: 'Look at', exact: true }).click();
  await expect(page.getByTestId('commands')).toContainText('["lookAtHotspot","hs_fixture"]');
  await page.getByRole('button', { name: 'Inspect collider', exact: true }).click();
  const sizeX = inspector.locator('.ed2-step-x input').nth(1);
  await sizeX.fill('-4'); await sizeX.press('Enter');
  const collider = JSON.parse(await page.getByTestId('collider-doc').innerText());
  expect(collider.size).toEqual([0.05, 2, 0.2]);
  expect(collider.position).toEqual([0, 1, 0]);
});

test('track inspector keeps editable commands and baked-track restrictions', async ({ page }) => {
  await fixture(page);
  await page.getByRole('button', { name: 'Inspect track', exact: true }).click();
  const inspector = page.getByTestId('inspector');
  const duration = inspector.getByRole('spinbutton', { name: 'Length (s)' });
  await duration.fill('18'); await duration.press('Enter');
  expect(JSON.parse(await page.getByTestId('track-doc').innerText()).seconds).toBe(18);
  await inspector.getByRole('button', { name: /Waypoint/ }).click();
  await expect(page.getByTestId('commands')).toContainText('["appendWpTo","track_fixture"]');
  await page.getByRole('button', { name: 'Use baked track', exact: true }).click();
  await expect(inspector.locator('input.ed2-name')).toBeDisabled();
  await expect(inspector.getByRole('button', { name: /Waypoint/ })).toHaveCount(0);
  await expect(inspector.getByRole('button', { name: /Delete/ })).toHaveCount(0);
  await duration.fill('20'); await duration.press('Enter');
  expect(JSON.parse(await page.getByTestId('track-doc').innerText()).seconds).toBe(18);
});
