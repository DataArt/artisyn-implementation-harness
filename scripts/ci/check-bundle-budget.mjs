// Fails loudly if the entry chunk(s) index.html actually references on
// initial load exceed a fixed byte budget. Called as the last step of
// apps/web-explorer's build. Deliberately scoped to the entry chunks, not
// every file under dist/: lazy-loaded routes (e.g. /inside-the-loop, split
// via React.lazy) ship their own separate chunks that a first-time visitor
// to "/" never downloads, and the budget's whole purpose is to keep that
// first visit light — summing the whole dist/ tree would wrongly charge
// Home for a route it never loads.
import fs from 'node:fs';
import path from 'node:path';

const BUDGET_BYTES = 600 * 1024; // 600 KB, raw (uncompressed) JS+CSS combined

const distArg = process.argv[2];
if (!distArg) {
  console.error('check-bundle-budget: usage: node check-bundle-budget.mjs <dist-dir>');
  process.exit(1);
}

const distDir = path.resolve(distArg);
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error(`check-bundle-budget: ${indexPath} does not exist`);
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');
const refs = new Set();
for (const m of html.matchAll(/(?:src|href)="(\/[^"]+\.(?:js|css))"/g)) refs.add(m[1]);

if (!refs.size) {
  console.error(`check-bundle-budget: no entry <script src> or <link href> found in ${indexPath}`);
  process.exit(1);
}

let totalBytes = 0;
for (const ref of refs) {
  // index.html's refs are base-prefixed absolute paths (e.g.
  // /artisyn-implementation-harness/assets/index-X.js) — strip everything
  // up to and including the last "/assets/" segment to resolve them against
  // dist/, since the configured base prefix isn't known here.
  const assetsIdx = ref.lastIndexOf('/assets/');
  const relPath = assetsIdx === -1 ? ref.replace(/^\/+/, '') : ref.slice(assetsIdx + 1);
  const full = path.join(distDir, relPath);
  if (!fs.existsSync(full)) {
    console.error(`check-bundle-budget: referenced entry file not found: ${full}`);
    process.exit(1);
  }
  totalBytes += fs.statSync(full).size;
}

console.log(
  `check-bundle-budget: ${refs.size} entry file(s), ${totalBytes} bytes total (budget: ${BUDGET_BYTES} bytes)`
);

if (totalBytes > BUDGET_BYTES) {
  console.error(
    `check-bundle-budget: ${totalBytes} bytes exceeds the ${BUDGET_BYTES}-byte budget for ${distDir}`
  );
  process.exit(1);
}
