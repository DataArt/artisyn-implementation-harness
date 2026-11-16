// Docs-table store: the only file that touches the `docs` table's SQL. cli.mjs
// operates on a `DocsStore` instance, never on raw queries of its own.
import fs from 'node:fs';
import {
  need,
  collisionSafeId,
  readFrontmatter,
  writeAdditiveId,
  firstHeading,
  toPosixRelative,
} from './utils.mjs';
import { TIER_PATH_PREFIXES, APP_README_PATTERN } from './constants.mjs';

/**
 * @typedef {Object} DocRow
 * @property {string} id
 * @property {string|null} tier
 * @property {string} path
 * @property {string|null} title
 * @property {string|null} purpose
 * @property {string|null} keywords
 * @property {string} updated_at
 */

/** @returns {string|null} The tier name for a POSIX-relative doc path, or null if none matches. */
function tierOf(relPath) {
  if (APP_README_PATTERN.test(relPath)) return 'AppReadme';
  for (const [prefix, tier] of TIER_PATH_PREFIXES) if (relPath.startsWith(prefix)) return tier;
  return null;
}

/**
 * Interface: `findByPath`/`findById` look up one row or `undefined`; `all`
 * lists every row; `usedIds` lists every assigned ID; `assign` is the one
 * write path — additive-only frontmatter ID assignment plus the row upsert.
 */
export class DocsStore {
  /** @param {import('node:sqlite').DatabaseSync} db */
  constructor(db) {
    this.db = db;
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
   * write `purpose:`/`keywords:` for.
   * @param {('purpose'|'keywords')[]} fields
   * @returns {DocRow[]}
   */
  missing(fields) {
    const clause = fields.map((field) => `${field} IS NULL`).join(' OR ');
    return /** @type {DocRow[]} */ (this.db.prepare(`SELECT * FROM docs WHERE ${clause}`).all());
  }

  /**
   * Remove every doc row whose path is not in `existingPaths` — a doc whose
   * file was deleted/retired on disk. The caller cascades edge removal.
   * @param {Set<string>} existingPaths Every doc path found on this reindex.
   * @returns {string[]} IDs of the removed rows.
   */
  pruneExcept(existingPaths) {
    const stale = this.all().filter((row) => !existingPaths.has(row.path));
    for (const row of stale) this.db.prepare('DELETE FROM docs WHERE id = ?').run(row.id);
    return stale.map((row) => row.id);
  }

  /**
   * Assign/confirm a doc's ID and upsert its row. Additive-only frontmatter
   * write, idempotent (a doc with an existing ID is never reassigned), and
   * collision-checked via an explicit override or a content hash.
   * @param {string} dir Project root.
   * @param {string} absPath Absolute path to the doc.
   * @param {{id?: string}} [opts]
   * @returns {{id: string, path: string}}
   */
  assign(dir, absPath, { id: explicitId } = {}) {
    const relPath = toPosixRelative(dir, absPath);
    const content = fs.readFileSync(absPath, 'utf8');
    const { data, body } = readFrontmatter(content);
    const existing = this.findByPath(relPath);
    let docId = data.id ?? existing?.id;
    if (!docId) {
      docId = explicitId ?? collisionSafeId(relPath, new Set(this.usedIds()));
      const collision = this.findById(docId);
      need(
        !collision || collision.path === relPath,
        `ID already in use by ${collision?.path}: ${docId}`
      );
      writeAdditiveId(absPath, docId);
    }
    const title = data.title ?? firstHeading(body) ?? null;
    // A doc that moved keeps its frontmatter `id:` but has a new path — the
    // row for that id still exists at the old path. INSERT...ON
    // CONFLICT(path) only catches a same-path update; it would try to
    // insert a second row with this id and hit the `id` UNIQUE constraint.
    // Update that row's path in place instead, preserving the id and every
    // edge referencing it (edges key on id, never path).
    const byId = this.findById(docId);
    if (byId && byId.path !== relPath) {
      this.db
        .prepare(
          `UPDATE docs SET path = ?, tier = ?, title = ?, purpose = ?,
             keywords = ?, updated_at = ? WHERE id = ?`
        )
        .run(
          relPath,
          tierOf(relPath),
          title,
          data.purpose ?? null,
          data.keywords ?? null,
          new Date().toISOString(),
          docId
        );
      return { id: docId, path: relPath };
    }
    this.db
      .prepare(
        `INSERT INTO docs (id, tier, path, title, purpose, keywords, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(path) DO UPDATE SET id = excluded.id, tier = excluded.tier,
           title = excluded.title, purpose = excluded.purpose,
           keywords = excluded.keywords, updated_at = excluded.updated_at`
      )
      .run(
        docId,
        tierOf(relPath),
        relPath,
        title,
        data.purpose ?? null,
        data.keywords ?? null,
        new Date().toISOString()
      );
    return { id: docId, path: relPath };
  }
}
