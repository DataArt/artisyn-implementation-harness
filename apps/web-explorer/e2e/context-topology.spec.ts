import AxeBuilder from '@axe-core/playwright';
import { test, expect, url } from './pages-emulation';

test('the topology tabs switch the diagram and the launch steps', async ({ page }) => {
  await page.goto(url('/cookbook/context-topology/'));
  const tabs = page.getByRole('tablist', { name: 'Context topologies' });
  await expect(tabs.getByRole('tab')).toHaveCount(4);
  const panel = page.getByRole('tabpanel');
  await expect(tabs.getByRole('tab', { name: /One workload, one monorepo/ })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  await expect(panel).toContainText('Design scope: Project-scoped (the default)');

  await tabs.getByRole('tab', { name: /Hundreds of repos/ }).click();
  await expect(panel).toHaveAttribute('aria-labelledby', 'ct-tab-mani-workspace');
  await expect(panel).toContainText('mani.yaml');
  await expect(panel).toContainText('tag: payments');

  await tabs.getByRole('tab', { name: /Hundreds of repos/ }).press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: /One workload, one monorepo/ })).toBeFocused();
});

test('every topology panel is free of serious WCAG violations', async ({ page }) => {
  await page.goto(url('/cookbook/context-topology/'));
  const tabs = page.getByRole('tablist', { name: 'Context topologies' });
  for (const name of [/Two-track/, /Many repos/, /Hundreds of repos/]) {
    await tabs.getByRole('tab', { name }).click();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = result.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect(serious).toEqual([]);
  }
});
