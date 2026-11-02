// Generic helpers for the operational-graph tool. No dependency on cli.mjs,
// constants.mjs, or edges.mjs — matches utils.mjs's role in the timing.mjs convention.
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomBytes } from 'node:crypto';

/** Throw `message` if `condition` is falsy; otherwise return `condition`. */
export function need(condition, message) {
  if (!condition) throw new Error(message);
  return condition;
}

/** Write `content` to `file` via a same-directory temp file + rename (atomic on POSIX). */
export function atomicWrite(file, content) {
  const tmp = path.join(
    path.dirname(file),
    `.${path.basename(file)}.${randomBytes(4).toString('hex')}.tmp`
  );
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, file);
}

/** @returns {string} An 8-hex-char hash of `seed`, stable across runs. */
export function shortHash(seed) {
  return createHash('sha1').update(seed).digest('hex').slice(0, 8);
}

/**
 * @returns {string} A short hash of `seed`, suffixed only on collision against `used`.
 * Deterministic for a given seed/used-set pair, never reassigns an existing ID.
 */
export function collisionSafeId(seed, used) {
  const base = shortHash(seed);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;

/** @returns {{data: Record<string,string>, body: string, raw: string|null}} Parsed frontmatter. */
export function readFrontmatter(content) {
  const match = content.match(FRONTMATTER);
  if (!match) return { data: {}, body: content, raw: null };
  const data = {};
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    data[line.slice(0, i).trim()] = line
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return { data, body: content.slice(match[0].length), raw: match[1] };
}

/**
 * Insert `id` as a frontmatter key, additive-only: never touches an existing
 * key, never reassigns an existing id. A no-op (returns false) when `id` is
 * already present.
 * @returns {boolean} Whether the file was actually written.
 */
export function writeAdditiveId(file, id) {
  const content = fs.readFileSync(file, 'utf8');
  const { data, raw } = readFrontmatter(content);
  if (data.id) return false;
  const next =
    raw === null
      ? `---\nid: ${id}\n---\n\n${content}`
      : content.replace(FRONTMATTER, `---\nid: ${id}\n${raw}\n---\n`);
  atomicWrite(file, next);
  return true;
}

/** @returns {string|null} The text of the doc's first `# ` heading, or null if absent. */
export function firstHeading(body) {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/** Recursively list every `.md` file under `root`, skipping `docs/.og/`. Empty if `root` is absent. */
export function listMarkdownFiles(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (path.relative(root, full) === path.join('docs', '.og')) continue;
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
    }
  };
  walk(root);
  return out;
}

/** @returns {string} `file`'s path relative to `dir`, POSIX-separated. */
export function toPosixRelative(dir, file) {
  return path.relative(dir, file).split(path.sep).join('/');
}
