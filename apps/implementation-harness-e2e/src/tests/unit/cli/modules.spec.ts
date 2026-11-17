/** Install CLI modules: provider detection, placement, ZIP reading, path safety. Covers plan
 * AC-12, AC-13 and AC-15 (Design - Install and Update, D-11).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { buildZip, load, pkgRoot, snapshot, tmpDir, writeAll } from '../helpers/harness.ts';

const lib = (name: string) => path.join(pkgRoot, 'bin/lib', name);

describe('providers.mjs', () => {
  it('detects providers from existing folders in .claude > .agents > .github order', async () => {
    const { detectProviders } = await load(lib('providers.mjs'));
    const root = tmpDir();
    fs.mkdirSync(path.join(root, '.github'));
    fs.mkdirSync(path.join(root, '.claude'));

    assert.deepEqual(detectProviders(root), ['claude', 'copilot']);
  });

  it('honours --provider flags over detection and keeps the given order', async () => {
    const { detectProviders } = await load(lib('providers.mjs'));
    const root = tmpDir();
    fs.mkdirSync(path.join(root, '.claude'));

    assert.deepEqual(detectProviders(root, ['codex']), ['codex']);
    assert.deepEqual(detectProviders(root, ['copilot', 'claude']), ['copilot', 'claude']);
  });

  it('returns nothing when no provider folder exists and rejects unknown names', async () => {
    const { detectProviders } = await load(lib('providers.mjs'));
    assert.deepEqual(detectProviders(tmpDir()), []);
    assert.throws(() => detectProviders(tmpDir(), ['vim']), /provider/i);
  });

  it('maps providers to skills folders and launch commands', async () => {
    const { skillsFolder, launchCommand } = await load(lib('providers.mjs'));
    assert.equal(skillsFolder('claude'), '.claude/skills');
    assert.equal(skillsFolder('codex'), '.agents/skills');
    assert.equal(skillsFolder('copilot'), '.github/skills');
    assert.equal(launchCommand('claude'), '/implementation-harness launch');
    assert.equal(launchCommand('copilot'), '/implementation-harness launch');
    assert.equal(launchCommand('codex'), '$implementation-harness launch');
  });
});

describe('placer.mjs', () => {
  it('copies the package without state and local files', async () => {
    const { placePackage } = await load(lib('placer.mjs'));
    const source = tmpDir();
    writeAll(source, {
      'SKILL.md': 'skill\n',
      'bin/x.mjs': 'x\n',
      'state/answers.json': '{}\n',
      'notes.local.md': 'local\n',
      '.DS_Store': 'junk',
    });
    const target = path.join(tmpDir(), 'implementation-harness');

    placePackage({ source, target });

    assert.deepEqual(Object.keys(snapshot(target)).sort(), ['SKILL.md', 'bin/x.mjs']);
  });

  it('rolls back to the previous folder when the copy fails halfway', async () => {
    const { placePackage } = await load(lib('placer.mjs'));
    const source = tmpDir();
    writeAll(source, { 'a.md': 'a\n', 'b.md': 'b\n' });
    const target = path.join(tmpDir(), 'implementation-harness');
    writeAll(target, { 'old.md': 'old\n' });
    const before = snapshot(target);
    let calls = 0;

    assert.throws(() =>
      placePackage({
        source,
        target,
        copyFile: (from: string, to: string) => {
          calls += 1;
          if (calls === 2) throw new Error('disk full');
          fs.copyFileSync(from, to);
        },
      })
    );

    assert.deepEqual(snapshot(target), before);
    assert.deepEqual(
      fs.readdirSync(path.dirname(target)),
      ['implementation-harness'],
      'no staging or .bak folder is left behind'
    );
  });

  it('swaps a staged tree in and deletes the .bak', async () => {
    const { swapPackage } = await load(lib('placer.mjs'));
    const parent = tmpDir();
    const target = path.join(parent, 'implementation-harness');
    const staged = path.join(parent, '.staged');
    writeAll(target, { 'old.md': 'old\n' });
    writeAll(staged, { 'new.md': 'new\n' });

    swapPackage({ staged, target });

    assert.deepEqual(Object.keys(snapshot(target)), ['new.md']);
    assert.deepEqual(fs.readdirSync(parent), ['implementation-harness']);
  });

  it('checks containment with Windows-style paths', async () => {
    const { isInside } = await load(lib('placer.mjs'));
    assert.equal(isInside('C:\\proj', 'C:\\proj\\.claude\\skills', path.win32), true);
    assert.equal(isInside('C:\\proj', 'C:\\proj2\\x', path.win32), false);
    assert.equal(isInside('C:\\proj', 'C:\\proj\\..\\other', path.win32), false);
    assert.equal(isInside('/proj', '/proj/a/b', path.posix), true);
    assert.equal(isInside('/proj', '/proj/../etc', path.posix), false);
  });
});

describe('zip.mjs', () => {
  it('extracts stored and deflated entries and verifies the CRC', async () => {
    const { extractZip } = await load(lib('zip.mjs'));
    for (const deflate of [true, false]) {
      const dest = tmpDir();
      const zip = buildZip(
        {
          'implementation-harness/SKILL.md': 'skill\n',
          'implementation-harness/bin/cli.mjs': 'cli\n',
        },
        { deflate }
      );

      const written = extractZip(zip, dest);

      assert.deepEqual(
        [...written].sort(),
        ['implementation-harness/SKILL.md', 'implementation-harness/bin/cli.mjs'].sort()
      );
      assert.equal(
        fs.readFileSync(path.join(dest, 'implementation-harness/SKILL.md'), 'utf8'),
        'skill\n'
      );
    }
  });

  it('rejects path traversal and absolute entries without writing', async () => {
    const { extractZip } = await load(lib('zip.mjs'));
    for (const name of ['../evil.md', '/abs.md', 'a/../../evil.md']) {
      const dest = tmpDir();
      assert.throws(() => extractZip(buildZip({ [name]: 'x' }), dest), /unsafe|outside/i, name);
      assert.deepEqual(fs.readdirSync(dest), []);
    }
  });

  it('rejects a corrupted archive', async () => {
    const { extractZip } = await load(lib('zip.mjs'));
    const zip = buildZip({ 'a.md': 'hello hello hello\n' }, { deflate: false });
    zip[40] ^= 0xff;
    assert.throws(() => extractZip(zip, tmpDir()), /crc|corrupt|checksum/i);
  });
});

describe('zip.mjs: size limits', () => {
  /** Overwrite the declared uncompressed size of the first central-directory entry. */
  function declareSize(zip: Buffer, size: number): Buffer {
    const at = zip.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
    zip.writeUInt32LE(size, at + 24);
    return zip;
  }

  it('does not inflate past the size the directory declares', async () => {
    const { extractZip } = await load(lib('zip.mjs'));
    const dest = tmpDir();
    const lying = declareSize(buildZip({ 'a.md': 'a'.repeat(100_000) }), 10);

    assert.throws(() => extractZip(lying, dest), /declared size|corrupt/i);
    assert.deepEqual(fs.readdirSync(dest), []);
  });

  it('rejects an archive that declares an entry or a total larger than the limits', async () => {
    const { extractZip } = await load(lib('zip.mjs'));
    const huge = declareSize(buildZip({ 'a.md': 'hello' }), 0xffffffff);
    assert.throws(() => extractZip(huge, tmpDir()), /too large/i);
  });
});

