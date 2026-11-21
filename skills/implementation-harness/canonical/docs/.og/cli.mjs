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
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

import {
  DB_FILE,
  MERMAID_FILE,
  AUTHORED_EDGE_TYPES,
  BACKUP_FILE,
  OKF_VERSION,
  CONFIG_FILE,
  RETIRED_EDGE_TYPE,
} from './constants.mjs';
import { SCHEMA, SCHEMA_VERSION, MIGRATIONS_V0_TO_V1 } from './schema.mjs';
import {
  need,
  atomicWrite,
  walkMarkdownFiles,
  readIgnoreList,
  readFrontmatter,
  toPosixRelative,
  inScope,
  parseFrontmatter,
  parseIndexBullets,
  resolveLink,
  linkTargetExists,
  DOCS_HOME,
  writeFrontmatter,
  normalizeText,
  splitFrontmatter,
  isContentBearing,
  isLinkBullet,
  isHeading,
  fencedLines,
  encodeLinkPath,
  firstHeading,
} from './utils.mjs';
import { DocsStore, loadConfig, configFrom, tierRoots, typeFor } from './docs.mjs';
import { EdgesStore, computeMirrors, computeKeywordMatches } from './edges.mjs';

/** The folder this tool lives in (`<project>/docs/.og`). */
const TOOL_DIR = path.dirname(fileURLToPath(import.meta.url));

/**
 * Bring the DB to SCHEMA_VERSION. A fresh DB is created at the current version.
 * A v0 DB (OG before schema versioning) is copied to BACKUP_FILE, then migrated
 * in one transaction; any failing statement rolls it back, so it stays v0. A DB
 * newer than this OG is refused untouched.
 */
function ensureSchema(db, root, dbPath) {
  const version = db.prepare('PRAGMA user_version').get().user_version;
  if (version > SCHEMA_VERSION) {
    db.close();
    throw new Error(
      `database newer than this OG (user_version ${version}, this OG supports ${SCHEMA_VERSION}): ${dbPath}`
    );
  }
  if (version === SCHEMA_VERSION) return;
  const isV0 = db
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'docs'")
    .get();
  if (!isV0) {
    db.exec('BEGIN');
    db.exec(SCHEMA);
    db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
    db.exec('COMMIT');
    return;
  }
  fs.copyFileSync(dbPath, path.join(root, BACKUP_FILE));
  db.exec('BEGIN');
  for (const statement of MIGRATIONS_V0_TO_V1) {
    try {
      db.exec(statement);
    } catch (error) {
      db.exec('ROLLBACK');
      db.close();
      throw new Error(`schema migration v0 → v1 failed at "${statement}": ${error.message}`, {
        cause: error,
      });
    }
  }
  db.exec('COMMIT');
}

/**
 * Open the graph database at `dir`'s DB_FILE, schema ensured, and wrap it as a
 * `{ docs, edges }` store pair. `dir` must be the project root, never `docs/` or
 * `docs/.og/` themselves: those values used to create a stray empty database at a
 * nested path and silently return empty results. An empty project with no `docs/`
 * yet is fine (build creates the schema). Read-only commands pass `create: false`
 * and fail when the database is absent instead of creating an empty one.
 * @param {string} dir
 * @param {{create?: boolean}} [opts]
 * @returns {{db: import('node:sqlite').DatabaseSync, config: import('./docs.mjs').ProjectConfig,
 *   docs: DocsStore, edges: EdgesStore}}
 */
function openStore(dir, { create = true } = {}) {
  const root = path.resolve(dir);
  need(
    root !== TOOL_DIR && root !== path.dirname(TOOL_DIR) && path.basename(root) !== '.og',
    `--dir must be the project root (the folder that contains docs/), not docs/ or docs/.og/ (got "${dir}")`
  );
  const dbPath = path.join(root, DB_FILE);
  if (!create) {
    need(
      fs.existsSync(dbPath),
      `Graph not built at ${dbPath}; run: node docs/.og/cli.mjs build --dir <project root>`
    );
  }
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  ensureSchema(db, root, dbPath);
  const config = loadConfig(root);
  return { db, config, docs: new DocsStore(db, config), edges: new EdgesStore(db) };
}

