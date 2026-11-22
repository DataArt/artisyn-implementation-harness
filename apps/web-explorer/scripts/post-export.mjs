// Post-export step (runs inside web-explorer:build, right after `next build`). Gives every
// exported HTML page its own <meta http-equiv="Content-Security-Policy"> with the SHA-256
// hashes of that page's inline scripts (GitHub Pages sends no response headers, so the
// meta tag is the only policy channel), and adds the landing's JSON-LD and the legacy
// hash-redirect <script src>. `--resign` re-signs a copy for another origin (preview).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse, serialize } from 'parse5';

// ---------- tree helpers ----------

const attr = (node, name) => node.attrs?.find((a) => a.name === name)?.value;

function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
  if (node.content) walk(node.content, visit);
}

function find(node, predicate) {
  let found;
  walk(node, (n) => {
    if (!found && predicate(n)) found = n;
  });
  return found;
}

function element(tagName, attrs, parentNode, text) {
  const node = {
    nodeName: tagName,
    tagName,
    attrs: Object.entries(attrs).map(([name, value]) => ({ name, value })),
    namespaceURI: 'http://www.w3.org/1999/xhtml',
    childNodes: [],
    parentNode,
  };
  if (text !== undefined)
    node.childNodes.push({ nodeName: '#text', value: text, parentNode: node });
  return node;
}

function insertAt(parent, index, node) {
  node.parentNode = parent;
  parent.childNodes.splice(index, 0, node);
}

function remove(node) {
  const siblings = node.parentNode.childNodes;
  siblings.splice(siblings.indexOf(node), 1);
}

const scriptText = (node) => node.childNodes.map((c) => c.value ?? '').join('');

const JS_TYPES = new Set([
  '',
  'module',
  'text/javascript',
  'application/javascript',
  'text/ecmascript',
  'application/ecmascript',
]);

/** Inline scripts the browser executes, so the CSP must hash them; JSON data blocks are not. */
export const isInlineExecutable = (node) =>
  node.nodeName === 'script' &&
  attr(node, 'src') === undefined &&
  JS_TYPES.has((attr(node, 'type') ?? '').trim().toLowerCase());

export const hashScript = (text) =>
  `'sha256-${crypto.createHash('sha256').update(text, 'utf8').digest('base64')}'`;

