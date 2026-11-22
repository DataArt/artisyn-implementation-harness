import fs from 'node:fs';
import path from 'node:path';
import { test, expect, url, outDir } from './pages-emulation';
import { MOVED_ROUTES } from './routes';

for (const [from, to] of MOVED_ROUTES) {
  test(`${from} redirects to ${to}`, async ({ page }) => {
    await page.goto(url(from));
    await expect(page).toHaveURL(url(to));
  });
}

test('a redirect page is noindex, canonical to the new path, and links to it', () => {
  const html = fs.readFileSync(path.join(outDir, 'migration-case', 'index.html'), 'utf8');
  expect(html).toContain('<meta name="robots" content="noindex, follow"');
  expect(html).toContain(`<link rel="canonical" href="${url('/cookbook/case/migration/')}"`);
  expect(html).toMatch(
    /<a [^>]*href="\/artisyn-implementation-harness\/cookbook\/case\/migration\/"/
  );
});
