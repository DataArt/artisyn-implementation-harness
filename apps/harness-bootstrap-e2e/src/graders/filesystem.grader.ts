import { result } from './grading.ts';
import type { GradeContext, GradeResult, GraderBinding } from './_types.ts';
import fs from 'node:fs';
import path from 'node:path';

/** Exact-match: declared paths exist or don't, relative to a workspace root.
 * `id` distinguishes several path assertions in one grader set, which would
 * otherwise collide on a single report key.
 */
export function gradeFilesystem(
  root: string,
  assertions: { exists?: string[]; absent?: string[] },
  id = 'filesystem'
): GradeResult {
  const failures: string[] = [];
  for (const rel of assertions.exists ?? [])
    if (!fs.existsSync(path.join(root, rel))) failures.push(`expected path to exist: ${rel}`);
  for (const rel of assertions.absent ?? [])
    if (fs.existsSync(path.join(root, rel))) failures.push(`expected path to be absent: ${rel}`);
  return result(id, failures);
}

/** `select` resolves the base directory and assertions from the run context;
 * `id` keeps several path checks in one grader set distinguishable.
 */
export const filesystemCheck =
  (
    id: string,
    select: (context: GradeContext) => { base: string; exists?: string[]; absent?: string[] }
  ): GraderBinding =>
  (context) => {
    const { base, ...assertions } = select(context);
    return gradeFilesystem(base, assertions, id);
  };
