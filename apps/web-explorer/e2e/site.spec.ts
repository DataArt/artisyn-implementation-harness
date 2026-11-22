import { test, expect, url, cspViolations, BASE_PATH } from './pages-emulation';
import { ROUTES } from './routes';

test.describe('every route loads clean under the production policy', () => {
  for (const route of ROUTES) {
    test(`${route} has no CSP violation, console error or hydration error`, async ({
      page,
      report,
    }) => {
      const response = await page.goto(url(route));
      expect(response?.status()).toBe(200);
      await page.waitForLoadState('networkidle');
      expect(await cspViolations(page, report)).toEqual([]);
      expect(report.consoleErrors).toEqual([]);
      expect(report.pageErrors).toEqual([]);
    });
  }
});

test.describe('404 page', () => {
  for (const missing of ['/no-such-page/', '/docs/no-such-article/']) {
    test(`${missing} gets the root 404 page with Home and Docs links`, async ({ page, report }) => {
      const response = await page.goto(url(missing));
      expect(response?.status()).toBe(404);
      await page.waitForLoadState('networkidle');
      const main = page.locator('main');
      await expect(main.getByRole('link', { name: /home/i })).toHaveAttribute(
        'href',
        `${BASE_PATH}/`
      );
      await expect(main.getByRole('link', { name: /docs/i })).toHaveAttribute(
        'href',
        `${BASE_PATH}/docs/`
      );
      expect(await cspViolations(page, report)).toEqual([]);
      expect(report.pageErrors).toEqual([]);
    });
  }
});
