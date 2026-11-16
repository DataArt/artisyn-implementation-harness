/** The harness changelog renderer writes entries in the semantic-release (conventionalcommits)
 * format: `## [<version>](<compare>) (<date>)`, then ⚠ BREAKING CHANGES, Features, Bug Fixes, with
 * `**scope:** subject ([hash](link))` bullets and no hidden commit types.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import { load, repoScript } from '../helpers/harness.ts';

const Renderer = (await load(repoScript('scripts/release/changelog-renderer.mjs'))).default;

const change = (type: string, description: string, extra: Record<string, unknown> = {}) => ({
  type,
  scope: 'harness',
  description,
  body: '',
  isBreaking: false,
  githubReferences: [],
  authors: [],
  shortHash: undefined,
  revertedHashes: [],
  affectedProjects: '*',
  ...extra,
});

async function render(changes: unknown[]) {
  const renderer = new Renderer({
    changes,
    changelogEntryVersion: '4.1.0',
    project: 'artisyn-implementation-harness',
    entryWhenNoChanges: false,
    isVersionPlans: false,
    changelogRenderOptions: {},
    conventionalCommitsConfig: {
      types: {
        feat: { semverBump: 'minor', changelog: { title: 'Features', hidden: false } },
        fix: { semverBump: 'patch', changelog: { title: 'Fixes', hidden: false } },
        perf: { semverBump: 'none', changelog: { title: 'Perf', hidden: false } },
        refactor: { semverBump: 'none', changelog: { title: 'Refactor', hidden: true } },
      },
    },
    // Nx always passes a remote release client; this one knows no remote repository.
    remoteReleaseClient: { getRemoteRepoData: () => null, formatReferences: () => '' },
  });
  return (await renderer.render()) as string;
}

describe('changelog-renderer.mjs', () => {
  it('writes the semantic-release heading and sections, breaking changes first', async () => {
    const text = await render([
      change('fix', 'harden the install CLI'),
      change('feat', 'add the doctor command'),
      change('feat', 'rename the package', {
        isBreaking: true,
        body: 'BREAKING CHANGE: state moves to .harness/state',
      }),
      change('refactor', 'tidy the placer'),
    ]);
    const lines = text.split('\n');

    assert.match(
      lines[0],
      /^## (\[4\.1\.0\]\(https:\/\/github\.com\/\S+\/compare\/\S+\)|4\.1\.0) \(\d{4}-\d{2}-\d{2}\)$/
    );
    const sections = lines.filter((line) => line.startsWith('### '));
    assert.deepEqual(sections, ['### ⚠ BREAKING CHANGES', '### Features', '### Bug Fixes']);
    assert.ok(lines.includes('- **harness:** state moves to .harness/state'), 'breaking note');
    assert.ok(lines.includes('- **harness:** add the doctor command'));
    assert.ok(lines.includes('- **harness:** harden the install CLI'));
    assert.ok(!text.includes('tidy the placer'), 'hidden types stay out');
    assert.ok(!/Thank You|🚀|🩹/.test(text), 'no Nx default decorations');
  });

  it('links a commit by its short hash', async () => {
    const text = await render([change('fix', 'a fix', { shortHash: 'abc1234' })]);
    assert.match(
      text,
      /- \*\*harness:\*\* a fix \(\[abc1234\]\(https:\/\/github\.com\/\S+\/commit\/\S+\)\)/
    );
  });
});
