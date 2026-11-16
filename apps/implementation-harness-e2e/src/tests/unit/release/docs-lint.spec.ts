/** Docs lint (D-07): no `/releases/latest` links, every `gh skill install` example pinned with
 * `@<tag>`, and the full name never used as a skill, folder or command. Covers plan AC-2 and AC-3.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import { repoScript, runNode, tmpDir, writeAll } from '../helpers/harness.ts';

const script = repoScript('scripts/check-docs.mjs');
const lint = (text: string) => {
  const root = tmpDir();
  writeAll(root, { 'docs/Harness/09 Distribution/install.md': text });
  return runNode(script, ['--root', root]);
};

describe('check-docs.mjs', () => {
  it('rejects /releases/latest', () => {
    const result = lint(
      'Download from https://github.com/DataArt/artisyn-implementation-harness/releases/latest\n'
    );
    assert.equal(result.status, 1);
    assert.match(result.stdout, /releases\/latest/);
  });

  it('rejects an unpinned gh skill install', () => {
    const result = lint(
      '```\ngh skill install DataArt/artisyn-implementation-harness implementation-harness --agent claude-code\n```\n'
    );
    assert.equal(result.status, 1);
    assert.match(result.stdout, /gh skill install/);
  });

  it('accepts a pinned gh skill install and the tag download URL', () => {
    const result = lint(
      [
        'gh skill install DataArt/artisyn-implementation-harness implementation-harness@artisyn-implementation-harness-v4.0.0 --agent claude-code',
        'https://github.com/DataArt/artisyn-implementation-harness/releases/download/artisyn-implementation-harness-v4.0.0/artisyn-implementation-harness-v4.0.0.zip',
      ].join('\n')
    );
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });

  it('ignores story folders, which keep history', () => {
    const root = tmpDir();
    writeAll(root, { 'docs/Stories/archive/x/a.md': 'see /releases/latest\n' });
    assert.equal(runNode(script, ['--root', root]).status, 0);
  });
});

describe('check-docs.mjs: the full name is not a skill, folder or command', () => {
  const gate = (files: Record<string, string>) => {
    const root = tmpDir();
    writeAll(root, files);
    return runNode(script, ['--root', root]);
  };

  it('allows the package, repo, tag, ZIP and bin names and the Pages base path', () => {
    const result = gate({
      'docs/a.md': [
        'npx @dataart/artisyn-implementation-harness init',
        'gh skill install DataArt/artisyn-implementation-harness implementation-harness@artisyn-implementation-harness-v4.0.0',
        'artisyn-implementation-harness-v4.0.0.zip',
        'bin/artisyn-implementation-harness.mjs',
        '"bin": { "artisyn-implementation-harness": "bin/x.mjs" }',
        'https://github.com/DataArt/artisyn-implementation-harness',
        'https://dataart.github.io/artisyn-implementation-harness/docs/',
      ].join('\n'),
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });

  for (const [label, files] of [
    ['a skills folder', { 'skills/artisyn-implementation-harness/SKILL.md': 'x\n' }],
    [
      'a folder path in text',
      { 'docs/a.md': 'copy it to .claude/skills/artisyn-implementation-harness\n' },
    ],
    ['a slash command', { 'docs/a.md': 'run /artisyn-implementation-harness launch\n' }],
    ['a Codex command', { 'CLAUDE.md': 'run $artisyn-implementation-harness patch apply\n' }],
    ['a skill name', { 'skills/x/SKILL.md': '---\nname: artisyn-implementation-harness\n---\n' }],
  ] as Array<[string, Record<string, string>]>) {
    it(`fails on ${label}`, () => {
      const result = gate(files);
      assert.equal(result.status, 1, result.stdout);
      assert.match(result.stdout, /the skill is implementation-harness/);
    });
  }
});
