import { result } from './grading.ts';
import type { GradeResult, GraderBinding } from './_types.ts';
import fs from 'node:fs';
import path from 'node:path';
import { applyPatch } from 'diff';
import { sha256, readJson } from '../utils/fs.ts';
import type { PatchManifest, Receipt } from './_types.ts';
import { OPERATIONS_DIR } from '../utils/constants.ts';
import { PROVIDERS, type Provider } from '../utils/providers.ts';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MANIFEST_SCHEMA = 'patch/manifest-schema';
const BUNDLE_HASHES = 'patch/bundle-hashes';
const APPLY_RECONSTRUCTION = 'patch/apply-reconstruction';
const PROVIDER_SCOPE = 'patch/provider-scope';

const KNOWN_PROVIDERS: string[] = Object.values(PROVIDERS);
/** A permanent output every selected provider reads (an Engineering Guide
 * article, an architecture doc) deploys once and belongs to no single provider.
 */
const SHARED_OUTPUT = 'shared';

/** 06-patch-state.md's "Provider scope of an operation": how wide the scope a
 * given mode is allowed to record may be. `prepare` never leaves canonical, so
 * it has none; `harvest` observes exactly one installed output.
 */
const SCOPE_BY_MODE: Record<string, { min: number; max: number }> = {
  prepare: { min: 0, max: 0 },
  harvest: { min: 1, max: 1 },
  // A canonical-only apply deploys nothing, so an empty scope is correct for it;
  // any mapped result still has to name a provider inside the scope.
  apply: { min: 0, max: KNOWN_PROVIDERS.length },
  launch: { min: 1, max: KNOWN_PROVIDERS.length },
};

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

/** Structural: a local operation record declares the provider scope
 * 06-patch-state.md requires, so a project with both providers installed can
 * tell which one an `apply`/`harvest` actually covered. `expectedProviders`,
 * when given, is the scope the run was supposed to reach — a record that
 * claims `applied` while covering fewer providers is the failure this guards.
 */
export function gradePatchProviderScope(
  operation: Receipt,
  expectedProviders?: Provider[]
): GradeResult {
  const failures: string[] = [];
  const mode = String(operation.mode ?? '');
  const bounds = SCOPE_BY_MODE[mode];
  if (!bounds) {
    fail(failures, `unknown operation mode: ${mode || '(missing)'}`);
    return result(PROVIDER_SCOPE, failures);
  }
  const providers = operation.providers;
  if (!Array.isArray(providers)) {
    fail(failures, `${mode}: operation record must declare a providers array`);
    return result(PROVIDER_SCOPE, failures);
  }
  if (providers.length < bounds.min || providers.length > bounds.max)
    fail(
      failures,
      `${mode}: providers must name ${bounds.min === bounds.max ? bounds.min : `${bounds.min}-${bounds.max}`} provider(s), got ${providers.length}`
    );
  if (new Set(providers).size !== providers.length)
    fail(failures, `${mode}: providers has duplicate entries`);
  for (const provider of providers)
    if (!KNOWN_PROVIDERS.includes(String(provider)))
      fail(failures, `${mode}: unknown provider in scope: ${String(provider)}`);

  // Each mapped per-file result belongs to one provider in scope, or is a
  // shared project output; only a canonical-only result may use null.
  const files: Receipt[] = Array.isArray(operation.files) ? operation.files : [];
  const covered = new Set<string>();
  for (const file of files) {
    const where = String(file.path ?? '(unnamed)');
    const provider = file.provider ?? null;
    if (provider === null) {
      if (file.deployment && file.deployment !== 'canonical-only')
        fail(failures, `${where}: mapped result must name its provider`);
      continue;
    }
    if (provider === SHARED_OUTPUT) continue;
    if (!providers.includes(provider)) {
      fail(failures, `${where}: provider ${String(provider)} is outside the recorded scope`);
      continue;
    }
    covered.add(String(provider));
  }

  // Completion is per provider: `applied` means every provider in scope was
  // deployed and verified, not "at least one of them".
  if (operation.status === 'applied' && mode === 'apply')
    for (const provider of providers)
      if (!covered.has(String(provider)))
        fail(
          failures,
          `status is applied but no deployed result covers provider ${String(provider)}`
        );

  for (const provider of expectedProviders ?? [])
    if (!providers.includes(provider))
      fail(failures, `${mode}: expected provider ${provider} missing from the recorded scope`);

  return result(PROVIDER_SCOPE, failures);
}

/** Newest local operation record for `mode` under the package's state dir. */
export function latestOperation(packageRoot: string, mode: string): Receipt {
  const dir = path.join(packageRoot, OPERATIONS_DIR);
  const records = (fs.existsSync(dir) ? fs.readdirSync(dir) : [])
    .filter((name) => name.endsWith('.json'))
    .map((name) => readJson<Receipt>(path.join(dir, name)))
    .filter((record) => String(record.mode ?? '').replace('patch-', '') === mode);
  if (!records.length) throw new Error(`no ${mode} operation record under ${dir}`);
  return records.sort((a, b) =>
    String(a.created_at ?? '').localeCompare(String(b.created_at ?? ''))
  )[records.length - 1];
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

/** `packageRootOf` resolves the project whose operation record is graded, so
 * the same check reads the sender after prepare and the receiver after apply.
 */
export const patchProviderScope =
  (
    mode: string,
    packageRootOf: (c: { workspaces: Array<{ packageRoot: string }> }) => string,
    expectedProviders?: Provider[]
  ): GraderBinding =>
  (c) => {
    try {
      return gradePatchProviderScope(latestOperation(packageRootOf(c), mode), expectedProviders);
    } catch (error) {
      return result(PROVIDER_SCOPE, [(error as Error).message]);
    }
  };
