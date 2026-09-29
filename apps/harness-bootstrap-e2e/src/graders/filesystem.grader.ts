import fs from 'node:fs';
import path from 'node:path';

export interface GradeResult {
  grader: string;
  pass: boolean;
  failures: string[];
}

function result(grader: string, failures: string[]): GradeResult {
  return { grader, pass: failures.length === 0, failures };
}

/** Exact-match: declared paths exist or don't, relative to a workspace root. */
export function gradeFilesystem(
  root: string,
  assertions: { exists?: string[]; absent?: string[] }
): GradeResult {
  const failures: string[] = [];
  for (const rel of assertions.exists ?? [])
    if (!fs.existsSync(path.join(root, rel))) failures.push(`expected path to exist: ${rel}`);
  for (const rel of assertions.absent ?? [])
    if (fs.existsSync(path.join(root, rel))) failures.push(`expected path to be absent: ${rel}`);
  return result('filesystem', failures);
}
