import fs from 'node:fs';
import path from 'node:path';

/** Recursively list files under `root/relative`, sorted and symlink-free, as
 * root-relative posix paths so a skill bundle's plan entries are stable across
 * platforms.
 */
export function walk(root, relative = '') {
  return fs
    .readdirSync(path.join(root, relative), { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      if (entry.isSymbolicLink()) throw new Error('Canonical symlinks are not supported');
      const name = path.posix.join(relative, entry.name);
      return entry.isDirectory() ? walk(root, name) : [name];
    });
}