export function buildPolicy({ hashes, site, upgradeInsecure }) {
  const s = `${site}/`;
  // Lighthouse's robots-txt and llms-txt audits fetch these origin-root files under the page
  // policy; exact-path sources allow only them, nothing else outside the project path (RF-036).
  const { origin } = new URL(site);
  const directives = [
    "default-src 'none'",
    `script-src ${[...hashes, s].join(' ')}`,
    `style-src ${s} 'unsafe-inline'`,
    `img-src ${s}`,
    `font-src ${s}`,
    `connect-src ${s} ${origin}/robots.txt ${origin}/llms.txt`,
    `manifest-src ${s}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ];
  if (upgradeInsecure) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

const isCspMeta = (n) =>
  n.nodeName === 'meta' &&
  (attr(n, 'http-equiv') ?? '').toLowerCase() === 'content-security-policy';
const isOriginTrialMeta = (n) =>
  n.nodeName === 'meta' && (attr(n, 'http-equiv') ?? '').toLowerCase() === 'origin-trial';
const isJsonLd = (n) => n.nodeName === 'script' && attr(n, 'type') === 'application/ld+json';

/** JSON for a <script> body: `<` escaped so the text can never close the element. */
export const jsonForScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

/**
 * Signs one page. `root` adds the landing's JSON-LD and redirect script; `jsonLd` adds a
 * page's own JSON-LD. With `resign`, earlier injections are removed first.
 */
export function signPage(
  html,
  { site, upgradeInsecure = true, root, jsonLd, originTrialToken, resign = false }
) {
  const document = parse(html);
  const head = find(document, (n) => n.nodeName === 'head');
  if (!head) throw new Error('post-export: no <head>');
  const charset = head.childNodes.find(
    (n) => n.nodeName === 'meta' && attr(n, 'charset') !== undefined
  );
  if (!charset) throw new Error('post-export: no <meta charset> in <head>');

  const redirectSrc = root?.redirectSrc;
  const pageJsonLd = root?.jsonLd ?? jsonLd;
  const stale = [];
  walk(document, (n) => {
    if (
      isCspMeta(n) ||
      isOriginTrialMeta(n) ||
      isJsonLd(n) ||
      (n.nodeName === 'script' && redirectSrc && attr(n, 'src') === redirectSrc)
    )
      stale.push(n);
  });
  if (!resign && stale.some(isCspMeta))
    throw new Error('post-export: page already has a Content-Security-Policy meta');
  if (resign) stale.forEach(remove);

  if (pageJsonLd !== undefined || redirectSrc) {
    const firstScript = head.childNodes.findIndex((n) => n.nodeName === 'script');
    let at = firstScript === -1 ? head.childNodes.length : firstScript;
    if (pageJsonLd !== undefined)
      insertAt(
        head,
        at++,
        element('script', { type: 'application/ld+json' }, head, jsonForScript(pageJsonLd))
      );
    if (redirectSrc) insertAt(head, at, element('script', { src: redirectSrc }, head, ''));
  }

  const hashes = [];
  walk(document, (n) => {
    if (isInlineExecutable(n)) {
      const h = hashScript(scriptText(n));
      if (!hashes.includes(h)) hashes.push(h);
    }
  });

  const at = head.childNodes.indexOf(charset) + 1;
  insertAt(
    head,
    at,
    element(
      'meta',
      {
        'http-equiv': 'Content-Security-Policy',
        content: buildPolicy({ hashes, site, upgradeInsecure }),
      },
      head
    )
  );
  if (originTrialToken)
    insertAt(
      head,
      at + 1,
      element('meta', { 'http-equiv': 'origin-trial', content: originTrialToken }, head)
    );

  return serialize(document);
}

// ---------- agent content index ----------

const SKIP = new Set(['header', 'footer', 'nav', 'script', 'style', 'svg', 'template', 'noscript']);

/** Headings (h1–h3) and visible text of a page's <main>, for the agent content index. */
export function extractPageContent(html) {
  const main = find(parse(html), (n) => n.nodeName === 'main');
  const headings = [];
  const parts = [];
  const collect = (node, sink) => {
    if (SKIP.has(node.nodeName)) return;
    if (node.nodeName === '#text') sink.push(node.value);
    for (const child of node.childNodes ?? []) collect(child, sink);
  };
  const clean = (text) => text.replace(/\s+/g, ' ').trim();
  if (main) {
    walk(main, (n) => {
      if (n.nodeName === 'h1' || n.nodeName === 'h2' || n.nodeName === 'h3') {
        const sink = [];
        collect(n, sink);
        const text = clean(sink.join(' '));
        if (text) headings.push(text);
      }
    });
    collect(main, parts);
  }
  return { headings, text: clean(parts.join(' ')) };
}

// ---------- CLI ----------

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? htmlFiles(p) : e.name.endsWith('.html') ? [p] : [];
  });
}

/**
 * schema.org JSON-LD for one registry page: the landing's WebSite + SoftwareSourceCode,
 * WebPage + BreadcrumbList under /inside-the-loop/, WebPage elsewhere, nothing when noindex.
 */
export function pageJsonLd(entry, { siteUrl, routes, repoUrl }) {
  if (!entry.index) return undefined;
  const url = `${siteUrl}${entry.path}`;
  const context = 'https://schema.org';
  if (entry.path === '/') {
    return {
      '@context': context,
      '@graph': [
        { '@type': 'WebSite', name: entry.title, description: entry.description, url },
        {
          '@type': 'SoftwareSourceCode',
          name: 'Artisyn Implementation Harness',
          description: entry.description,
          url,
          codeRepository: repoUrl,
          programmingLanguage: ['Markdown', 'JavaScript'],
          license: 'https://spdx.org/licenses/MIT.html',
        },
      ],
    };
  }
  const webPage = {
    '@type': 'WebPage',
    name: entry.title,
    description: entry.description,
    url,
    isPartOf: { '@type': 'WebSite', url: `${siteUrl}/` },
  };
  if (!entry.path.startsWith('/inside-the-loop/')) return { '@context': context, ...webPage };

  const trail = [
    '/',
    '/inside-the-loop/',
    ...(entry.path === '/inside-the-loop/' ? [] : [entry.path]),
  ];
  const byPath = new Map(routes.map((r) => [r.path, r]));
  const crumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p === '/' ? 'Home' : byPath.get(p).title,
      item: `${siteUrl}${p}`,
    })),
  };
  return { '@context': context, '@graph': [webPage, crumbs] };
}

/** Registry path for an exported file: index.html → '/', a/b/index.html → '/a/b/'. */
const routePathOf = (relative) =>
  relative === 'index.html'
    ? '/'
    : relative.endsWith('/index.html')
      ? `/${relative.slice(0, -'index.html'.length)}`
      : undefined;

async function main() {
  const args = process.argv.slice(2);
  const resign = args.includes('--resign');
  const originArg = args.indexOf('--origin');
  const { basePath, siteOrigin } = await import('../src/site.ts');
  const { routes } = await import('../src/routes.ts');
  const { repoUrl } = await import('../src/env.ts');
  const origin = originArg === -1 ? siteOrigin : args[originArg + 1];
  const dir = path.resolve(
    args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--origin') ?? 'out'
  );
  const site = `${origin}${basePath}`;
  const ctx = { siteUrl: `${siteOrigin}${basePath}`, routes, repoUrl };
  const redirectSrc = `${basePath}/legacy-hash-redirect.js`;
  // The WebMCP origin-trial token is bound to the production origin; a re-signed local copy gets none.
  const originTrialToken = resign ? undefined : process.env.WEBMCP_ORIGIN_TRIAL_TOKEN || undefined;

  const files = htmlFiles(dir);
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const routePath = routePathOf(path.relative(dir, file).split(path.sep).join('/'));
    const entry = routes.find((r) => r.path === routePath);
    const jsonLd = entry ? pageJsonLd(entry, ctx) : undefined;
    const root = routePath === '/' ? { jsonLd, redirectSrc } : undefined;
    try {
      fs.writeFileSync(
        file,
        signPage(html, {
          site,
          upgradeInsecure: origin.startsWith('https:'),
          root,
          jsonLd,
          resign,
          originTrialToken,
        })
      );
    } catch (err) {
      throw new Error(`${path.relative(dir, file)}: ${err.message}`, { cause: err });
    }
  }
  if (!resign) {
    const entries = routes
      .filter((r) => r.index)
      .map((r) => {
        const file = path.join(dir, r.path, 'index.html');
        const { headings, text } = extractPageContent(fs.readFileSync(file, 'utf8'));
        return {
          path: r.path,
          url: `${ctx.siteUrl}${r.path}`,
          title: r.title,
          description: r.description,
          headings,
          text,
        };
      });
    fs.writeFileSync(
      path.join(dir, 'agent-index.json'),
      JSON.stringify({ source: 'site', entries })
    );
  }
  console.log(
    `post-export: signed ${files.length} page(s) for ${site}/${resign ? ' (re-signed)' : '; wrote agent-index.json'}`
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
