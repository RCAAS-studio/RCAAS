import { test, expect } from '@playwright/test';
import { ROUTES } from '../../src/features/marketing/types';

test.beforeEach(async ({ page }) => {
  // Keep browser regressions independent of live providers and production data.
  await page.route('**/api/**', route => route.request().method() === 'GET'
    ? route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    : route.abort());
});

test('home keeps its sections, one main landmark and working planner', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('main h1')).toHaveCount(1);
  const ids = await page.locator('main section[id]').evaluateAll(nodes => nodes.map(node => node.id));
  expect(ids).toEqual(['hero', 'live-experience', 'what-we-create', 'industries', 'how-it-works', 'why-rcaas', 'work', 'heritage', 'faq', 'cta']);
  await page.locator('#hero').getByRole('button', { name: /plan your experience/i }).click();
  await expect(page.getByRole('button', { name: /close/i }).first()).toBeVisible();
});

test('every published marketing URL resolves with its own metadata', async ({ request, page }) => {
  test.setTimeout(180000);
  for (const route of ROUTES) {
    const response = await request.get(`.${route}`);
    expect(response.ok(), route).toBeTruthy();
    expect(await response.text(), route).toContain('<link rel="canonical"');
  }
  const missing = await request.get('./services/does-not-exist/');
  expect(missing.status()).toBe(404);
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    await page.goto('./services/does-not-exist/');
    await expect(page.getByRole('heading', { level: 1, name: /captured yet|isn.t here/ })).toBeVisible();
  }
  for (const route of ['./login/', './studio/']) {
    expect((await request.get(route)).ok(), route).toBeTruthy();
  }
});

test('native navigation retains enquiry query, history and metadata', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./services/visual-storytelling/');
  await page.locator('#format-tab-2').click();
  await page.locator('#social').getByRole('link', { name: /discuss this format/i }).click();
  await expect(page).toHaveURL(/contact\/?\?type=storytelling&format=social#form/);
  await expect(page.locator('#c-story-format')).toHaveValue('social');
  await expect(page).toHaveTitle(/Contact RCAAS/);
  await page.goBack();
  await expect(page.locator('#story-title')).toBeVisible();
  expect(errors).toEqual([]);
});

test('service tabs, comparison and narrow layout remain usable', async ({ page }) => {
  await page.goto('./services/visual-storytelling/');
  await page.locator('#format-tab-0').focus();
  await page.keyboard.press('End');
  await expect(page.locator('#format-tab-4')).toBeFocused();
  await expect(page.locator('#story-comparison-range')).toBeVisible();
  await page.locator('#story-comparison-range').focus();
  await page.keyboard.press('Home'); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#story-comparison-range')).toHaveValue('1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
