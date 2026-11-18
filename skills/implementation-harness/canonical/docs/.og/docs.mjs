// Docs-table store: the only file that touches the `docs` table's SQL. cli.mjs
// operates on a `DocsStore` instance, never on raw queries of its own. Tier and
// `type` resolution live here too, since both are derived from a doc's path.
import fs from 'node:fs';
import path from 'node:path';
import {
  need,
  atomicWrite,
  collisionSafeId,
  parseFrontmatter,
  writeFrontmatter,
  writeAdditiveId,
  formatFlowList,
  firstHeading,
  toPosixRelative,
  inScope,
  readIgnoreList,
} from './utils.mjs';
import { TIER_ROOTS, TYPE_MAP, TYPE_FALLBACK, UNTIERED_TYPE, CONFIG_FILE } from './constants.mjs';

/**
 * @typedef {Object} DocRow
 * @property {string} id
 * @property {string|null} tier
 * @property {string|null} type
 * @property {string} path
 * @property {string|null} title
 * @property {string|null} description
 * @property {string|null} tags Flow-list text, e.g. `[a, b]`.
 * @property {string|null} created_at From frontmatter `generated.at`.
 * @property {string|null} modified_at From frontmatter `updated.at`.
 * @property {string} indexed_at OG index time.
 */

/**
 * @typedef {Object} ProjectConfig
 * @property {boolean} present Whether `og.config.json` exists.
 * @property {string|null} productDir Validated Product folder, or null.
 * @property {string|null} rawProductDir The configured value, valid or not.
 * @property {{reason: string}|null} invalidConfig Why the config was ignored.
 */

/** @returns {boolean} Whether one root equals or contains the other. */
function overlaps(a, b) {
  return a === b || a.startsWith(b + '/') || b.startsWith(a + '/');
}

/**
 * Read and validate `docs/.og/og.config.json`. An invalid config is ignored
 * (no Product tier) and reported, never thrown.
 * @param {string} dir Project root.
 * @returns {ProjectConfig}
 */
export function loadConfig(dir) {
  const file = path.join(dir, CONFIG_FILE);
  if (!fs.existsSync(file))
    return { present: false, productDir: null, rawProductDir: null, invalidConfig: null };
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return {
      present: true,
      productDir: null,
      rawProductDir: null,
      invalidConfig: { reason: `og.config.json is not valid JSON: ${error.message}` },
    };
  }
  return configFrom(parsed);
}

/**
 * Validate a parsed `og.config.json` object (or a candidate built from the
 * launch answers): `productDir` under `docs/`, not `docs/.og`, and not equal
 * to or overlapping another tier root.
 * @returns {ProjectConfig}
 */
export function configFrom(parsed) {
  const raw = parsed?.productDir;
  if (raw === undefined || raw === null)
    return { present: true, productDir: null, rawProductDir: null, invalidConfig: null };
  const value = String(raw).replace(/\\/g, '/').replace(/\/+$/, '');
  const invalid = (reason) => ({
    present: true,
    productDir: null,
    rawProductDir: value,
    invalidConfig: { reason },
  });
  if (!value.startsWith('docs/') || value.split('/').includes('..'))
    return invalid(`productDir ${value} must be under docs/`);
  if (overlaps(value, 'docs/.og')) return invalid(`productDir ${value} must not be docs/.og`);
  const clash = Object.values(TIER_ROOTS).find((root) => overlaps(value, root));
  if (clash) return invalid(`productDir ${value} overlaps ${clash}`);
  return { present: true, productDir: value, rawProductDir: value, invalidConfig: null };
}

/** @returns {[string, string][]} `[root, tier]` pairs; the Product root only when configured. */
export function tierRoots(config) {
  const roots = Object.entries(TIER_ROOTS).map(([tier, root]) => [root, tier]);
  if (config?.productDir) roots.splice(3, 0, [config.productDir, 'Product']);
  return roots;
}

