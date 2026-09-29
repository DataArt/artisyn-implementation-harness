import fs from 'node:fs';
import path from 'node:path';
import type { GradeResult } from './filesystem.grader.ts';

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
  for (const dir of dirs) {
    const base = path.join(root, dir);
    if (!fs.existsSync(base)) continue;
    for (const file of walkFiles(base)) {
      if (exclude.some((excluded) => file === excluded || file.startsWith(excluded + path.sep)))
        continue;
      if (!file.endsWith('.md') && !file.endsWith('.toml')) continue;
      const text = fs.readFileSync(file, 'utf8');
      for (const match of text.matchAll(pattern))
        if (!fs.existsSync(path.join(root, match[0])))
          failures.push(`${path.relative(root, file)} references missing path: ${match[0]}`);
    }
  }
  return { grader: 'references', pass: failures.length === 0, failures };
}

function walkFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}
