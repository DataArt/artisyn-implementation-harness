import { result } from './grading.ts';
import type { GradeResult, GraderBinding } from './_types.ts';
import fs from 'node:fs';
import path from 'node:path';
import { applyPatch } from 'diff';
import { sha256 } from '../utils/fs.ts';
import type { PatchManifest } from './_types.ts';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MANIFEST_SCHEMA = 'patch/manifest-schema';
const BUNDLE_HASHES = 'patch/bundle-hashes';
const APPLY_RECONSTRUCTION = 'patch/apply-reconstruction';

function fail(failures: string[], message: string) {
  failures.push(message);
}

/** Structural: the manifest itself is shaped the way 06-patch-state.md
 * requires — right schema version, a real UUID identity, and each change
 * carrying the hashes/payload its operation demands.
 */
export function gradePatchManifestSchema(manifest: PatchManifest): GradeResult {
  const failures: string[] = [];
  if (manifest.schema_version !== 2)
    fail(failures, `schema_version must be 2, got ${manifest.schema_version}`);
  if (!UUID_RE.test(manifest.id)) fail(failures, `id is not a UUID: ${manifest.id}`);
  if (!['harvest', 'prepare', 'apply', 'launch'].includes(manifest.operation))
    fail(failures, `unknown bundle operation: ${manifest.operation}`);
  if (!Array.isArray(manifest.changes) || !manifest.changes.length)
    fail(failures, 'manifest has no changes');

  for (const change of manifest.changes ?? []) {
    const where = change.path;
    switch (change.operation) {
      case 'add':
        if (change.before_sha256 !== null)
          fail(failures, `${where}: add must have before_sha256 null`);
        if (!change.after_sha256) fail(failures, `${where}: add requires after_sha256`);
        if (!change.payload) fail(failures, `${where}: add requires a files/ payload`);
        break;
      case 'update':
        if (!change.before_sha256 || !change.after_sha256)
          fail(failures, `${where}: update requires before_sha256 and after_sha256`);
        if (!change.payload) fail(failures, `${where}: update requires a diffs/ payload`);
        break;
      case 'rename':
      case 'copy':
        if (!change.old_path) fail(failures, `${where}: ${change.operation} requires old_path`);
        if (!change.before_sha256 || !change.after_sha256)
          fail(failures, `${where}: ${change.operation} requires before_sha256 and after_sha256`);
        break;
      case 'delete':
        if (!change.before_sha256) fail(failures, `${where}: delete requires before_sha256`);
        if (change.after_sha256 !== null)
          fail(failures, `${where}: delete must have after_sha256 null`);
        break;
      default:
        fail(failures, `${where}: unsupported operation ${change.operation}`);
    }
  }
  return result(MANIFEST_SCHEMA, failures);
}

/** Code grader: every payload's own bytes hash to `payload_sha256`, exactly
 * as 06-patch-state.md requires ("validate payload SHA-256 before parsing").
 */
export function gradePatchBundleHashes(bundleDir: string, manifest: PatchManifest): GradeResult {
  const failures: string[] = [];
  for (const change of manifest.changes) {
    if (!change.payload) continue;
    const payloadPath = path.join(bundleDir, change.payload);
    if (!fs.existsSync(payloadPath)) {
      fail(failures, `${change.path}: missing payload file ${change.payload}`);
      continue;
    }
    const bytes = fs.readFileSync(payloadPath);
    if (change.payload_sha256 && sha256(bytes) !== change.payload_sha256)
      fail(failures, `${change.path}: payload_sha256 mismatch for ${change.payload}`);
    if (change.operation === 'add' && change.after_sha256 && sha256(bytes) !== change.after_sha256)
      fail(failures, `${change.path}: add payload bytes don't match after_sha256`);
  }
  return result(BUNDLE_HASHES, failures);
}

/** Code grader: applying an `update` diff to the declared `before` base must
 * reproduce exactly `after_sha256` — the core portability guarantee ("bundle
 * can reconstruct the expected canonical change"). `baseFor(path)` supplies
 * the pre-patch canonical bytes (a real base on disk in an apply case, or a
 * synthetic one in a contract-only unit test).
 */
export function gradePatchApplyReconstruction(
  bundleDir: string,
  manifest: PatchManifest,
  baseFor: (relativePath: string) => Buffer
): GradeResult {
  const failures: string[] = [];
  for (const change of manifest.changes) {
    if (change.operation !== 'update' || !change.payload) continue;
    const base = baseFor(change.path).toString('utf8');
    if (change.before_sha256 && sha256(Buffer.from(base)) !== change.before_sha256) {
      fail(failures, `${change.path}: supplied base doesn't match before_sha256`);
      continue;
    }
    const diffText = fs.readFileSync(path.join(bundleDir, change.payload), 'utf8');
    const applied = applyPatch(base, diffText);
    if (applied === false) {
      fail(failures, `${change.path}: diff did not apply cleanly to the declared base`);
      continue;
    }
    if (change.after_sha256 && sha256(Buffer.from(applied)) !== change.after_sha256)
      fail(failures, `${change.path}: applied result doesn't match after_sha256`);
  }
  return result(APPLY_RECONSTRUCTION, failures);
}

/** The prepare step writes the bundle and manifest into the run context under
 * these keys; the factories read them back so the scenario stays declarative.
 */
export const patchManifestSchema =
  (manifestKey: string): GraderBinding =>
  (c) =>
    gradePatchManifestSchema(c.artifacts.get(manifestKey) as PatchManifest);

export const patchBundleHashes =
  (bundleKey: string, manifestKey: string): GraderBinding =>
  (c) =>
    gradePatchBundleHashes(
      c.artifacts.get(bundleKey) as string,
      c.artifacts.get(manifestKey) as PatchManifest
    );

export const patchApplyReconstruction =
  (bundleKey: string, manifestKey: string, baseKey: string): GraderBinding =>
  (c) =>
    gradePatchApplyReconstruction(
      c.artifacts.get(bundleKey) as string,
      c.artifacts.get(manifestKey) as PatchManifest,
      () => c.artifacts.get(baseKey) as Buffer
    );
