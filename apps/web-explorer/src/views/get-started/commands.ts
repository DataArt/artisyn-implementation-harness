/**
 * Per-configuration command matrix for the Get Started page. Content is
 * transcribed from docs/Harness/09 Distribution/01 Install.md and
 * 02 Update.md — those docs stay the source of truth; this module only
 * reshapes them into (channel × provider) lookups for the toggles.
 */

export type ProviderId = 'claude' | 'codex' | 'copilot';
export type ChannelId = 'skills-sh' | 'marketplace' | 'gh-skill' | 'npmjs' | 'gh-packages' | 'zip';

export const VERSION = process.env.HARNESS_VERSION;

/** Releases are tagged v<version>; up to 4.0.2 they were artisyn-implementation-harness-v<version>. */
const longTag = (version: string) => {
  const [major, minor, patch] = version.split(/[.-]/).map(Number);
  return major < 4 || (major === 4 && minor === 0 && patch <= 2);
};
export const TAG = longTag(VERSION) ? `artisyn-implementation-harness-v${VERSION}` : `v${VERSION}`;
export const RELEASES_URL = 'https://github.com/DataArt/artisyn-implementation-harness/releases';

export interface Provider {
  id: ProviderId;
  label: string;
  /** Prompt prefix for slash commands inside the agent host. */
  prefix: '/' | '$';
  /** Provider skills folder the install CLI targets. */
  skillsDir: string;
}

export const providers: Provider[] = [
  { id: 'claude', label: 'Claude Code', prefix: '/', skillsDir: '.claude/skills/' },
  { id: 'codex', label: 'Codex', prefix: '$', skillsDir: '.agents/skills/' },
  { id: 'copilot', label: 'GitHub Copilot', prefix: '/', skillsDir: '.github/skills/' },
];

export interface Channel {
  id: ChannelId;
  label: string;
  /** Marketplace installs as a plugin; every other channel as a skill. */
  kind: 'skill' | 'plugin';
  soon?: boolean;
  pickWhen: string;
}

export const channels: Channel[] = [
  {
    id: 'skills-sh',
    label: 'skills.sh',
    kind: 'skill',
    soon: true,
    pickWhen: 'One-command install, no pinned version',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    kind: 'plugin',
    pickWhen: 'Your agent host installs plugins from a marketplace',
  },
  {
    id: 'gh-skill',
    label: 'GitHub CLI',
    kind: 'skill',
    pickWhen: 'You already work through the GitHub CLI',
  },
  {
    id: 'npmjs',
    label: 'npmjs.com',
    kind: 'skill',
    soon: true,
    pickWhen: 'npm install without a token',
  },
  {
    id: 'gh-packages',
    label: 'GitHub Packages',
    kind: 'skill',
    pickWhen: 'You have a GitHub token with read:packages',
  },
  {
    id: 'zip',
    label: 'Release ZIP',
    kind: 'skill',
    pickWhen: 'Verified files, no token',
  },
];

export interface CommandBlock {
  /** terminal = run in a shell; agent = run inside the AI tool; file = add this file. */
  kind: 'terminal' | 'agent' | 'file';
  /** Card header, e.g. "Run in your terminal" or ".npmrc — add to the project". */
  label: string;
  code: string;
  note?: string;
}

const npmInit = (provider: Provider): CommandBlock => ({
  kind: 'terminal',
  label: 'Run in your terminal',
  code:
    `npx @dataart/artisyn-implementation-harness@${VERSION} init --provider ${provider.id}\n` +
    `npx @dataart/artisyn-implementation-harness@${VERSION} doctor`,
  note: `Lands in ${provider.skillsDir}implementation-harness/ and creates .harness/state/. doctor checks the install and exits 1 on a problem.`,
});

