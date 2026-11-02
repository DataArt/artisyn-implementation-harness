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

import { DB_FILE, MERMAID_FILE, EDGE_TYPES, TIER_COLORS } from './constants.mjs';
import { SCHEMA } from './schema.mjs';
import { need, atomicWrite, listMarkdownFiles, toPosixRelative } from './utils.mjs';
import { DocsStore } from './docs.mjs';
import { EdgesStore, computeMirrors } from './edges.mjs';

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
        EDGE_TYPES.includes(edge),
        `Unknown edge type: ${edge} (expected one of ${EDGE_TYPES.join(', ')})`
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
 * Assign IDs to every doc under `docs/` still missing one, then recompute the
 * derived mirrors-consistent/mirrors-gap edges. Idempotent: a second run
 * changes nothing.
 * @param {{dir: string}} opts
 * @returns {Promise<{skipped: {path: string, reason: string}[]}>}
 */
export async function reindex({ dir }) {
  const { db, docs, edges } = openStore(dir);
  try {
    for (const file of listMarkdownFiles(path.join(dir, 'docs'))) docs.assign(dir, file);
    const { edges: mirrorEdges, skipped } = computeMirrors(dir);
    for (const edge of mirrorEdges) {
      const from = docs.findByPath(edge.fromPath);
      if (!from) continue; // Not indexed (e.g. no docs/ tree yet) — nothing to relate.
      edges.write(from.id, edge.toPlaceholder, edge.edgeType, 1);
    }
    return { skipped };
  } finally {
    db.close();
  }
}

/**
 * Mermaid node IDs are unquoted and bare; a raw `:` (as in a mirrors-gap
 * edge's synthetic `lld-folder:<Name>` placeholder, which names no real doc)
 * is reserved syntax there, not a safe character. Sanitize to a safe ID.
 * @returns {string}
 */
function safeMermaidId(id) {
  return id.replace(/[^A-Za-z0-9_]/g, '_');
}

/** Render the generated Mermaid artifact for every indexed doc and edge. */
function renderMermaid(docs, edges) {
  const lines = ['flowchart TD'];
  for (const doc of docs.all())
    lines.push(`    ${safeMermaidId(doc.id)}["${doc.path}"]${doc.tier ? `:::${doc.tier}` : ''}`);
  for (const edge of edges.all())
    lines.push(
      `    ${safeMermaidId(edge.from_id)} -- "${edge.edge_type}" --> ${safeMermaidId(edge.to_id)}`
    );
  for (const [tier, color] of Object.entries(TIER_COLORS))
    lines.push(`    classDef ${tier} fill:${color},stroke:${color},color:#fff`);
  return lines.join('\n') + '\n';
}

/**
 * Full (re)build: ensure the schema, reindex every doc and the derived mirrors
 * edges, then emit the generated Mermaid artifact. Rolls back on partial failure.
 * @param {{dir: string}} opts
 * @returns {Promise<{skipped: {path: string, reason: string}[]}>}
 */
export async function build({ dir }) {
  let result;
  try {
    result = await reindex({ dir });
  } catch (error) {
    throw new Error(`build() failed, no artifact written: ${error.message}`, { cause: error });
  }
  const { db, docs, edges } = openStore(dir);
  try {
    atomicWrite(path.join(dir, MERMAID_FILE), renderMermaid(docs, edges));
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

// --- CLI entry -------------------------------------------------------------

const USAGE = `Usage: cli.mjs <command> [options]

Commands:
  build   --dir <root>
  index   --dir <root> --doc <path> [--edge <type> --to <path>] [--id <id>]
  reindex --dir <root>
  query   --dir <root> --related-to <id|path> [--edge <type>]
  search  --dir <root> --term <text>
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