describe('reporter.mjs: versions', () => {
  it('orders pre-releases before their release and compares numerically', async () => {
    const { compareVersions, VERSION_PATTERN } = await load(lib('reporter.mjs'));
    assert.equal(compareVersions('4.0.0', '4.0.0'), 0);
    assert.equal(compareVersions('4.0.0-rc.1', '4.0.0'), -1);
    assert.equal(compareVersions('4.0.0', '4.0.0-rc.1'), 1);
    assert.equal(compareVersions('4.0.0-rc.2', '4.0.0-rc.10'), -1);
    assert.equal(compareVersions('3.5.0', '4.0.0'), -1);
    assert.equal(compareVersions('10.0.0', '9.9.9'), 1);
    assert.ok(VERSION_PATTERN.test('1.2.3'));
    assert.ok(VERSION_PATTERN.test('1.2.3-rc.1'));
    assert.ok(!VERSION_PATTERN.test('1.0.0/../../x'));
    assert.ok(!VERSION_PATTERN.test('1.2'));
  });

  it('tags releases v<version>, keeping the long tag up to 4.0.2 and the long asset name', async () => {
    const { releaseTag, releaseAsset, updateCommand } = await load(lib('reporter.mjs'));
    assert.equal(releaseTag('4.1.0'), 'v4.1.0');
    assert.equal(releaseTag('4.0.3'), 'v4.0.3');
    assert.equal(releaseTag('4.0.2'), 'artisyn-implementation-harness-v4.0.2');
    assert.equal(releaseTag('3.5.0'), 'artisyn-implementation-harness-v3.5.0');
    assert.equal(releaseAsset('4.1.0'), 'artisyn-implementation-harness-v4.1.0');
    const zip = updateCommand({ channel: 'zip', name: 'x', version: '4.1.0' });
    assert.match(zip, /download artisyn-implementation-harness-v4\.1\.0\.zip and /);
    assert.match(zip, /Release tagged v4\.1\.0,/);
  });
});

describe('CLI sources', () => {
  it('import only node: modules and relative files', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.mjs')) files.push(full);
      }
    };
    walk(path.join(pkgRoot, 'bin'));
    assert.ok(files.length > 0, 'bin/ holds the CLI');
    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8');
      const specifiers = [
        ...source.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g),
        ...source.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g),
      ].map((m) => m[1]);
      for (const specifier of specifiers) {
        assert.ok(
          specifier.startsWith('node:') || specifier.startsWith('.'),
          `${path.relative(pkgRoot, file)} imports ${specifier}`
        );
      }
    }
  });
});
