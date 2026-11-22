import { test, expect, url, BASE_PATH } from './pages-emulation';

test('a header link navigates client-side with an RSC payload', async ({ page }) => {
  // Next prefetches in-view links' segment payloads on load, so the payload can arrive before the click.
  const payloads: { path: string; status: number }[] = [];
  page.on('response', (res) => {
    const { pathname } = new URL(res.url());
    if (pathname.endsWith('.txt')) payloads.push({ path: pathname, status: res.status() });
  });
  await page.goto(url('/'));
  await page.waitForLoadState('networkidle');
  await page.evaluate(
    () => ((window as unknown as { __sameDocument: boolean }).__sameDocument = true)
  );

  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Get Started' })
    .click();

  await expect(page).toHaveURL(url('/get-started/'));
  await expect(page.getByRole('group', { name: 'Installation channel' })).toBeVisible();
  expect(
    await page.evaluate(() => (window as unknown as { __sameDocument?: boolean }).__sameDocument)
  ).toBe(true);
  const getStarted = payloads.filter((p) => p.path.startsWith(`${BASE_PATH}/get-started/`));
  expect(getStarted.length).toBeGreaterThan(0);
  expect(getStarted.every((p) => p.status === 200)).toBe(true);
});

for (const start of ['/', '/get-started/']) {
  test(`header anchor links scroll to their section from ${start}`, async ({ page }) => {
    await page.goto(url(start));
    await page.waitForLoadState('networkidle');
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'How It Works' })
      .click();
    await expect(page).toHaveURL(url('/#how-it-works'));
    await expect(page.locator('#how-it-works')).toBeInViewport();
  });
}