/** @returns {{tier: string, root: string}|null} The tier a POSIX-relative path falls in. */
export function tierOf(relPath, config) {
  for (const [root, tier] of tierRoots(config))
    if (relPath.startsWith(root + '/')) return { tier, root };
  return null;
}

/** `**` matches any folders, `*` stays within one path segment. */
function globToRegExp(glob) {
  const escaped = glob
    .split('**/')
    .map((part) =>
      part
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '[^/]')
    )
    .join('(?:.*/)?');
  return new RegExp(`^${escaped}$`);
}

/** @returns {string} The canonical `type` for a doc path (type map, then fallback). */
export function typeFor(relPath, config) {
  const located = tierOf(relPath, config);
  if (!located) return UNTIERED_TYPE;
  const inBundle = relPath.slice(located.root.length + 1);
  for (const [glob, type] of TYPE_MAP[located.tier])
    if (globToRegExp(glob).test(inBundle)) return type;
  return TYPE_FALLBACK[located.tier];
}

/** Frontmatter values → the strings stored in a row, read-compat for OG-era keys. */
export function rowValues(data, body) {
  const description = data.description ?? data.purpose ?? null;
  const tags = data.tags ?? data.keywords ?? null;
  return {
    type: typeof data.type === 'string' ? data.type : null,
    title: (typeof data.title === 'string' && data.title) || firstHeading(body) || null,
    description: typeof description === 'string' ? description : null,
    tags: Array.isArray(tags) ? formatFlowList(tags) : typeof tags === 'string' ? tags : null,
    created_at: data.generated?.at ?? null,
    modified_at: data.updated?.at ?? null,
  };
}

/**
 * Interface: `findByPath`/`findById` look up one row or `undefined`; `all`
 * lists every row; `usedIds` lists every assigned ID; `assign` is the one
 * write path — scope check, additive-only frontmatter ID assignment (plus a
 * missing `type` when asked) and the row upsert.
 */
export class DocsStore {
  /**
   * @param {import('node:sqlite').DatabaseSync} db
   * @param {ProjectConfig} [config]
   */
  constructor(db, config = null) {
    this.db = db;
    this.config = config;
  }

  /** @returns {DocRow|undefined} */
  findByPath(relPath) {
    return /** @type {DocRow|undefined} */ (
      this.db.prepare('SELECT * FROM docs WHERE path = ?').get(relPath)
    );
  }

  /** @returns {DocRow|undefined} */
  findById(id) {
    return /** @type {DocRow|undefined} */ (
      this.db.prepare('SELECT * FROM docs WHERE id = ?').get(id)
    );
  }

  /** @returns {DocRow[]} */
  all() {
    return /** @type {DocRow[]} */ (this.db.prepare('SELECT * FROM docs').all());
  }

  /** @returns {string[]} Every assigned doc ID currently in the database. */
  usedIds() {
    return this.all().map((row) => row.id);
  }

  /**
   * Docs still missing one or more of the given fields — the deterministic
   * half of a "fill these in" pass. Never writes anything; purely a query
   * so a caller (an agent, not this script) knows which docs to read and
   * write `description:`/`tags:` for.
   * @param {('description'|'tags')[]} fields
   * @returns {DocRow[]}
   */
  missing(fields) {
    const clause = fields.map((field) => `${field} IS NULL`).join(' OR ');
    return /** @type {DocRow[]} */ (this.db.prepare(`SELECT * FROM docs WHERE ${clause}`).all());
  }

  /**
   * Every row whose path is not in `keptPaths` — a doc whose file was deleted,
   * moved out of scope or retired. A pure query; `remove` deletes them.
   * @param {Set<string>} keptPaths
   * @returns {DocRow[]}
   */
  staleExcept(keptPaths) {
    return this.all().filter((row) => !keptPaths.has(row.path));
  }

