#!/usr/bin/env node
// Operational-graph tool: a deterministic knowledge graph over the repo's doc
// tiers. CLI entry (parseArgs, dispatch map, mirrors timing.mjs's own shape) and
// the programmatic module imported by the VitePress build hook and lifecycle
// skills. Zero runtime dependencies beyond node:sqlite (a Node built-in).
// This file is orchestration only — it operates on a DocsStore and an
// EdgesStore instance; neither file's own table SQL lives here.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { DatabaseSync } from 'node:sqlite';

import { DB_FILE, MERMAID_FILE, AUTHORED_EDGE_TYPES } from './constants.mjs';
import { SCHEMA } from './schema.mjs';
import { need, atomicWrite, listMarkdownFiles, toPosixRelative } from './utils.mjs';
import { DocsStore } from './docs.mjs';
import { EdgesStore, computeMirrors, computeKeywordMatches } from './edges.mjs';

/**
 * Open (creating if absent) the graph database at `dir`'s DB_FILE, schema
 * ensured, and wrap it as a `{ docs, edges }` store pair.
 * @returns {{db: import('node:sqlite').DatabaseSync, docs: DocsStore, edges: EdgesStore}}
 */
function openStore(dir) {
  const dbPath = path.join(dir, DB_FILE);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(SCHEMA);
  return { db, docs: new DocsStore(db), edges: new EdgesStore(db) };
}

/**
 * Assign/confirm a doc's ID via `DocsStore.assign()` and, when `--edge` is
 * given, write the authored (derived=0) graduation edge via `EdgesStore.write()`.
 * @param {{dir: string, doc: string, id?: string, edge?: string, to?: string}} opts
 */
export async function index({ dir, doc, id, edge, to }) {
  const { db, docs, edges } = openStore(dir);
  try {
    const absDoc = path.isAbsolute(doc) ? doc : path.join(dir, doc);
    const assigned = docs.assign(dir, absDoc, { id });
    if (edge) {
      need(
        AUTHORED_EDGE_TYPES.includes(edge),
        `Unknown edge type: ${edge} (expected one of ${AUTHORED_EDGE_TYPES.join(', ')})`
      );
      need(to, '--edge requires --to');
      const absTo = path.isAbsolute(to) ? to : path.join(dir, to);
      const relTo = toPosixRelative(dir, absTo);
      const toRow = need(docs.findByPath(relTo), `--to target is not indexed: ${relTo}`);
      edges.write(assigned.id, toRow.id, edge, 0);
    }
    return assigned;
  } finally {
    db.close();
  }
}

/**
 * Retract a specific edge — the review/stale-edge-cleanup path
 * (`reindex-graph.md`'s Step 2c). Both `doc` and `to` must already be
 * indexed; a no-op if the edge is already gone.
 * @param {{dir: string, doc: string, edge: string, to: string}} opts
 */
export async function unedge({ dir, doc, edge, to }) {
  need(
    AUTHORED_EDGE_TYPES.includes(edge),
    `Unknown edge type: ${edge} (expected one of ${AUTHORED_EDGE_TYPES.join(', ')})`
  );
  const { db, docs, edges } = openStore(dir);
  try {
    const absDoc = path.isAbsolute(doc) ? doc : path.join(dir, doc);
    const absTo = path.isAbsolute(to) ? to : path.join(dir, to);
    const fromRow = need(
      docs.findByPath(toPosixRelative(dir, absDoc)),
      `--doc is not indexed: ${doc}`
    );
    const toRow = need(docs.findByPath(toPosixRelative(dir, absTo)), `--to is not indexed: ${to}`);
    edges.remove(fromRow.id, toRow.id, edge);
  } finally {
    db.close();
  }
}

/**
 * Assign IDs to every doc under `docs/` still missing one, prune rows for docs
 * whose file was deleted since the last reindex (cascading their edges), then
 * recompute every derived edge: mirrors-consistent/mirrors-gap (HLD/LLD diff)
 * and keyword-match (shared `keywords:` tokens — from the stored column, no
 * content read). Idempotent: a second run with nothing changed on disk
 * changes nothing.
 * @param {{dir: string}} opts
 * @returns {Promise<{skipped: {path: string, reason: string}[], pruned: string[]}>}
 */
