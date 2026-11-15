/** Structure of the release workflow and the new CI gates. The release workflow cannot run
 * here; these checks pin the properties the design depends on. Covers plan AC-22 and AC-23.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { describe, it } from 'vitest';
import { workspaceRoot } from '../helpers/harness.ts';

const load = (name: string) => {
  const text = fs.readFileSync(path.join(workspaceRoot, '.github/workflows', name), 'utf8');
  return { text, doc: parse(text) as Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
};

describe('release-harness.yml', () => {
  const { text, doc } = load('release-harness.yml');
  const jobs = Object.values(doc.jobs) as Array<Record<string, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

  it('runs on push to main with one concurrency group', () => {
    assert.deepEqual(doc.on.push.branches, ['main']);
    const group = typeof doc.concurrency === 'string' ? doc.concurrency : doc.concurrency.group;
    assert.equal(group, 'release-harness');
  });

  it('asks for the four permissions the design lists and nothing wider', () => {
    assert.deepEqual(doc.permissions, {
      contents: 'write',
      packages: 'write',
      'id-token': 'write',
      attestations: 'write',
    });
  });

  it('is off until HARNESS_RELEASE_ENABLED is set and ignores its own release commit', () => {
    for (const job of jobs) {
      const condition = String(job.if ?? '');
      assert.ok(condition.includes("vars.HARNESS_RELEASE_ENABLED == 'true'"), condition);
      assert.ok(condition.includes('github.actor'), 'actor guard');
    }
    assert.ok(text.includes('[skip ci]'));
  });

  it('checks out with the release token, fails fast without it and has no github.token fallback', () => {
    assert.ok(text.includes('secrets.HARNESS_RELEASE_TOKEN'));
    assert.match(text, /HARNESS_RELEASE_TOKEN[^\n]*(missing|not set|empty)/i);
    assert.ok(!/HARNESS_RELEASE_TOKEN\s*\|\|\s*(github|secrets)\.(github_)?token/i.test(text));
    assert.ok(text.includes('fetch-depth: 0'));
  });

  it('releases from the tip of main, pushes atomically and keeps the token out of every other step', () => {
    assert.match(text, /ref: main/);
    assert.match(text, /persist-credentials: false/);
    assert.match(text, /git push --atomic/);
    // The secret is read in exactly two places: the presence check and the push step.
    assert.equal((text.match(/secrets\.HARNESS_RELEASE_TOKEN/g) ?? []).length, 2);
  });

  it('attests before it publishes, so a failed attestation blocks the release and is retried', () => {
    const attest = text.indexOf('actions/attest-build-provenance');
    assert.ok(attest > 0);
    for (const later of [
      'npm publish --tolerate-republish',
      'gh release create',
      'gh release upload',
    ])
      assert.ok(text.indexOf(later) > attest, `${later} comes after the attest steps`);
  });

  it('versions, stamps, publishes, builds the ZIP and attests tarball and ZIP', () => {
    for (const needle of [
      'nx release version',
      'stamp-harness-version.mjs',
      'nx release changelog',
      'npm publish --tolerate-republish',
      'pack-shim.mjs',
      '.sha256',
      'gh release upload',
    ])
      assert.ok(text.includes(needle), needle);
    assert.ok((text.match(/attest-build-provenance/g) ?? []).length >= 2, 'tarball and ZIP');
  });

  it('resolves the latest harness tag reachable from origin/main so a re-run still publishes', () => {
    assert.ok(text.includes('artisyn-implementation-harness-v'));
    assert.match(text, /origin\/main/);
    assert.match(text, /--merged/);
    assert.match(text, /yarn npm info/);
    assert.match(text, /gh release view/);
  });

  it('exits early only when nothing new and the latest tag is fully published', () => {
    assert.match(text, /fully published|already published/i);
  });
});

describe('ci.yml', () => {
  const { text, doc } = load('ci.yml');

  it('pins the plugin validator version', () => {
    assert.match(text, /@anthropic-ai\/claude-code@\d+\.\d+\.\d+/);
  });

  it('keeps the existing ci job and adds the version, rename and package gates', () => {
    for (const job of ['ci', 'version-gate', 'rename-gate', 'harness-package'])
      assert.ok(doc.jobs[job], job);
  });

  it('runs the gates the design names', () => {
    for (const needle of [
      'stamp-harness-version.mjs --check',
      'check-rename.mjs',
      'check-docs.mjs',
      'check-pack.mjs',
      'validate-plugin.mjs',
      'nx release version',
      'check-commit-scope.mjs',
    ])
      assert.ok(text.includes(needle), needle);
  });

  it('runs the CLI unit tests on ubuntu, macos and windows', () => {
    const matrixJob = Object.values(doc.jobs).find(
      (job: any) => job.strategy?.matrix?.os // eslint-disable-line @typescript-eslint/no-explicit-any
    ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    assert.ok(matrixJob, 'a matrix job exists');
    const os = JSON.stringify(matrixJob.strategy.matrix.os);
    for (const runner of ['ubuntu', 'macos', 'windows']) assert.ok(os.includes(runner), runner);
  });
});