  /** Delete the rows with these IDs. The caller reports and cascades edge removal. */
  remove(ids) {
    for (const id of ids) this.db.prepare('DELETE FROM docs WHERE id = ?').run(id);
  }

  /** Point an existing row at a new path (the `migrate` id move to `00 Overview.md`). */
  movePath(id, relPath) {
    this.db.prepare('UPDATE docs SET path = ? WHERE id = ?').run(relPath, id);
  }

  /**
   * Assign/confirm a doc's ID and upsert its row. Additive-only frontmatter
   * write, idempotent (a doc with an existing ID is never reassigned), and
   * collision-checked via an explicit override or a content hash.
   *
   * `stampType` is the `index --doc` path: it refuses frontmatter outside the
   * YAML subset and stamps a missing `type` from the type map. Bulk callers
   * (`reindex`/`build`) leave it off: they write `id` only and get the parse
   * errors back to report.
   * @param {string} dir Project root.
   * @param {string} absPath Absolute path to the doc.
   * @param {{id?: string, stampType?: boolean}} [opts]
   * @returns {{id: string, path: string, errors: {line: number, reason: string}[]}}
   */
  assign(dir, absPath, { id: explicitId, stampType = false } = {}) {
    const relPath = toPosixRelative(dir, absPath);
    const scope = inScope(relPath, readIgnoreList(path.join(dir, 'docs')));
    need(scope.ok, scope.message);
    const { data, body, raw, errors } = parseFrontmatter(fs.readFileSync(absPath, 'utf8'));
    if (stampType && errors.length)
      need(false, `${relPath}: unsupported YAML at line ${errors[0].line} (${errors[0].reason})`);
    const existing = this.findByPath(relPath);
    let docId = data.id ?? existing?.id;
    if (!data.id) {
      docId = docId ?? explicitId ?? collisionSafeId(relPath, new Set(this.usedIds()));
      const collision = this.findById(docId);
      need(
        !collision || collision.path === relPath,
        `ID already in use by ${collision?.path}: ${docId}`
      );
    }
    if (stampType && !data.type) {
      const next = { ...data, id: docId, type: typeFor(relPath, this.config) };
      atomicWrite(absPath, writeFrontmatter(next) + (raw === null ? '\n' : '') + body);
      data.type = next.type;
    } else if (!data.id) writeAdditiveId(absPath, docId);
    const values = rowValues(data, body);
    const tier = tierOf(relPath, this.config)?.tier ?? null;
    const now = new Date().toISOString();
    // A doc that moved keeps its frontmatter `id:` but has a new path — the
    // row for that id still exists at the old path. INSERT...ON
    // CONFLICT(path) only catches a same-path update; it would try to
    // insert a second row with this id and hit the `id` UNIQUE constraint.
    // Update that row's path in place instead, preserving the id and every
    // edge referencing it (edges key on id, never path).
    const byId = this.findById(docId);
    const params = [
      tier,
      values.type,
      values.title,
      values.description,
      values.tags,
      values.created_at,
      values.modified_at,
      now,
    ];
    if (byId && byId.path !== relPath) {
      this.db
        .prepare(
          `UPDATE docs SET path = ?, tier = ?, type = ?, title = ?, description = ?, tags = ?,
             created_at = ?, modified_at = ?, indexed_at = ? WHERE id = ?`
        )
        .run(relPath, ...params, docId);
      return { id: docId, path: relPath, errors };
    }
    this.db
      .prepare(
        `INSERT INTO docs (id, path, tier, type, title, description, tags, created_at, modified_at, indexed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(path) DO UPDATE SET id = excluded.id, tier = excluded.tier,
           type = excluded.type, title = excluded.title, description = excluded.description,
           tags = excluded.tags, created_at = excluded.created_at,
           modified_at = excluded.modified_at, indexed_at = excluded.indexed_at`
      )
      .run(docId, relPath, ...params);
    return { id: docId, path: relPath, errors };
  }
}
