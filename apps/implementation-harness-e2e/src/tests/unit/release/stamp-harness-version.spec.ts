/** Version stamping and its CI gate (D-15). The harness package.json is the one version
 * source; the stamp writes it into every manifest and `--check` fails on any mismatch.
 * Covers plan AC-19.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { repoScript, runNode, tmpDir, writeAll } from '../helpers/harness.ts';

const script = repoScript('scripts/release/stamp-harness-version.mjs');
const TAG = (version: string) => `artisyn-implementation-harness-v${version}`;

const skillMd = (name: string, version: string) =>
  `---\nname: ${name}\ndescription: test skill\nmetadata:\n  version: "${version}"\n---\n\nBody stays.\n`;
const claudeMarketplace = (version: string, ref: string) =>
  JSON.stringify(
    {
      name: 'dataart',
      plugins: [
        {
          name: 'artisyn',
          version,
          source: {
            source: 'git-subdir',
            url: 'https://github.com/DataArt/artisyn-implementation-harness',
            path: 'skills',
            ref,
          },
        },
      ],
    },
    null,
    2
  );
const copilotMarketplace = (version: string, ref: string) =>
  JSON.stringify(
    {
      name: 'dataart',
      plugins: [
        {
          name: 'artisyn',
          version,
          source: { source: 'github', repo: 'DataArt/r', path: 'skills', ref },
        },
      ],
    },
    null,
    2
  );
const codexMarketplace = (version: string, ref: string) =>
  JSON.stringify(
    {
      name: 'dataart',
      plugins: [
        {
          name: 'artisyn',
          version,
          source: { source: 'git-subdir', url: 'https://example.test/r', path: 'skills', ref },
        },
      ],
    },
    null,
    2
  );

function project(packageVersion: string, stamped: string) {
  const root = tmpDir();
  writeAll(root, {
    'skills/implementation-harness/package.json': JSON.stringify({
      name: '@dataart/x',
      version: packageVersion,
    }),
    'skills/implementation-harness/SKILL.md': skillMd('implementation-harness', stamped),
    'skills/.claude-plugin/plugin.json': JSON.stringify(
      { name: 'artisyn', version: stamped },
      null,
      2
    ),
    '.claude-plugin/marketplace.json': claudeMarketplace(stamped, TAG(stamped)),
    '.agents/plugins/marketplace.json': codexMarketplace(stamped, TAG(stamped)),
    '.github/plugin/marketplace.json': copilotMarketplace(stamped, TAG(stamped)),
  });
  return root;
}
const readJson = (root: string, rel: string) =>
  JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

describe('stamp-harness-version.mjs', () => {
  it('writes the package version into every manifest and the release tag into every ref', () => {
    const root = project('4.0.0', '3.5.0');

    const result = runNode(script, ['--root', root]);

    assert.equal(result.status, 0, result.stderr);
    for (const rel of ['skills/implementation-harness/SKILL.md']) {
      const text = fs.readFileSync(path.join(root, rel), 'utf8');
      assert.match(text, /version: "?4\.0\.0"?/);
      assert.ok(text.includes('Body stays.'));
      assert.ok(text.includes('description: test skill'));
    }
    assert.equal(readJson(root, 'skills/.claude-plugin/plugin.json').version, '4.0.0');
    for (const rel of [
      '.claude-plugin/marketplace.json',
      '.agents/plugins/marketplace.json',
      '.github/plugin/marketplace.json',
    ]) {
      const entry = readJson(root, rel).plugins[0];
      assert.equal(entry.version, '4.0.0', rel);
      assert.equal(entry.source.ref, TAG('4.0.0'), rel);
    }
  });

  it('--check exits 0 when everything matches', () => {
    const root = project('4.0.0', '4.0.0');
    const result = runNode(script, ['--check', '--root', root]);
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });

  const tamper: Array<[string, (root: string) => void]> = [
    [
      'SKILL.md',
      (r) =>
        writeAll(r, {
          'skills/implementation-harness/SKILL.md': skillMd('implementation-harness', '1.0.0'),
        }),
    ],
    [
      'plugin.json',
      (r) =>
        writeAll(r, {
          'skills/.claude-plugin/plugin.json': JSON.stringify({
            name: 'artisyn',
            version: '1.0.0',
          }),
        }),
    ],
    [
      'claude marketplace version',
      (r) =>
        writeAll(r, {
          '.claude-plugin/marketplace.json': claudeMarketplace('1.0.0', TAG('4.0.0')),
        }),
    ],
    [
      'claude marketplace ref',
      (r) => writeAll(r, { '.claude-plugin/marketplace.json': claudeMarketplace('4.0.0', 'main') }),
    ],
    [
      'codex marketplace version',
      (r) =>
        writeAll(r, {
          '.agents/plugins/marketplace.json': codexMarketplace('1.0.0', TAG('4.0.0')),
        }),
    ],
    [
      'codex marketplace ref',
      (r) => writeAll(r, { '.agents/plugins/marketplace.json': codexMarketplace('4.0.0', 'main') }),
    ],
    [
      'copilot marketplace version',
      (r) =>
        writeAll(r, {
          '.github/plugin/marketplace.json': copilotMarketplace('1.0.0', TAG('4.0.0')),
        }),
    ],
    [
      'copilot marketplace ref',
      (r) =>
        writeAll(r, { '.github/plugin/marketplace.json': copilotMarketplace('4.0.0', 'main') }),
    ],
  ];
  for (const [label, apply] of tamper) {
    it(`--check exits 1 when ${label} drifts`, () => {
      const root = project('4.0.0', '4.0.0');
      apply(root);

      const result = runNode(script, ['--check', '--root', root]);

      assert.equal(result.status, 1, `${label}: ${result.stdout}`);
      assert.ok((result.stdout + result.stderr).length > 0, 'names the mismatch');
    });
  }

  it('--check does not modify any file', () => {
    const root = project('4.0.0', '3.5.0');
    const manifest = path.join(root, 'skills/.claude-plugin/plugin.json');
    const before = fs.readFileSync(manifest, 'utf8');
    runNode(script, ['--check', '--root', root]);
    assert.equal(fs.readFileSync(manifest, 'utf8'), before);
  });
});
