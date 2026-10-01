import { result } from './grading.ts';
import type { GradeResult, GraderBinding } from './_types.ts';
import path from 'node:path';
import { isExcluded, walkFiles } from '../utils/fs.ts';
import { INTENT_FILE, PROVIDER_DIRS } from '../utils/constants.ts';

/** INTENT.md is authoring guidance kept in the bootstrap package. It must never
 * be copied into provider skill or runtime destinations, even temporarily.
 */
export function gradeIntentCleanup(
  root: string,
  dirs: string[],
  exclude: string[] = []
): GradeResult {
  const failures: string[] = [];
  for (const dir of dirs)
    for (const file of walkFiles(path.join(root, dir))) {
      if (isExcluded(file, exclude)) continue;
      if (path.basename(file) === INTENT_FILE)
        failures.push(
          `${INTENT_FILE} must not be copied into provider destinations: ${path.relative(root, file)}`
        );
    }
  return result('cleanup', failures);
}

export const intentCleanup = (): GraderBinding => (c) =>
  gradeIntentCleanup(c.root, PROVIDER_DIRS, [c.packageRoot]);
