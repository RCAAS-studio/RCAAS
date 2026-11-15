import { test, expect } from '@playwright/test';
import { ROUTES } from '../../src/features/marketing/types';
import { VISIBLE_POSTS, postPath } from '../../src/features/marketing/content/blog';
import { pageMeta, blogPageCount } from '../../src/features/marketing/meta';

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
  const paths = [...ROUTES, ...VISIBLE_POSTS.map(postPath), ...Array.from({ length: blogPageCount() - 1 }, (_, index) => `/blog/page/${index + 2}/`)];
  for (const route of paths) {
    const response = await request.get(`.${route}`);
    expect(response.ok(), route).toBeTruthy();
    const head = await page.evaluate(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return {
        title: doc.title,
        description: doc.querySelector('meta[name="description"]')?.getAttribute('content'),
        canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),
        robots: doc.querySelector('meta[name="robots"]')?.getAttribute('content'),
      };
    }, await response.text());
    const expected = pageMeta(route);
    expect(head.title, route).toBe(expected.title);
    expect(head.description, route).toBe(expected.description);
    expect(head.canonical, route).toBeTruthy();
    const prefix = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost').pathname.replace(/\/$/, '');
    expect(new URL(head.canonical!).pathname.replace(/\/$/, ''), route).toBe(prefix + route.replace(/\/$/, ''));
    if (expected.robots?.includes('noindex')) expect(head.robots, route).toContain('noindex');
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

test('content families reject missing slugs and legacy aliases retain redirects', async ({ request }) => {
  for (const route of ['/industries/unknown-industry/', '/work/unknown-project/', '/blog/unknown-post/', '/blog/page/0/', '/blog/page/1/', `/blog/page/${blogPageCount() + 1}/`]) {
    expect((await request.get(`.${route}`)).status(), route).toBe(404);
  }
  // The static export provides an HTML redirect; Next supplies HTTP 308.
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    for (const [from, to] of [['/how-it-works/', '/how-we-work'], ['/gaussian-splatting/', '/learn/what-is-gaussian-splatting']]) {
      const response = await request.get(`.${from}`);
      expect(response.ok(), from).toBeTruthy();
      expect(new URL(response.url()).pathname.replace(/\/$/, '')).toBe(to);
    }
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
