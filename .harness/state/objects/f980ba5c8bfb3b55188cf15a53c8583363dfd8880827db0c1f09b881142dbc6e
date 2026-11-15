/** Read the canonical agent frontmatter format and render it into each
 * provider's native agent file (Claude Markdown frontmatter, Codex TOML).
 */
import { AGENT_FRONTMATTER_FIELDS, AGENT_WRITE_TOOLS, SAFE_NAME_RE } from './constants.mjs';

/** Restricted frontmatter reader for the canonical agent format; unknown fields
 * fail rather than silently losing provider-specific behavior. Supports folded
 * (indented-continuation) descriptions.
 */
export function agentFields(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('Agent requires YAML frontmatter');
  const fields = {};
  let key;
  for (const line of match[1].split('\n')) {
    if (!line.trim()) continue;
    const field = line.match(/^([a-z_]+):\s*(.*)$/);
    if (field) {
      key = field[1];
      if (!AGENT_FRONTMATTER_FIELDS.includes(key))
        throw new Error(`Unsupported agent field: ${key}`);
      if (Object.hasOwn(fields, key)) throw new Error(`Duplicate agent field: ${key}`);
      fields[key] = field[2] === '>' ? '' : field[2];
    } else if (key === 'description' && /^\s/.test(line)) fields.description += ` ${line.trim()}`;
    else if (key !== 'metadata') throw new Error(`Unsupported agent frontmatter: ${line}`);
  }
  if (!fields.name || !fields.description) throw new Error('Agent name and description required');
  return { ...fields, body: match[2].trim() };
}

// JSON.stringify passes the U+2028/U+2029 line/paragraph separators through
// literally, which TOML's basic strings don't allow — escape them the way
// JSON.stringify itself would if it treated them like other control characters.
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

function tomlValue(v) {
  if (typeof v === 'string') {
    return JSON.stringify(v)
      .split(LINE_SEPARATOR)
      .join('\\u2028')
      .split(PARAGRAPH_SEPARATOR)
      .join('\\u2029');
  }
  if (typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v))) return String(v);
  if (Array.isArray(v)) return `[${v.map(tomlValue).join(', ')}]`;
  throw new Error('Unsupported TOML value');
}

/** Render a plain object as TOML, recursing into nested tables under `prefix`. */
export function toml(object, prefix = []) {
  const lines = [];
  if (prefix.length) lines.push(`[${prefix.map((k) => JSON.stringify(k)).join('.')}]`);
  const isTable = (v) => v && typeof v === 'object' && !Array.isArray(v);
  for (const [key, v] of Object.entries(object))
    if (!isTable(v)) lines.push(`${JSON.stringify(key)} = ${tomlValue(v)}`);
  for (const [key, v] of Object.entries(object))
    if (isTable(v)) lines.push('', toml(v, [...prefix, key]));
  return lines.join('\n') + '\n';
}

function renderClaudeAgent(text, fields, name) {
  const metadata = text.match(/^metadata:\s*\n((?:[ \t]+[^\n]*\n)*)/m)?.[1];
  return [
    '---',
    `name: ${name}`,
    `description: ${JSON.stringify(fields.description.trim())}`,
    ...(fields.tools ? [`tools: ${JSON.stringify(fields.tools)}`] : []),
    ...(fields.model ? [`model: ${JSON.stringify(fields.model)}`] : []),
    ...(metadata ? [`metadata:\n${metadata.trimEnd()}`] : []),
    '---',
    '',
    fields.body,
    '',
  ].join('\n');
}

function renderCodexAgent(fields, name) {
  const tools = (fields.tools ?? '').split(',').map((t) => t.trim());
  const writable = tools.some((t) => AGENT_WRITE_TOOLS.includes(t));
  return toml({
    name,
    description: fields.description.trim(),
    sandbox_mode: writable ? 'workspace-write' : 'read-only',
    developer_instructions: `${fields.body}\n\nRole tool scope: ${fields.tools || 'use only tools needed for this role'}. Respect the role's path and mutation limits. These instructions do not create a native per-tool allowlist. External writes require the role's stated authorization.`,
  });
}

/** Render a canonical agent TEMPLATE for `provider`, installed under `name`. */
export function renderAgent(text, provider, name) {
  const fields = agentFields(text);
  if (!SAFE_NAME_RE.test(name)) throw new Error('Invalid installed agent name');
  return provider === 'claude'
    ? renderClaudeAgent(text, fields, name)
    : renderCodexAgent(fields, name);
}
