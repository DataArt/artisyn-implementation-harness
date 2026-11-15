/** Migration of state from older installs into the project's `.harness/state/` (D-14).
 *
 * Sources, in precedence order:
 *   1. `<provider>/skills/harness-bootstrap/state/` (any provider folder of a 3.x install)
 *   2. `.canonical-implementation-harness/state/` (a 3.x root-extract install)
 *   3. `.harness/launch/` (legacy project records)
 *
 * The migrator plans every copy first and stops before writing anything if the same path holds
 * different bytes. It copies, verifies each copy by hash, writes `provenance.json`, and only then
 * marks each source with `MIGRATED.md`. Sources are never deleted. A second run changes nothing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { sha256 } from './fs-safe.mjs';
import { readPackageIdentity, stateDirOf } from './state-root.mjs';

const PROVIDER_DIRS = ['.claude', '.agents', '.github'];
const OLD_PACKAGE_FOLDER = 'harness-bootstrap';
const ROOT_EXTRACT_FOLDER = '.canonical-implementation-harness';
const MARKER = 'MIGRATED.md';
const posix = (value) => value.split(path.sep).join('/');

/** Every regular file under `dir`, as POSIX paths relative to it. Symlinks are never followed. */
function listFiles(dir) {
  const files = [];
  const skippedLinks = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isSymbolicLink()) skippedLinks.push(posix(path.relative(dir, full)));
      else if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push(posix(path.relative(dir, full)));
    }
  };
  walk(dir);
  return { files: files.sort(), skippedLinks };
}

/** The old install locations found in the project, each with its state folder and marker status. */
export function detectSources(root) {
  const sources = [];
  for (const provider of PROVIDER_DIRS) {
    const packageDir = path.join(root, provider, 'skills', OLD_PACKAGE_FOLDER);
    const stateDir = path.join(packageDir, 'state');
    if (fs.existsSync(stateDir) && fs.statSync(stateDir).isDirectory())
      sources.push({ kind: 'package', packageDir, dir: stateDir, skillFolder: true });
  }
  const rootExtract = path.join(root, ROOT_EXTRACT_FOLDER);
  const rootState = path.join(rootExtract, 'state');
  if (fs.existsSync(rootState) && fs.statSync(rootState).isDirectory())
    sources.push({ kind: 'package', packageDir: rootExtract, dir: rootState, skillFolder: false });
  const legacy = path.join(root, '.harness', 'launch');
  if (fs.existsSync(legacy) && fs.statSync(legacy).isDirectory())
    sources.push({ kind: 'legacy-launch', dir: legacy, prefix: 'launch/' });
  return sources.map((source) => ({
    ...source,
    marked: fs.existsSync(path.join(source.dir, MARKER)),
  }));
}

/** Run ID of a file in legacy `.harness/launch/` (`runs/<id>/...`) or in package state (`launch/runs/<id>/...`). */
const legacyRunId = (relative) => /^runs\/([^/]+)\//.exec(relative)?.[1];
const packageRunId = (relative) => /^launch\/runs\/([^/]+)\//.exec(relative)?.[1];

/** Decide which files to copy. Package state wins; a legacy run is imported only when its ID is
 * absent from the package state, and a run ID present in both with different bytes is a conflict.
 */
function planCopies(root, pending) {
  const stateDir = stateDirOf(root);
  const copies = new Map();
  const conflicts = [];
  const warnings = [];
  const packageRuns = new Set();

  const consider = (source, relative, destRelative) => {
    const from = path.join(source.dir, relative);
    const to = path.join(stateDir, destRelative);
    const bytes = fs.readFileSync(from);
    const planned = copies.get(destRelative);
    if (planned) {
      if (planned.sha !== sha256(bytes))
        conflicts.push({ path: destRelative, source: posix(path.relative(root, from)) });
      return false;
    }
    if (fs.existsSync(to)) {
      if (sha256(fs.readFileSync(to)) !== sha256(bytes))
        conflicts.push({ path: destRelative, source: posix(path.relative(root, from)) });
      return false;
    }
    copies.set(destRelative, { from, to, sha: sha256(bytes), source });
    return true;
  };

  for (const source of pending.filter((s) => s.kind === 'package')) {
    const { files, skippedLinks } = listFiles(source.dir);
    for (const link of skippedLinks) warnings.push(`skipped symlink in old state: ${link}`);
    for (const relative of files) {
      const runId = packageRunId(relative);
      if (runId) packageRuns.add(runId);
      consider(source, relative, relative);
    }
  }

  const importedRuns = new Set();
  for (const source of pending.filter((s) => s.kind === 'legacy-launch')) {
    const { files, skippedLinks } = listFiles(source.dir);
    for (const link of skippedLinks) warnings.push(`skipped symlink in .harness/launch: ${link}`);
    for (const relative of files) {
      const destRelative = `${source.prefix}${relative}`;
      const runId = legacyRunId(relative);
      if (runId && !packageRuns.has(runId)) {
        if (consider(source, relative, destRelative)) importedRuns.add(runId);
      } else if (runId) {
        // Present in package state: the bytes must agree, otherwise the project has two histories.
        const packaged = copies.get(destRelative);
        const existing =
          packaged?.sha ??
          (fs.existsSync(path.join(stateDir, destRelative))
            ? sha256(fs.readFileSync(path.join(stateDir, destRelative)))
            : null);
        if (
          existing !== null &&
          existing !== sha256(fs.readFileSync(path.join(source.dir, relative)))
        )
          conflicts.push({
            path: destRelative,
            source: posix(path.relative(root, path.join(source.dir, relative))),
          });
      } else {
        consider(source, relative, destRelative);
      }
    }
  }
  return { copies, conflicts, warnings, importedRuns };
}

