import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test as base, expect, type Page } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ORIGIN = 'https://dataart.github.io';
export const BASE_PATH = '/artisyn-implementation-harness';
export const SITE = `${ORIGIN}${BASE_PATH}`;

const OUT_DIR = path.resolve(__dirname, '..', 'out');
const DOCS_INDEX_FIXTURE = path.resolve(__dirname, 'fixtures', 'docs-agent-index.json');

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

/** Absolute production URL for a site path such as '/get-started/'. */
export const url = (sitePath: string) => `${SITE}${sitePath}`;

const isFile = (p: string) => fs.existsSync(p) && fs.statSync(p).isFile();
const isDir = (p: string) => fs.existsSync(p) && fs.statSync(p).isDirectory();

type Served = { status: number; file?: string; location?: string; contentType?: string };

/** GitHub Pages rules for the project site, served from out/. */
function resolve(sitePath: string): Served {
  if (sitePath === '/docs/agent-index.json')
    return { status: 200, file: DOCS_INDEX_FIXTURE, contentType: CONTENT_TYPES['.json'] };

  const notFound: Served = { status: 404, file: path.join(OUT_DIR, '404.html') };
  if (sitePath.startsWith('/docs/') || sitePath === '/docs') return notFound;

  const target = path.join(OUT_DIR, decodeURIComponent(sitePath));
  if (!target.startsWith(OUT_DIR)) return notFound;

  if (sitePath.endsWith('/')) {
    const index = path.join(target, 'index.html');
    return isFile(index) ? { status: 200, file: index } : notFound;
  }
  if (isFile(target)) return { status: 200, file: target };
  if (isDir(target)) return { status: 301, location: `${BASE_PATH}${sitePath}/` };
  return notFound;
}

export type PageReport = {
  cspViolations: string[];
  consoleErrors: string[];
  pageErrors: string[];
  requests: string[];
};

async function installPagesEmulation(page: Page, report: PageReport) {
  if (!isFile(path.join(OUT_DIR, 'index.html')))
    throw new Error(
      `apps/web-explorer/out/index.html does not exist; run web-explorer:build first`
    );

  await page.addInitScript(() => {
    const w = window as unknown as { __cspViolations: string[] };
    w.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      w.__cspViolations.push(`${e.violatedDirective} blocked ${e.blockedURI || 'inline'}`);
    });
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error' || text.startsWith('Refused to')) report.consoleErrors.push(text);
  });
  page.on('pageerror', (err) => report.pageErrors.push(err.message));
  page.on('request', (req) => report.requests.push(req.url()));

  await page.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url());
    const inSite =
      requestUrl.origin === ORIGIN &&
      (requestUrl.pathname === BASE_PATH || requestUrl.pathname.startsWith(`${BASE_PATH}/`));
    if (!inSite) return route.abort('blockedbyclient');

    const sitePath = requestUrl.pathname.slice(BASE_PATH.length) || '';
    if (sitePath === '')
      return route.fulfill({ status: 301, headers: { location: `${BASE_PATH}/` } });

    const served = resolve(sitePath);
    if (served.location)
      return route.fulfill({ status: served.status, headers: { location: served.location } });
    const file = served.file!;
    const contentType =
      served.contentType ?? CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream';
    return route.fulfill({
      status: served.status,
      headers: { 'content-type': contentType },
      body: fs.readFileSync(file),
    });
  });
}

/** Reads the CSP violations the init script recorded on the current document. */
export async function cspViolations(page: Page, report: PageReport): Promise<string[]> {
  const inPage = await page
    .evaluate(() => (window as unknown as { __cspViolations?: string[] }).__cspViolations ?? [])
    .catch(() => [] as string[]);
  return [...report.cspViolations, ...inPage];
}

export const test = base.extend<{ report: PageReport }>({
  // auto: every test runs against out/, never the live site
  report: [
    async ({ page }, use) => {
      const report: PageReport = {
        cspViolations: [],
        consoleErrors: [],
        pageErrors: [],
        requests: [],
      };
      await installPagesEmulation(page, report);
      await use(report);
    },
    { auto: true },
  ],
});

export { expect };
export const outDir = OUT_DIR;
