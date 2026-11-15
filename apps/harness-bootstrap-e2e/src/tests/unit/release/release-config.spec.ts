/** Release configuration: the root semantic-release lane ignores harness commits (even
 * breaking ones) and the harness package releases through Nx Release in independent mode.
 * Covers plan AC-20 and part of AC-21.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { load, workspaceRoot } from '../helpers/harness.ts';

type Plugin = string | [string, Record<string, unknown>];

async function analyze(message: string): Promise<string | null> {
  const config = (await load(path.join(workspaceRoot, 'release.config.js'))).default as {
    plugins: Plugin[];
  };
  const entry = config.plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === '@semantic-release/commit-analyzer'
  ) as [string, Record<string, unknown>];
  // A variable specifier keeps TypeScript from asking for declarations of this untyped package.
  const analyzerModule = '@semantic-release/commit-analyzer';
  const { analyzeCommits } = (await import(analyzerModule)) as {
    analyzeCommits: (
      pluginConfig: Record<string, unknown>,
      context: Record<string, unknown>
    ) => Promise<string | null>;
  };
  return analyzeCommits(entry[1], {
    cwd: workspaceRoot,
    commits: [{ hash: 'abc1234', message }],
    logger: { log() {}, error() {} },
  });
}

describe('root semantic-release rules', () => {
  const ignored = [
    'feat(harness): add install cli',
    'fix(harness): handle empty state',
    'feat(harness)!: rename the package',
    'feat(harness): drop the old layout\n\nBREAKING CHANGE: state moved to .harness/state',
    'chore(harness-release): 4.0.0 [skip ci]',
  ];
  for (const message of ignored) {
    it(`does not release for ${JSON.stringify(message)}`, async () => {
      assert.equal(await analyze(message), null);
    });
  }

  it('still releases for other scopes', async () => {
    assert.equal(await analyze('feat(web-docs): add page'), 'minor');
    assert.equal(await analyze('fix(web-explorer): spacing'), 'patch');
  });
});

describe('Nx Release configuration', () => {
  const nx = JSON.parse(fs.readFileSync(path.join(workspaceRoot, 'nx.json'), 'utf8'));

  it('releases only the harness project, independently, with the harness tag pattern', () => {
    assert.deepEqual(nx.release.projects, ['artisyn-implementation-harness']);
    assert.equal(nx.release.projectsRelationship, 'independent');
    assert.equal(nx.release.releaseTag.pattern, '{projectName}-v{version}');
  });

  it('derives the version from conventional commits and writes the project changelog', () => {
    assert.equal(nx.release.version.conventionalCommits, true);
    assert.ok(JSON.stringify(nx.release.changelog).includes('{projectRoot}/CHANGELOG.md'));
  });

  it('picks the bump from commit types, not from commit scopes', () => {
    // Nx matches a scope to a project name; `harness` is not the project name, so with scopes on
    // every harness commit would count as an indirect patch and a breaking change would be lost.
    assert.equal(nx.release.conventionalCommits.useCommitScope, false);
  });

  it('falls back to the version on disk when no tag exists yet', () => {
    assert.equal(nx.release.version.fallbackCurrentVersionResolver, 'disk');
  });
});
