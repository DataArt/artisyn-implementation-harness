/** Read a baseline from `.harness/state/objects/`.
 *
 * Bytes always come from `objects/`, so applying a patch makes no network call, and a missing base
 * fails before anything is written.
 */
import fs from 'node:fs';
import path from 'node:path';
import { sha256 } from './fs-safe.mjs';

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
  const label = snapshot;
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
