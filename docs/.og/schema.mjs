// SQLite schema, its own file — not CLI logic, not a constant value, just the
// DDL that `cli.mjs` applies on open. `docs`: one row per indexed doc. `edges`:
// typed relations between doc IDs; `derived` distinguishes the authored
// EDGE_TYPES (written by index()'s --edge) from the computed DERIVED_EDGE_TYPES
// (written by build()/reindex()'s own HLD/LLD diff).
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS docs (
  id TEXT PRIMARY KEY,
  tier TEXT,
  path TEXT UNIQUE NOT NULL,
  title TEXT,
  purpose TEXT,
  keywords TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS edges (
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  edge_type TEXT NOT NULL,
  derived INTEGER NOT NULL,
  UNIQUE(from_id, to_id, edge_type)
);
`;
