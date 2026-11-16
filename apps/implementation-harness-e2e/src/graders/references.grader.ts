import { result } from './grading.ts';
import type { GradeResult, GraderBinding } from './_types.ts';
import fs from 'node:fs';
import path from 'node:path';
import { isExcluded, walkFiles } from '../utils/fs.ts';
import { PROVIDER_DIRS } from '../utils/constants.ts';

/** Structural: every installed-skill/runtime-relative path a rendered .md/.toml
 * file mentions must actually exist on disk. Reuses the exact link shape
 * scripts/tests/provider-launch.test.mjs already checks by hand (permanent
 * `runtime/*.md` references surviving after the disposable package is
 * removed), generalized into a standalone grader.
 */
export function gradeReferencesResolve(
  root: string,
  dirs: string[],
  exclude: string[] = []
): GradeResult {
  const failures: string[] = [];
  const pattern =
    /(?:\.agents|\.claude)\/skills\/[^\s`"<>]+\/(?:runtime|references)\/[a-z0-9-]+\.md|\.(?:claude|codex)\/harness-runtime\/[a-z-]+\.md/g;
  for (const dir of dirs)
    for (const file of walkFiles(path.join(root, dir))) {
      if (isExcluded(file, exclude)) continue;
      if (!file.endsWith('.md') && !file.endsWith('.toml')) continue;
      const text = fs.readFileSync(file, 'utf8');
      for (const match of text.matchAll(pattern))
        if (!fs.existsSync(path.join(root, match[0])))
          failures.push(`${path.relative(root, file)} references missing path: ${match[0]}`);
    }
  return result('references', failures);
}

export const referencesResolve = (): GraderBinding => (c) =>
  gradeReferencesResolve(c.root, PROVIDER_DIRS, [c.packageRoot]);
