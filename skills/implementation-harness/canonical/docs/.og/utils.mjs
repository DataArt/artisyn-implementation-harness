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

const FRONTMATTER = /^---[ \t]*\n(?:([\s\S]*?)\n)?---[ \t]*(?:\n|$)/;

/** Strip a UTF-8 BOM and normalize CRLF to LF, so both parse like plain LF text. */
export function normalizeText(content) {
  return content.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

/** @returns {string[]} `text` split on commas outside quotes and brackets. */
function splitFlow(text) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      current += ch;
      if (ch === quote) {
        if (quote === "'" && text[i + 1] === "'") current += text[++i];
        else quote = null;
      } else if (quote === '"' && ch === '\\') current += text[++i] ?? '';
      continue;
    }
    if ((ch === "'" || ch === '"') && !current.trim()) quote = ch;
    else if (ch === '[' || ch === '{') depth += 1;
    else if (ch === ']' || ch === '}') depth -= 1;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else current += ch;
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter((part, i, all) => part || i < all.length - 1);
}

/** A YAML scalar → string. Throws a reason for forms outside the subset. */
function parseScalar(text) {
  const value = text.trim();
  if (/^[&*]/.test(value)) throw new Error('anchors and aliases are not supported');
  if (/^[|>]/.test(value)) throw new Error('block scalars are not supported');
  if (value.startsWith("'")) {
    const match = value.match(/^'((?:[^']|'')*)'\s*(?:#.*)?$/);
    if (!match) throw new Error('unterminated single-quoted string');
    return match[1].replace(/''/g, "'");
  }
  if (value.startsWith('"')) {
    const match = value.match(/^"((?:[^"\\]|\\.)*)"\s*(?:#.*)?$/);
    if (!match) throw new Error('unterminated double-quoted string');
    return match[1].replace(/\\(.)/g, (_, ch) => ({ n: '\n', t: '\t' })[ch] ?? ch);
  }
  if (/^[[{]/.test(value)) throw new Error('nesting deeper than one level is not supported');
  return value.replace(/\s+#.*$/, '');
}

/** `[a, b]` → `['a', 'b']`. */
function parseFlowList(text) {
  const inner = text.trim();
  if (!inner.endsWith(']')) throw new Error('unterminated flow list');
  return splitFlow(inner.slice(1, -1)).map(parseScalar);
}

/** `{ a: x, b: y }` → `{a: 'x', b: 'y'}`. */
function parseFlowMap(text) {
  const inner = text.trim();
  if (!inner.endsWith('}')) throw new Error('unterminated flow mapping');
  const out = {};
  for (const entry of splitFlow(inner.slice(1, -1))) {
    const match = entry.match(/^([^\s:'"][^:]*?):(?:\s+(.*))?$/);
    if (!match) throw new Error('flow mapping entries must be "key: value"');
    out[match[1]] = parseScalar(match[2] ?? '');
  }
  return out;
}

const KEY_LINE = /^([A-Za-z0-9_][\w.-]*):(?:[ \t]+(.*?))?[ \t]*$/;

/**
 * Parse frontmatter with the OG YAML subset: plain and quoted scalars, flow
 * lists (inline or wrapped, as Prettier writes them), block lists, one-level
 * flow and block mappings. Anchors, aliases, block scalars, deeper nesting and
 * document markers are refused per key; every other key is still returned.
 * A UTF-8 BOM and CRLF line endings parse like plain LF text.
 * @param {string} content Whole file content.
 * @returns {{data: Record<string, any>, body: string, raw: string|null,
 *   errors: {line: number, reason: string}[]}} `line` is 1-based in the file.
 */
export function parseFrontmatter(content) {
  const text = normalizeText(content);
  const match = text.match(FRONTMATTER);
  if (!match) return { data: {}, body: text, raw: null, errors: [] };
  const raw = match[1] ?? '';
  const lines = raw === '' ? [] : raw.split('\n');
  const data = {};
  const errors = [];
  const indented = (line) => /^[ \t]/.test(line);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const lineNo = i + 2;
    i += 1;
    if (!line.trim() || /^\s*#/.test(line)) continue;
    if (/^(\.\.\.|---)(\s|$)/.test(line)) {
      errors.push({ line: lineNo, reason: 'document markers are not supported' });
      continue;
    }
    const keyMatch = line.match(KEY_LINE);
    if (!keyMatch) {
      errors.push({ line: lineNo, reason: 'expected "key: value"' });
      while (i < lines.length && indented(lines[i])) i += 1;
      continue;
    }
    const [, key, inline] = keyMatch;
    const block = [];
    while (i < lines.length && (indented(lines[i]) || !lines[i].trim())) {
      block.push({ text: lines[i], lineNo: i + 2 });
      i += 1;
    }
    while (block.length && !block[block.length - 1].text.trim()) {
      block.pop();
      i -= 1;
    }
    try {
      data[key] = parseValue(inline, block);
    } catch (error) {
      errors.push({ line: error.line ?? lineNo, reason: error.message });
    }
  }
  return { data, body: text.slice(match[0].length), raw, errors };
}

/** One key's value from its inline text and its indented continuation lines. */
function parseValue(inline, block) {
  const content = block.filter((entry) => entry.text.trim());
  if (inline !== undefined && inline !== '') {
    if (/^[|>]/.test(inline)) throw new Error('block scalars are not supported');
    const joined = [inline, ...content.map((entry) => entry.text.trim())].join(' ');
    if (inline.startsWith('[')) return parseFlowList(joined);
    if (inline.startsWith('{')) return parseFlowMap(joined);
    if (content.length)
      throw Object.assign(new Error('multi-line plain scalars are not supported'), {
        line: content[0].lineNo,
      });
    return parseScalar(inline);
  }
  if (!content.length) return null;
  const first = content[0].text.trim();
  if (first.startsWith('[') || first.startsWith('{')) {
    const joined = content.map((entry) => entry.text.trim()).join(' ');
    return first.startsWith('[') ? parseFlowList(joined) : parseFlowMap(joined);
  }
  const indent = content[0].text.match(/^\s*/)[0].length;
  const deeperAt = content.findIndex((entry) => entry.text.match(/^\s*/)[0].length !== indent);
  if (deeperAt !== -1)
    throw Object.assign(new Error('nesting deeper than one level is not supported'), {
      line: content[Math.max(0, deeperAt - 1)].lineNo,
    });
  if (first.startsWith('- ') || first === '-') {
    return content.map((entry) => {
      const item = entry.text.trim().replace(/^-\s*/, '');
      if (!entry.text.trim().startsWith('-'))
        throw Object.assign(new Error('mixed block list'), { line: entry.lineNo });
      if (KEY_LINE.test(item) || /^[[{]/.test(item))
        throw Object.assign(new Error('nesting deeper than one level is not supported'), {
          line: entry.lineNo,
        });
      return parseScalar(item);
    });
  }
  const out = {};
  for (const entry of content) {
    const pair = entry.text.trim().match(KEY_LINE);
    if (!pair) throw Object.assign(new Error('expected "key: value"'), { line: entry.lineNo });
    if (pair[2] === undefined || pair[2] === '')
      throw Object.assign(new Error('nesting deeper than one level is not supported'), {
        line: entry.lineNo,
      });
    try {
      out[pair[1]] = parseScalar(pair[2]);
    } catch (error) {
      throw Object.assign(error, { line: entry.lineNo });
    }
  }
  return out;
}

/** B+ key order; any other key follows in its original order. */
export const B_PLUS_KEYS = Object.freeze([
  'id',
  'type',
  'title',
  'description',
  'tags',
  'generated',
  'updated',
]);

const PRINT_WIDTH = 100;

/** A string as a YAML scalar, quoted only when a plain scalar would misparse. */
function formatScalar(value, flow = false) {
  const text = String(value);
  const needsQuotes =
    text === '' ||
    text !== text.trim() ||
    /^[-?:,[\]{}#&*!|>'"%@`]/.test(text) ||
    /: |:$| #/.test(text) ||
    (flow && /[,[\]{}]/.test(text)) ||
    /^[+-]?(\d+\.?\d*|\.\d+)$/.test(text) ||
    /[\n\t]/.test(text);
  if (!needsQuotes) return text;
  const singles = (text.match(/'/g) ?? []).length;
  const doubles = (text.match(/"/g) ?? []).length;
  if (singles > doubles || /[\n\t]/.test(text))
    return `"${text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t')}"`;
  return `'${text.replace(/'/g, "''")}'`;
}

/** One `key: value` entry, wrapped the way Prettier wraps a long flow list. */
function formatEntry(key, value) {
  if (value === null) return `${key}:`;
  if (Array.isArray(value)) {
    const items = value.map((item) => formatScalar(item, true));
    const inline = `${key}: [${items.join(', ')}]`;
    if (inline.length <= PRINT_WIDTH) return inline;
    return [`${key}:`, '  [', ...items.map((item) => `    ${item},`), '  ]'].join('\n');
  }
  if (typeof value === 'object') {
    const pairs = Object.entries(value).map(([k, v]) => `${k}: ${formatScalar(v, true)}`);
    return `${key}: { ${pairs.join(', ')} }`;
  }
  return `${key}: ${formatScalar(value)}`;
}

/**
 * Serialize frontmatter data as a `---` block in the B+ key order. Output is
 * Prettier-stable and parses back (`parseFrontmatter`) to equal values.
 * @param {Record<string, any>} data
 * @returns {string} The block, ending with `---\n`.
 */
export function writeFrontmatter(data) {
  const keys = [
    ...B_PLUS_KEYS.filter((key) => key in data),
    ...Object.keys(data).filter((key) => !B_PLUS_KEYS.includes(key)),
  ].filter((key) => data[key] !== undefined);
  return ['---', ...keys.map((key) => formatEntry(key, data[key])), '---', ''].join('\n');
}

/** `[a, b]` flow text for a list value, as stored in the `tags` column. */
export function formatFlowList(items) {
  return `[${items.map((item) => formatScalar(item, true)).join(', ')}]`;
}

/** @returns {{data: Record<string, any>, body: string, raw: string|null}} Parsed frontmatter. */
export function readFrontmatter(content) {
  const { data, body, raw } = parseFrontmatter(content);
  return { data, body, raw };
}

/**
 * Insert `id` as a frontmatter key, additive-only: never touches an existing
 * key, never reassigns an existing id. A no-op (returns false) when `id` is
 * already present.
 * @returns {boolean} Whether the file was actually written.
 */
export function writeAdditiveId(file, id) {
  const content = normalizeText(fs.readFileSync(file, 'utf8'));
  const { data, raw } = readFrontmatter(content);
  if (data.id) return false;
  const next =
    raw === null
      ? `---\nid: ${id}\n---\n\n${content}`
      : content.replace(FRONTMATTER, () =>
          raw ? `---\nid: ${id}\n${raw}\n---\n` : `---\nid: ${id}\n---\n`
        );
  atomicWrite(file, next);
  return true;
}

/** @returns {string|null} The text of the doc's first `# ` heading, or null if absent. */
export function firstHeading(body) {
  const lines = body.split('\n');
  const fenced = fencedLines(lines);
  const line = lines.find((text, i) => !fenced[i] && /^#\s+\S/.test(text));
  return line ? line.replace(/^#\s+/, '').trim() : null;
}

/**
 * Read `<docsRoot>/.ogignore`: one project-relative path prefix per line
 * (`docs/vendor/`, `docs/agents/issue-tracker.md`), `#` comments allowed.
 * Docs matching a prefix are never indexed and never receive a frontmatter `id`,
 * for files under `docs/` that another tool owns. Empty when the file is absent.
 * @returns {string[]} POSIX prefixes relative to the project root
 */
export function readIgnoreList(docsRoot) {
  const file = path.join(docsRoot, '.ogignore');
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, ''));
}

/** OKF reserves these basenames; OG never indexes or writes them (except `docs/index.md`). */
const RESERVED_BASENAMES = new Set(['index.md', 'log.md']);

/** The VitePress home: the one `index.md` that is an ordinary in-scope doc. */
export const DOCS_HOME = 'docs/index.md';

/**
 * The OG scope predicate, applied at every write path. Rules run in order and
 * the first failing rule wins; they are built in and have no override. A pure
 * string check, so it gives the same answer on every file system.
 * @param {string} relPath Project-relative path, POSIX separators.
 * @param {string[]} ignore `.ogignore` prefixes (`readIgnoreList`).
 * @returns {{ok: true}|{ok: false, rule: string, message: string}}
 */
export function inScope(relPath, ignore = []) {
  const rel = relPath.replace(/\\/g, '/').replace(/^\.\//, '');
  const fail = (rule, why) => ({
    ok: false,
    rule,
    message: `Out of scope [${rule}]: ${rel} ${why}`,
  });
  if (!rel.startsWith('docs/') || rel.split('/').includes('..'))
    return fail('outside-docs', 'is not under docs/');
  if (rel.startsWith('docs/.og/')) return fail('og-internal', 'is inside the OG tool folder');
  if (RESERVED_BASENAMES.has(path.posix.basename(rel).toLowerCase()) && rel !== DOCS_HOME)
    return fail('reserved-basename', 'is an OKF-reserved file (index.md, log.md)');
  const prefix = ignore.find((p) => rel === p || rel.startsWith(p + '/'));
  if (prefix) return fail('ogignore', `matches .ogignore prefix ${prefix}`);
  return { ok: true };
}

/** Recursively list every `.md` file under `root` (the `docs/` folder), skipping
 * only `docs/.og/`. Scope is not applied; see `listMarkdownFiles`. */
export function walkMarkdownFiles(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (path.relative(root, full) === '.og') continue;
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
    }
  };
  walk(root);
  return out;
}

/** Every in-scope `.md` file under `root` (the `docs/` folder), per `inScope`
 * with `ignore` (project-relative POSIX prefixes, see `readIgnoreList`).
 * Out-of-scope files are skipped silently. Empty if `root` is absent. */
export function listMarkdownFiles(root, ignore = []) {
  const project = path.dirname(root);
  return walkMarkdownFiles(root).filter(
    (full) => inScope(toPosixRelative(project, full), ignore).ok
  );
}

const BULLET = /^\s*[*-]\s+\[([^\]]*)\]\(([^)\s]+)\)(?:\s+-\s+(.*?))?\s*$/;
const HEADING = /^#{1,6}\s/;

/** @returns {boolean} Whether `line` is a link-only bullet (`* [Title](url)`, optionally ` - text`). */
export function isLinkBullet(line) {
  return BULLET.test(line);
}

/** @returns {boolean} Whether `line` is a markdown heading. */
export function isHeading(line) {
  return HEADING.test(line);
}

const FENCE = /^ {0,3}(`{3,}|~{3,})/;

/**
 * Mark the lines that sit inside a fenced code block, fence lines included. A fence
 * closes on a line of the same character at least as long as the opener; an
 * unclosed fence runs to the end.
 * @param {string[]} lines
 * @returns {boolean[]} One entry per line: `true` when it is code, not markdown.
 */
export function fencedLines(lines) {
  let open = null;
  return lines.map((line) => {
    const match = line.match(FENCE);
    if (open === null) {
      const info = match ? line.slice(match[0].length) : '';
      if (match && !(match[1][0] === '`' && info.includes('`'))) open = match[1];
      return open !== null;
    }
    if (
      match &&
      match[1][0] === open[0] &&
      match[1].length >= open.length &&
      !line.slice(match[0].length).trim()
    )
      open = null;
    return true;
  });
}

/** Split normalized content into its raw frontmatter block (with delimiters, or '') and the rest. */
export function splitFrontmatter(content) {
  const text = normalizeText(content);
  const match = text.match(FRONTMATTER);
  return match ? { block: match[0], body: text.slice(match[0].length) } : { block: '', body: text };
}

/** @returns {{title: string, url: string, text: string|null}[]} The link bullets of an `index.md` body. */
export function parseIndexBullets(body) {
  const lines = normalizeText(body).split('\n');
  const fenced = fencedLines(lines);
  return lines
    .map((line, i) => !fenced[i] && line.match(BULLET))
    .filter(Boolean)
    .map(([, title, url, text]) => ({ title, url, text: text ?? null }));
}

/** An `index.md` body is content-bearing when it holds anything but headings,
 * blank lines and link-only bullets (`* [Title](url)`, optionally ` - text`). */
export function isContentBearing(body) {
  return normalizeText(body)
    .split('\n')
    .some((line) => line.trim() && !HEADING.test(line) && !BULLET.test(line));
}

/**
 * Resolve a file-relative markdown link to an absolute path, or null for a
 * link that is not file-relative (external, site-absolute, anchor-only).
 * @param {string} fromFile Absolute path of the file holding the link.
 * @param {string} url
 */
export function resolveLink(fromFile, url) {
  if (/^([a-z]+:|\/|#)/i.test(url)) return null;
  let target = url.replace(/[#?].*$/, '');
  try {
    target = decodeURIComponent(target);
  } catch {
    // Keep the raw text when it is not valid percent-encoding.
  }
  return target ? path.resolve(path.dirname(fromFile), target) : null;
}

/** @returns {boolean} Whether a resolved link target exists as a page (file, `.md` file or folder index). */
export function linkTargetExists(absTarget) {
  if (fs.existsSync(absTarget)) return true;
  return fs.existsSync(absTarget + '.md');
}

/** `name` as a file-relative URL segment (spaces percent-encoded, as writers link). */
export function encodeLinkPath(relPath) {
  return relPath
    .split('/')
    .map((segment) =>
      encodeURIComponent(segment).replace(/%2F/g, '/').replace(/\(/g, '%28').replace(/\)/g, '%29')
    )
    .join('/');
}

/** @returns {string} `file`'s path relative to `dir`, POSIX-separated. */
export function toPosixRelative(dir, file) {
  return path.relative(dir, file).split(path.sep).join('/');
}

/**
 * Parse a frontmatter `keywords:` value into normalized tokens — accepts
 * either YAML flow-sequence style (`[a, b]`) or a bare comma list (`a, b`),
 * since `readFrontmatter()` stores the raw string as written, unparsed.
 * @param {string|null} raw
 * @returns {string[]} Lowercased, trimmed, deduplicated; empty if `raw` is null/empty.
 */
export function parseKeywords(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) raw = raw.join(',');
  const stripped = raw.trim().replace(/^\[/, '').replace(/\]$/, '');
  return [
    ...new Set(
      stripped
        .split(',')
        .map((word) => word.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
}
