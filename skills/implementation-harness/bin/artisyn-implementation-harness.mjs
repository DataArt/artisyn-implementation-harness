#!/usr/bin/env node
/** Install CLI for the Artisyn Implementation Harness: init, update, doctor.
 *
 * It places the package in a provider skills folder and keeps the project's `.harness/state/`
 * and `package:` records in step. It does not run launch or patch apply. Node >= 22, `node:`
 * modules only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import {
  ensureGitignore,
  ensureStateDirs,
  readPackageIdentity,
  resolvePackagePath,
  resolveProjectRoot,
  stateDirOf,
  writePackageRecord,
} from '../scripts/lib/state-root.mjs';
import {
  PACKAGE_FOLDER,
  PROVIDER_NAMES,
  command,
  detectProviders,
  launchCommand,
  providerOfPath,
  skillsFolder,
} from './lib/providers.mjs';
import { placePackage, swapPackage } from './lib/placer.mjs';
import { extractZip } from './lib/zip.mjs';
import {
  VERSION_PATTERN,
  compareVersions,
  releaseAsset,
  releaseTag,
  updateCommand,
} from './lib/reporter.mjs';

const OWN_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_RELEASE_BASE =
  'https://github.com/DataArt/artisyn-implementation-harness/releases/download';
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);
const CHANNELS = ['npm', 'zip'];

const USAGE = `Usage: artisyn-implementation-harness <command> [options]

Commands
  init      Place the package in the first selected provider's skills folder and create .harness/state/
  update    Replace the installed package with the version of this CLI (npm) or a release ZIP (zip)
  doctor    Report installed packages, versions and state health

Options
  --dir <path>               Project root (default: git top level, else the working directory)
  --provider <name>          claude, codex or copilot; repeatable (init)
  --channel <npm|zip>        How this package was obtained (init; default npm)
  --version <x.y.z>          Version to update to (update)
  --force                    Replace a different version (init) or allow a downgrade (update)
  --release-base-url <url>   Release origin for the zip channel; https or loopback http only
`;

class Exit extends Error {
  constructor(code, message) {
    super(message);
    this.exitCode = code;
  }
}

const say = (line = '') => process.stdout.write(`${line}\n`);
const warn = (line) => process.stderr.write(`${line}\n`);
const relative = (root, file) => path.relative(root, file).split(path.sep).join('/') || '.';

function ownIdentity() {
  const identity = readPackageIdentity(OWN_DIR);
  if (!identity) throw new Exit(1, `Cannot read this package's name and version from ${OWN_DIR}`);
  return identity;
}

function readRecord(root) {
  const file = path.join(stateDirOf(root), 'launch', 'package.json');
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function installedFolders(root) {
  return PROVIDER_NAMES.map((provider) => ({
    provider,
    dir: path.join(root, skillsFolder(provider), PACKAGE_FOLDER),
  })).filter(({ dir }) => fs.existsSync(dir));
}

function validateReleaseBase(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Exit(2, `--release-base-url is not a URL: ${raw}`);
  }
  const loopback = url.protocol === 'http:' && LOOPBACK_HOSTS.has(url.hostname);
  if (url.protocol !== 'https:' && !loopback)
    throw new Exit(
      2,
      '--release-base-url must use https: (or http: on a loopback address, for tests)'
    );
  return raw.replace(/\/+$/, '');
}

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Exit(1, `Download failed: GET ${url} returned ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

// ---------------------------------------------------------------------------------- init

function init(root, options) {
  let providers;
  try {
    providers = detectProviders(root, options.provider ?? []);
  } catch (error) {
    throw new Exit(2, error.message);
  }
  if (providers.length === 0)
    throw new Exit(
      2,
      'No provider detected. Create .claude/, .agents/ or .github/ in the project, or pass --provider claude|codex|copilot.'
    );
  const channel = options.channel ?? 'npm';
  if (!CHANNELS.includes(channel))
    throw new Exit(2, `--channel must be one of ${CHANNELS.join(', ')}`);

  const provider = providers[0];
  const target = path.join(root, skillsFolder(provider), PACKAGE_FOLDER);
  const own = ownIdentity();
  let alreadyInstalled = false;
  if (fs.existsSync(target)) {
    const present = readPackageIdentity(target);
    alreadyInstalled = present?.version === own.version && !options.force;
    if (!alreadyInstalled && !options.force)
      throw new Exit(
        1,
        `${relative(root, target)} already holds a different version (${present?.version ?? 'unknown'}); use --force to replace it.`
      );
  }
  if (!alreadyInstalled) placePackage({ source: OWN_DIR, target });

  ensureStateDirs(root);
  ensureGitignore(root);
  writePackageRecord(root, { ...own, channel, path: target });

  say(
    `${alreadyInstalled ? 'Already installed' : 'Installed'} ${own.name} ${own.version} in ${relative(root, target)}`
  );
  say('State root: .harness/state/');
  say(`Next: run \`${launchCommand(provider)}\``);
}

// -------------------------------------------------------------------------------- update

async function update(root, options) {
  const record = readRecord(root);
  if (!record)
    throw new Exit(1, 'No install record at .harness/state/launch/package.json. Run `init` first.');
  const target = resolvePackagePath(root);
  if (!target)
    throw new Exit(1, 'Cannot find the installed package for the recorded version. Run `doctor`.');
  const provider = providerOfPath(root, target);
  const installed = readPackageIdentity(target)?.version ?? record.version;
  const own = ownIdentity();

  if (!CHANNELS.includes(record.channel)) {
    say(
      `This install came from ${record.channel}; update it with: ${updateCommand({ ...record, provider })}`
    );
    say(`Then run \`${command(provider, 'patch apply')}\`.`);
    return;
  }
  const wanted = options.version ?? own.version;
  if (!VERSION_PATTERN.test(wanted))
    throw new Exit(2, `--version must look like 1.2.3, got: ${wanted}`);
  if (record.channel === 'npm' && wanted !== own.version)
    throw new Exit(2, `This CLI is ${own.version}. Run: npx ${own.name}@${wanted} update`);

  const order = compareVersions(wanted, installed);
  if (order === 0) {
    say(`Already at ${installed}; nothing to do.`);
    return;
  }
  if (order < 0 && !options.force)
    throw new Exit(3, `Refusing to downgrade ${installed} to ${wanted}. Use --force to allow it.`);

  if (record.channel === 'npm') placePackage({ source: OWN_DIR, target });
  else await updateFromRelease({ target, wanted, base: options.releaseBase });

  writePackageRecord(root, {
    name: record.name,
    version: wanted,
    channel: record.channel,
    path: target,
  });
  say(`Updated ${record.name} ${installed} -> ${wanted} (${record.channel})`);
  say(`Next: run \`${command(provider, 'patch apply')}\``);
}

async function updateFromRelease({ target, wanted, base }) {
  const tag = releaseTag(wanted);
  const asset = releaseAsset(wanted);
  const origin = base ?? DEFAULT_RELEASE_BASE;
  const zipUrl = `${origin}/${tag}/${asset}.zip`;
  const zip = await download(zipUrl);
  const expected = (await download(`${zipUrl}.sha256`)).toString('utf8').trim().split(/\s+/)[0];
  const actual = createHash('sha256').update(zip).digest('hex');
  if (!/^[a-f0-9]{64}$/.test(expected) || expected !== actual)
    throw new Exit(
      1,
      `sha256 mismatch for ${asset}.zip: expected ${expected}, got ${actual}. The installed package is unchanged.`
    );

  const parent = path.dirname(target);
  fs.mkdirSync(parent, { recursive: true });
  const scratch = fs.mkdtempSync(path.join(parent, '.implementation-harness-update-'));
  try {
    extractZip(zip, scratch);
    const staged = path.join(scratch, PACKAGE_FOLDER);
    const identity = fs.existsSync(staged) ? readPackageIdentity(staged) : null;
    if (!identity || identity.version !== wanted)
      throw new Exit(
        1,
        `The archive does not hold ${PACKAGE_FOLDER} ${wanted}. The installed package is unchanged.`
      );
    swapPackage({ staged, target });
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

// --------------------------------------------------------------------------------- doctor

function doctor(root) {
  let problems = 0;
  const problem = (text) => {
    problems += 1;
    say(`  PROBLEM  ${text}`);
  };
  const record = readRecord(root);
  const installs = installedFolders(root).map((item) => ({
    ...item,
    identity: readPackageIdentity(item.dir),
  }));

  say(`Project: ${root}`);
  say('Installed packages:');
  if (installs.length === 0) say('  none in the provider skills folders');
  for (const { provider, dir, identity } of installs)
    say(
      `  ${provider}: ${relative(root, dir)} (${identity ? `${identity.name} ${identity.version}` : 'unreadable'})`
    );

  const versions = new Set(installs.map(({ identity }) => identity?.version).filter(Boolean));
  if (versions.size > 1)
    problem(
      `version skew between providers: ${installs.map((i) => `${i.provider} ${i.identity?.version}`).join(', ')}`
    );

  if (record) {
    say(`Recorded: ${record.name} ${record.version} via ${record.channel}`);
    const located = resolvePackagePath(root);
    if (located) say(`  package path: ${located}`);
    else if (installs.length === 0) problem('the recorded package cannot be found on this machine');
    const provider = installs[0]?.provider ?? 'claude';
    say(`  update: ${updateCommand({ ...record, provider })}`);
    say(
      `  launch: ${record.channel === 'marketplace' ? `${command(provider, 'launch').replace('implementation-harness', 'artisyn:implementation-harness')}` : launchCommand(provider)}`
    );
  } else if (installs.length === 0) {
    problem('no installed package and no install record; run `init`');
  } else {
    problem('no install record at .harness/state/launch/package.json; run `init` or launch once');
  }

  say(
    fs.existsSync(stateDirOf(root)) ? 'State root: .harness/state/ present' : 'State root: missing'
  );
  if (!fs.existsSync(stateDirOf(root))) problem('.harness/state/ does not exist');

  say(problems === 0 ? 'OK' : `${problems} problem(s) found`);
  process.exitCode = problems === 0 ? 0 : 1;
}

// ----------------------------------------------------------------------------------- main

async function main(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      dir: { type: 'string' },
      provider: { type: 'string', multiple: true },
      channel: { type: 'string' },
      version: { type: 'string' },
      force: { type: 'boolean', default: false },
      'release-base-url': { type: 'string' },
      help: { type: 'boolean', default: false },
    },
  });
  const [name] = positionals;
  if (values.help || !name) {
    say(USAGE);
    return;
  }
  const root = values.dir ? path.resolve(values.dir) : resolveProjectRoot();
  const options = {
    provider: values.provider,
    channel: values.channel,
    version: values.version,
    force: values.force,
    releaseBase: values['release-base-url']
      ? validateReleaseBase(values['release-base-url'])
      : undefined,
  };
  switch (name) {
    case 'init':
      return init(root, options);
    case 'update':
      return update(root, options);
    case 'doctor':
      return doctor(root);
    default:
      throw new Exit(2, `Unknown command "${name}".\n\n${USAGE}`);
  }
}

main(process.argv.slice(2)).catch((error) => {
  warn(error instanceof Exit ? error.message : `Unexpected error: ${error.stack ?? error.message}`);
  process.exitCode = error instanceof Exit ? error.exitCode : 1;
});
