// Shared constants for the operational-graph tool (docs/.og/). No other file in
// this folder depends on another's internals except through these names.

/** SQLite file, relative to the project root this tool is invoked against. */
export const DB_FILE = 'docs/.og/docs-operational-graph.sqlite';

/** Generated Mermaid artifact, emitted by build(), relative to the project root. */
export const MERMAID_FILE = 'docs/.og/graph.mmd';

/** The six authored (derived=0) graduation edges, per Documents Flow's six
 * `/dev document` / `/design publish` outputs — written by index()'s --edge flag. */
export const EDGE_TYPES = Object.freeze([
  'story-to-product',
  'story-to-hld',
  'impl-to-hld',
  'impl-to-lld',
  'impl-to-engineering-guide',
  'impl-to-readme',
]);

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
  AppReadme: '#4B5563',
});

/** Repo-relative path prefixes used to infer a doc's tier. Order matters: first match wins. */
export const TIER_PATH_PREFIXES = Object.freeze([
  ['docs/Target Architecture (HLD)', 'HLD'],
  ['docs/System Architecture (LLD)', 'LLD'],
  ['docs/Engineering Guide', 'EngineeringGuide'],
  ['docs/Harness', 'Product'],
  ['docs/Stories', 'Story'],
]);

/** Matches an `apps/<project>/README.md` path (any depth of `apps/`). */
export const APP_README_PATTERN = /(^|\/)apps\/[^/]+\/README\.md$/;

/** HLD/LLD roots, diffed by `edges.mjs`'s `computeMirrors()`. */
export const HLD_ROOT = 'docs/Target Architecture (HLD)';
export const LLD_ROOT = 'docs/System Architecture (LLD)';

/** A well-formed container name: alphanumeric boundaries, no leading/trailing symbol. */
export const VALID_NAME = /^[A-Za-z0-9][A-Za-z0-9 _-]*[A-Za-z0-9]$/;
