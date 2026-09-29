import fs from 'node:fs';
import path from 'node:path';
import type { Provider } from '../testkit/build-launch.ts';
import type { GradeResult } from './filesystem.grader.ts';

const OUTPUT_ROOTS: Record<Provider, string[]> = {
  claude: ['.claude/skills', '.claude/agents'],
  codex: ['.agents/skills', '.codex/agents'],
};
const ROOT_OUTPUTS: Record<Provider, string[]> = {
  claude: ['CLAUDE.md', '.claude/settings.json'],
  codex: ['AGENTS.md', '.codex/config.toml'],
};
const REUSABLE_RUNTIME_TOKENS = new Set(['{{VERSION}}']);

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

/** Catch project tokens left anywhere in installed skills or generated agents.
 * Lowercase/date/version tokens used by reusable future report templates are
 * intentionally outside this project-token pattern.
 */
export function gradeAdaptationsComplete(
  root: string,
  provider: Provider,
  packageRoot: string,
  trackerSelected: boolean
): GradeResult {
  const failures: string[] = [];
  const packagePath = path.resolve(packageRoot);
  const outputs = new Set<string>(ROOT_OUTPUTS[provider].map((file) => path.join(root, file)));
  for (const relativeRoot of OUTPUT_ROOTS[provider])
    for (const file of walkFiles(path.join(root, relativeRoot))) outputs.add(file);

  for (const file of outputs) {
    if (
      !fs.existsSync(file) ||
      file === packagePath ||
      file.startsWith(packagePath + path.sep)
    )
      continue;
    const text = fs.readFileSync(file, 'utf8');
    const tokens = [
      ...new Set(text.match(/\{\{[A-Z][A-Z0-9_]*\}\}/g) ?? []),
    ].filter((token) => !REUSABLE_RUNTIME_TOKENS.has(token));
    if (tokens.length)
      failures.push(`${path.relative(root, file)} has unresolved project tokens: ${tokens.join(', ')}`);

    const skillsPath = path.join(root, provider === 'claude' ? '.claude/skills' : '.agents/skills');
    if (!trackerSelected && file.startsWith(skillsPath + path.sep)) {
      const malformedNoneRoute =
        /NONE\s*\(no issue tracker; tracker references removed\)/i.test(text) ||
        /\b(?:build|implement)\s+NONE\s*\(/i.test(text);
      if (malformedNoneRoute)
        failures.push(
          `${path.relative(root, file)} substituted the no-tracker answer into a ticket route`
        );
    }
  }
  return { grader: 'adaptation', pass: failures.length === 0, failures };
}
