/** Release configuration: Nx Release is the only release lane. It releases the harness package in
 * independent mode, and the retired root semantic-release lane stays gone. Covers part of AC-21.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { workspaceRoot } from '../helpers/harness.ts';

describe('Nx Release configuration', () => {
  const nx = JSON.parse(fs.readFileSync(path.join(workspaceRoot, 'nx.json'), 'utf8'));

  it('releases only the harness project, independently, with the harness tag pattern', () => {
    assert.deepEqual(nx.release.projects, ['artisyn-implementation-harness']);
    assert.equal(nx.release.projectsRelationship, 'independent');
    assert.equal(nx.release.releaseTag.pattern, 'v{version}');
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

describe('the retired root lane', () => {
  it('has no semantic-release workflow, config or dependency', () => {
    assert.ok(!fs.existsSync(path.join(workspaceRoot, '.github/workflows/release.yml')));
    assert.ok(!fs.existsSync(path.join(workspaceRoot, 'release.config.js')));
    const pkg = JSON.parse(fs.readFileSync(path.join(workspaceRoot, 'package.json'), 'utf8'));
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    assert.deepEqual(
      deps.filter((name) => name.includes('semantic-release')),
      []
    );
  });
});
