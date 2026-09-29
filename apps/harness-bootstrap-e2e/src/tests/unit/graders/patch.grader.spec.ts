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
  type PatchManifest,
} from '../../../graders/patch.grader.ts';

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
