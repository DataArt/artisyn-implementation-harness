/** Place the package into a provider skills folder: copy to a staging folder next to the target,
 * then swap it in, so a failure never leaves a half-written or missing package.
 */
import fs from 'node:fs';
import path from 'node:path';

/** True when `target` is `base` or inside it. `pathMod` lets tests use Windows rules on any host. */
export function isInside(base, target, pathMod = path) {
  const relative = pathMod.relative(base, target);
  if (relative === '') return true;
  if (relative === '..' || relative.startsWith(`..${pathMod.sep}`)) return false;
  return !pathMod.isAbsolute(relative);
}

/** Files that never ship in a placed package: state, OS junk, per-machine and secret files. */
function excluded(relative, name) {
  return (
    relative === 'state' ||
    name === '.DS_Store' ||
    name === 'node_modules' ||
    name.startsWith('.env') ||
    /\.local\./.test(name)
  );
}

function copyTree(source, destination, copyFile, relative = '') {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const childRelative = relative ? `${relative}/${entry.name}` : entry.name;
    if (excluded(childRelative, entry.name) || entry.isSymbolicLink()) continue;
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyTree(from, to, copyFile, childRelative);
    else if (entry.isFile()) copyFile(from, to);
  }
}

/** Replace `target` with `staged`: the old folder is renamed to `.bak`, the new one moved in, and
 * the `.bak` removed. If the move fails the old folder is put back.
 */
export function swapPackage({ staged, target }) {
  const backup = `${target}.bak`;
  fs.rmSync(backup, { recursive: true, force: true });
  const hadTarget = fs.existsSync(target);
  if (hadTarget) fs.renameSync(target, backup);
  try {
    fs.renameSync(staged, target);
  } catch (error) {
    if (hadTarget) fs.renameSync(backup, target);
    throw error;
  }
  if (hadTarget) fs.rmSync(backup, { recursive: true, force: true });
}

/** Copy `source` to `target`. On any error the target is exactly as it was and no staging
 * folder is left behind.
 */
export function placePackage({ source, target, copyFile = fs.copyFileSync }) {
  const parent = path.dirname(target);
  fs.mkdirSync(parent, { recursive: true });
  const staged = fs.mkdtempSync(path.join(parent, '.implementation-harness-staging-'));
  try {
    copyTree(source, staged, copyFile);
    swapPackage({ staged, target });
  } catch (error) {
    fs.rmSync(staged, { recursive: true, force: true });
    throw error;
  }
  return { target };
}
