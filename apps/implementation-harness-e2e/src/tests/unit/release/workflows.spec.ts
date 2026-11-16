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

  it('always runs: no enable flag or job condition', () => {
    assert.ok(!text.includes('HARNESS_RELEASE_ENABLED'));
    for (const job of jobs) assert.equal(job.if, undefined);
  });

  it('never pushes to main and needs no release token (TD-5)', () => {
    assert.ok(!text.includes('HARNESS_RELEASE_TOKEN'));
    assert.ok(!/git push/.test(text), 'no push');
    assert.ok(!/git commit/.test(text), 'no commit');
    assert.match(text, /persist-credentials: false/);
    assert.ok(text.includes('fetch-depth: 0'));
  });

  it('tags the commit that triggered the run through the API when the tag is new', () => {
    assert.match(text, /gh api "repos\/\$\{GITHUB_REPOSITORY\}\/git\/refs"/);
    assert.match(text, /refs\/tags\/\$\{tag\}/);
    assert.match(text, /GITHUB_SHA/);
    assert.match(text, /skills\/implementation-harness\/package\.json/);
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

  it('publishes, builds the ZIP and attests tarball and ZIP, but does not version', () => {
    for (const needle of ['npm publish --tolerate-republish', '.sha256', 'gh release upload'])
      assert.ok(text.includes(needle), needle);
    for (const absent of [
      'nx release version',
      'nx release changelog',
      'stamp-harness-version.mjs',
    ])
      assert.ok(!text.includes(absent), `${absent} runs on the PR, not here`);
    assert.ok((text.match(/attest-build-provenance/g) ?? []).length >= 2, 'tarball and ZIP');
  });

  it('finishes an existing tag instead of failing, so a re-run or a later merge still publishes', () => {
    assert.match(text, /rev-parse -q --verify "refs\/tags/);
    assert.match(
      text,
      /git diff --quiet "\$\{tag\}" "\$\{GITHUB_SHA\}" -- skills\/implementation-harness/
    );
    assert.match(text, /yarn npm info/);
    assert.match(text, /gh release view/);
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
      'version-harness.mjs --check',
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
