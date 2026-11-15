/** Read-time mapping for the retired package name (`harness-bootstrap`).
 *
 * Old values are resolved when a record is read; history files are never rewritten. Bytes always
 * come from `.harness/state/objects/`, so applying a patch makes no network call, and a missing
 * base fails before anything is written.
 */
import fs from 'node:fs';
import path from 'node:path';
import { sha256 } from './fs-safe.mjs';

const OLD_RELEASE_REF = /^release:artisyn-harness-bootstrap-v(.+)\.zip$/;
const OLD_ROOT_DOC = 'harness-bootstrap.md';
const NEW_ROOT_DOC = 'implementation-harness.md';

/** `release:artisyn-harness-bootstrap-v{ver}.zip` reads as `release:artisyn-implementation-harness-v{ver}`. */
export function mapLegacyRef(value) {
  const match = OLD_RELEASE_REF.exec(value);
  return match ? `release:artisyn-implementation-harness-v${match[1]}` : value;
}

/** The old root doc and the old `adoptors/` folder name. */
export function mapLegacyPath(value) {
  if (value === OLD_ROOT_DOC) return NEW_ROOT_DOC;
  return value
    .split('/')
    .map((segment) => (segment === 'adoptors' ? 'adaptors' : segment))
    .join('/');
}

/** The names an old index may have recorded `value` under: the reverse of `mapLegacyPath`. */
export function legacyNamesOf(value) {
  if (value === NEW_ROOT_DOC) return [OLD_ROOT_DOC];
  const renamed = value
    .split('/')
    .map((segment) => (segment === 'adaptors' ? 'adoptors' : segment))
    .join('/');
  return renamed === value ? [] : [renamed];
}

/** Resolve a baseline index entry to its label and bytes.
 *
 * A `state/objects/<sha>` snapshot names its object directly. A `release:` snapshot is a label
 * only; the bytes are the object named by the entry's recorded sha256, and a missing object is a
 * missing base. Other snapshot kinds (`bundle:`, `git:`, `local:`) are resolved by their own
 * procedures; they are returned only when the recorded object happens to exist, and otherwise
 * report `NOT_OBJECT_BACKED` so a caller can tell them apart from a lost baseline.
 */
export function resolveBase(stateDir, entry) {
  const snapshot = String(entry.snapshot ?? '');
  const direct = /^state\/objects\/([a-f0-9]{64})$/.exec(snapshot);
  const sha = direct ? direct[1] : entry.recorded_sha256;
  const label = mapLegacyRef(snapshot);
  const file = path.join(stateDir, 'objects', String(sha));
  if (!/^[a-f0-9]{64}$/.test(String(sha)) || !fs.existsSync(file)) {
    const objectBacked = direct !== null || snapshot.startsWith('release:');
    throw Object.assign(
      new Error(
        objectBacked
          ? `Missing base object for ${label}: ${sha}`
          : `${label} is not object-backed; resolve it from its own source`
      ),
      { code: objectBacked ? 'MISSING_BASE' : 'NOT_OBJECT_BACKED' }
    );
  }
  const bytes = fs.readFileSync(file);
  if (sha256(bytes) !== sha) {
    throw Object.assign(new Error(`Base object does not match its hash: ${sha}`), {
      code: 'BASE_HASH_MISMATCH',
    });
  }
  return { label, sha256: sha, bytes };
}
