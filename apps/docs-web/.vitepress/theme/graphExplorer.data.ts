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

export interface GraphExplorerData {
  docs: GraphDoc[];
}

const dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.resolve(dirname, '../../../../docs/.og/docs-operational-graph.sqlite');

// Build-time query, read directly from the same sqlite `site-build.sh` keeps
// current via `cli.mjs build` before this runs. This is the fallback render
// GraphExplorer.vue falls back to when the client-side live query (fetch +
// sql.js) fails — never a blank or broken page.
export default defineLoader({
  watch: [DB_FILE],
  load(): GraphExplorerData {
    const db = new DatabaseSync(DB_FILE, { readOnly: true });
    try {
      const docs = db
        .prepare('SELECT id, tier, path, title FROM docs ORDER BY tier, title')
        .all() as unknown as GraphDoc[];
      return { docs };
    } finally {
      db.close();
    }
  },
});
