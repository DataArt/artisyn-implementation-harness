/** Smoke tests on the real artifacts, built the way the release workflow builds them: the npm
 * tarball from `yarn pack`, and a ZIP made from it. They install and update with the CLI that ships
 * inside each artifact, and check the skills.sh layout. Covers review finding RF-039 and the design's
 * per-channel smoke obligation (D-05).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { parse } from 'yaml';
import {
  pkgRoot,
  runNode,
  runNodeAsync,
  sha256,
  snapshot,
  tmpDir,
  workspaceRoot,
} from '../helpers/harness.ts';

const ownVersion: string = JSON.parse(
  fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8')
).version;
const onWindows = process.platform === 'win32';

function sh(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', shell: onWindows });
  assert.equal(result.status, 0, `${command} ${args.join(' ')}\n${result.stderr}${result.stdout}`);
  return result.stdout;
}
const hasZip = spawnSync('zip', ['-v'], { shell: onWindows }).status === 0;

let tarball = '';
let extracted = '';
let artifactCli = '';

beforeAll(() => {
  const dist = tmpDir('smoke-dist-');
  tarball = path.join(dist, 'harness.tgz');
  sh('yarn', ['pack', '--out', tarball], pkgRoot);
  extracted = tmpDir('smoke-extracted-');
  // The archive goes by a relative name: GNU tar on Windows reads `C:\…` in -f as a remote host.
  sh('tar', ['-xzf', path.basename(tarball), '-C', extracted], dist);
  artifactCli = path.join(extracted, 'package/bin/artisyn-implementation-harness.mjs');
}, 120_000);

describe('the npm tarball', () => {
  it('carries the CLI and the package files, and no state or Nx files', () => {
    const files = sh('tar', ['-tzf', path.basename(tarball)], path.dirname(tarball))
      .split('\n')
      .filter(Boolean);
    for (const required of [
      'package/package.json',
      'package/SKILL.md',
      'package/bin/artisyn-implementation-harness.mjs',
    ])
      assert.ok(files.includes(required), `${required} is in the tarball`);
    assert.ok(!files.some((file) => /\/state\//.test(file)), 'no state');
    assert.ok(!files.includes('package/project.json'), 'no Nx project file');
  });

  it('installs with the CLI inside it and passes doctor', () => {
    const project = tmpDir();
    fs.mkdirSync(path.join(project, '.claude'));
    const env = { ARTISYN_HARNESS_PROJECT_ROOT: project };

    const init = runNode(artifactCli, ['init'], { cwd: project, env });
    assert.equal(init.status, 0, init.stderr);
    const installed = path.join(project, '.claude/skills/implementation-harness');
    assert.ok(fs.existsSync(path.join(installed, 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(installed, 'bin/artisyn-implementation-harness.mjs')));
    assert.ok(!fs.existsSync(path.join(installed, 'state')));

    const doctor = runNode(artifactCli, ['doctor'], { cwd: project, env });
    assert.equal(doctor.status, 0, doctor.stdout + doctor.stderr);
  });
});

describe.skipIf(!hasZip)('the release ZIP', () => {
  let server: http.Server | undefined;
  afterAll(
    () => new Promise<void>((resolve) => (server ? server.close(() => resolve()) : resolve()))
  );

  it('updates an installed package from the ZIP, checked against its sha256', async () => {
    // Built like the workflow: the extracted tarball, folder renamed, zipped with -X.
    const scratch = tmpDir('smoke-zip-');
    fs.cpSync(path.join(extracted, 'package'), path.join(scratch, 'implementation-harness'), {
      recursive: true,
    });
    const tag = `artisyn-implementation-harness-v${ownVersion}`;
    const zipFile = path.join(tmpDir('smoke-zip-out-'), `${tag}.zip`);
    sh('zip', ['-r', '-X', zipFile, 'implementation-harness'], scratch);
    const zip = fs.readFileSync(zipFile);
    server = http.createServer((req, res) => {
      if (req.url === `/${tag}/${tag}.zip`) res.end(zip);
      else if (req.url === `/${tag}/${tag}.zip.sha256`) res.end(`${sha256(zip)}  ${tag}.zip\n`);
      else {
        res.statusCode = 404;
        res.end();
      }
    });
    await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as { port: number };

    const project = tmpDir();
    const installed = path.join(project, '.claude/skills/implementation-harness');
    fs.mkdirSync(installed, { recursive: true });
    fs.writeFileSync(
      path.join(installed, 'package.json'),
      JSON.stringify({ name: '@dataart/artisyn-implementation-harness', version: '1.0.0' })
    );
    fs.mkdirSync(path.join(project, '.harness/state/launch'), { recursive: true });
    fs.writeFileSync(
      path.join(project, '.harness/state/launch/package.json'),
      JSON.stringify({
        name: '@dataart/artisyn-implementation-harness',
        version: '1.0.0',
        channel: 'zip',
      })
    );
    fs.writeFileSync(
      path.join(project, '.harness/state/launch/package.local.json'),
      JSON.stringify({ path: installed })
    );

    const result = await runNodeAsync(
      artifactCli,
      ['update', '--version', ownVersion, '--release-base-url', `http://127.0.0.1:${port}`],
      { cwd: project, env: { ARTISYN_HARNESS_PROJECT_ROOT: project } }
    );

    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.equal(
      JSON.parse(fs.readFileSync(path.join(installed, 'package.json'), 'utf8')).version,
      ownVersion
    );
    assert.ok(fs.existsSync(path.join(installed, 'bin/artisyn-implementation-harness.mjs')));
    assert.deepEqual(
      fs.readdirSync(path.dirname(installed)),
      ['implementation-harness'],
      'no .bak or scratch folder'
    );
    assert.ok(Object.keys(snapshot(installed)).length > 100, 'the whole package arrived');
  });
});

describe('the skills.sh layout', () => {
  const frontmatter = (file: string) =>
    parse(/^---\n([\s\S]*?)\n---\n/.exec(fs.readFileSync(file, 'utf8'))![1]) as {
      name: string;
      metadata?: { internal?: boolean };
    };

  it('offers exactly the harness skill under skills/, named after its folder', () => {
    const folders = fs
      .readdirSync(path.join(workspaceRoot, 'skills'), { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          fs.existsSync(path.join(workspaceRoot, 'skills', entry.name, 'SKILL.md'))
      )
      .map((entry) => entry.name)
      .sort();
    assert.deepEqual(folders, ['implementation-harness']);
    for (const folder of folders)
      assert.equal(
        frontmatter(path.join(workspaceRoot, 'skills', folder, 'SKILL.md')).name,
        folder
      );
  });

  it('adds only ./skills through skills.sh.json', () => {
    const config = JSON.parse(fs.readFileSync(path.join(workspaceRoot, 'skills.sh.json'), 'utf8'));
    assert.deepEqual(config.paths, ['./skills']);
  });

  it("hides this repo's own deployed skills from discovery (RF-025)", () => {
    const deployed = path.join(workspaceRoot, '.claude/skills');
    for (const entry of fs.readdirSync(deployed, { withFileTypes: true })) {
      const skillFile = path.join(deployed, entry.name, 'SKILL.md');
      if (entry.isSymbolicLink() || !fs.existsSync(skillFile)) continue; // the symlink is the harness itself
      const isTracked =
        spawnSync('git', ['ls-files', '--error-unmatch', `.claude/skills/${entry.name}`], {
          cwd: workspaceRoot,
        }).status === 0;
      if (!isTracked) continue; // local, git-ignored folders are not in the repository
      assert.equal(frontmatter(skillFile).metadata?.internal, true, `${entry.name} is internal`);
    }
  });
});
