import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** Every file under `dir`, recursively. Symlinks are skipped so a workspace
 * that links back into the repo can't pull the whole tree into a grader.
 * A missing directory yields no files rather than throwing — graders routinely
 * check paths a partial install may never have created.
 */
export function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

export function isUnder(file: string, base: string): boolean {
  return file === base || file.startsWith(base + path.sep);
}

export function isExcluded(file: string, excludes: string[]): boolean {
  return excludes.some((excluded) => isUnder(file, excluded));
}

export function sha256(data: Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function hashFile(file: string): string {
  return sha256(fs.readFileSync(file));
}

export function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}