function readProvenance(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return { schema_version: 1, imports: [] };
  }
}

/** True when the old package folder still holds the old package (not the shim). */
function isOldPackage(source) {
  const skillFile = path.join(source.packageDir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) return false;
  const text = fs.readFileSync(skillFile, 'utf8');
  return /^name:\s*harness-bootstrap\s*$/m.test(text) && !/deprecated/.test(text);
}

/** Replace the old skill folder's package files with the shim, keeping `state/`. Only a folder
 * whose `SKILL.md` still names the retired skill is touched, and only its direct children.
 */
function replaceWithShim(root, source, shim, warnings) {
  if (!source.skillFolder) return;
  if (shim === null || shim === undefined) {
    warnings.push(
      `no shim source available; left ${posix(path.relative(root, source.packageDir))} as it was`
    );
    return;
  }
  const real = fs.realpathSync(source.packageDir);
  const realRoot = fs.realpathSync(root);
  const skillFile = path.join(real, 'SKILL.md');
  const named =
    fs.existsSync(skillFile) &&
    /^name:\s*harness-bootstrap\s*$/m.test(fs.readFileSync(skillFile, 'utf8'));
  if (
    !real.startsWith(realRoot + path.sep) ||
    path.basename(real) !== OLD_PACKAGE_FOLDER ||
    !named
  ) {
    warnings.push(
      `did not replace ${posix(path.relative(root, source.packageDir))}: it does not look like the old package`
    );
    return;
  }
  for (const entry of fs.readdirSync(real)) {
    if (entry === 'state') continue;
    fs.rmSync(path.join(real, entry), { recursive: true, force: true });
  }
  fs.writeFileSync(skillFile, shim);
}

/** Run the migration for the project at `root`. `shim` is the text of the shim `SKILL.md`, or
 * `null` when no source is available.
 */
export function migrate({ root, shim = null }) {
  const sources = detectSources(root);
  if (sources.length === 0)
    return {
      status: 'nothing-to-migrate',
      exitCode: 0,
      imported: { files: 0, runs: [] },
      warnings: [],
      conflicts: [],
    };
  const pending = sources.filter((source) => !source.marked);
  if (pending.length === 0) {
    // State is already migrated, but an earlier run may have had no shim to place. Place it now.
    const stale = sources.filter((source) => source.skillFolder && isOldPackage(source));
    if (stale.length > 0) {
      const warnings = [];
      for (const source of stale) replaceWithShim(root, source, shim, warnings);
      const placed = warnings.length === 0;
      return {
        status: placed ? 'shim-placed' : 'already-migrated',
        exitCode: 0,
        imported: { files: 0, runs: [] },
        warnings,
        conflicts: [],
      };
    }
    return {
      status: 'already-migrated',
      exitCode: 0,
      imported: { files: 0, runs: [] },
      warnings: [],
      conflicts: [],
    };
  }

  const { copies, conflicts, warnings, importedRuns } = planCopies(root, pending);
  if (conflicts.length > 0)
    return {
      status: 'conflict',
      exitCode: 4,
      imported: { files: 0, runs: [] },
      warnings,
      conflicts,
    };

  const created = [];
  try {
    for (const { from, to } of copies.values()) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      created.push(to);
    }
    for (const [relative, { to, sha }] of copies) {
      if (sha256(fs.readFileSync(to)) !== sha)
        throw Object.assign(new Error(`hash mismatch after copy: ${relative}`), { code: 'VERIFY' });
    }
  } catch (error) {
    for (const file of created) fs.rmSync(file, { force: true });
    return {
      status: 'aborted',
      exitCode: 4,
      imported: { files: 0, runs: [] },
      warnings,
      conflicts: [{ path: error.message, source: 'verify' }],
    };
  }

  const timestamp = new Date().toISOString();
  const provenanceFile = path.join(stateDirOf(root), 'provenance.json');
  const provenance = readProvenance(provenanceFile);
  for (const source of pending) {
    const entry = {
      source: posix(path.relative(root, source.dir)),
      kind: source.kind,
      files: [...copies.values()].filter((copy) => copy.source === source).length,
      timestamp,
    };
    if (source.kind === 'package')
      entry.version = readPackageIdentity(source.packageDir)?.version ?? null;
    if (source.kind === 'legacy-launch') entry.imported_runs = [...importedRuns].sort();
    provenance.imports.push(entry);
  }
  fs.mkdirSync(path.dirname(provenanceFile), { recursive: true });
  fs.writeFileSync(provenanceFile, `${JSON.stringify(provenance, null, 2)}\n`);

  for (const source of pending) {
    fs.writeFileSync(
      path.join(source.dir, MARKER),
      `# Migrated\n\nThis state was copied to \`.harness/state/\` on ${timestamp} by \`migrate\`.\nThis copy is kept until you delete it.\n`
    );
  }
  for (const source of pending) replaceWithShim(root, source, shim, warnings);

  return {
    status: 'migrated',
    exitCode: 0,
    imported: { files: copies.size, runs: [...importedRuns].sort() },
    warnings,
    conflicts: [],
  };
}
