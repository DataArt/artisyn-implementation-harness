// Shared constants for the operational-graph tool (docs/.og/). No other file in
// this folder depends on another's internals except through these names.

/** SQLite file, relative to the project root this tool is invoked against. */
export const DB_FILE = 'docs/.og/docs-operational-graph.sqlite';

/** Generated Mermaid artifact, emitted by build(), relative to the project root. */
export const MERMAID_FILE = 'docs/.og/graph.mmd';

/** The five authored (derived=0) graduation edges, per Documents Flow's
 * `/dev document` / `/design publish` outputs — written by index()'s --edge flag. */
export const EDGE_TYPES = Object.freeze([
  'story-to-product',
  'story-to-hld',
  'impl-to-hld',
  'impl-to-lld',
  'impl-to-engineering-guide',
]);

/** Retired graduation type: `migrate` re-types any remaining edge of it to `references`. */
export const RETIRED_EDGE_TYPE = 'impl-to-readme';

/** A doc pair sharing at least this many normalized `keywords:` tokens gets a
 * `keyword-match` edge — computed from the stored column, no content re-read. */
export const KEYWORD_MATCH_MIN_SHARED = 1;

/** Computed (derived=1) edges, written only by build()/reindex()'s own HLD/LLD
 * diff or keyword-overlap comparison — never by reading a doc's full content. */
export const DERIVED_EDGE_TYPES = Object.freeze([
  'mirrors-consistent',
  'mirrors-gap',
  'keyword-match',
]);

/** A generic, grounded content cross-reference between two docs — written
 * (derived=0, same as the six graduation types) by `reindex-graph.md`'s
 * intelligent scan when a doc's actual content names another doc it
 * implements/references, not a graduation event. Never fabricates Story
 * provenance; see that reference's Step 2. */
export const SCAN_EDGE_TYPES = Object.freeze(['references']);

/** Every edge type `index()`'s `--edge` flag accepts. */
export const AUTHORED_EDGE_TYPES = Object.freeze([...EDGE_TYPES, ...SCAN_EDGE_TYPES]);

export const ALL_EDGE_TYPES = Object.freeze([...AUTHORED_EDGE_TYPES, ...DERIVED_EDGE_TYPES]);

/** Doc tiers, keyed the same way as `solution/Architecture.md`'s classDef colors. */
export const TIER_COLORS = Object.freeze({
  HLD: '#1D4ED8',
  LLD: '#0E7490',
  EngineeringGuide: '#065F46',
  Story: '#D97706',
  Product: '#7C3AED',
});

/** The tier names, a static list: only their path prefixes may come from config. */
export const TIER_NAMES = Object.freeze(['HLD', 'LLD', 'EngineeringGuide', 'Product', 'Story']);

/** Fixed tier roots (bundle roots). The Product root comes from `og.config.json`. */
export const TIER_ROOTS = Object.freeze({
  HLD: 'docs/Target Architecture (HLD)',
  LLD: 'docs/System Architecture (LLD)',
  EngineeringGuide: 'docs/Engineering Guide',
  Story: 'docs/Stories',
});

/** Project-owned config naming the Product folder: `{"productDir": "docs/<folder>"}`. */
export const CONFIG_FILE = 'docs/.og/og.config.json';

/** Copy of a v0 DB taken before the on-open v0 → v1 migration. */
export const BACKUP_FILE = 'docs/.og/docs-operational-graph.v0.bak.sqlite';

/** The canonical type map: per tier, path patterns relative to the bundle root
 * (`**` any folders, `*` within one segment); the first match wins. */
export const TYPE_MAP = Object.freeze({
  HLD: [
    ['**/Containers/*.md', 'Container'],
    ['**/Non-Functional Concerns/*.md', 'Non-Functional Requirements'],
    ['**/System Overview.md', 'System Overview'],
    ['**/System Sizing.md', 'System Sizing'],
    ['README.md', 'Version Router'],
  ],
  LLD: [
    ['README.md', 'Component Registry'],
    ['*/*.md', 'Component Design'],
  ],
  EngineeringGuide: [],
  Product: [],
  Story: [
    ['**/design/00 Frame.md', 'Design Frame'],
    ['**/design/01 Research*.md', 'Design Research'],
    ['**/design/02 Evaluate*.md', 'Design Evaluation'],
    ['**/design/Report.md', 'Design Report'],
    ['**/solution/Architecture.md', 'Solution Architecture'],
    ['**/solution/Design*.md', 'Solution Design'],
    ['**/solution/Stack.md', 'Solution Stack'],
    ['**/solution/Efforts.md', 'Solution Efforts'],
    ['**/impl/0-intent.md', 'Dev Intent'],
    ['**/impl/1-plan.md', 'Implementation Plan'],
    ['**/impl/2-report.md', 'Implementation Report'],
  ],
});

/** Per-tier `type` when no pattern matches. */
export const TYPE_FALLBACK = Object.freeze({
  HLD: 'HLD',
  LLD: 'LLD',
  EngineeringGuide: 'Guide',
  Product: 'Product Concept',
  Story: 'Story Note',
});

/** `type` of an in-scope doc outside every bundle (e.g. `docs/README.md`). */
export const UNTIERED_TYPE = 'Reference';

/** The OKF version every bundle root `index.md` pins. */
export const OKF_VERSION = '0.2';

/** HLD/LLD roots, diffed by `edges.mjs`'s `computeMirrors()`. */
export const HLD_ROOT = 'docs/Target Architecture (HLD)';
export const LLD_ROOT = 'docs/System Architecture (LLD)';

/** A well-formed container name: alphanumeric boundaries, no leading/trailing symbol. */
export const VALID_NAME = /^[A-Za-z0-9][A-Za-z0-9 _-]*[A-Za-z0-9]$/;
