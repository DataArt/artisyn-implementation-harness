import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages project-site URL shape: https://dataart.github.io/artisyn-implementation-harness/
// Web Explorer is served at the project-site root; Web Docs is composed alongside
// it under /docs/ by web-portal (see apps/web-docs/.vitepress/config.ts).
const base = '/artisyn-implementation-harness/';

const harnessVersion: string = JSON.parse(
  readFileSync(new URL('../../skills/implementation-harness/package.json', import.meta.url), 'utf8')
).version;

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  define: { __HARNESS_VERSION__: JSON.stringify(harnessVersion) },
  // Static SPA: no server or API required for the showcase demo.
});
