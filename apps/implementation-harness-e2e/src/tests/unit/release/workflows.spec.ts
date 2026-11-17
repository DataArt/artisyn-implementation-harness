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

describe('deploy-harness.yml', () => {
  const { text, doc } = load('deploy-harness.yml');
  const jobs = doc.jobs as Record<string, Record<string, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { build, release } = jobs;
  const packages = jobs['publish-github-packages'];
  const github = jobs['publish-github'];
  const npmjs = jobs['publish-npmjs'];
  const steps = (job: Record<string, any>) => JSON.stringify(job.steps); // eslint-disable-line @typescript-eslint/no-explicit-any

  it('starts only for the package, its channel manifests or itself, or by hand', () => {
    assert.deepEqual(doc.on.push.paths, [
      'skills/implementation-harness/**',
      'skills/.claude-plugin/**',
      '.claude-plugin/**',
      '.agents/plugins/**',
      '.github/plugin/**',
      'skills.sh.json',
      '.github/workflows/deploy-harness.yml',
    ]);
    assert.ok('workflow_dispatch' in doc.on);
  });

  it('keeps the paths filter in step with the harness files of the commit scope rule', () => {
    const scope = fs.readFileSync(
      path.join(workspaceRoot, 'scripts/check-commit-scope.mjs'),
      'utf8'
    );
    for (const prefix of [
      'skills\\/implementation-harness\\/',
      'skills\\/\\.claude-plugin\\/',
      '\\.claude-plugin\\/',
      '\\.agents\\/plugins\\/',
      '\\.github\\/plugin\\/',
      'skills\\.sh\\.json',
    ])
      assert.ok(scope.includes(prefix), prefix);
  });

  it('refuses a manual run from any branch but main before it builds or attests', () => {
    const first = (build.steps as { name?: string; run?: string }[])[0];
    assert.equal(first.name, 'Only main is released');
    assert.match(String(first.run), /GITHUB_REF\}" != "refs\/heads\/main"/);
    assert.match(String(first.run), /exit 1/);
  });

  it('runs on push to main with one concurrency group and no enable flag', () => {
    assert.deepEqual(doc.on.push.branches, ['main']);
    const group = typeof doc.concurrency === 'string' ? doc.concurrency : doc.concurrency.group;
    assert.equal(group, 'deploy-harness');
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

describe('workflow set', () => {
  it('splits PR checks into ci-web.yml and ci-harness.yml; the old files are gone', () => {
    const dir = path.join(workspaceRoot, '.github/workflows');
    for (const gone of ['ci.yml', 'gitleaks.yml', 'release-harness.yml'])
      assert.ok(!fs.existsSync(path.join(dir, gone)), `${gone} is retired`);
  });

  it('keeps each required check a unique job ID with no name override, so the ruleset matches it', () => {
    const owners: Record<string, string> = {
      'build-and-test': 'ci-web.yml',
      'docs-gate': 'ci-web.yml',
      'version-gate': 'ci-harness.yml',
      'harness-package': 'ci-harness.yml',
      'harness-unit': 'ci-harness.yml',
    };
    const all = ['ci-web.yml', 'ci-harness.yml', 'deploy-web.yml', 'deploy-harness.yml'].map(
      (name) => ({ name, jobs: load(name).doc.jobs as Record<string, Record<string, unknown>> })
    );
    for (const [check, owner] of Object.entries(owners)) {
      const found = all.filter((w) => check in w.jobs);
      assert.deepEqual(
        found.map((w) => w.name),
        [owner],
        `${check} exists once, in ${owner}`
      );
      assert.equal(found[0].jobs[check].name, undefined, `${check} has no name override`);
    }
  });

  it('gives both PR workflows read-only contents and nothing else', () => {
    for (const name of ['ci-web.yml', 'ci-harness.yml']) {
      const { doc } = load(name);
      assert.deepEqual(doc.permissions, { contents: 'read' }, name);
      for (const [id, job] of Object.entries(doc.jobs as Record<string, Record<string, unknown>>))
        assert.equal(job.permissions, undefined, `${name} ${id} adds no permissions`);
    }
  });

  it('cancels superseded PR runs but never a push-to-main scan', () => {
    const web = load('ci-web.yml').doc.concurrency;
    assert.match(web.group, /github\.event\.pull_request\.number \|\| github\.sha/);
    assert.equal(web['cancel-in-progress'], "${{ github.event_name == 'pull_request' }}");
    const harness = load('ci-harness.yml').doc.concurrency;
    assert.match(harness.group, /github\.event\.pull_request\.number/);
    assert.equal(harness['cancel-in-progress'], true);
  });
});

describe('ci-web.yml', () => {
  const { text, doc } = load('ci-web.yml');
  const jobs = doc.jobs as Record<string, Record<string, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

  it('runs build-and-test, docs-gate and gitleaks in parallel on every pull request', () => {
    assert.deepEqual(Object.keys(doc.on), ['pull_request', 'push']);
    assert.equal(doc.on.pull_request.paths, undefined, 'no paths filter');
    assert.deepEqual(Object.keys(jobs), ['build-and-test', 'docs-gate', 'gitleaks']);
    for (const job of Object.values(jobs)) assert.equal(job.needs, undefined);
  });

  it('scans main on every push, and runs only the scan there', () => {
    assert.deepEqual(doc.on.push, { branches: ['main'] });
    assert.equal(doc.on.push.paths, undefined, 'every push is scanned');
    assert.equal(jobs.gitleaks.if, undefined);
    for (const job of ['build-and-test', 'docs-gate'])
      assert.equal(jobs[job].if, "github.event_name == 'pull_request'", job);
  });

  it('checks docs and commit scopes across the whole repo', () => {
    const d = JSON.stringify(jobs['docs-gate']);
    assert.ok(d.includes('check-docs.mjs'));
    assert.ok(d.includes('check-commit-scope.mjs'));
  });

  it('builds in the web environment with the site variables', () => {
    assert.equal(jobs['build-and-test'].environment, 'web');
    for (const name of [
      'VITE_GITHUB_ORG',
      'VITE_GITHUB_REPO',
      'VITE_GISCUS_REPO_ID',
      'VITE_GISCUS_CATEGORY_ID',
    ])
      assert.ok(text.includes(`vars.${name}`), name);
  });

  it('runs a pinned, checksum-verified gitleaks over the full history', () => {
    const g = JSON.stringify(jobs.gitleaks);
    assert.match(g, /GITLEAKS_SHA256/);
    assert.match(g, /sha256sum -c/);
    assert.match(g, /--log-opts=\\"--all\\"/);
  });
});

describe('ci-harness.yml', () => {
  const { text, doc } = load('ci-harness.yml');
  const jobs = doc.jobs as Record<string, Record<string, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

  const filter = String(
    (jobs.changes.steps as { id?: string; run?: string }[]).find((s) => s.id === 'filter')?.run
  );
  const pattern = new RegExp(/paths='([^']+)'/.exec(filter)![1]);

  it('starts on every pull request and filters paths in a job: required checks must report', () => {
    assert.deepEqual(Object.keys(doc.on), ['pull_request']);
    assert.equal(doc.on.pull_request.paths, undefined, 'a skipped workflow blocks the merge');
    assert.equal(jobs['docs-gate'], undefined, 'docs-gate runs in ci-web.yml');
  });

  it('runs the gates when the PR touches the harness, then the CLI', () => {
    for (const job of ['version-gate', 'harness-package', 'harness-unit']) {
      assert.equal(jobs[job].needs, 'changes', job);
      assert.match(String(jobs[job].if), /needs\.changes\.outputs\.harness == 'true'/, job);
    }
    assert.deepEqual(jobs['harness-cli'].needs, ['version-gate', 'harness-package']);
  });

  it('runs the gates when change detection fails: a job skipped after a failed need reports success', () => {
    for (const job of ['version-gate', 'harness-package', 'harness-unit']) {
      const condition = String(jobs[job].if);
      assert.match(condition, /!cancelled\(\)/, job);
      assert.match(condition, /needs\.changes\.result != 'success'/, job);
    }
    assert.match(filter, /if ! changed=\$\(git diff/, 'a git error counts as a harness change');
    assert.ok(!/set -e/.test(filter), 'a git error must not fail the job');
  });

  it('wires the filter step to the changes output and lists both sides of a rename', () => {
    assert.equal(jobs.changes.outputs.harness, '${{ steps.filter.outputs.harness }}');
    assert.match(filter, /git diff --no-renames --name-only/);
  });

  it('runs the e2e unit specs, which Nx skips for workflow-only and scripts-only changes', () => {
    assert.match(JSON.stringify(jobs['harness-unit'].steps), /implementation-harness-e2e:unit"/);
  });

  it('filters on the harness files of deploy-harness.yml and the tooling the jobs run', () => {
    const release = load('deploy-harness.yml').doc.on.push.paths as string[];
    const samples = [
      ...release.map((p) => p.replace('**', 'x').replace('deploy-harness', 'ci-harness')),
      'scripts/release/version-harness.mjs',
      'scripts/ci/check-pack.mjs',
      'scripts/validate-plugin.mjs',
      'scripts/check-commit-scope.mjs',
      'scripts/check-docs.mjs',
      'apps/implementation-harness-e2e/src/x.ts',
      '.github/workflows/ci-web.yml',
      '.github/actions/setup/action.yml',
      'nx.json',
      'package.json',
      'yarn.lock',
      '.yarnrc.yml',
      '.yarn/releases/yarn.cjs',
      'skills/another-skill/SKILL.md',
      '.claude/skills/dev/SKILL.md',
    ];
    for (const file of samples) assert.ok(pattern.test(file), `${file} runs the harness checks`);
    for (const file of [
      'apps/web-explorer/src/main.tsx',
      'apps/web-docs/package.json',
      'docs/README.md',
      'skills.sh.json.bak',
      'scripts/ci/site-build.sh',
      '.claude/agents/web.md',
    ])
      assert.ok(!pattern.test(file), `${file} skips them`);
  });

  it('pins the plugin validator version', () => {
    assert.match(text, /@anthropic-ai\/claude-code@\d+\.\d+\.\d+/);
  });

  it('runs the gates the design names', () => {
    for (const needle of [
      'stamp-harness-version.mjs --check',
      'version-harness.mjs --check',
      'check-pack.mjs',
      'validate-plugin.mjs',
      'nx release version',
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

describe('deploy-web.yml', () => {
  const { text, doc } = load('deploy-web.yml');
  const jobs = doc.jobs as Record<string, Record<string, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

  it('builds in the web environment and deploys in github-pages only when the site was built', () => {
    assert.equal(jobs.build.environment, 'web');
    assert.deepEqual(jobs.build.permissions, { contents: 'read', actions: 'read' });
    assert.deepEqual(doc.permissions, { contents: 'read' });
    assert.equal(jobs.deploy.needs, 'build');
    assert.equal(jobs.deploy.environment.name, 'github-pages');
    assert.match(String(jobs.deploy.if), /needs\.build\.outputs\.built == 'true'/);
    assert.deepEqual(jobs.deploy.permissions, { pages: 'write', 'id-token': 'write' });
  });

  it('uploads in build and deploys in deploy, one Pages deploy at a time', () => {
    assert.deepEqual(doc.concurrency, { group: 'pages', 'cancel-in-progress': false });
    const build = JSON.stringify(jobs.build.steps);
    const deploy = JSON.stringify(jobs.deploy.steps);
    assert.ok(build.includes('upload-pages-artifact') && !build.includes('deploy-pages'));
    assert.ok(deploy.includes('deploy-pages') && !deploy.includes('upload-pages-artifact'));
  });

  it('builds from the last successful deploy, so a replaced or failed push is not lost', () => {
    const steps = jobs.build.steps as { id?: string; name?: string; run?: string }[];
    const base = String(steps.find((step) => step.id === 'base')?.run);
    assert.match(base, /gh run list .*--workflow deploy-web\.yml .*--status success/s);
    assert.match(base, /git merge-base --is-ancestor/);
    assert.match(base, /base="\$BEFORE"/, 'falls back to the push range');
    const build = String(steps.find((step) => step.name === 'Build site')?.run);
    assert.match(build, /--base=\$\{\{ steps\.base\.outputs\.sha \}\}/);
  });

  it('builds the site with the variables of the web environment', () => {
    for (const name of [
      'VITE_GITHUB_ORG',
      'VITE_GITHUB_REPO',
      'VITE_GISCUS_REPO_ID',
      'VITE_GISCUS_CATEGORY_ID',
    ])
      assert.ok(text.includes(`vars.${name}`), name);
  });
});
