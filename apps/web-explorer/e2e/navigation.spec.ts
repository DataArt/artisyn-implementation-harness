import { test, expect, url } from './pages-emulation';

test('a header link navigates client-side with an RSC payload', async ({ page }) => {
  await page.goto(url('/'));
  await page.waitForLoadState('networkidle');
  await page.evaluate(
    () => ((window as unknown as { __sameDocument: boolean }).__sameDocument = true)
  );

  const payload = page.waitForResponse((res) => new URL(res.url()).pathname.endsWith('.txt'));
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Get started' })
    .click();
  const response = await payload;

  expect(response.status()).toBe(200);
  await expect(page).toHaveURL(url('/get-started/'));
  expect(
    await page.evaluate(() => (window as unknown as { __sameDocument?: boolean }).__sameDocument)
  ).toBe(true);
});

for (const start of ['/', '/get-started/']) {
  test(`header anchor links scroll to their section from ${start}`, async ({ page }) => {
    await page.goto(url(start));
    await page.waitForLoadState('networkidle');
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'How it works' })
      .click();
    await expect(page).toHaveURL(url('/#how-it-works'));
    await expect(page.locator('#how-it-works')).toBeInViewport();
  });
}
