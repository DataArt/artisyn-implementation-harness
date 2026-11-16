/** Rename gate (D-01): no stray `harness-bootstrap`, and the full name
 * `artisyn-implementation-harness` only where it is a package, repo, tag or ZIP name.
 * Covers plan AC-2 and AC-3. This file names the retired package on purpose.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import { repoScript, runNode, tmpDir, writeAll } from '../helpers/harness.ts';

const script = repoScript('scripts/check-rename.mjs');
const gate = (files: Record<string, string>, args: string[] = []) => {
  const root = tmpDir();
  writeAll(root, files);
  return runNode(script, ['--root', root, ...args]);
};

describe('check-rename.mjs: rule 1, the retired name', () => {
  it('passes a clean tree', () => {
    const result = gate({ 'apps/web/a.ts': 'const x = "implementation-harness";\n' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });

  it('fails on a stray harness-bootstrap and names the file', () => {
    const result = gate({ 'apps/web/a.ts': 'run /harness-bootstrap launch\n' });
    assert.equal(result.status, 1);
    assert.ok(result.stdout.includes('apps/web/a.ts'));
  });

  it('allows the history places only', () => {
    const result = gate({
      'skills/implementation-harness/patch/b1/files/x.md': 'harness-bootstrap\n',
      '.harness/state/index.json': 'harness-bootstrap\n',
      '.harness/evolve/x/y.md': 'harness-bootstrap\n',
      '.harness/reflections/x.md': 'harness-bootstrap\n',
      'docs/Stories/archive/s/impl/report.md': 'harness-bootstrap\n',
      'docs/.og/graph.mmd': 'harness-bootstrap\n',
      'apps/implementation-harness-e2e/runs/2026/report.json': 'harness-bootstrap\n',
      'CHANGELOG.md': '## 3.5.0\n- harness-bootstrap history\n',
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });

  it('flags the old E2E project name and the shim folder: nothing of the old name is kept', () => {
    const result = gate({
      'CLAUDE.md': 'run yarn nx run harness-bootstrap-e2e:unit\n',
      'skills/harness-bootstrap/SKILL.md': 'x\n',
    });
    assert.equal(result.status, 1);
    assert.ok(result.stdout.includes('CLAUDE.md:1'));
    assert.ok(result.stdout.includes('skills/harness-bootstrap/SKILL.md: path names'));
  });

  it('skips node_modules and .git', () => {
    const result = gate({
      'node_modules/x/a.js': 'harness-bootstrap\n',
      '.git/config': 'harness-bootstrap\n',
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });
});

describe('check-rename.mjs: rule 2, the full name is not a skill, folder or command', () => {
  it('allows the package, repo, tag, ZIP and bin names', () => {
    const result = gate({
      'docs/a.md': [
        'npx @dataart/artisyn-implementation-harness init',
        'gh skill install DataArt/artisyn-implementation-harness implementation-harness@artisyn-implementation-harness-v4.0.0',
        'artisyn-implementation-harness-v4.0.0.zip',
        'bin/artisyn-implementation-harness.mjs',
        '"bin": { "artisyn-implementation-harness": "bin/x.mjs" }',
        'https://github.com/DataArt/artisyn-implementation-harness',
      ].join('\n'),
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });

  for (const [label, files] of [
    ['a skills folder', { 'skills/artisyn-implementation-harness/SKILL.md': 'x\n' }],
    ['a slash command', { 'docs/a.md': 'run /artisyn-implementation-harness launch\n' }],
    ['a Codex command', { 'docs/a.md': 'run $artisyn-implementation-harness launch\n' }],
    ['a skill name', { 'skills/x/SKILL.md': '---\nname: artisyn-implementation-harness\n---\n' }],
  ] as Array<[string, Record<string, string>]>) {
    it(`fails on ${label}`, () => {
      const result = gate(files);
      assert.equal(result.status, 1, result.stdout);
    });
  }
});

describe('check-rename.mjs: --scope code', () => {
  const docsHit = {
    'docs/Harness/a.md': 'use /harness-bootstrap launch\n',
    'CLAUDE.md': 'use /harness-bootstrap launch\n',
    'README.md': 'use /harness-bootstrap launch\n',
  };

  it('ignores docs, CLAUDE.md and README.md', () => {
    const result = gate(docsHit, ['--scope', 'code']);
    assert.equal(result.status, 0, result.stdout);
  });

  it('flags the same files in the default full scope', () => {
    const result = gate(docsHit);
    assert.equal(result.status, 1);
    for (const file of ['docs/Harness/a.md', 'CLAUDE.md', 'README.md'])
      assert.ok(result.stdout.includes(file), file);
  });

  it('still flags code hits', () => {
    const result = gate({ 'apps/web/a.ts': '/harness-bootstrap\n' }, ['--scope', 'code']);
    assert.equal(result.status, 1);
  });
});
