// Writes src/views/cookbook/case/dogfood/graph.json from the operational graph DB: every doc
// (id, tier, title, path under docs/) and every authored edge. Run from the repo
// root after `node docs/.og/cli.mjs build --dir .`:
//   node apps/web-explorer/scripts/export-dogfood-graph.mjs
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('docs/.og/docs-operational-graph.sqlite', { readOnly: true });
const docs = db
  .prepare(
    "SELECT id, COALESCE(tier, 'Other') AS tier, COALESCE(title, '') AS title, path FROM docs ORDER BY path"
  )
  .all();
const ids = new Set(docs.map((d) => d.id));
const edges = db
  .prepare('SELECT from_id, to_id, edge_type FROM edges WHERE derived = 0')
  .all()
  .filter((e) => ids.has(e.from_id) && ids.has(e.to_id))
  .map((e) => [e.from_id, e.to_id, e.edge_type]);
const nodes = docs.map((d) => ({
  id: d.id,
  tier: d.tier,
  title: d.title || d.path.split('/').pop().replace(/\.md$/, ''),
  path: d.path.replace(/^docs\//, ''),
}));
const out = 'apps/web-explorer/src/views/cookbook/case/dogfood/graph.json';
fs.writeFileSync(out, JSON.stringify({ nodes, edges }) + '\n');
console.log(`${out}: ${nodes.length} docs, ${edges.length} authored edges`);
