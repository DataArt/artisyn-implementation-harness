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
  const { build, publish } = doc.jobs as Record<string, Record<string, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const steps = (job: Record<string, any>) => JSON.stringify(job.steps); // eslint-disable-line @typescript-eslint/no-explicit-any

  it('runs on push to main with one concurrency group and no enable flag', () => {
    assert.deepEqual(doc.on.push.branches, ['main']);
    const group = typeof doc.concurrency === 'string' ? doc.concurrency : doc.concurrency.group;
    assert.equal(group, 'release-harness');
    assert.ok(!text.includes('HARNESS_RELEASE_ENABLED'));
    assert.equal(build.if, undefined, 'build always runs');
  });

  it('splits into an automatic build job and a publish job that waits for the release environment', () => {
    assert.deepEqual(Object.keys(doc.jobs), ['build', 'publish']);
    assert.equal(publish.needs, 'build');
    assert.equal(publish.environment, 'release');
    assert.match(String(publish.if), /needs\.build\.outputs\.publish == 'true'/);
  });

  it('grants nothing by default and each job only what it needs', () => {
    assert.deepEqual(doc.permissions, {});
    assert.deepEqual(build.permissions, {
      contents: 'read',
      packages: 'read',
      'id-token': 'write',
      attestations: 'write',
    });
    assert.deepEqual(publish.permissions, { contents: 'write', packages: 'write' });
  });

  it('never pushes to main and needs no release token', () => {
    assert.ok(!text.includes('HARNESS_RELEASE_TOKEN'));
    assert.ok(!/git push/.test(text), 'no push');
    assert.ok(!/git commit/.test(text), 'no commit');
    assert.match(text, /persist-credentials: false/);
  });

  it('builds and attests in the build job and hands the artifacts over', () => {
    const b = steps(build);
    assert.ok((b.match(/attest-build-provenance/g) ?? []).length >= 2, 'tarball and ZIP');
    for (const needle of ['pack --out', 'zip -r -X', 'sha256sum', 'upload-artifact'])
      assert.ok(b.includes(needle), needle);
    for (const absent of ['npm publish', 'gh release create', 'gh release upload', 'git/refs'])
      assert.ok(!b.includes(absent), `${absent} waits for approval`);
  });

  it('creates the tag through the API only after approval, then publishes npm and the release', () => {
    const p = steps(publish);
    const order = [
      'download-artifact',
      'git/refs',
      'npm publish --tolerate-republish',
      'gh release create',
    ];
    let last = -1;
    for (const needle of order) {
      const at = p.indexOf(needle);
      assert.ok(at > last, `${needle} comes after the previous step`);
      last = at;
    }
    assert.match(p, /GITHUB_SHA/);
  });

  it('publishes the release from a draft, so an immutable release gets its assets first', () => {
    const p = steps(publish);
    assert.match(p, /--draft --title/);
    assert.ok(p.indexOf('gh release upload') < p.indexOf('--draft=false'));
  });

  it('does not version: the PR stamped the version', () => {
    for (const absent of [
      'nx release version',
      'nx release changelog',
      'stamp-harness-version.mjs',
    ])
      assert.ok(!text.includes(absent), `${absent} runs on the PR, not here`);
    assert.match(text, /skills\/implementation-harness\/package\.json/);
  });

  it('skips a fully published version and fails when a merge changes the harness under an existing tag', () => {
    const b = steps(build);
    assert.match(b, /yarn npm info/);
    assert.match(b, /gh release view/);
    assert.match(b, /fully published/);
    assert.match(
      text,
      /git diff --quiet "\$\{tag\}" "\$\{GITHUB_SHA\}" -- skills\/implementation-harness/
    );
  });
});

describe('ci.yml', () => {
  const { text, doc } = load('ci.yml');

  it('pins the plugin validator version', () => {
    assert.match(text, /@anthropic-ai\/claude-code@\d+\.\d+\.\d+/);
  });

  it('keeps the existing ci job and adds the version, rename and package gates', () => {
    for (const job of ['ci', 'version-gate', 'docs-gate', 'harness-package'])
      assert.ok(doc.jobs[job], job);
  });

  it('runs the gates the design names', () => {
    for (const needle of [
      'stamp-harness-version.mjs --check',
      'version-harness.mjs --check',
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
