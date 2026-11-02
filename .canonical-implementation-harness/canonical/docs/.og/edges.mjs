// Edges-table store (the only file that touches the `edges` table's SQL) plus
// the derived mirrors-consistent/mirrors-gap computation: an exact,
// case-sensitive basename diff of each HLD container against its LLD folder,
// per docs/Engineering Guide/Documentation/02 Structure.md.
import fs from 'node:fs';
import path from 'node:path';
import { toPosixRelative } from './utils.mjs';
import { HLD_ROOT, LLD_ROOT, VALID_NAME } from './constants.mjs';

/**
 * @typedef {Object} EdgeRow
 * @property {string} from_id
 * @property {string} to_id
 * @property {string} edge_type
 * @property {number} derived
 */

/**
 * Interface: `write` is the one insert path (idempotent — `INSERT OR IGNORE`);
 * `queryFrom`/`all` are the two read paths.
 */
export class EdgesStore {
  /** @param {import('node:sqlite').DatabaseSync} db */
  constructor(db) {
    this.db = db;
  }

  /** @param fromId
   @param toId
   @param edgeType
   @param {number} derived 0 (authored) or 1 (computed). */
  write(fromId, toId, edgeType, derived) {
    this.db
      .prepare(
        'INSERT OR IGNORE INTO edges (from_id, to_id, edge_type, derived) VALUES (?, ?, ?, ?)'
      )
      .run(fromId, toId, edgeType, derived);
  }

  /** @returns {EdgeRow[]} */
  queryFrom(fromId, edgeType) {
    return /** @type {EdgeRow[]} */ (
      edgeType
        ? this.db
            .prepare('SELECT * FROM edges WHERE from_id = ? AND edge_type = ?')
            .all(fromId, edgeType)
        : this.db.prepare('SELECT * FROM edges WHERE from_id = ?').all(fromId)
    );
  }

  /** @returns {EdgeRow[]} */
  all() {
    return /** @type {EdgeRow[]} */ (this.db.prepare('SELECT * FROM edges').all());
  }

  /** Remove every edge touching any of `docIds` as either endpoint — cascades
   * a `DocsStore.pruneExcept()` removal so a retired doc leaves no orphan edges. */
  removeForDocs(docIds) {
    for (const id of docIds)
      this.db.prepare('DELETE FROM edges WHERE from_id = ? OR to_id = ?').run(id, id);
  }
}

/** @returns {string[]} Every `<hldRoot>/<version>/Containers/*.md` file, across all versions. */
function containerFiles(hldRoot) {
  if (!fs.existsSync(hldRoot)) return [];
  return fs
    .readdirSync(hldRoot, { withFileTypes: true })
    .filter((version) => version.isDirectory())
    .flatMap((version) => {
      const containersDir = path.join(hldRoot, version.name, 'Containers');
      if (!fs.existsSync(containersDir)) return [];
      return fs
        .readdirSync(containersDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) => path.join(containersDir, entry.name));
    });
}

/**
 * One container file's result: a skip (malformed name) or a mirrors edge
 * (consistent or gap, by whether its LLD folder exists).
 * @returns {{skip: {path: string, reason: string}}|{edge: {fromPath: string, toPlaceholder: string, edgeType: string}}}
 */
function classifyContainer(dir, file) {
  const name = path.basename(file, '.md');
  if (!VALID_NAME.test(name))
    return {
      skip: { path: toPosixRelative(dir, file), reason: `malformed container name: "${name}"` },
    };
  const lldFolder = path.join(dir, LLD_ROOT, name);
  const consistent = fs.existsSync(lldFolder) && fs.statSync(lldFolder).isDirectory();
  return {
    edge: {
      fromPath: toPosixRelative(dir, file),
      toPlaceholder: `lld-folder:${name}`,
      edgeType: consistent ? 'mirrors-consistent' : 'mirrors-gap',
    },
  };
}

/**
 * Diff every `<HLD_ROOT>/<version>/Containers/<Name>.md` against
 * `<LLD_ROOT>/<Name>/`. A malformed `<Name>` is skipped and reported, never aborts.
 * @param {string} dir Project root.
 * @returns {{edges: {fromPath: string, toPlaceholder: string, edgeType: string}[], skipped: {path: string, reason: string}[]}}
 */
export function computeMirrors(dir) {
  const edges = [];
  const skipped = [];
  for (const file of containerFiles(path.join(dir, HLD_ROOT))) {
    const result = classifyContainer(dir, file);
    if ('skip' in result) skipped.push(result.skip);
    else edges.push(result.edge);
  }
  return { edges, skipped };
}
