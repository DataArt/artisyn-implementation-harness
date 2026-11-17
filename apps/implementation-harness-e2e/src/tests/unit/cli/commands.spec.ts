/** Install CLI commands end to end on scratch projects: init, update (npm and zip channels)
 * and doctor. Covers plan AC-12, AC-13, AC-14 (Design - Install and Update, D-10, D-11).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { afterEach, describe, it } from 'vitest';
import {
  buildZip,
  cliEntry,
  pkgRoot,
  runNode,
  runNodeAsync,
  sha256,
  snapshot,
  tmpDir,
  write,
  writeAll,
} from '../helpers/harness.ts';

const NAME = '@dataart/artisyn-implementation-harness';
const ownVersion: string = JSON.parse(
  fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8')
).version;
const cli = (args: string[], cwd: string, env: Record<string, string> = {}) =>
  runNode(cliEntry, args, { cwd, env: { ARTISYN_HARNESS_PROJECT_ROOT: cwd, ...env } });
const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));

function projectWithInstalled(version: string, channel: string, provider = '.claude') {
  const root = tmpDir();
  const installed = path.join(root, provider, 'skills/implementation-harness');
  writeAll(installed, {
    'package.json': JSON.stringify({ name: NAME, version }),
    'SKILL.md': `---\nname: implementation-harness\nmetadata:\n  version: ${version}\n---\n`,
  });
  write(
    path.join(root, '.harness/state/launch/package.json'),
    JSON.stringify({ name: NAME, version, channel })
  );
  write(
    path.join(root, '.harness/state/launch/package.local.json'),
    JSON.stringify({ path: installed })
  );
  return { root, installed };
}

describe('init', () => {
  it('exits 2 with a hint when no provider is detected', () => {
    const root = tmpDir();
    const result = cli(['init'], root);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /provider/i);
  });

  it('places the package in the first detected provider and writes state and records', () => {
    const root = tmpDir();
    fs.mkdirSync(path.join(root, '.claude'));
    fs.mkdirSync(path.join(root, '.github'));

    const result = cli(['init'], root);

    assert.equal(result.status, 0, result.stderr);
    const installed = path.join(root, '.claude/skills/implementation-harness');
    assert.ok(fs.existsSync(path.join(installed, 'SKILL.md')));
    assert.ok(
      !fs.existsSync(path.join(root, '.github/skills/implementation-harness')),
      'first provider only'
    );
    assert.ok(!fs.existsSync(path.join(installed, 'state')), 'package carries no state');
    assert.deepEqual(readJson(path.join(root, '.harness/state/launch/package.json')), {
      name: NAME,
      version: ownVersion,
      channel: 'npm',
    });
    assert.equal(
      fs.realpathSync(readJson(path.join(root, '.harness/state/launch/package.local.json')).path),
      fs.realpathSync(installed)
    );
    const ignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
    assert.ok(ignore.includes('.harness/state/objects/'));
    assert.match(result.stdout, /\/implementation-harness launch/);
  });

  it('uses --provider and prints the Codex command form', () => {
    const root = tmpDir();

    const result = cli(['init', '--provider', 'codex'], root);

    assert.equal(result.status, 0, result.stderr);
    assert.ok(fs.existsSync(path.join(root, '.agents/skills/implementation-harness/SKILL.md')));
    assert.match(result.stdout, /\$implementation-harness launch/);
  });

  it('refuses a different existing version without --force and replaces it with --force', () => {
    const { root, installed } = projectWithInstalled('0.0.1', 'npm');
    const before = snapshot(installed);

    const refused = cli(['init'], root);

    assert.notEqual(refused.status, 0);
    assert.match(refused.stderr, /different version|--force/i);
    assert.deepEqual(snapshot(installed), before);

    const forced = cli(['init', '--force'], root);

    assert.equal(forced.status, 0, forced.stderr);
    assert.equal(readJson(path.join(installed, 'package.json')).version, ownVersion);
  });
});

describe('update on the npm channel', () => {
  it('copies from its own tree and prints the patch apply command', () => {
    const { root, installed } = projectWithInstalled('0.0.1', 'npm');

    const result = cli(['update', '--force'], root);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(readJson(path.join(installed, 'package.json')).version, ownVersion);
    assert.equal(
      readJson(path.join(root, '.harness/state/launch/package.json')).version,
      ownVersion
    );
    assert.match(result.stdout, /patch apply/);
  });

  it('is a no-op at the same version', () => {
    const { root, installed } = projectWithInstalled(ownVersion, 'npm');
    const before = snapshot(installed);

    const result = cli(['update'], root);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /already|up to date|no-op/i);
    assert.deepEqual(snapshot(installed), before);
  });
});

describe('update on the zip channel', () => {
  let server: http.Server | undefined;
  afterEach(
    () => new Promise<void>((resolve) => (server ? server.close(() => resolve()) : resolve()))
  );

  async function serveRelease(version: string, { corrupt = false, tag = `v${version}` } = {}) {
    const zipName = `artisyn-implementation-harness-v${version}.zip`;
    const zip = buildZip({
      'implementation-harness/package.json': JSON.stringify({ name: NAME, version }),
      'implementation-harness/SKILL.md': `---\nname: implementation-harness\nmetadata:\n  version: ${version}\n---\n`,
    });
    const digest = corrupt ? sha256('something else') : sha256(zip);
    server = http.createServer((req, res) => {
      if (req.url === `/${tag}/${zipName}`) res.end(zip);
      else if (req.url === `/${tag}/${zipName}.sha256`) res.end(`${digest}  ${zipName}\n`);
      else {
        res.statusCode = 404;
        res.end();
      }
    });
    await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as { port: number };
    return `http://127.0.0.1:${port}`;
  }

  const update = (root: string, args: string[]) =>
    runNodeAsync(cliEntry, ['update', ...args], {
      cwd: root,
      env: { ARTISYN_HARNESS_PROJECT_ROOT: root },
    });

  it('verifies the downloaded ZIP against the .sha256, swaps and records the new version', async () => {
    const { root, installed } = projectWithInstalled('1.0.0', 'zip');
    const base = await serveRelease('9.9.9');

    const result = await update(root, ['--version', '9.9.9', '--release-base-url', base]);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(readJson(path.join(installed, 'package.json')).version, '9.9.9');
    assert.equal(readJson(path.join(root, '.harness/state/launch/package.json')).version, '9.9.9');
    assert.match(result.stdout, /patch apply/);
    assert.deepEqual(
      fs.readdirSync(path.dirname(installed)),
      ['implementation-harness'],
      'no .bak'
    );
  });

  it('fetches a release up to 4.0.2 from its long artisyn-implementation-harness-v tag', async () => {
    const { root, installed } = projectWithInstalled('1.0.0', 'zip');
    const base = await serveRelease('4.0.2', { tag: 'artisyn-implementation-harness-v4.0.2' });

    const result = await update(root, ['--version', '4.0.2', '--release-base-url', base]);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(readJson(path.join(installed, 'package.json')).version, '4.0.2');
  });

  it('aborts on a checksum mismatch and leaves the installed package unchanged', async () => {
    const { root, installed } = projectWithInstalled('1.0.0', 'zip');
    const base = await serveRelease('9.9.9', { corrupt: true });
    const before = snapshot(installed);

    const result = await update(root, ['--version', '9.9.9', '--release-base-url', base]);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /sha256|checksum/i);
    assert.deepEqual(snapshot(installed), before);
  });

  it('is a no-op at the same version and exits 3 on a downgrade without --force', async () => {
    const same = projectWithInstalled('2.0.0', 'zip');
    const base = await serveRelease('1.0.0', { tag: 'artisyn-implementation-harness-v1.0.0' });

    const noop = await update(same.root, ['--version', '2.0.0', '--release-base-url', base]);
    assert.equal(noop.status, 0, noop.stderr);

    const refused = await update(same.root, ['--version', '1.0.0', '--release-base-url', base]);
    assert.equal(refused.status, 3);
    assert.equal(readJson(path.join(same.installed, 'package.json')).version, '2.0.0');

    const forced = await update(same.root, [
      '--version',
      '1.0.0',
      '--force',
      '--release-base-url',
      base,
    ]);
    assert.equal(forced.status, 0, forced.stderr);
    assert.equal(readJson(path.join(same.installed, 'package.json')).version, '1.0.0');
  });

  it('rejects a --version that is not a plain version, before any download', async () => {
    const { root, installed } = projectWithInstalled('1.0.0', 'zip');
    const before = snapshot(installed);

    const result = await update(root, ['--version', '1.0.0/../../x']);

    assert.equal(result.status, 2);
    assert.match(result.stderr, /--version must look like/);
    assert.deepEqual(snapshot(installed), before);
  });

  it('accepts a release base URL only over https or loopback http', async () => {
    const { root, installed } = projectWithInstalled('1.0.0', 'zip');
    const before = snapshot(installed);

    const result = await update(root, [
      '--version',
      '9.9.9',
      '--release-base-url',
      'http://example.com/x',
    ]);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /https|loopback/i);
    assert.deepEqual(snapshot(installed), before);
  });
});

describe('doctor', () => {
  it('reports providers, versions, channel and state for a healthy install', () => {
    const { root } = projectWithInstalled(ownVersion, 'npm');
    fs.mkdirSync(path.join(root, '.harness/state'), { recursive: true });

    const result = cli(['doctor'], root);

    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /claude/);
    assert.ok(result.stdout.includes(ownVersion));
    assert.match(result.stdout, /npm/);
    assert.match(
      result.stdout,
      new RegExp(`npx ${NAME}@${ownVersion.replace(/\./g, '\\.')} update`)
    );
    assert.match(result.stdout, /\/implementation-harness launch/);
  });

  it('flags version skew between providers and exits 1', () => {
    const { root } = projectWithInstalled('4.0.0', 'npm', '.claude');
    writeAll(path.join(root, '.agents/skills/implementation-harness'), {
      'package.json': JSON.stringify({ name: NAME, version: '4.1.0' }),
    });

    const result = cli(['doctor'], root);

    assert.equal(result.status, 1);
    assert.match(result.stdout, /skew/i);
  });
});
