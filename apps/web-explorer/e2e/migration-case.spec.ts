import AxeBuilder from '@axe-core/playwright';
import { test, expect, url } from './pages-emulation';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test('the lifecycle tabs switch the chart and a row opens its stage below it', async ({ page }) => {
  await page.goto(url('/migration-case/'));
  const tabs = page.getByRole('tablist', { name: 'Lifecycles' });
  const design = tabs.getByRole('tab', { name: /Solution Design/ });
  const development = tabs.getByRole('tab', { name: /Development/ });
  const panel = page.getByRole('tabpanel');
  const rows = panel.getByRole('list', { name: /stages$/ });

  await expect(design).toHaveAttribute('aria-selected', 'true');
  await expect(rows).toHaveAccessibleName('Solution Design stages');
  await expect(panel.getByRole('heading', { level: 3 })).toHaveText(
    'Solution Design: Context & ceremony'
  );

  const evaluate = rows.getByRole('button', { name: /Evaluate/ });
  await evaluate.click();
  await expect(evaluate).toHaveAttribute('aria-expanded', 'true');
  await expect(panel.getByRole('heading', { level: 3 })).toHaveText('Solution Design: Evaluate');
  await expect(panel.getByRole('heading', { level: 3 })).toHaveCount(1);
  // The detail opens right after the selected row.
  const detail = page.locator(`#${await evaluate.getAttribute('aria-controls')}`);
  await expect(detail).toContainText('Every option scored against the 11 criteria');

  await development.click();
  await expect(development).toHaveAttribute('aria-selected', 'true');
  await expect(panel).toHaveAttribute('aria-labelledby', 'mc-tab-development');
  await expect(rows).toHaveAccessibleName('Development stages');
  await expect(rows.getByRole('button', { name: /Publish/ })).toHaveCount(0);
  await rows.getByRole('button', { name: /Test/ }).click();
  await expect(panel).toContainText('27 of 27 acceptance criteria proven');

  // Each lifecycle keeps its own open stage.
  await design.click();
  await expect(panel.getByRole('heading', { level: 3 })).toHaveText('Solution Design: Evaluate');
});

test('arrow keys move between the lifecycle tabs', async ({ page }) => {
  await page.goto(url('/migration-case/'));
  const tabs = page.getByRole('tablist', { name: 'Lifecycles' });
  await tabs.getByRole('tab', { name: /Solution Design/ }).focus();
  await page.keyboard.press('ArrowRight');
  const development = tabs.getByRole('tab', { name: /Development/ });
  await expect(development).toBeFocused();
  await expect(development).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: /Solution Design/ })).toBeFocused();
});

test('an opened stage stays free of serious WCAG violations', async ({ page }) => {
  await page.goto(url('/migration-case/'));
  await page.getByRole('tab', { name: /Development/ }).click();
  await page
    .getByRole('tabpanel')
    .getByRole('button', { name: /Implement/ })
    .click();
  const result = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const serious = result.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(serious).toEqual([]);
});
