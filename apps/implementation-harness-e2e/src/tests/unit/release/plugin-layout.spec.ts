/** The marketplace plugin ships only the harness skill. Its root is `skills/`, and every
 * marketplace fetches that subdirectory, so a host's plugin cache never holds the rest of the repo.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { workspaceRoot } from '../helpers/harness.ts';

const readJson = (rel: string) =>
  JSON.parse(fs.readFileSync(path.join(workspaceRoot, rel), 'utf8'));

describe('plugin layout', () => {
  it('keeps the plugin manifest under skills/ and loads the skills next to it', () => {
    assert.ok(!fs.existsSync(path.join(workspaceRoot, '.claude-plugin/plugin.json')));
    assert.deepEqual(readJson('skills/.claude-plugin/plugin.json').skills, ['./']);
  });

  it('holds nothing in the plugin root but the manifest and the harness skill', () => {
    const tracked = fs
      .readdirSync(path.join(workspaceRoot, 'skills'))
      .filter((name) => name !== '.DS_Store');
    assert.deepEqual(tracked.sort(), ['.claude-plugin', 'implementation-harness']);
  });

  it('points every marketplace at the skills/ subdirectory', () => {
    const claude = readJson('.claude-plugin/marketplace.json').plugins[0].source;
    assert.equal(claude.source, 'git-subdir');
    assert.equal(claude.path, 'skills');

    const codex = readJson('.agents/plugins/marketplace.json').plugins[0].source;
    assert.equal(codex.source, 'git-subdir');
    assert.equal(codex.path, 'skills');

    // Copilot CLI documents `github` with `path`, not `git-subdir`, and reads this file first.
    const copilot = readJson('.github/plugin/marketplace.json').plugins[0].source;
    assert.equal(copilot.source, 'github');
    assert.equal(copilot.path, 'skills');
  });
});
