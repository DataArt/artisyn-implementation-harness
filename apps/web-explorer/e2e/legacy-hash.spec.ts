import { test, expect, url } from './pages-emulation';

test('an old #/get-started link lands on the path URL with its query', async ({ page }) => {
  await page.goto(url('/#/get-started?channel=zip&provider=claude'));
  await expect(page).toHaveURL(url('/get-started/?channel=zip&provider=claude'));
});

test('an old #/inside-the-loop/<slug> link lands on the path URL', async ({ page }) => {
  await page.goto(url('/#/inside-the-loop/context'));
  await expect(page).toHaveURL(url('/inside-the-loop/context/'));
});

test('a plain in-page anchor stays on the landing page', async ({ page }) => {
  await page.goto(url('/#how-it-works'));
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(url('/#how-it-works'));
});
