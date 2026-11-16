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
  const jobs = doc.jobs as Record<string, Record<string, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { build, release } = jobs;
  const packages = jobs['publish-github-packages'];
  const github = jobs['publish-github'];
  const npmjs = jobs['publish-npmjs'];
  const steps = (job: Record<string, any>) => JSON.stringify(job.steps); // eslint-disable-line @typescript-eslint/no-explicit-any

  it('runs on push to main with one concurrency group and no enable flag', () => {
    assert.deepEqual(doc.on.push.branches, ['main']);
    const group = typeof doc.concurrency === 'string' ? doc.concurrency : doc.concurrency.group;
    assert.equal(group, 'release-harness');
    assert.ok(!text.includes('HARNESS_RELEASE_ENABLED'));
    assert.equal(build.if, undefined, 'build always runs');
  });

  it('builds, waits for approval in the release environment, then runs the publish jobs in parallel', () => {
    assert.deepEqual(Object.keys(jobs), [
      'build',
      'release',
      'publish-github-packages',
      'publish-github',
      'publish-npmjs',
    ]);
    assert.equal(release.needs, 'build');
    assert.equal(release.environment, 'release');
    assert.match(String(release.if), /needs\.build\.outputs\.publish == 'true'/);
    for (const job of [packages, github, npmjs]) {
      assert.deepEqual(job.needs, ['build', 'release']);
      assert.equal(job.environment, undefined, 'one approval covers every channel');
    }
  });

  it('grants nothing by default and each job only what it needs', () => {
    assert.deepEqual(doc.permissions, {});
    assert.deepEqual(build.permissions, {
      contents: 'read',
      packages: 'read',
      'id-token': 'write',
      attestations: 'write',
    });
    assert.deepEqual(release.permissions, { contents: 'write' });
    assert.deepEqual(packages.permissions, { contents: 'read', packages: 'write' });
    assert.deepEqual(github.permissions, { contents: 'write' });
    assert.deepEqual(npmjs.permissions, { contents: 'read' });
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

  it('creates the tag through the API in the approval job only', () => {
    const r = steps(release);
    assert.match(r, /git\/refs/);
    assert.match(r, /GITHUB_SHA/);
    assert.ok(!r.includes('npm publish') && !r.includes('gh release'), 'the gate only tags');
  });

  it('stops at the gate when another run released the version while this one waited', () => {
    const r = steps(release);
    assert.match(r, /git diff --quiet/);
    assert.match(r, /while this run waited/);
  });

  it('publishes GitHub Packages and the GitHub Release in their own jobs', () => {
    assert.match(steps(packages), /npm publish --tolerate-republish/);
    assert.ok(!steps(packages).includes('gh release'));
    const g = steps(github);
    assert.match(g, /download-artifact/);
    assert.match(g, /gh release create/);
    assert.ok(!g.includes('npm publish'));
  });

  it('keeps npmjs.com as a stub that publishes nothing', () => {
    const n = steps(npmjs);
    assert.match(n, /not set up yet/);
    assert.ok(!n.includes('npm publish'), 'no publish');
  });

  it('uses the changelog entry of the version as the release notes, as semantic-release did', () => {
    assert.match(steps(build), /release-notes\.md/);
    assert.match(steps(build), /CHANGELOG\.md has no entry/);
    assert.match(steps(github), /--notes-file dist\/release-notes\.md/);
    assert.ok(!text.includes('--generate-notes'));
  });

  it('publishes the attested tarball to GitHub Packages and proves it before and after', () => {
    const p = steps(packages);
    const order = [
      'download-artifact',
      'cmp -s',
      'npm publish --tolerate-republish',
      'dist.integrity',
    ];
    let last = -1;
    for (const needle of order) {
      const at = p.indexOf(needle);
      assert.ok(at > last, `${needle} comes after the previous step`);
      last = at;
    }
    assert.match(p, /sha512/);
  });

  it('publishes the release from a draft, so an immutable release gets its assets first', () => {
    const g = steps(github);
    assert.match(g, /--draft --title/);
    assert.ok(g.indexOf('gh release upload') < g.indexOf('--draft=false'));
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

  it('runs in three stages: build-and-test, then the gates and the package check, then the CLI', () => {
    const jobs = doc.jobs as Record<string, Record<string, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
    assert.equal(jobs['build-and-test'].needs, undefined, 'stage 1 starts first');
    assert.equal(jobs.ci, undefined, 'the old job name is gone');
    for (const job of ['version-gate', 'docs-gate', 'harness-package'])
      assert.equal(jobs[job].needs, 'build-and-test', job);
    assert.deepEqual(jobs['harness-cli'].needs, ['version-gate', 'docs-gate', 'harness-package']);
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
