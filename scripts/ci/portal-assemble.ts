// Assembles web-explorer's and web-docs's independent static builds into one
// deployable artifact tree at apps/web-portal/dist/, then asserts the entry points
// and the size limit so a copy bug fails the Nx build target loudly instead of
// shipping a partial deploy.
import fs from 'node:fs';
import path from 'node:path';

const explorerOut = path.resolve('apps/web-explorer/out');
const docsDist = path.resolve('apps/web-docs/.vitepress/dist');
const portalDist = path.resolve('apps/web-portal/dist');

// GitHub Pages publishes at most 1 GB; fail well before that (NFR-17).
const maxBytes = process.env.PORTAL_MAX_BYTES
  ? Number(process.env.PORTAL_MAX_BYTES)
  : 900 * 1024 * 1024;

if (fs.existsSync(path.join(explorerOut, 'docs'))) {
  throw new Error(
    `portal-assemble: ${path.join(explorerOut, 'docs')} exists; Web Explorer must not emit anything under docs/`
  );
}

fs.rmSync(portalDist, { recursive: true, force: true });
fs.mkdirSync(portalDist, { recursive: true });

fs.cpSync(explorerOut, portalDist, { recursive: true });
fs.cpSync(docsDist, path.join(portalDist, 'docs'), { recursive: true });

const required = ['index.html', '404.html', '.nojekyll', path.join('docs', 'index.html')];
const missing = required.map((p) => path.join(portalDist, p)).filter((p) => !fs.existsSync(p));
if (missing.length) {
  throw new Error(`portal-assemble: missing expected file(s): ${missing.join(', ')}`);
}

// The WebMCP search tool reads both indexes by URL at runtime.
for (const rel of ['agent-index.json', path.join('docs', 'agent-index.json')]) {
  const file = path.join(portalDist, rel);
  let entries: unknown;
  try {
    entries = JSON.parse(fs.readFileSync(file, 'utf8')).entries;
  } catch (err) {
    throw new Error(`portal-assemble: ${file} is missing or does not parse`, { cause: err });
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(`portal-assemble: ${file} has no entries`);
  }
  // The contract Web Explorer's tools read (src/agent/tools.ts AgentIndexEntry).
  const malformed = entries.findIndex(
    (e) =>
      !e ||
      ['path', 'url', 'title', 'text'].some((k) => typeof e[k] !== 'string' || !e[k]) ||
      typeof e.description !== 'string' ||
      !Array.isArray(e.headings)
  );
  if (malformed !== -1) {
    throw new Error(
      `portal-assemble: ${file} entry ${malformed} does not match the agent index contract`
    );
  }
}

function sizeOf(dir: string): number {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    total += entry.isDirectory() ? sizeOf(p) : fs.statSync(p).size;
  }
  return total;
}

const publishedBytes = sizeOf(portalDist);
if (publishedBytes > maxBytes) {
  throw new Error(
    `portal-assemble: published size ${publishedBytes} bytes exceeds the ${maxBytes}-byte limit`
  );
}

console.log(
  `portal-assemble: ${required.join(', ')} and both agent indexes present; published size ${publishedBytes} bytes (limit ${maxBytes}).`
);