/**
 * Assign/confirm a doc's ID via `DocsStore.assign()` and, when `--edge` is
 * given, write the authored (derived=0) graduation edge via `EdgesStore.write()`.
 * The edge type and the `--to` scope are checked before `assign()`, so an
 * out-of-scope target never leaves an ID behind on `--doc`. A `--to` that is
 * in scope but not indexed is still checked after `assign()`; that side effect
 * is harmless, since assignment is additive-only and safe to retry.
 * @param {{dir: string, doc: string, id?: string, edge?: string, to?: string}} opts
 */
export async function index({ dir, doc, id, edge, to }) {
  let relTo;
  if (edge) {
    need(
      AUTHORED_EDGE_TYPES.includes(edge),
      `Unknown edge type: ${edge} (expected one of ${AUTHORED_EDGE_TYPES.join(', ')})`
    );
    need(to, '--edge requires --to');
    relTo = toPosixRelative(dir, path.isAbsolute(to) ? to : path.join(dir, to));
    const scope = inScope(relTo, readIgnoreList(path.join(dir, 'docs')));
    need(scope.ok, scope.message);
  }
  const { db, config, docs, edges } = openStore(dir);
  try {
    const absDoc = path.isAbsolute(doc) ? doc : path.join(dir, doc);
    const relDoc = toPosixRelative(dir, absDoc);
    const configured = config.rawProductDir;
    need(
      !(config.invalidConfig && configured && relDoc.startsWith(configured + '/')),
      `invalidConfig: ${config.invalidConfig?.reason}; fix docs/.og/og.config.json before indexing ${relDoc}`
    );
    const assigned = docs.assign(dir, absDoc, { id, stampType: true });
    if (edge) {
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
 * and keyword-match (shared `tags:` tokens — from the stored column, no
 * content read). Idempotent: a second run with nothing changed on disk
 * changes nothing.
 *
 * Deliberately not wrapped in a single SQLite transaction: each step below
 * (assign, prune, mirrors, keyword-match) is its own auto-committing write.
 * An interruption mid-run can leave a transient inconsistency (e.g.
 * keyword-match edges cleared but not yet recomputed), but every step is
 * idempotent and fully recomputed from current state, so the next successful
 * `reindex()`/`build()` self-heals it — a half-measure transaction wrapping
 * only some of these steps (and not `build()`'s separate Mermaid-artifact
 * write) would add complexity without closing that same window anyway.
 *
 * Scope: out-of-scope files are skipped silently. `scopeViolations` lists only
 * what needs action: a reserved file that still carries an OG `id:`, and a row
 * pruned because its existing file is now out of scope. A reserved `index.md`
 * that still carries its row's `id:` keeps the row (and its authored edges)
 * until a writer removes the id. Every authored edge on a pruned row is listed
 * in `orphanedAuthored` before it is removed with the row.
 * @param {{dir: string}} opts
 */
export async function reindex({ dir }) {
  const { db, config, docs, edges } = openStore(dir);
  try {
    const docsRoot = path.join(dir, 'docs');
    const ignore = readIgnoreList(docsRoot);
    const kept = new Set();
    const scopeViolations = [];
    const frontmatterErrors = [];
    for (const file of walkMarkdownFiles(docsRoot)) {
      const relPath = toPosixRelative(dir, file);
      const scope = inScope(relPath, ignore);
      if (scope.ok) {
        const { errors } = docs.assign(dir, file);
        for (const error of errors) frontmatterErrors.push({ path: relPath, ...error });
        kept.add(relPath);
        continue;
      }
      if (scope.rule === 'ogignore') continue;
      const fileId = readFrontmatter(fs.readFileSync(file, 'utf8')).data.id;
      if (!fileId) continue;
      scopeViolations.push({ path: relPath, rule: scope.rule });
      if (docs.findByPath(relPath)?.id === fileId) kept.add(relPath);
    }
    const stale = docs.staleExcept(kept);
    for (const row of stale) {
      const absPath = path.join(dir, row.path);
      if (!fs.existsSync(absPath)) continue;
      const scope = inScope(row.path, ignore);
      if (
        !scope.ok &&
        scope.rule !== 'ogignore' &&
        !scopeViolations.some((v) => v.path === row.path)
      )
        scopeViolations.push({ path: row.path, rule: scope.rule });
    }
    const pruned = stale.map((row) => row.id);
    const orphanedAuthored = edges.authoredTouching(pruned).map((edge) => {
      const pathOf = (id) => docs.findById(id)?.path ?? null;
      return {
        edge: edge.edge_type,
        fromId: edge.from_id,
        fromPath: pathOf(edge.from_id),
        toId: edge.to_id,
        toPath: pathOf(edge.to_id),
        prunedId: pruned.includes(edge.to_id) ? edge.to_id : edge.from_id,
      };
    });
    docs.remove(pruned);
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
    return {
      skipped,
      pruned,
      scopeViolations,
      orphanedAuthored,
      frontmatterErrors,
      invalidConfig: config.invalidConfig,
    };
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
  const { db, docs, edges } = openStore(dir, { create: false });
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
  const { db, docs } = openStore(dir, { create: false });
  try {
    const needle = term.toLowerCase();
    return docs
      .all()
      .filter((row) => {
        const haystack = [row.title, row.description, row.tags]
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

/** @returns {boolean} Whether a frontmatter value counts as present. */
function filled(value) {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === 'string' && value.trim() !== '';
}

const REQUIRED_FIELDS = ['type', 'description', 'tags'];

/**
 * The OKF conformance report: in-scope docs missing a required B+ field,
 * `index.md` bullets to missing files, concept docs their folder's `index.md`
 * does not list, present bundle roots without a versioned `index.md`, and
 * frontmatter outside the YAML subset. Reads files only; never writes, never
 * opens the DB. `docs/index.md` (the VitePress home) is never reported.
 * @param {{dir: string}} opts
 */
export async function check({ dir }) {
  const root = path.resolve(dir);
  const docsRoot = path.join(root, 'docs');
  const ignore = readIgnoreList(docsRoot);
  const report = {
    missingFields: [],
    brokenIndexEntries: [],
    unlistedConcepts: [],
    unversionedBundles: [],
    frontmatterErrors: [],
  };
  const concepts = [];
  const indexes = new Map();
  for (const file of walkMarkdownFiles(docsRoot)) {
    const relPath = toPosixRelative(root, file);
    if (relPath === DOCS_HOME) continue;
    const scope = inScope(relPath, ignore);
    if (!scope.ok) {
      if (scope.rule === 'reserved-basename' && path.basename(file).toLowerCase() === 'index.md')
        indexes.set(path.dirname(file), file);
      continue;
    }
    concepts.push(file);
    const { data, errors } = parseFrontmatter(fs.readFileSync(file, 'utf8'));
    for (const error of errors) report.frontmatterErrors.push({ path: relPath, ...error });
    const fields = REQUIRED_FIELDS.filter((field) => !filled(data[field]));
    if (fields.length) report.missingFields.push({ path: relPath, fields });
  }
  const listed = new Map();
  for (const [folder, indexFile] of indexes) {
    const linked = new Set();
    const { body } = parseFrontmatter(fs.readFileSync(indexFile, 'utf8'));
    for (const bullet of parseIndexBullets(body)) {
      const target = resolveLink(indexFile, bullet.url);
      if (!target) continue;
      linked.add(target);
      if (!linkTargetExists(target))
        report.brokenIndexEntries.push({
          index: toPosixRelative(root, indexFile),
          target: path.relative(folder, target).split(path.sep).join('/'),
        });
    }
    listed.set(folder, linked);
  }
  for (const file of concepts) {
    const folder = path.dirname(file);
    if (folder === docsRoot || !indexes.has(folder)) continue;
    if (!listed.get(folder).has(file))
      report.unlistedConcepts.push({
        path: toPosixRelative(root, file),
        index: toPosixRelative(root, indexes.get(folder)),
      });
  }
  for (const [bundleRoot] of tierRoots(loadConfig(root))) {
    const absRoot = path.join(root, bundleRoot);
    if (!fs.existsSync(absRoot)) continue;
    const indexFile = path.join(absRoot, 'index.md');
    const version = fs.existsSync(indexFile)
      ? parseFrontmatter(fs.readFileSync(indexFile, 'utf8')).data.okf_version
      : undefined;
    if (version !== OKF_VERSION) report.unversionedBundles.push({ root: bundleRoot });
  }
  for (const list of Object.values(report))
    list.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  report.counts = Object.fromEntries(
    Object.entries(report).map(([key, list]) => [key, list.length])
  );
  return report;
}

// --- migrate -------------------------------------------------------------------

const MIGRATION_ACTOR = 'process:okf-migration';
const OG_KEY_LINE = /^(id|purpose|keywords):/;
const OG_ID = /^[0-9a-f]{8}(-\d+)?$/;
const ANSWER_FILES = ['.harness/state/answers.json', '.harness/state/launch/answers.json'];

/** Run git in `root`; null when git fails or `root` is not a repository. */
function git(root, args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout : null;
}

/** ISO 8601 in UTC with a `Z` suffix and whole seconds. */
function utcSeconds(date) {
  return new Date(date).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** First and last author dates of a file, in UTC; `now` when it has no history. */
function gitDates(root, relPath, now) {
  const dates = (git(root, ['log', '--follow', '--format=%aI', '--', relPath]) ?? '')
    .split('\n')
    .filter(Boolean);
  if (!dates.length) return { first: now, last: now };
  return { first: utcSeconds(dates[dates.length - 1]), last: utcSeconds(dates[0]) };
}

/**
 * The `og.config.json` content implied by the stored launch answers, or null
 * when no answer settles it. Q10b Project-scoped or a Q10c "none" → `{}`. A Q10c
 * value counts only when it names an existing folder under `docs/`.
 */
function configFromAnswers(root) {
  const file = ANSWER_FILES.map((rel) => path.join(root, rel)).find((f) => fs.existsSync(f));
  if (!file) return null;
  let answers;
  try {
    answers = JSON.parse(fs.readFileSync(file, 'utf8')).answers ?? {};
  } catch {
    return null;
  }
  const scope = String(answers.Q10b?.value ?? '');
  if (/project/i.test(scope) && !/two|product/i.test(scope)) return {};
  const value = typeof answers.Q10c?.value === 'string' ? answers.Q10c.value.trim() : '';
  if (/^none$/i.test(value)) return {};
  if (!value) return null;
  const candidate = (value.startsWith('docs/') ? value : `docs/${value}`).replace(/\/+$/, '');
  const abs = path.join(root, candidate);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) return null;
  return { productDir: candidate };
}

function isTemplateMeta(data) {
  return 'name' in data && data.type === 'reference';
}

/** A tags value as a list, whatever form an OG-era doc wrote it in. */
function toList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** A doc's frontmatter in B+ form: renamed keys, template meta dropped, seeds filled. */
function migratedData(root, relPath, data, body, config, now) {
  const next = { ...data };
  if (isTemplateMeta(data)) for (const key of ['name', 'description', 'type']) delete next[key];
  const description = next.description ?? next.purpose;
  const tags = next.tags ?? next.keywords;
  delete next.purpose;
  delete next.keywords;
  if (filled(description)) next.description = description;
  else delete next.description;
  if (toList(tags).length) next.tags = toList(tags);
  else delete next.tags;
  if (!filled(next.type)) next.type = typeFor(relPath, config);
  if (!filled(next.title)) next.title = firstHeading(body) ?? path.posix.basename(relPath, '.md');
  if (!next.generated || !next.updated) {
    const dates = gitDates(root, relPath, now);
    next.generated ??= { by: MIGRATION_ACTOR, at: dates.first };
    next.updated ??= { by: MIGRATION_ACTOR, at: dates.last };
  }
  return next;
}

/** Collapse runs of blank lines and trim, ending with one newline. */
/** Collapse blank-line runs and trim the ends, leaving fenced code as written. */
function tidy(text) {
  const lines = text.split('\n');
  const fenced = fencedLines(lines);
  const kept = lines.filter(
    (line, i) => fenced[i] || line.trim() || i === 0 || fenced[i - 1] || lines[i - 1].trim()
  );
  return kept.join('\n').replace(/^\n+/, '').replace(/\s+$/, '') + '\n';
}

/** Remove the top-level `id`/`purpose`/`keywords` lines (and the continuation lines
 * of a wrapped value) from the frontmatter by line, without a YAML parse. A
 * block left empty is removed with the blank line after it. */
function stripOgKeys(content) {
  const { block, body } = splitFrontmatter(content);
  if (!block) return normalizeText(content);
  const lines = block
    .replace(/^---\n/, '')
    .replace(/---\n?$/, '')
    .split('\n');
  const kept = [];
  for (let i = 0; i < lines.length; i++) {
    if (!OG_KEY_LINE.test(lines[i])) {
      kept.push(lines[i]);
      continue;
    }
    while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) i += 1;
  }
  const remaining = kept.filter((line) => line.trim());
  if (!remaining.length) return body.replace(/^\n/, '');
  return `---\n${kept.join('\n').replace(/\n+$/, '')}\n---\n${body}`;
}

/** Content without its frontmatter block (and the blank line after it). */
function withoutFrontmatter(content) {
  return splitFrontmatter(content).body.replace(/^\n/, '');
}

/** Add `okf_version` to a bundle root `index.md`, keeping its other keys. */
function withOkfVersion(content) {
  const { block, body } = splitFrontmatter(content);
  const line = `okf_version: '${OKF_VERSION}'`;
  if (!block) return `---\n${line}\n---\n\n${body.replace(/^\n+/, '')}`;
  const inner = block
    .replace(/^---\n/, '')
    .replace(/---\n?$/, '')
    .split('\n')
    .filter((l) => !/^okf_version:/.test(l) && l !== '');
  return `---\n${[line, ...inner].join('\n')}\n---\n${body}`;
}

/** `* [title](url) - description` for a doc, from its (planned) frontmatter. */
function bulletFor(title, url, description) {
  return `- [${title}](${url})${filled(description) ? ` - ${description}` : ''}`;
}

/**
 * Work out every change `migrate` would make, without writing anything. The
 * same plan drives `--check` (pending or not), `--dry-run` (the report) and a
 * real run (the writes).
 */
function planMigration(root, docs, initialConfig) {
  const now = utcSeconds(Date.now());
  const docsRoot = path.join(root, 'docs');
  const ignore = readIgnoreList(docsRoot);
  const plan = {
    writes: new Map(),
    stray: new Set(),
    configToWrite: null,
    missingConfig: false,
    invalidConfig: initialConfig.invalidConfig,
    needsWriter: [],
    overviewConflicts: [],
  };
  const read = (rel) =>
    plan.writes.has(rel) ? plan.writes.get(rel) : fs.readFileSync(path.join(root, rel), 'utf8');

  // Step 1 — config.
  let config = initialConfig;
  if (!initialConfig.present) {
    const resolved = configFromAnswers(root);
    if (resolved) {
      plan.configToWrite = resolved;
      config = configFrom(resolved);
      plan.invalidConfig = config.invalidConfig;
    } else plan.missingConfig = true;
  }

  const files = walkMarkdownFiles(docsRoot).map((file) => toPosixRelative(root, file));
  const concepts = files.filter((rel) => rel !== DOCS_HOME && inScope(rel, ignore).ok);
  const indexes = files.filter(
    (rel) => rel !== DOCS_HOME && path.posix.basename(rel).toLowerCase() === 'index.md'
  );
  const bundles = tierRoots(config).map(([bundleRoot]) => bundleRoot);
  const inBundle = (rel) => bundles.some((bundleRoot) => rel.startsWith(bundleRoot + '/'));
  const writerGaps = (rel, data) => {
    if (!filled(data.description))
      plan.needsWriter.push({ path: rel, reason: 'missing description' });
    if (!filled(data.tags)) plan.needsWriter.push({ path: rel, reason: 'missing tags' });
  };

  // Step 4 — frontmatter rewrite (planned first, so navigation bullets use final values).
  for (const rel of concepts) {
    const { data, body, raw, errors } = parseFrontmatter(read(rel));
    const legacy =
      'purpose' in data || 'keywords' in data || !filled(data.type) || isTemplateMeta(data);
    if (!legacy) continue;
    if (errors.length) {
      plan.needsWriter.push({ path: rel, reason: 'unsupported YAML', line: errors[0].line });
      continue;
    }
    const next = migratedData(root, rel, data, body, config, now);
    writerGaps(rel, next);
    plan.writes.set(rel, writeFrontmatter(next) + (raw === null ? '\n' : '') + body);
  }

  // Step 2 — move index prose to 00 Overview.md and write the navigation bullets.
  const conflictFolders = new Set();
  for (const rel of indexes.filter(inBundle)) {
    const { data, body } = parseFrontmatter(read(rel));
    if (!isContentBearing(body)) continue;
    const folder = path.posix.dirname(rel);
    const overviewRel = `${folder}/00 Overview.md`;
    if (fs.existsSync(path.join(root, overviewRel))) {
      plan.overviewConflicts.push({ folder, existing: overviewRel });
      conflictFolders.add(folder);
      continue;
    }
    const title =
      (filled(data.title) && data.title) || firstHeading(body) || path.posix.basename(folder);
    const description = data.description ?? data.purpose;
    const tags = toList(data.tags ?? data.keywords);
    const dates = gitDates(root, rel, now);
    const overview = {
      ...(data.id ? { id: data.id } : {}),
      type: typeFor(overviewRel, config),
      title,
      ...(filled(description) ? { description } : {}),
      ...(tags.length ? { tags } : {}),
      generated: { by: MIGRATION_ACTOR, at: dates.first },
      updated: { by: MIGRATION_ACTOR, at: dates.last },
    };
    writerGaps(overviewRel, overview);
    const bodyLines = body.split('\n');
    const fenced = fencedLines(bodyLines);
    const prose = bodyLines.filter((line, i) => fenced[i] || !isLinkBullet(line)).join('\n');
    plan.writes.set(overviewRel, writeFrontmatter(overview) + '\n' + tidy(prose));

    const absIndex = path.join(root, rel);
    const kept = bodyLines.filter(
      (line, i) => !fenced[i] && (!line.trim() || isHeading(line) || isLinkBullet(line))
    );
    const linked = new Set(
      kept
        .filter(isLinkBullet)
        .flatMap((line) => parseIndexBullets(line))
        .map((bullet) => resolveLink(absIndex, bullet.url))
        .filter(Boolean)
    );
    const h1 = kept.findIndex((line) => /^#\s/.test(line));
    const overviewBullet = bulletFor(
      `${title} Overview`,
      encodeLinkPath('00 Overview.md'),
      description
    );
    const lines =
      h1 === -1
        ? [overviewBullet, ...kept]
        : [kept[h1], '', overviewBullet, ...kept.filter((_, i) => i !== h1)];
    const siblings = concepts
      .filter((c) => path.posix.dirname(c) === folder)
      .sort((a, b) => path.posix.basename(a).localeCompare(path.posix.basename(b)));
    for (const conceptRel of siblings) {
      if (linked.has(path.join(root, conceptRel))) continue;
      const meta = parseFrontmatter(read(conceptRel));
      const conceptTitle =
        meta.data.title ?? firstHeading(meta.body) ?? path.posix.basename(conceptRel, '.md');
      lines.push(
        bulletFor(
          conceptTitle,
          encodeLinkPath(path.posix.basename(conceptRel)),
          meta.data.description ?? meta.data.purpose
        )
      );
    }
    const nearest = (i, step) => {
      for (let j = i + step; j >= 0 && j < lines.length; j += step)
        if (lines[j].trim()) return lines[j];
      return '';
    };
    const joined = lines.filter(
      (line, i) => line.trim() || !(isLinkBullet(nearest(i, -1)) && isLinkBullet(nearest(i, 1)))
    );
    plan.writes.set(rel, splitFrontmatter(read(rel)).block + '\n' + tidy(joined.join('\n')));
  }

  // Step 5 — strip OG keys from every index.md (never docs/index.md, never a conflict folder).
  for (const rel of indexes) {
    if (conflictFolders.has(path.posix.dirname(rel))) continue;
    const content = normalizeText(read(rel));
    const stripped = stripOgKeys(content);
    if (stripped !== content) plan.writes.set(rel, stripped);
  }

  // Step 6 — bundle roots carry a versioned index.md.
  for (const bundleRoot of bundles) {
    const absRoot = path.join(root, bundleRoot);
    if (!fs.existsSync(absRoot) || !fs.statSync(absRoot).isDirectory()) continue;
    const rel = `${bundleRoot}/index.md`;
    if (conflictFolders.has(bundleRoot)) continue;
    const exists = plan.writes.has(rel) || fs.existsSync(path.join(root, rel));
    if (!exists) {
      const bullets = concepts
        .filter((c) => path.posix.dirname(c) === bundleRoot)
        .sort((a, b) => path.posix.basename(a).localeCompare(path.posix.basename(b)))
        .map((conceptRel) => {
          const meta = parseFrontmatter(read(conceptRel));
          const title =
            meta.data.title ?? firstHeading(meta.body) ?? path.posix.basename(conceptRel, '.md');
          return bulletFor(
            title,
            encodeLinkPath(path.posix.basename(conceptRel)),
            meta.data.description ?? meta.data.purpose
          );
        });
      const heading = `# ${path.posix.basename(bundleRoot)}`;
      plan.writes.set(rel, withOkfVersion(tidy([heading, '', ...bullets].join('\n'))));
      continue;
    }
    const content = read(rel);
    if (parseFrontmatter(content).data.okf_version !== OKF_VERSION)
      plan.writes.set(rel, withOkfVersion(content));
  }

  // Step 7 — stray OG ids outside docs/ (git-tracked .md files only).
  const tracked = (git(root, ['ls-files', '-z', '--', '*.md']) ?? '').split('\0').filter(Boolean);
  for (const rel of tracked) {
    if (rel.startsWith('docs/') || !fs.existsSync(path.join(root, rel))) continue;
    const content = fs.readFileSync(path.join(root, rel), 'utf8');
    const { data } = parseFrontmatter(content);
    if (data.id === undefined) continue;
    const onlyOgId =
      Object.keys(data).length === 1 && OG_ID.test(String(data.id)) && !docs.findById(data.id);
    if (onlyOgId) {
      plan.writes.set(rel, withoutFrontmatter(content));
      plan.stray.add(rel);
    } else plan.needsWriter.push({ path: rel, reason: 'OG id outside docs/ left in place' });
  }

  plan.config = config;
  plan.pending =
    plan.overviewConflicts.length > 0 ||
    [...plan.writes.keys()].some((rel) => !plan.stray.has(rel));
  return plan;
}

/** Refuse a real run over uncommitted `.md` work: under docs/ (except docs/.og/) and the stray-id targets. */
function refuseDirty(root, plan) {
  const status = git(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  need(
    status !== null,
    `Refusing to migrate: ${root} is not a git repository (git is the rollback); pass --allow-dirty to run anyway`
  );
  const entries = status.split('\0');
  const dirty = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry) continue;
    const rel = entry.slice(3);
    if (entry[0] === 'R' || entry[0] === 'C') i += 1;
    const inDocs = rel.startsWith('docs/') && !rel.startsWith('docs/.og/');
    if (rel.endsWith('.md') && (inDocs || plan.stray.has(rel))) dirty.push(rel);
  }
  need(
    !dirty.length,
    `Refusing to migrate: dirty .md files (commit or stash them, or pass --allow-dirty): ${dirty.join(', ')}`
  );
}

/**
 * Bring a project's docs to B+ frontmatter and the OKF bundle layout in one
 * idempotent pass: config, index prose to `00 Overview.md` with navigation
 * bullets, `impl-to-readme` edges re-typed (merging duplicates), frontmatter
 * rewrite seeded from git, OG keys stripped from every `index.md`, bundle roots
 * versioned, stray ids outside `docs/` removed, reindex, report. `docs/index.md`
 * is never touched. `check` and `dryRun` write no doc file; a real run refuses
 * dirty `.md` files unless `allowDirty`.
 * @param {{dir: string, check?: boolean, dryRun?: boolean, allowDirty?: boolean}} opts
 */
export async function migrate({
  dir,
  check: checkOnly = false,
  dryRun = false,
  allowDirty = false,
}) {
  const root = path.resolve(dir);
  let plan;
  let before;
  let mergedEdges;
  const { db, config, docs, edges } = openStore(root);
  try {
    before = { nodes: docs.all().length, edges: edges.counts() };
    plan = planMigration(root, docs, config);
    if (checkOnly)
      return {
        pending: plan.pending,
        counts: before,
        missingConfig: plan.missingConfig,
        invalidConfig: plan.invalidConfig,
      };
    if (!dryRun && !allowDirty) refuseDirty(root, plan);
    mergedEdges = edges.retype(RETIRED_EDGE_TYPE, 'references', { dryRun });
  } finally {
    if (db.isOpen) db.close();
  }
  const report = {
    pending: plan.pending,
    counts: { before, after: null },
    filesChanged: plan.writes.size + (plan.configToWrite ? 1 : 0),
    mergedEdges,
    missingConfig: plan.missingConfig,
    invalidConfig: plan.invalidConfig,
    needsWriter: plan.needsWriter,
    overviewConflicts: plan.overviewConflicts,
    orphanedAuthored: [],
  };
  if (dryRun) {
    const ignore = readIgnoreList(path.join(root, 'docs'));
    const finalDocs = new Set(
      walkMarkdownFiles(path.join(root, 'docs')).map((file) => toPosixRelative(root, file))
    );
    for (const rel of plan.writes.keys()) if (rel.startsWith('docs/')) finalDocs.add(rel);
    report.counts.after = {
      nodes: [...finalDocs].filter((rel) => inScope(rel, ignore).ok).length,
      edges: { authored: before.edges.authored - mergedEdges, derived: null },
    };
    return report;
  }
  if (plan.configToWrite)
    atomicWrite(path.join(root, CONFIG_FILE), JSON.stringify(plan.configToWrite, null, 2) + '\n');
  for (const [rel, content] of plan.writes) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    atomicWrite(path.join(root, rel), content);
  }
  const indexed = await reindex({ dir: root });
  const reopened = openStore(root);
  try {
    report.counts.after = { nodes: reopened.docs.all().length, edges: reopened.edges.counts() };
    report.orphanedAuthored = indexed.orphanedAuthored;
    report.pending = planMigration(root, reopened.docs, reopened.config).pending;
  } finally {
    reopened.db.close();
  }
  return report;
}

const MISSING_FIELDS = ['description', 'tags'];

/**
 * Every indexed doc, or (with `missing`) only those still missing `description`
 * and/or `tags`. A pure query, no writes. The caller (an agent, following
 * `reindex-graph.md`'s intelligent-scan step) reads what comes back and
 * writes frontmatter/edges itself; this script never derives or writes
 * `description`/`tags`/content-reference edges on its own.
 * @param {{dir: string, missing?: string}} opts `missing`, when given, is a
 *   comma-separated subset of `description,tags`; omitted means every doc.
 * @returns {Promise<import('./docs.mjs').DocRow[]>}
 */
export async function list({ dir, missing }) {
  const fields = missing ? missing.split(',').map((field) => field.trim()) : [];
  for (const field of fields)
    need(
      MISSING_FIELDS.includes(field),
      `Unknown --missing field: ${field} (expected description, tags)`
    );
  const { db, docs } = openStore(dir, { create: false });
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
  list    --dir <root> [--missing <description|tags|description,tags>]
  unedge  --dir <root> --doc <path> --edge <type> --to <path>
  check   --dir <root>
  migrate --dir <root> [--check] [--dry-run] [--allow-dirty]
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
      check: { type: 'boolean' },
      'dry-run': { type: 'boolean' },
      'allow-dirty': { type: 'boolean' },
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
    check: () => check({ dir }),
    migrate: () =>
      migrate({
        dir,
        check: values.check,
        dryRun: values['dry-run'],
        allowDirty: values['allow-dirty'],
      }),
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(`cli.mjs: ${error.message}`);
      process.exitCode = 1;
    });
}
