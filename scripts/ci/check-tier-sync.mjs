// Fails loudly if apps/web-docs's hand-duplicated TIER_COLORS (Graph Explorer's
// Cytoscape stylesheet) drifts from the canonical tier taxonomy in
// docs/.og/constants.mjs. The web build intentionally doesn't import the
// canonical module at runtime (TD-7 in DESIGN-20261102-Q5MU's report), so this
// is a build-time text check instead of a real import — regenerate this script
// if either file's shape changes enough to break the regex below.
import fs from 'node:fs';
import path from 'node:path';
import { TIER_PATH_PREFIXES, APP_README_PATTERN } from '../../docs/.og/constants.mjs';

const canonicalTiers = new Set(TIER_PATH_PREFIXES.map(([, tier]) => tier));
if (APP_README_PATTERN) canonicalTiers.add('AppReadme');

const stylePath = path.resolve(
  import.meta.dirname,
  '../../apps/web-docs/.vitepress/theme/GraphExplorer/cytoscapeStyle.ts'
);
const styleSource = fs.readFileSync(stylePath, 'utf8');
const match = styleSource.match(/TIER_COLORS:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\}/);
if (!match) {
  console.error(`check-tier-sync: could not find TIER_COLORS in ${stylePath}`);
  process.exit(1);
}
const uiTiers = new Set([...match[1].matchAll(/^\s*(\w+):/gm)].map((m) => m[1]));

const missingFromUi = [...canonicalTiers].filter((t) => !uiTiers.has(t));
const extraInUi = [...uiTiers].filter((t) => !canonicalTiers.has(t));

if (missingFromUi.length || extraInUi.length) {
  console.error(
    "check-tier-sync: GraphExplorer/cytoscapeStyle.ts's TIER_COLORS has drifted from docs/.og/constants.mjs's tier taxonomy."
  );
  if (missingFromUi.length)
    console.error(`  Missing from TIER_COLORS: ${missingFromUi.join(', ')}`);
  if (extraInUi.length) console.error(`  No longer a real tier: ${extraInUi.join(', ')}`);
  console.error(
    '  Update apps/web-docs/.vitepress/theme/GraphExplorer/cytoscapeStyle.ts to match.'
  );
  process.exit(1);
}

console.log('check-tier-sync: TIER_COLORS matches the canonical tier taxonomy.');
