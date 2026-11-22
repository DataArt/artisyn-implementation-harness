import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

/**
 * NFR-A17/A18: WCAG 2.2 AA rules, failing on serious or critical violations. Pages that do not
 * pass yet are held to wcag-baseline.json (TD-2): per page, the rules allowed to fail and how many
 * elements each may flag. A new rule, a higher count or a rule that no longer fails (remove it)
 * fails the test. `WCAG_BASELINE=update yarn playwright test agent-accessibility` rewrites it.
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const BASELINE_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'wcag-baseline.json');
const UPDATE = process.env.WCAG_BASELINE === 'update';
type Baseline = Record<string, Record<string, number>>;
const readBaseline = (): Baseline =>
  fs.existsSync(BASELINE_FILE) ? JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')) : {};

test.describe('WCAG 2.2 AA', () => {
  // Update mode rewrites one shared file, so its cases run one at a time.
  if (UPDATE) test.describe.configure({ mode: 'serial' });

  for (const route of [...ROUTES, '/no-such-page/']) {
    test(`${route} has no serious or critical WCAG violation beyond the baseline`, async ({
      page,
    }) => {
      await page.goto(url(route));
      await page.waitForLoadState('networkidle');
      const result = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      const found = Object.fromEntries(
        result.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => [v.id, v.nodes.length])
      );

      if (UPDATE) {
        const baseline = readBaseline();
        if (Object.keys(found).length) baseline[route] = found;
        else delete baseline[route];
        const sorted = Object.fromEntries(
          Object.entries(baseline).sort(([a], [b]) => a.localeCompare(b))
        );
        fs.writeFileSync(BASELINE_FILE, `${JSON.stringify(sorted, null, 2)}\n`);
        return;
      }

      const allowed = readBaseline()[route] ?? {};
      const problems = [
        ...Object.entries(found)
          .filter(([id, count]) => count > (allowed[id] ?? 0))
          .map(([id, count]) => `${id}: ${count} element(s), baseline allows ${allowed[id] ?? 0}`),
        ...Object.keys(allowed)
          .filter((id) => !(id in found))
          .map((id) => `${id}: fixed, remove it from wcag-baseline.json`),
      ];
      expect(problems).toEqual([]);
    });
  }
});
