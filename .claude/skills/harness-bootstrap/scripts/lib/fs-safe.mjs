/** Path-containment and hashing primitives shared by the launch planner and
 * materializer. Every containment check here operates on already-resolved
 * absolute paths — callers resolve with `resolveExisting`/`relativeFile` first.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

/** True when `file` is `root` itself or a descendant of it. */
export function isWithin(root, file) {
  if (file === root) return true;
  const rel = path.relative(root, file);
  return !rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel);
}

/** Resolve `file` through real symlinks as far as it exists. A dangling symlink
 * at the missing leaf is rejected outright rather than treated as an ordinary
 * missing path, so a plan can't be satisfied by writing through a broken link.
 */
export function resolveExisting(file) {
  try {
    return fs.realpathSync(file);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (fs.existsSync(path.dirname(file))) {
      try {
        if (fs.lstatSync(file).isSymbolicLink()) throw new Error(`Dangling symlink: ${file}`);
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
    }
    const parent = path.dirname(file);
    if (parent === file) throw error;
    return path.join(resolveExisting(parent), path.basename(file));
  }
}

/** Resolve a plan-declared relative path under `root`, rejecting traversal,
 * absolute paths, and anything that resolves outside `root` once symlinks are
 * followed.
 */
export function relativeFile(root, value) {
  if (
    typeof value !== 'string' ||
    !value ||
    value.includes('\\') ||
    value.includes('\0') ||
    path.isAbsolute(value) ||
    value.split('/').some((p) => ['', '.', '..'].includes(p))
  )
    throw new Error(`Unsafe relative path: ${value}`);
  const resolved = resolveExisting(path.join(root, value));
  if (!isWithin(root, resolved)) throw new Error(`Path escapes root: ${value}`);
  return resolved;
}

/** Write `data` to `file` such that a reader never observes a partial write. */
export function atomicWrite(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = path.join(path.dirname(file), `.launch-${crypto.randomUUID()}`);
  try {
    fs.writeFileSync(temporary, data, { flag: 'wx', mode: 0o600 });
    fs.renameSync(temporary, file);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

export const currentBytes = (file) => (fs.existsSync(file) ? fs.readFileSync(file) : null);
export const hashOrNull = (bytes) => (bytes === null ? null : sha256(bytes));

/** Remove any ancestor directories a deleted file leaves empty, stopping at the
 * first non-empty ancestor and never climbing above `root`.
 */
export function pruneEmptyAncestors(root, file) {
  let parent = path.dirname(file);
  while (parent !== root && parent.startsWith(root + path.sep)) {
    try {
      if (fs.readdirSync(parent).length) break;
      fs.rmdirSync(parent);
    } catch {
      break;
    }
    parent = path.dirname(parent);
  }
}
