import { test, expect } from '@playwright/test';
import { INDUSTRIES } from '../../src/features/marketing/data/siteData';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', route => route.request().method() === 'GET'
    ? route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }) : route.abort());
});

test('all eleven industries retain approved content, images and original routes', async ({ page, baseURL }) => {
  await page.goto('./');
  const section = page.locator('#industries');
  const picker = section.getByRole('combobox', { name: 'Choose an industry' });
  await expect(picker.locator('option')).toHaveCount(INDUSTRIES.length);
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Built around your goal');
  await expect(section.locator('[data-industry-link]')).toHaveCount(INDUSTRIES.length);
  const prefix = new URL(baseURL!).pathname.replace(/\/$/, '');
  const touch = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  for (const [index, industry] of INDUSTRIES.entries()) {
    await picker.selectOption(String(index));
    const slide = section.locator('[data-active="true"]');
    await expect(slide).toHaveAttribute('data-industry-slide', industry.id);
    await expect(slide.getByRole('heading', { level: 3 })).toHaveText(industry.title);
    await expect(slide).toContainText(industry.goalHeadline);
    if (touch) await slide.getByRole('button', { name: 'Reveal details for ' + industry.title }).tap({ position: { x: 20, y: 25 } });
    else await slide.hover();
    await expect(slide.locator('[id^="industry-details-"]')).toHaveAttribute('aria-hidden', 'false');
    await expect(slide).toContainText(industry.summary);
    if (industry.whoItsFor) await expect(slide).toContainText(industry.whoItsFor);
    await expect(slide.locator('[data-industry-link]')).toHaveAttribute('href', prefix + industry.link);
    expect(await slide.locator('img').evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
    expect(await slide.locator('h3').evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  }
});

test('arrows and keyboard navigation wrap in both directions', async ({ page }) => {
  await page.goto('./');
  const section = page.locator('#industries');
  const picker = section.locator('#industry-picker');
  await section.getByRole('button', { name: 'Previous industry', exact: true }).click();
  await expect(picker).toHaveValue('10');
  await section.getByRole('button', { name: 'Next industry', exact: true }).click();
  await expect(picker).toHaveValue('0');
  const carousel = section.getByRole('region', { name: 'Industry photographs' });
  await carousel.focus();
  for (const [key, value] of [['End', '10'], ['ArrowRight', '0'], ['ArrowLeft', '10'], ['Home', '0']]) {
    await page.keyboard.press(key);
    await expect(picker).toHaveValue(value);
    await expect(carousel).toBeFocused();
  }
  expect(await carousel.evaluate(node => getComputedStyle(node).outlineStyle)).not.toBe('none');
});

test('a swipe advances without navigation and the next link activation still works', async ({ page, context }) => {
  await page.goto('./');
  const stage = page.locator('#industry-filmstrip');
  await stage.scrollIntoViewIfNeeded();
  const photo = page.locator('[data-active="true"] > button').first();
  const box = (await photo.boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + 70;
  if (await page.evaluate(() => matchMedia('(pointer: coarse)').matches)) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 12; step++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - step * 8, y }] });
      await page.waitForTimeout(20);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await page.mouse.move(x, y); await page.mouse.down();
    for (let step = 1; step <= 12; step++) { await page.mouse.move(x - step * 8, y); await page.waitForTimeout(20); }
    await page.mouse.up();
  }
  await expect(page.locator('#industry-picker')).toHaveValue('1');
  await expect(page).not.toHaveURL(/industries\/education/);
  const link = page.locator('[data-active="true"] [data-industry-link]');
  if (await page.evaluate(() => matchMedia('(pointer: coarse)').matches)) await link.tap(); else await link.click();
  await expect(page).toHaveURL(/industries\/education/);
});

test('continuous movement loops, pauses, resumes and stops for reduced motion', async ({ page }) => {
  test.setTimeout(45000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');
  await page.locator('#industry-filmstrip').scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const picker = page.locator('#industry-picker');
  await picker.selectOption('10');
  await page.getByRole('button', { name: 'Play automatic industry slides' }).click();
  await page.mouse.move(0, 0);
  const position = async () => (await page.locator('[data-industry-slide="banking-financial-institutions"]').boundingBox())!.x;
  const first = await position();
  await page.waitForTimeout(1200);
  const second = await position();
  await page.waitForTimeout(1200);
  const third = await position();
  expect(first - second).toBeGreaterThan(18);
  expect(first - second).toBeLessThan(40);
  expect(second - third).toBeGreaterThan(18);
  expect(second - third).toBeLessThan(40);
  await expect(picker).toHaveValue('0', { timeout: 18000 });
  await page.getByRole('button', { name: 'Pause automatic industry slides' }).click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(700);
  const paused = await position();
  await page.waitForTimeout(1200);
  expect(Math.abs(await position() - paused)).toBeLessThan(0.5);
  await expect(picker).toHaveValue('0');
  await page.getByRole('button', { name: 'Play automatic industry slides' }).click();
  await page.mouse.move(0, 0);
  const resumed = await position();
  await page.waitForTimeout(1200);
  expect(resumed - await position()).toBeGreaterThan(18);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Play automatic industry slides' })).toBeDisabled();
  const reduced = await position();
  await page.waitForTimeout(1200);
  expect(Math.abs(await position() - reduced)).toBeLessThan(0.5);
  expect(await page.locator('[data-active="true"]').evaluate(node => Number.parseFloat(getComputedStyle(node).transitionDuration))).toBeLessThan(0.001);
});

test('industry links remain available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage(); await page.goto('./');
    for (const industry of INDUSTRIES) await expect(page.locator('#industries noscript').getByRole('link', { name: industry.title, exact: true })).toBeVisible();
  } finally { await context.close(); }
});
