import fs from 'node:fs';
import path from 'node:path';
import type { GradeResult } from './filesystem.grader.ts';

function walkFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

/** INTENT.md is authoring guidance kept in the bootstrap package. It must never
 * be copied into provider skill or runtime destinations, even temporarily.
 */
export function gradeIntentCleanup(root: string, dirs: string[], exclude: string[] = []): GradeResult {
  const failures: string[] = [];
  for (const dir of dirs) {
    const base = path.join(root, dir);
    if (!fs.existsSync(base)) continue;
    for (const file of walkFiles(base)) {
      if (exclude.some((excluded) => file === excluded || file.startsWith(excluded + path.sep)))
        continue;
      if (path.basename(file) === 'INTENT.md')
        failures.push(`INTENT.md must not be copied into provider destinations: ${path.relative(root, file)}`);
    }
  }
  return { grader: 'cleanup', pass: failures.length === 0, failures };
}
