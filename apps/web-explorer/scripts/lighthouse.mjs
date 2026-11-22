// web-explorer:lighthouse — runs Lighthouse (performance, SEO, agentic browsing) on every route
// of the exported site, served locally the way GitHub Pages serves it, with WebMCP enabled.
// Fails on SEO or agent-readiness regressions; performance is machine-dependent, so it is only
// asserted when --min-performance is given.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SEO_EXEMPT_WHEN_NOINDEX = new Set(['is-crawlable']);

const failedAudits = (lhr, category) =>
  (lhr.categories[category]?.auditRefs ?? [])
    .map((ref) => [ref.id, lhr.audits[ref.id]])
    .filter(
      ([, a]) =>
        a &&
        a.score === 0 &&
        !['notApplicable', 'manual', 'informative'].includes(a.scoreDisplayMode)
    )
    .map(([id]) => id);

const registeredTools = (lhr) =>
  JSON.stringify(lhr.audits['webmcp-registered-tools']?.details ?? {}).match(/"tool":"[^"]+"/g)
    ?.length ?? 0;

/** Assertion violations for one route's Lighthouse result; an empty list passes. */
export function evaluate(lhr, route, { minPerformance } = {}) {
  const violations = [];
  const seoFailures = failedAudits(lhr, 'seo').filter(
    (id) => route.index || !SEO_EXEMPT_WHEN_NOINDEX.has(id)
  );
  if (route.index && lhr.categories.seo.score !== 1)
    violations.push(`SEO score ${Math.round(lhr.categories.seo.score * 100)}`);
  for (const id of seoFailures) violations.push(`SEO audit failed: ${id}`);
  for (const id of failedAudits(lhr, 'agentic-browsing'))
    violations.push(`agentic-browsing audit failed: ${id}`);
  if (registeredTools(lhr) === 0) violations.push('webmcp-registered-tools lists no tools');
  const performance = Math.round((lhr.categories.performance?.score ?? 0) * 100);
  if (minPerformance !== undefined && performance < minPerformance)
    violations.push(`performance ${performance} below ${minPerformance}`);
  return violations;
}

function option(args, name) {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
}

async function main() {
  const args = process.argv.slice(2);
  const { basePath } = await import('../src/site.ts');
  const { routes: registry } = await import('../src/routes.ts');
  const { createPreviewServer } = await import('./serve-preview.mjs');
  const { default: lighthouse } = await import('lighthouse');
  const chromeLauncher = await import('chrome-launcher');
  const { chromium } = await import('@playwright/test');

  const only = option(args, '--routes')?.split(',');
  const minPerformance = option(args, '--min-performance')
    ? Number(option(args, '--min-performance'))
    : undefined;
  const routes = only ? registry.filter((r) => only.includes(r.path)) : registry;
  const reportDir = path.resolve('lighthouse-report');
  const stage = path.resolve('.lighthouse');

  // A copy of out/ re-signed for the local origin; out/ itself is never touched.
  const server = createPreviewServer(stage);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const origin = `http://localhost:${port}`;
  fs.rmSync(stage, { recursive: true, force: true });
  fs.mkdirSync(stage, { recursive: true });
  fs.cpSync('out', path.join(stage, basePath.slice(1)), { recursive: true });
  execFileSync(
    'node',
    [
      'scripts/post-export.mjs',
      '--resign',
      '--origin',
      origin,
      path.join(stage, basePath.slice(1)),
    ],
    { stdio: 'ignore' }
  );

  fs.rmSync(reportDir, { recursive: true, force: true });
  fs.mkdirSync(reportDir, { recursive: true });
  const chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    // Linux runners (Ubuntu 24.04) block the user namespaces Chrome's sandbox needs, so it
    // exits at launch; Playwright launches without the sandbox on Linux for the same reason.
    chromeFlags: [
      '--headless=new',
      '--enable-features=WebMCP',
      ...(process.platform === 'linux' ? ['--no-sandbox'] : []),
    ],
  });

  const rows = [];
  try {
    for (const route of routes) {
      const { lhr } = await lighthouse(`${origin}${basePath}${route.path}`, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'seo', 'agentic-browsing'],
      });
      const file = `${route.path.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home'}.json`;
      fs.writeFileSync(path.join(reportDir, file), JSON.stringify(lhr));
      rows.push({
        route: route.path,
        performance: Math.round(lhr.categories.performance.score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
        lcp: lhr.audits['largest-contentful-paint'].displayValue,
        cls: lhr.audits['cumulative-layout-shift'].displayValue,
        tbt: lhr.audits['total-blocking-time'].displayValue,
        tools: registeredTools(lhr),
        violations: evaluate(lhr, route, { minPerformance }),
      });
    }
  } finally {
    await chrome.kill();
    server.close();
    fs.rmSync(stage, { recursive: true, force: true });
  }

  fs.writeFileSync(
    path.join(reportDir, 'summary.json'),
    JSON.stringify({ lighthouse: '13.4.1', origin, rows }, null, 2)
  );
  console.table(
    rows.map(({ violations, ...row }) => ({ ...row, ok: violations.length === 0 ? 'yes' : 'NO' }))
  );
  const failing = rows.filter((r) => r.violations.length);
  for (const r of failing) console.error(`lighthouse: ${r.route}: ${r.violations.join('; ')}`);
  if (failing.length) process.exit(1);
  console.log(
    `lighthouse: ${rows.length} route(s) pass; reports in ${path.relative(process.cwd(), reportDir)}/`
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
