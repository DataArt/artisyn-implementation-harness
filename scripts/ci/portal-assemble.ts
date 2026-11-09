// Assembles web-explorer's and web-docs's independent static builds into one
// deployable artifact tree at apps/web-portal/dist/, then asserts both entry
// points exist so a copy bug fails the Nx build target loudly instead of
// shipping a partial deploy.
import fs from 'node:fs';
import path from 'node:path';

const explorerDist = path.resolve('apps/web-explorer/dist');
const docsDist = path.resolve('apps/web-docs/.vitepress/dist');
const portalDist = path.resolve('apps/web-portal/dist');

fs.rmSync(portalDist, { recursive: true, force: true });
fs.mkdirSync(portalDist, { recursive: true });

fs.cpSync(explorerDist, portalDist, { recursive: true });
fs.cpSync(docsDist, path.join(portalDist, 'docs'), { recursive: true });

const rootIndex = path.join(portalDist, 'index.html');
const docsIndex = path.join(portalDist, 'docs', 'index.html');

const missing = [];
if (!fs.existsSync(rootIndex)) missing.push(rootIndex);
if (!fs.existsSync(docsIndex)) missing.push(docsIndex);

if (missing.length) {
  throw new Error(`portal-assemble: missing expected entry point(s): ${missing.join(', ')}`);
}

console.log(`portal-assemble: ${rootIndex} and ${docsIndex} both present.`);