export async function reindex({ dir }) {
  const { db, docs, edges } = openStore(dir);
  try {
    const found = listMarkdownFiles(path.join(dir, 'docs'));
    for (const file of found) docs.assign(dir, file);
    const pruned = docs.pruneExcept(new Set(found.map((file) => toPosixRelative(dir, file))));
    edges.removeForDocs(pruned);
    const { edges: mirrorEdges, skipped } = computeMirrors(dir);
    for (const edge of mirrorEdges) {
      const from = docs.findByPath(edge.fromPath);
      if (!from) continue; // Not indexed (e.g. no docs/ tree yet) — nothing to relate.
      edges.write(from.id, edge.toPlaceholder, edge.edgeType, 1);
    }
    edges.removeAllOfType('keyword-match');
    for (const { fromId, toId } of computeKeywordMatches(docs.all()))
      edges.write(fromId, toId, 'keyword-match', 1);
    return { skipped, pruned };
  } finally {
    db.close();
  }
}

/**
 * Mermaid node IDs are unquoted and bare; a raw `:` is reserved syntax, not a
 * safe character. Sanitize to a safe ID.
 * @returns {string}
 */
function safeMermaidId(id) {
  return id.replace(/[^A-Za-z0-9_]/g, '_');
}

/** Quote a node's display text safely for Mermaid's `["..."]` text syntax. */
function quoteMermaidText(text) {
  return text.replace(/"/g, '#quot;');
}

const UNTIERED_BRANCH = 'Other';

/**
 * Render the generated Mermaid artifact as a tier-rooted `mindmap`: one
 * branch per tier, one leaf per doc. Mermaid's `mindmap` is a tree, not a
 * graph — it cannot draw the `edges` table's cross-doc relations (mirrors or
 * authored); those stay queryable via `query()`/`search()`, just not drawn
 * here. Favors a tier-grouped overview over edge visualization.
 *
 * Unlike flowchart, mindmap's grammar has no `classDef` statement (confirmed
 * against its compiled parser table — no `CLASSDEF` terminal exists), so
 * there is no in-diagram way to color nodes by tier; that is why tier
 * identity here is conveyed only by the branch label, not a fill color.
 */
function renderMermaid(docs) {
  const lines = ['mindmap', '  root(("Operational Graph"))'];
  const byTier = new Map();
  for (const doc of docs.all()) {
    const tier = doc.tier ?? UNTIERED_BRANCH;
    if (!byTier.has(tier)) byTier.set(tier, []);
    byTier.get(tier).push(doc);
  }
  for (const [tier, tierDocs] of byTier) {
    lines.push(`    ${tier}`);
    for (const doc of tierDocs)
      lines.push(`      ${safeMermaidId(doc.id)}["${quoteMermaidText(doc.title ?? doc.path)}"]`);
  }
  return lines.join('\n') + '\n';
}

/**
 * Full (re)build: ensure the schema, reindex every doc (assign/prune, cascade
 * edges) and the derived mirrors edges, then emit the generated Mermaid
 * artifact. Rolls back on partial failure.
 * @param {{dir: string}} opts
 * @returns {Promise<{skipped: {path: string, reason: string}[], pruned: string[]}>}
 */
export async function build({ dir }) {
  let result;
  try {
    result = await reindex({ dir });
  } catch (error) {
    throw new Error(`build() failed, no artifact written: ${error.message}`, { cause: error });
  }
  const { db, docs } = openStore(dir);
  try {
    atomicWrite(path.join(dir, MERMAID_FILE), renderMermaid(docs));
  } finally {
    db.close();
  }
  return result;
}

/**
 * @param {{dir: string, relatedTo: string, edge?: string}} opts
 * @returns {Promise<import('./edges.mjs').EdgeRow[]>}
 */
export async function query({ dir, relatedTo, edge }) {
  const { db, docs, edges } = openStore(dir);
  try {
    const abs = path.isAbsolute(relatedTo) ? relatedTo : path.join(dir, relatedTo);
    const relPath = fs.existsSync(abs) ? toPosixRelative(dir, abs) : relatedTo;
    const doc = docs.findByPath(relPath) ?? docs.findById(relatedTo);
    return doc ? edges.queryFrom(doc.id, edge) : [];
  } finally {
    db.close();
  }
}

/**
 * @param {{dir: string, term: string}} opts
 * @returns {Promise<{id: string, path: string, title: string|null}[]>}
 */
export async function search({ dir, term }) {
  const { db, docs } = openStore(dir);
  try {
    const needle = term.toLowerCase();
    return docs
      .all()
      .filter((row) => {
        const haystack = [row.title, row.purpose, row.keywords]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (haystack.includes(needle)) return true;
        const abs = path.join(dir, row.path);
        return fs.existsSync(abs) && fs.readFileSync(abs, 'utf8').toLowerCase().includes(needle);
      })
      .map(({ id, path: p, title }) => ({ id, path: p, title }));
  } finally {
    db.close();
  }
}

const MISSING_FIELDS = ['purpose', 'keywords'];

/**
 * Every indexed doc, or (with `missing`) only those still missing `purpose`
 * and/or `keywords`. A pure query, no writes. The caller (an agent, following
 * `reindex-graph.md`'s intelligent-scan step) reads what comes back and
 * writes frontmatter/edges itself; this script never derives or writes
 * `purpose`/`keywords`/content-reference edges on its own.
 * @param {{dir: string, missing?: string}} opts `missing`, when given, is a
 *   comma-separated subset of `purpose,keywords`; omitted means every doc.
 * @returns {Promise<import('./docs.mjs').DocRow[]>}
 */
export async function list({ dir, missing }) {
  const fields = missing ? missing.split(',').map((field) => field.trim()) : [];
  for (const field of fields)
    need(
      MISSING_FIELDS.includes(field),
      `Unknown --missing field: ${field} (expected purpose, keywords)`
    );
  const { db, docs } = openStore(dir);
  try {
    return fields.length ? docs.missing(fields) : docs.all();
  } finally {
    db.close();
  }
}

// --- CLI entry -------------------------------------------------------------

const USAGE = `Usage: cli.mjs <command> [options]

Commands:
  build   --dir <root>
  index   --dir <root> --doc <path> [--edge <type> --to <path>] [--id <id>]
  reindex --dir <root>
  query   --dir <root> --related-to <id|path> [--edge <type>]
  search  --dir <root> --term <text>
  list    --dir <root> [--missing <purpose|keywords|purpose,keywords>]
  unedge  --dir <root> --doc <path> --edge <type> --to <path>
`;

async function runCli() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h') {
    console.log(USAGE);
    return command ? 0 : 1;
  }
  const { values } = parseArgs({
    args: rest,
    options: {
      dir: { type: 'string' },
      doc: { type: 'string' },
      id: { type: 'string' },
      edge: { type: 'string' },
      to: { type: 'string' },
      'related-to': { type: 'string' },
      term: { type: 'string' },
      missing: { type: 'string' },
    },
  });
  const dir = need(values.dir, '--dir is required');
  const handlers = {
    build: () => build({ dir }),
    index: () =>
      index({
        dir,
        doc: need(values.doc, '--doc is required'),
        id: values.id,
        edge: values.edge,
        to: values.to,
      }),
    reindex: () => reindex({ dir }),
    query: () =>
      query({
        dir,
        relatedTo: need(values['related-to'], '--related-to is required'),
        edge: values.edge,
      }),
    search: () => search({ dir, term: need(values.term, '--term is required') }),
    list: () => list({ dir, missing: values.missing }),
    unedge: () =>
      unedge({
        dir,
        doc: need(values.doc, '--doc is required'),
        edge: need(values.edge, '--edge is required'),
        to: need(values.to, '--to is required'),
      }),
  };
  const handler = handlers[command];
  if (!handler) {
    console.error(`Unknown command: ${command}\n\n${USAGE}`);
    return 1;
  }
  console.log(JSON.stringify(await handler(), null, 2));
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(`cli.mjs: ${error.message}`);
      process.exitCode = 1;
    });
}
