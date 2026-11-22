// Fails the build when the JavaScript and CSS that the landing page references for
// first load exceed the gzip budget (NFR-19). Measured on out/index.html only: other
// routes ship their own chunks, which a first-time visitor to "/" never downloads.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';

// Provisional ceiling confirmed by the first measurement (see 2-report.md, Step 5).
export const CEILING_BYTES = 300 * 1024;

/** Gzip size of every `_next/static` JS and CSS file that `<outDir>/index.html` references. */
export function measure(outDir, basePath) {
  const indexPath = path.join(outDir, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  const prefix = `${basePath}/_next/static/`;
  const refs = new Set();
  for (const m of html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))(?:\?[^"]*)?"/g))
    if (m[1].startsWith(prefix)) refs.add(m[1]);
  if (!refs.size)
    throw new Error(`check-bundle-budget: no _next/static JS or CSS referenced in ${indexPath}`);

  const files = [...refs].map((ref) => {
    const file = path.join(outDir, ref.slice(basePath.length));
    if (!fs.existsSync(file))
      throw new Error(`check-bundle-budget: referenced file not found: ${file}`);
    const raw = fs.readFileSync(file);
    return { ref, rawBytes: raw.length, gzipBytes: zlib.gzipSync(raw).length };
  });
  return {
    files,
    rawBytes: files.reduce((sum, f) => sum + f.rawBytes, 0),
    gzipBytes: files.reduce((sum, f) => sum + f.gzipBytes, 0),
  };
}

export function checkBudget(outDir, { basePath, ceilingBytes = CEILING_BYTES }) {
  const result = measure(outDir, basePath);
  return { ...result, ceilingBytes, ok: result.gzipBytes <= ceilingBytes };
}

async function main() {
  const { basePath } = await import('../src/site.ts');
  const outDir = path.resolve(process.argv[2] ?? 'out');
  const ceilingBytes = process.env.BUNDLE_BUDGET_BYTES
    ? Number(process.env.BUNDLE_BUDGET_BYTES)
    : CEILING_BYTES;
  const result = checkBudget(outDir, { basePath, ceilingBytes });
  console.log(
    `check-bundle-budget: ${result.files.length} file(s) on /, ${result.gzipBytes} bytes gzip ` +
      `(${result.rawBytes} raw), budget ${result.ceilingBytes} bytes gzip`
  );
  if (!result.ok) {
    console.error(
      `check-bundle-budget: ${result.gzipBytes} bytes gzip exceeds the ${result.ceilingBytes}-byte budget`
    );
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
