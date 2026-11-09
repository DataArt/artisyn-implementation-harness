// Tier palette — duplicated from docs/.og/constants.mjs's `TIER_COLORS` (a
// small, low-churn map; kept here rather than cross-importing a generated
// runtime file the web build shouldn't depend on for correctness). Shared by
// both the Cytoscape stylesheet below and the fallback table's captions.
export const TIER_COLORS: Record<string, string> = {
  HLD: '#1D4ED8',
  LLD: '#0E7490',
  EngineeringGuide: '#065F46',
  Story: '#D97706',
  Product: '#7C3AED',
  AppReadme: '#4B5563',
};
export const UNTIERED_TIER = 'Other';
export const UNTIERED_COLOR = '#6B7280';

export function tierColor(tier: string): string {
  return TIER_COLORS[tier] ?? UNTIERED_COLOR;
}

// Concentric ring order for the Graph Explorer's Cytoscape layout — ring 0
// is the center, higher numbers sit further out. `AppReadme` and the
// untiered `UNTIERED_TIER` ('Other') share the outermost ring (confirmed:
// not folded into Story's ring).
export const TIER_RING: Record<string, number> = {
  Product: 0,
  HLD: 1,
  LLD: 2,
  EngineeringGuide: 3,
  Story: 4,
  AppReadme: 5,
  [UNTIERED_TIER]: 5,
};
const UNTIERED_RING = 5;

export function tierRing(tier: string): number {
  return TIER_RING[tier] ?? UNTIERED_RING;
}

/**
 * The six graduation edge types (docs/.og/constants.mjs's `EDGE_TYPES`) plus
 * the scan-authored `references` type, the derived `mirrors-*` pair, and the
 * fully-automatic `keyword-match` type — grouped into four visual/filter
 * buckets so the UI doesn't need seven separate checkboxes. `keyword-match`
 * alone outnumbers every other type combined (503 of ~660 edges on this
 * repo's own graph), so it gets the lightest, most recessive style —
 * otherwise it visually drowns the hand-curated edges.
 */
export type EdgeGroup = 'keyword-match' | 'references' | 'graduation' | 'mirrors';

export function edgeGroup(edgeType: string): EdgeGroup {
  if (edgeType === 'keyword-match') return 'keyword-match';
  if (edgeType === 'references') return 'references';
  if (edgeType.startsWith('mirrors-')) return 'mirrors';
  return 'graduation';
}

export const EDGE_GROUP_LABELS: Record<EdgeGroup, string> = {
  'keyword-match': 'Keyword match (automatic)',
  references: 'References (content links)',
  graduation: 'Graduation (Story/Design → HLD/LLD/Guide)',
  mirrors: 'Mirrors (HLD ↔ LLD)',
};

/**
 * Cytoscape's own plain-text stylesheet syntax (attribute selectors), not a
 * JS style array — the pattern wineandcheesemap uses, so tier/edge-type
 * rules read as a flat, scannable list rather than a nested object tree.
 * `min-zoomed-font-size` (tokyo-railways' affordance): at ~115 nodes/~660
 * edges, rendering every label at every zoom level is both unreadable and
 * slow — labels only draw once zoomed in enough to read them.
 *
 * `labelTextColor`/`labelBackgroundColor` are read by the caller from this
 * site's own `--vp-c-text-1`/`--vp-c-bg-soft` CSS custom properties at
 * render time. VitePress's default theme (which this site uses) toggles
 * both variables' values when the `dark` class is added/removed from
 * `<html>` — a hardcoded near-black label color (the original
 * `#1f2937`) paired with a hardcoded white plate would turn illegible in
 * dark mode once the plate itself goes dark-aware (dark text on a dark
 * plate), so both tokens need to travel together, not just the background.
 * Reading VitePress's own paired text/background tokens guarantees the same
 * contrast the rest of the site already relies on, in both appearance
 * modes. Defaults are light-mode VitePress values, used only by callers
 * (e.g. tests) that don't have a `document` to read from.
 */
export function buildCytoscapeStyle(
  labelTextColor = '#1f2937',
  labelBackgroundColor = '#ffffff'
): string {
  const tierRules = Object.entries(TIER_COLORS)
    .map(([tier, color]) => `node[tier = "${tier}"] { background-color: ${color}; }`)
    .join('\n');

  return `
node {
  width: 24;
  height: 24;
  font-size: 10;
  min-zoomed-font-size: 8;
  label: data(label);
  text-wrap: ellipsis;
  text-max-width: 120;
  text-valign: bottom;
  text-margin-y: 4;
  color: ${labelTextColor};
  text-background-color: ${labelBackgroundColor};
  text-background-opacity: 0.88;
  text-background-shape: roundrectangle;
  text-background-padding: 2;
  background-color: ${UNTIERED_COLOR};
}

${tierRules}

node.graph-explorer-hidden,
edge.graph-explorer-hidden {
  display: none;
}

edge {
  curve-style: haystack;
  haystack-radius: 0;
  width: 1;
  target-arrow-shape: none;
}

edge[group = "keyword-match"] {
  line-color: #9ca3af;
  opacity: 0.25;
  width: 1;
}

edge[group = "references"] {
  line-color: #2563eb;
  opacity: 0.8;
  width: 1.5;
}

edge[group = "graduation"] {
  line-color: #15803d;
  opacity: 0.9;
  width: 2;
  line-style: solid;
}

edge[group = "mirrors"] {
  line-color: #b45309;
  opacity: 0.7;
  width: 1.5;
  line-style: dashed;
}
`;
}
