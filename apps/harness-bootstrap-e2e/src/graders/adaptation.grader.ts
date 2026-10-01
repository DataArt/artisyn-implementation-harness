import { requireProvider, result } from './grading.ts';
import type { GradeResult, GraderBinding } from './_types.ts';
import { PROVIDER_DETAILS } from '../utils/providers.ts';
import fs from 'node:fs';
import path from 'node:path';
import type { Provider } from '../utils/build-launch.ts';
import { isUnder, walkFiles } from '../utils/fs.ts';
import { projectPlaceholderPattern } from '../utils/constants.ts';

const REUSABLE_RUNTIME_TOKENS = new Set(['{{VERSION}}']);

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
  const outputs = new Set<string>(
    [PROVIDER_DETAILS[provider].instructions, PROVIDER_DETAILS[provider].settings].map((file) =>
      path.join(root, file)
    )
  );
  for (const relativeRoot of [PROVIDER_DETAILS[provider].skills, PROVIDER_DETAILS[provider].agents])
    for (const file of walkFiles(path.join(root, relativeRoot))) outputs.add(file);

  for (const file of outputs) {
    if (!fs.existsSync(file) || isUnder(file, packagePath)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const tokens = [...new Set(text.match(projectPlaceholderPattern()) ?? [])].filter(
      (token) => !REUSABLE_RUNTIME_TOKENS.has(token)
    );
    if (tokens.length)
      failures.push(
        `${path.relative(root, file)} has unresolved project tokens: ${tokens.join(', ')}`
      );

    const skillsPath = path.join(root, PROVIDER_DETAILS[provider].skills);
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
  return result('adaptation', failures);
}

export const adaptationsComplete =
  ({ trackerSelected }: { trackerSelected: boolean }): GraderBinding =>
  (c) =>
    gradeAdaptationsComplete(c.root, requireProvider(c), c.packageRoot, trackerSelected);
