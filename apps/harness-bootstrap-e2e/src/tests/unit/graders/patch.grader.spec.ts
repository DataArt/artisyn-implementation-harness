import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createPatch } from 'diff';
import { describe, expect, it } from 'vitest';
import {
  gradePatchManifestSchema,
  gradePatchBundleHashes,
  gradePatchApplyReconstruction,
  gradePatchProviderScope,
  latestOperation,
} from '../../../graders/patch.grader.ts';
import type { PatchManifest, Receipt } from '../../../graders/_types.ts';
import { OPERATIONS_DIR } from '../../../utils/constants.ts';
import { PROVIDERS } from '../../../utils/providers.ts';

const sha256 = (data: Buffer) => crypto.createHash('sha256').update(data).digest('hex');

/** Builds a minimal, real schema-v2 bundle on disk — synthetic content, but
 * exercised through the exact same manifest/diff/hash contract
 * 06-patch-state.md specifies. This tests the contract itself, independent
 * of whether the skill's own harvest/prepare/apply (agent-driven, no script
 * backs them) actually produces one — see patch-prepare-apply's agent-e2e case for that.
 */
function buildBundle() {
  const bundleDir = fs.mkdtempSync(path.join(os.tmpdir(), 'patch-bundle-'));
  const before = 'Project scope\n\nOriginal guidance line.\n';
  const after = 'Project scope\n\nOriginal guidance line.\nAdded guidance line.\n';
  const diffText = createPatch('canonical/skills/demo/TEMPLATE.md', before, after);

  fs.mkdirSync(path.join(bundleDir, 'diffs/canonical/skills/demo'), { recursive: true });
  fs.writeFileSync(path.join(bundleDir, 'diffs/canonical/skills/demo/TEMPLATE.md.patch'), diffText);

  fs.mkdirSync(path.join(bundleDir, 'files/canonical/skills/demo'), { recursive: true });
  const newFileContent = 'A brand new canonical file.\n';
  fs.writeFileSync(path.join(bundleDir, 'files/canonical/skills/demo/NEW.md'), newFileContent);

  const manifest: PatchManifest = {
    schema_version: 2,
    id: crypto.randomUUID(),
    operation: 'prepare',
    changes: [
      {
        operation: 'update',
        path: 'canonical/skills/demo/TEMPLATE.md',
        old_path: null,
        before_sha256: sha256(Buffer.from(before)),
        after_sha256: sha256(Buffer.from(after)),
        payload: 'diffs/canonical/skills/demo/TEMPLATE.md.patch',
        payload_sha256: sha256(Buffer.from(diffText)),
      },
      {
        operation: 'add',
        path: 'canonical/skills/demo/NEW.md',
        old_path: null,
        before_sha256: null,
        after_sha256: sha256(Buffer.from(newFileContent)),
        payload: 'files/canonical/skills/demo/NEW.md',
        payload_sha256: sha256(Buffer.from(newFileContent)),
      },
    ],
  };
  fs.writeFileSync(path.join(bundleDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return { bundleDir, manifest, before, after };
}

describe('patch bundle contract (schema v2)', () => {
  it('accepts a well-formed manifest', () => {
    const { manifest } = buildBundle();
    expect(gradePatchManifestSchema(manifest).pass).toBe(true);
  });

  it('rejects a manifest with an add entry that declares a before hash', () => {
    const { manifest } = buildBundle();
    manifest.changes[1].before_sha256 = 'not-null';
    const result = gradePatchManifestSchema(manifest);
    expect(result.pass).toBe(false);
    expect(result.failures[0]).toMatch(/add must have before_sha256 null/);
  });

  it('verifies payload bytes match their declared hashes', () => {
    const { bundleDir, manifest } = buildBundle();
    expect(gradePatchBundleHashes(bundleDir, manifest).pass).toBe(true);
  });

  it('catches a tampered payload', () => {
    const { bundleDir, manifest } = buildBundle();
    fs.appendFileSync(path.join(bundleDir, 'files/canonical/skills/demo/NEW.md'), 'tampered');
    const result = gradePatchBundleHashes(bundleDir, manifest);
    expect(result.pass).toBe(false);
  });

  it('reconstructs the after-state by applying the diff to the declared before-state', () => {
    const { bundleDir, manifest, before } = buildBundle();
    const result = gradePatchApplyReconstruction(bundleDir, manifest, () => Buffer.from(before));
    expect(result.pass, result.failures.join('\n')).toBe(true);
  });

  it('fails reconstruction when the supplied base does not match before_sha256', () => {
    const { bundleDir, manifest } = buildBundle();
    const result = gradePatchApplyReconstruction(bundleDir, manifest, () =>
      Buffer.from('wrong base')
    );
    expect(result.pass).toBe(false);
    expect(result.failures[0]).toMatch(/doesn't match before_sha256/);
  });
});

/** A local `apply` operation record as 06-patch-state.md's "Provider scope of
 * an operation" specifies it: a resolved provider scope, and one per-file
 * result per provider output plus a provider-neutral canonical-only entry.
 */
function applyRecord(overrides: Partial<Receipt> = {}): Receipt {
  return {
    id: crypto.randomUUID(),
    mode: 'apply',
    status: 'applied',
    created_at: '2026-10-01T00:00:00Z',
    providers: [PROVIDERS.claude, PROVIDERS.codex],
    files: [
      { path: '.claude/skills/dev/SKILL.md', provider: PROVIDERS.claude, deployment: 'mapped' },
      { path: '.agents/skills/dev/SKILL.md', provider: PROVIDERS.codex, deployment: 'mapped' },
      {
        path: 'docs/Engineering Guide/01 Conventions.md',
        provider: 'shared',
        deployment: 'mapped',
      },
      { path: 'CHANGELOG.md', provider: null, deployment: 'canonical-only' },
    ],
    ...overrides,
  };
}

describe('patch operation provider scope', () => {
  it('accepts an apply record that covers every provider in its scope', () => {
    const outcome = gradePatchProviderScope(applyRecord(), [PROVIDERS.claude, PROVIDERS.codex]);
    expect(outcome.pass, outcome.failures.join('\n')).toBe(true);
  });

  it('rejects a record with no providers array — scope is unknown, not implied', () => {
    const record = applyRecord();
    delete record.providers;
    const outcome = gradePatchProviderScope(record);
    expect(outcome.pass).toBe(false);
    expect(outcome.failures[0]).toMatch(/must declare a providers array/);
  });

  it('rejects applied when one provider in scope has no deployed result', () => {
    const outcome = gradePatchProviderScope(
      applyRecord({
        files: [
          { path: '.claude/skills/dev/SKILL.md', provider: PROVIDERS.claude, deployment: 'mapped' },
        ],
      })
    );
    expect(outcome.pass).toBe(false);
    expect(outcome.failures.join('\n')).toMatch(/no deployed result covers provider codex/);
  });

  it('accepts the same half-finished run when it honestly records partial', () => {
    const outcome = gradePatchProviderScope(
      applyRecord({
        status: 'partial',
        files: [
          { path: '.claude/skills/dev/SKILL.md', provider: PROVIDERS.claude, deployment: 'mapped' },
        ],
      })
    );
    expect(outcome.pass, outcome.failures.join('\n')).toBe(true);
  });

  it('rejects a mapped result whose provider is outside the recorded scope', () => {
    const outcome = gradePatchProviderScope(
      applyRecord({
        providers: [PROVIDERS.claude],
        files: [
          { path: '.agents/skills/dev/SKILL.md', provider: PROVIDERS.codex, deployment: 'mapped' },
        ],
      })
    );
    expect(outcome.pass).toBe(false);
    expect(outcome.failures.join('\n')).toMatch(/outside the recorded scope/);
  });

  it('rejects a mapped result that names no provider at all', () => {
    const outcome = gradePatchProviderScope(
      applyRecord({
        files: [{ path: '.claude/skills/dev/SKILL.md', provider: null, deployment: 'mapped' }],
        status: 'partial',
      })
    );
    expect(outcome.pass).toBe(false);
    expect(outcome.failures.join('\n')).toMatch(/must name its provider/);
  });

  it('requires prepare to record an empty scope and harvest exactly one provider', () => {
    expect(
      gradePatchProviderScope({ mode: 'prepare', status: 'completed', providers: [], files: [] })
        .pass
    ).toBe(true);
    expect(
      gradePatchProviderScope({
        mode: 'prepare',
        status: 'completed',
        providers: [PROVIDERS.claude],
        files: [],
      }).pass
    ).toBe(false);
    expect(
      gradePatchProviderScope({
        mode: 'harvest',
        status: 'harvested',
        providers: [PROVIDERS.claude, PROVIDERS.codex],
        files: [],
      }).pass
    ).toBe(false);
  });

  it('accepts a shared project output that belongs to no single provider', () => {
    const outcome = gradePatchProviderScope(
      applyRecord({
        providers: [PROVIDERS.claude],
        files: [
          { path: '.claude/skills/dev/SKILL.md', provider: PROVIDERS.claude, deployment: 'mapped' },
          {
            path: 'docs/Engineering Guide/01 Conventions.md',
            provider: 'shared',
            deployment: 'mapped',
          },
        ],
      })
    );
    expect(outcome.pass, outcome.failures.join('\n')).toBe(true);
  });

  it('accepts a canonical-only apply that deploys nothing and so covers no provider', () => {
    const outcome = gradePatchProviderScope(
      applyRecord({
        providers: [],
        files: [{ path: 'CHANGELOG.md', provider: null, deployment: 'canonical-only' }],
      })
    );
    expect(outcome.pass, outcome.failures.join('\n')).toBe(true);
  });

  it('still rejects a mapped result when the scope is empty', () => {
    const outcome = gradePatchProviderScope(
      applyRecord({
        providers: [],
        files: [
          { path: '.claude/skills/dev/SKILL.md', provider: PROVIDERS.claude, deployment: 'mapped' },
        ],
      })
    );
    expect(outcome.pass).toBe(false);
    expect(outcome.failures.join('\n')).toMatch(/outside the recorded scope/);
  });

  it('reads the newest record for a mode, tolerating the patch- mode prefix', () => {
    const packageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'patch-ops-'));
    const dir = path.join(packageRoot, OPERATIONS_DIR);
    fs.mkdirSync(dir, { recursive: true });
    const older = applyRecord({ created_at: '2026-09-01T00:00:00Z', mode: 'patch-apply' });
    const newer = applyRecord({ created_at: '2026-10-01T00:00:00Z', mode: 'patch-apply' });
    fs.writeFileSync(path.join(dir, `${older.id}.json`), JSON.stringify(older));
    fs.writeFileSync(path.join(dir, `${newer.id}.json`), JSON.stringify(newer));
    expect(latestOperation(packageRoot, 'apply').id).toBe(newer.id);
  });
});
