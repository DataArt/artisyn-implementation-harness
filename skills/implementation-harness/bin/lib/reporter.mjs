/** Text the CLI prints: version comparison, the next-step lines and the pinned update command. */

const parse = (version) =>
  String(version)
    .split('-')[0]
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);

/** -1, 0 or 1 comparing dotted numeric versions (a pre-release suffix is ignored). */
export function compareVersions(a, b) {
  const left = parse(a);
  const right = parse(b);
  for (let index = 0; index < 3; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) return difference < 0 ? -1 : 1;
  }
  return 0;
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
