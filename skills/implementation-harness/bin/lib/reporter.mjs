/** Text the CLI prints: version comparison, the next-step lines and the pinned update command. */

export const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

const parse = (version) => {
  const [core, ...rest] = String(version).split('-');
  return {
    numbers: core.split('.').map((part) => Number.parseInt(part, 10) || 0),
    pre: rest.length > 0 ? rest.join('-') : null,
  };
};

const compareIdentifiers = (a, b) => {
  const left = a.split('.');
  const right = b.split('.');
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    if (left[index] === undefined) return -1;
    if (right[index] === undefined) return 1;
    const numeric = /^\d+$/.test(left[index]) && /^\d+$/.test(right[index]);
    const difference = numeric
      ? Number(left[index]) - Number(right[index])
      : left[index].localeCompare(right[index]);
    if (difference !== 0) return difference < 0 ? -1 : 1;
  }
  return 0;
};

/** -1, 0 or 1 comparing semver versions; a pre-release sorts before its release. */
export function compareVersions(a, b) {
  const left = parse(a);
  const right = parse(b);
  for (let index = 0; index < 3; index += 1) {
    const difference = (left.numbers[index] ?? 0) - (right.numbers[index] ?? 0);
    if (difference !== 0) return difference < 0 ? -1 : 1;
  }
  if (left.pre === right.pre) return 0;
  if (left.pre === null) return 1;
  if (right.pre === null) return -1;
  return compareIdentifiers(left.pre, right.pre);
}

/** The command that updates an install of the recorded channel, pinned to `version`. */
export function updateCommand({ channel, name, version, provider = 'claude' }) {
  const tag = `artisyn-implementation-harness-v${version}`;
  switch (channel) {
    case 'npm':
      return `npx ${name}@${version} update`;
    case 'zip':
      return `download ${tag}.zip and ${tag}.zip.sha256 from the GitHub Release tagged ${tag}, or run the bundled CLI: node <package>/bin/artisyn-implementation-harness.mjs update --version ${version}`;
    case 'marketplace':
      return provider === 'codex'
        ? 'codex plugin marketplace upgrade'
        : provider === 'copilot'
          ? 'copilot plugin update artisyn'
          : 'claude plugin update artisyn@dataart';
    case 'skills.sh':
      return 'npx skills update';
    case 'gh-skill':
      return `gh skill install DataArt/artisyn-implementation-harness implementation-harness@${tag} --scope project`;
    default:
      return `unknown channel "${channel}"`;
  }
}
