/** Minimal argv parser shared by the launch CLI scripts: zero or more `--option
 * value` pairs plus, where applicable, exactly one mode flag chosen from a fixed
 * set (e.g. `--check`/`--write`). Each script still assembles its own usage
 * message and required-argument checks — this only owns the token loop.
 */
export function parseArgs(argv, { modeFlags = [], options = [], defaults = {} } = {}) {
  const args = { ...defaults };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (modeFlags.includes(key)) {
      if (args.mode) throw new Error(`Choose exactly one of ${modeFlags.join(' or ')}`);
      args.mode = key;
    } else if (options.includes(key) && argv[i + 1] && !argv[i + 1].startsWith('--')) {
      args[key.slice(2)] = argv[++i];
    } else throw new Error(`Unknown or incomplete argument: ${key}`);
  }
  return args;
}
