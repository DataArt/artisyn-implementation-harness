import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { defineLoader } from 'vitepress';

export interface GraphDoc {
  id: string;
  tier: string | null;
  path: string;
  title: string | null;
}

export interface GraphEdge {
  from_id: string;
  to_id: string;
  edge_type: string;
}

export interface GraphExplorerData {
  docs: GraphDoc[];
  edges: GraphEdge[];
}

const dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.resolve(dirname, '../../../../../docs/.og/docs-operational-graph.sqlite');

// Build-time query, read directly from the same sqlite `site-build.sh` keeps
// current via `cli.mjs build` before this runs. This is the fallback render
// GraphExplorer falls back to when the client-side live query (fetch +
// sql.js) fails — never a blank or broken page. The db itself can be absent
// (a fresh bootstrap before `/harness-bootstrap launch`/`reindex-graph` has
// ever run) — that must not fail the whole VitePress build, only leave this
// one loader's data empty; GraphExplorer's own live sql.js query is already
// built to recover from an empty/failed fetch.
export default defineLoader({
  watch: [DB_FILE],
  load(): GraphExplorerData {
    if (!fs.existsSync(DB_FILE)) return { docs: [], edges: [] };
    let db: DatabaseSync;
    try {
      db = new DatabaseSync(DB_FILE, { readOnly: true });
    } catch {
      return { docs: [], edges: [] };
    }
    try {
      const docs = db
        .prepare('SELECT id, tier, path, title FROM docs ORDER BY tier, title')
        .all() as unknown as GraphDoc[];
      const edges = db
        .prepare('SELECT from_id, to_id, edge_type FROM edges')
        .all() as unknown as GraphEdge[];
      return { docs, edges };
    } catch {
      return { docs: [], edges: [] };
    } finally {
      db.close();
    }
  },
});

// VitePress's Vite plugin rewrites this module at load time to export a
// `data` const (the `load()` result above) — a virtual transform `tsc`
// can't see. This ambient declaration is type-only (erased, never
// implemented here) so consumers can `import { data } from
// './graphExplorer.data'` and have it typecheck, matching VitePress's own
// documented pattern for typed data loaders.
export declare const data: GraphExplorerData;
