/** Docs lint (D-07): no `/releases/latest` links and every `gh skill install` example pinned
 * with `@<tag>`. Covers plan AC-3.
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
