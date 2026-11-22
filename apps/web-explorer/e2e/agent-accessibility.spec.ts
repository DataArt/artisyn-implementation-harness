import AxeBuilder from '@axe-core/playwright';
import { test, expect, url } from './pages-emulation';
import { ROUTES } from './routes';

/**
 * The axe rules Lighthouse's `agent-accessibility-tree` audit reports
 * (TARGET_RULES in core/audits/agentic/agent-accessibility-tree.js, Lighthouse 13.4.1).
 * Keep in step with that file when Lighthouse is upgraded.
 */
const AGENT_RULES = [
  'button-name',
  'input-button-name',
  'input-image-alt',
  'label',
  'link-name',
  'select-name',
  'document-title',
  'aria-allowed-attr',
  'aria-allowed-role',
  'aria-command-name',
  'aria-conditional-attr',
  'aria-dialog-name',
  'aria-hidden-body',
  'aria-hidden-focus',
  'aria-input-field-name',
  'aria-prohibited-attr',
  'aria-required-attr',
  'aria-required-children',
  'aria-required-parent',
  'aria-roles',
  'aria-text',
  'aria-toggle-field-name',
  'aria-tooltip-name',
  'aria-treeitem-name',
  'aria-valid-attr',
  'aria-valid-attr-value',
  'duplicate-id-aria',
  'definition-list',
  'table-duplicate-name',
  'tabindex',
  'autocomplete-valid',
  'presentation-role-conflict',
  'svg-img-alt',
];

for (const route of [...ROUTES, '/no-such-page/']) {
  test(`${route} has no agent-accessibility violation`, async ({ page }) => {
    await page.goto(url(route));
    await page.waitForLoadState('networkidle');
    const result = await new AxeBuilder({ page }).withRules(AGENT_RULES).analyze();
    const summary = result.violations.map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
    );
    expect(summary).toEqual([]);
  });
}
