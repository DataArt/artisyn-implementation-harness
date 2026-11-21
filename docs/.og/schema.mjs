// SQLite schema, its own file — not CLI logic, not a constant value, just the
// DDL that `cli.mjs` applies on open. `docs`: one row per indexed doc. `edges`:
// typed relations between doc IDs; `derived` distinguishes the authored
// EDGE_TYPES (written by index()'s --edge) from the computed DERIVED_EDGE_TYPES
// (written by build()/reindex()'s own HLD/LLD diff).

/** Schema version this OG writes and reads, stored as `PRAGMA user_version`. */
export const SCHEMA_VERSION = 1;

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS docs (
  id TEXT PRIMARY KEY,
  tier TEXT,
  type TEXT,
  path TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  tags TEXT,
  created_at TEXT,
  modified_at TEXT,
  indexed_at TEXT
);
CREATE TABLE IF NOT EXISTS edges (
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  edge_type TEXT NOT NULL,
  derived INTEGER NOT NULL,
  UNIQUE(from_id, to_id, edge_type)
);
`;

/** v0 → v1, run in one transaction. Rows and edges are kept. */
export const MIGRATIONS_V0_TO_V1 = Object.freeze([
  'ALTER TABLE docs RENAME COLUMN purpose TO description',
  'ALTER TABLE docs RENAME COLUMN keywords TO tags',
  'ALTER TABLE docs RENAME COLUMN updated_at TO indexed_at',
  'ALTER TABLE docs ADD COLUMN type TEXT',
  'ALTER TABLE docs ADD COLUMN created_at TEXT',
  'ALTER TABLE docs ADD COLUMN modified_at TEXT',
  'PRAGMA user_version = 1',
]);
