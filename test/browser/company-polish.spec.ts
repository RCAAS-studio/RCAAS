import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', route => route.request().method() === 'GET'
    ? route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }) : route.abort());
});

test('primary page introductions remain readable before JavaScript hydration', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    for (const route of ['./', './services/', './contact/']) {
      await page.goto(route);
      const introduction = page.locator('main h1').first();
      await expect(introduction).not.toBeEmpty();
      const opacity = await introduction.evaluate(node => {
        let visibleOpacity = 1;
        for (let current: Element | null = node; current; current = current.parentElement) visibleOpacity *= Number(getComputedStyle(current).opacity);
        return visibleOpacity;
      });
      expect(opacity).toBeGreaterThan(0.95);
    }
  } finally { await context.close(); }
});

test('planner stays within the viewport and retains keyboard focus until closed', async ({ page }) => {
  await page.goto('./');
  const trigger = page.locator('#hero').getByRole('button', { name: /plan your experience/i });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Plan your experience', exact: true });
  const close = dialog.getByRole('button', { name: 'Close modal', exact: true });
  await expect(close).toBeInViewport();
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await close.click();
  await expect(dialog).toHaveCount(0);
});

test('industry masonry fits the viewport and keeps audience descriptions complete', async ({ page }) => {
  await page.goto('./');
  const section = page.locator('#industries');
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator('a')).toHaveCount(11);
  expect(await section.locator('.truncate').count()).toBe(0);
  const columns = await section.locator('[class*="columns-1"]').evaluate(node => getComputedStyle(node).columnCount);
  expect(Number(columns)).toBe(page.viewportSize()!.width >= 1280 ? 4 : 1);
  const clipped = await section.locator('a').evaluateAll(nodes => nodes.some(node => node.scrollWidth > node.clientWidth + 1));
  expect(clipped).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('navigation supports keyboard entry, Escape and focus restoration', async ({ page }) => {
  await page.goto('./');
  if (page.viewportSize()!.width < 1240) {
    const menu = page.locator('.snav-menu-btn');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
  } else {
    const trigger = page.getByRole('button', { name: 'What we create: show the list' });
    await trigger.focus(); await trigger.press('ArrowDown');
    await expect(page.locator('#snav-drop-services a[href]').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.press('Enter'); await trigger.press('Tab');
    await expect(page.locator('#snav-drop-services a[href]').first()).toBeFocused();
  }
});

test('carousel dots keep their visual size inside comfortable pointer targets', async ({ page }) => {
  await page.goto('./services/');
  const dots = page.getByRole('button', { name: /^Jump to / });
  await dots.last().scrollIntoViewIfNeeded();
  for (const dot of await dots.all()) {
    const bounds = await dot.boundingBox();
    expect(bounds!.width).toBeGreaterThanOrEqual(32);
    expect(bounds!.height).toBeGreaterThanOrEqual(32);
    expect(await dot.locator('span').evaluate(node => node.getBoundingClientRect().height)).toBe(8);
  }
  await dots.nth(2).click(); await expect(dots.nth(2)).toHaveAttribute('aria-current', 'true');
  await page.getByRole('button', { name: 'Next project', exact: true }).click();
  await expect(dots.nth(3)).toHaveAttribute('aria-current', 'true');
  const selected = page.locator('a[data-carousel-card][tabindex="0"]');
  await expect(selected).toHaveAttribute('href', /madan-ashrit/);
  await selected.hover();
  const card = (await selected.boundingBox())!;
  const startX = card.x + card.width / 2;
  const startY = card.y + card.height * 0.4;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (let step = 1; step <= 12; step++) {
    await page.mouse.move(startX - step * 10, startY);
    await page.waitForTimeout(20);
  }
  await page.mouse.up();
  await expect(dots.nth(4)).toHaveAttribute('aria-current', 'true');
  await expect(page).toHaveURL(/services\/?$/);
  await dots.nth(3).click();
  await selected.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(dots.nth(2)).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('a[data-carousel-card][tabindex="0"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/work\/nepathya-school-college-3d-campus-tour/);
});

test('decorative cursor preserves pointer access and reduced-motion behavior', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const cursor = page.locator('[data-lidar-cursor]');
  if (await page.evaluate(() => matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches)) {
    await expect(cursor).toHaveCount(0);
  } else {
    await page.mouse.move(200, 200);
    await expect(cursor).toHaveAttribute('aria-hidden', 'true');
    expect(await cursor.evaluate(node => getComputedStyle(node).pointerEvents)).toBe('none');
    expect(await cursor.evaluate(node => Number.parseFloat(getComputedStyle(node).transitionDuration))).toBeLessThan(0.001);
    expect(await page.evaluate(() => !!document.elementFromPoint(200, 200)?.closest('[data-lidar-cursor]'))).toBe(false);
  }
});

test('contact validation and recovery preserve entered details without live submissions', async ({ page }) => {
  let submissions = 0;
  await page.route('**/api/leads', route => {
    submissions++;
    return route.fulfill({ status: submissions === 1 ? 500 : 200, contentType: 'application/json', body: JSON.stringify(submissions === 1 ? { error: 'Synthetic QA failure' } : { ok: true }) });
  });
  await page.goto('./contact/');
  await expect(page.getByRole('list', { name: 'Contact details' }).getByRole('listitem')).toHaveCount(5);
  await page.locator('#c-message').fill('Synthetic browser QA enquiry. Never deliver this message.');
  await page.locator('#c-name').fill('QA Example');
  await page.locator('#c-email').fill('qa@example.test');
  await page.locator('#c-phone').fill('123');
  await page.locator('#c-consent').check();
  await page.getByRole('button', { name: 'Send my enquiry', exact: true }).click();
  expect(await page.locator('#c-phone').evaluate(node => (node as HTMLInputElement).validity.valid)).toBe(false);
  expect(submissions).toBe(0);
  await page.locator('#c-phone').fill('+977 9800000000');
  // Exercise the real submit path after its deliberate anti-bot minimum.
  await page.waitForTimeout(3100);
  await page.getByRole('button', { name: 'Send my enquiry', exact: true }).click();
  await expect(page.locator('main').getByRole('alert')).toContainText("couldn't send");
  await expect(page.locator('#c-name')).toHaveValue('QA Example');
  await expect(page.locator('#c-message')).toHaveValue('Synthetic browser QA enquiry. Never deliver this message.');
  await page.getByRole('button', { name: 'Send my enquiry', exact: true }).click();
  await expect(page).toHaveURL(/thank-you/);
  expect(submissions).toBe(2);
});
