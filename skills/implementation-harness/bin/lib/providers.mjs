/** The three hosts the package installs into, and how each one names things. */
import fs from 'node:fs';
import path from 'node:path';

export const PROVIDERS = {
  claude: { dir: '.claude', skills: '.claude/skills', prefix: '/' },
  codex: { dir: '.agents', skills: '.agents/skills', prefix: '$' },
  copilot: { dir: '.github', skills: '.github/skills', prefix: '/' },
};
export const PROVIDER_NAMES = Object.keys(PROVIDERS);
export const PACKAGE_FOLDER = 'implementation-harness';

/** Providers to install for. Flags win and keep their order; otherwise every host folder that
 * already exists in the project, in the order claude, codex, copilot.
 */
export function detectProviders(root, requested = []) {
  if (requested.length > 0) {
    for (const name of requested) {
      if (!PROVIDERS[name])
        throw new Error(`Unknown provider "${name}" (expected ${PROVIDER_NAMES.join(', ')})`);
    }
    return [...new Set(requested)];
  }
  return PROVIDER_NAMES.filter((name) => fs.existsSync(path.join(root, PROVIDERS[name].dir)));
}

export const skillsFolder = (provider) => PROVIDERS[provider].skills;

/** A command in the provider's own syntax, e.g. `/implementation-harness launch` or
 * `$implementation-harness patch apply` for Codex.
 */
export const command = (provider, route) =>
  `${PROVIDERS[provider].prefix}${PACKAGE_FOLDER} ${route}`;
export const launchCommand = (provider) => command(provider, 'launch');

/** The provider whose skills folder holds `packageDir`, or `claude` when none does. */
export function providerOfPath(root, packageDir) {
  const found = PROVIDER_NAMES.find((name) => {
    const rel = path.relative(path.join(root, skillsFolder(name)), packageDir);
    return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
  });
  return found ?? 'claude';
}
