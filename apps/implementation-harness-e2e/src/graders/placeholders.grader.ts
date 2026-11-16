import { result } from './grading.ts';
import type { GradeContext, GradeResult, GraderBinding } from './_types.ts';
import fs from 'node:fs';
import path from 'node:path';
import { isExcluded, walkFiles } from '../utils/fs.ts';
import { PROVIDER_DIRS, PROVIDER_PLACEHOLDER_RE } from '../utils/constants.ts';

/** Only `{{provider:*}}` leftovers are always a bug — a plain `{{TOKEN}}` may
 * be an intentionally preserved project token (materialize-launch.mjs already
 * verifies those against each plan file's own preserve_tokens list), which is
 * `adaptation.grader.ts`'s job instead.
 */
export function gradeProviderPlaceholders(
  root: string,
  dirs: string[],
  exclude: string[] = []
): GradeResult {
  const failures: string[] = [];
  for (const dir of dirs)
    for (const file of walkFiles(path.join(root, dir))) {
      if (isExcluded(file, exclude)) continue;
      if (PROVIDER_PLACEHOLDER_RE.test(fs.readFileSync(file, 'utf8')))
        failures.push(`unresolved {{provider:*}} placeholder in ${path.relative(root, file)}`);
    }
  return result('no-unresolved-placeholders', failures);
}

/** Scans every provider directory by default; bootstrap narrows it to the one
 * provider it installed.
 */
export const noUnresolvedProviderPlaceholders =
  (dirs: (context: GradeContext) => string[] = () => PROVIDER_DIRS): GraderBinding =>
  (c) =>
    gradeProviderPlaceholders(c.root, dirs(c), [c.packageRoot]);