export function installBlocks(channel: Channel, provider: Provider): CommandBlock[] {
  switch (channel.id) {
    case 'skills-sh':
      return [
        {
          kind: 'terminal',
          label: 'Run in your terminal',
          code: 'npx skills add DataArt/artisyn-implementation-harness --skill implementation-harness',
          note: 'Not listed on skills.sh yet. Installs from the default branch into the provider skills folders the tool detects; the commit is recorded in skills-lock.json.',
        },
      ];
    case 'gh-skill':
      return [
        {
          kind: 'terminal',
          label: 'Run in your terminal (needs the GitHub CLI)',
          code: `gh skill install DataArt/artisyn-implementation-harness implementation-harness@${TAG} --scope project`,
          note: 'Lands in .github/skills/implementation-harness/, pinned to the release tag.',
        },
      ];
    case 'marketplace': {
      if (provider.id === 'claude')
        return [
          {
            kind: 'terminal',
            label: 'Run in your terminal',
            code:
              'claude plugin marketplace add DataArt/artisyn-implementation-harness --scope project\n' +
              'claude plugin install artisyn@dataart --scope project',
            note: "--scope project declares both in the project's .claude/settings.json, so every teammate gets the same plugin. The package lands in the host's plugin cache, outside the project.",
          },
        ];
      if (provider.id === 'codex')
        return [
          {
            kind: 'terminal',
            label: 'Run in your terminal',
            code: 'codex plugin marketplace add DataArt/artisyn-implementation-harness',
            note: 'Then install artisyn from /plugins inside Codex.',
          },
        ];
      return [
        {
          kind: 'terminal',
          label: 'Run in your terminal',
          code:
            'copilot plugin marketplace add DataArt/artisyn-implementation-harness\n' +
            'copilot plugin install artisyn@dataart',
        },
      ];
    }
    case 'npmjs':
      return [
        {
          ...npmInit(provider),
          note: `Not published to npmjs.com yet — no token or .npmrc once it is. ${npmInit(provider).note}`,
        },
      ];
    case 'gh-packages':
      return [
        {
          kind: 'file',
          label: '.npmrc — add to the project',
          code:
            '@dataart:registry=https://npm.pkg.github.com\n' +
            '//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}',
          note: 'The scope line can be committed. The token comes from the environment, never from the repository.',
        },
        {
          kind: 'terminal',
          label: 'Run in your terminal',
          code: `export GITHUB_TOKEN=github_pat_...\n${npmInit(provider).code}`,
          note: `Needs a GitHub token with read:packages. ${npmInit(provider).note}`,
        },
      ];
    case 'zip': {
      const zip = `artisyn-implementation-harness-v${VERSION}.zip`;
      return [
        {
          kind: 'terminal',
          label: 'Download the release',
          code:
            `curl -LO ${RELEASES_URL}/download/${TAG}/${zip}\n` +
            `curl -LO ${RELEASES_URL}/download/${TAG}/${zip}.sha256`,
          note: 'Downloads the ZIP and its .sha256 from the release tag. You can also get both from the releases page.',
        },
        {
          kind: 'terminal',
          label: 'Verify the download',
          code:
            `shasum -a 256 -c ${zip}.sha256\n` +
            `gh attestation verify ${zip} --repo DataArt/artisyn-implementation-harness`,
          note: 'The attestation check uses the GitHub CLI.',
        },
        {
          kind: 'terminal',
          label: 'Unzip and install from the project root',
          code:
            `unzip ${zip}\n` +
            'node implementation-harness/bin/artisyn-implementation-harness.mjs init --channel zip',
          note: `Or unzip straight into ${provider.skillsDir} — the ZIP's top folder is already implementation-harness/. --channel zip lets update fetch later releases as ZIPs.`,
        },
      ];
    }
  }
}

export function launchBlocks(channel: Channel, provider: Provider): CommandBlock[] {
  const name =
    channel.kind === 'plugin' ? 'artisyn:implementation-harness' : 'implementation-harness';
  return [
    {
      kind: 'agent',
      label: `Run in ${provider.label}`,
      code: `${provider.prefix}${name} launch`,
      note:
        provider.id === 'codex' && channel.kind === 'plugin'
          ? "If the plugin's skill is listed without a prefix, use $implementation-harness launch."
          : 'Run once. It initializes the harness inside your project.',
    },
  ];
}

export function updateBlocks(channel: Channel, provider: Provider): CommandBlock[] {
  let pkg: CommandBlock;
  switch (channel.id) {
    case 'marketplace':
      pkg = {
        kind: 'terminal',
        label: 'Update the plugin',
        code:
          provider.id === 'claude'
            ? 'claude plugin update artisyn@dataart'
            : provider.id === 'codex'
              ? 'codex plugin marketplace upgrade'
              : 'copilot plugin update artisyn',
      };
      break;
    case 'skills-sh':
      pkg = { kind: 'terminal', label: 'Update the skill', code: 'npx skills update' };
      break;
    case 'gh-skill':
      pkg = {
        kind: 'terminal',
        label: 'Update the skill',
        code: `gh skill install DataArt/artisyn-implementation-harness implementation-harness@${TAG} --scope project`,
        note: 'Re-run the install pinned to the new release tag.',
      };
      break;
    case 'npmjs':
    case 'gh-packages':
      pkg = {
        kind: 'terminal',
        label: 'Update the package',
        code: `npx @dataart/artisyn-implementation-harness@${VERSION} update`,
        note: 'The CLI updates to its own version, so pin the version you want.',
      };
      break;
    case 'zip':
      pkg = {
        kind: 'terminal',
        label: 'Update the package',
        code: `node implementation-harness/bin/artisyn-implementation-harness.mjs update --version ${VERSION}`,
        note: "Or download the new release's ZIP and .sha256 from that tag and verify them as in Install.",
      };
      break;
  }
  const name =
    channel.kind === 'plugin' ? 'artisyn:implementation-harness' : 'implementation-harness';
  return [
    pkg,
    {
      kind: 'agent',
      label: `Then in ${provider.label}`,
      code: `${provider.prefix}${name} patch apply`,
      note: 'Run after every update — it syncs the project files the harness manages.',
    },
  ];
}
