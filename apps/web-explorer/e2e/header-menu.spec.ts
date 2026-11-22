import AxeBuilder from '@axe-core/playwright';
import { test, expect, url } from './pages-emulation';

const nav = (page: import('@playwright/test').Page) =>
  page.getByRole('navigation', { name: 'Main navigation' });

test('the main navigation has five entries with Cookbook as a disclosure', async ({ page }) => {
  await page.goto(url('/'));
  const main = nav(page);
  await expect(main.getByRole('link', { name: 'How It Works' })).toBeVisible();
  await expect(main.getByRole('link', { name: 'Capabilities' })).toBeVisible();
  await expect(main.getByRole('link', { name: 'Get Started' })).toBeVisible();
  await expect(main.getByRole('link', { name: /Docs/ })).toBeVisible();
  const cookbook = main.getByRole('button', { name: 'Cookbook' });
  await expect(cookbook).toHaveAttribute('aria-expanded', 'false');
  await expect(main.getByRole('link', { name: /Team Adoption Path/ })).toBeHidden();
});

test('Cookbook opens its recipes and case studies, and Escape closes it', async ({ page }) => {
  await page.goto(url('/'));
  const main = nav(page);
  const cookbook = main.getByRole('button', { name: 'Cookbook' });
  await cookbook.click();
  await expect(cookbook).toHaveAttribute('aria-expanded', 'true');
  for (const name of [/Team Adoption Path/, /Knowledge Flow/, /Agents/, /Dogfood/, /Migration/])
    await expect(main.getByRole('link', { name })).toBeVisible();
  const cases = main.getByRole('list', { name: 'Case studies' });
  await expect(cases.getByRole('link')).toHaveCount(2);

  await page.keyboard.press('Escape');
  await expect(cookbook).toHaveAttribute('aria-expanded', 'false');
  await expect(cookbook).toBeFocused();

  await cookbook.click();
  await page.locator('main').click({ position: { x: 5, y: 5 } });
  await expect(cookbook).toHaveAttribute('aria-expanded', 'false');
});

test('a Cookbook link navigates and marks the current page', async ({ page }) => {
  await page.goto(url('/'));
  const main = nav(page);
  await main.getByRole('button', { name: 'Cookbook' }).click();
  await main.getByRole('link', { name: /Migration/ }).click();
  await expect(page).toHaveURL(url('/cookbook/case/migration/'));
  const cookbook = main.getByRole('button', { name: 'Cookbook' });
  await expect(cookbook).toHaveAttribute('aria-expanded', 'false');
  await cookbook.click();
  await expect(main.getByRole('link', { name: /Migration/ })).toHaveAttribute(
    'aria-current',
    'page'
  );
});

test('the open menu has no serious WCAG or agent-accessibility violation', async ({ page }) => {
  await page.goto(url('/get-started/'));
  await nav(page).getByRole('button', { name: 'Cookbook' }).click();
  const result = await new AxeBuilder({ page })
    .include('.site-header')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = result.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(serious).toEqual([]);
});
