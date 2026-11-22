// Build gate over the exported site (runs inside web-explorer:build). Fails the build
// when a page's metadata is incomplete. Each check returns a list of error strings; an
// empty list means the check passed.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'parse5';
import { buildPolicy, hashScript, isInlineExecutable } from './post-export.mjs';

// ---------- HTML helpers ----------

const attr = (node, name) => node.attrs?.find((a) => a.name === name)?.value;

function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
  if (node.content) walk(node.content, visit);
}

function textOf(node) {
  let text = '';
  walk(node, (n) => {
    if (n.nodeName === '#text') text += n.value;
  });
  return text;
}

/** The head facts the gates need, from one parse. */
export function readHead(html) {
  const facts = { title: '', metaName: {}, metaProperty: {}, canonical: undefined };
  walk(parse(html), (n) => {
    if (n.nodeName === 'title') facts.title = textOf(n).trim();
    if (n.nodeName === 'meta') {
      const name = attr(n, 'name');
      const property = attr(n, 'property');
      if (name) facts.metaName[name] = attr(n, 'content') ?? '';
      if (property) facts.metaProperty[property] = attr(n, 'content') ?? '';
    }
    if (n.nodeName === 'link' && attr(n, 'rel') === 'canonical') facts.canonical = attr(n, 'href');
  });
  return facts;
}

// ---------- Metadata completeness ----------

const REFERRER = 'strict-origin-when-cross-origin';

/** Full metadata set for one route-registry page. */
export function checkMetadata(html, entry, { siteUrl, fileExists }) {
  const head = readHead(html);
  const errors = [];
  const expectedUrl = `${siteUrl}${entry.path}`;
  if (!head.title) errors.push('missing <title>');
  if (!head.metaName.description) errors.push('missing meta description');
  if (head.metaName.referrer !== REFERRER) errors.push(`meta referrer is not ${REFERRER}`);
  if (head.canonical !== expectedUrl)
    errors.push(`canonical is ${head.canonical ?? 'missing'}, expected ${expectedUrl}`);
  for (const p of ['og:title', 'og:description'])
    if (!head.metaProperty[p]) errors.push(`missing ${p}`);
  if (head.metaProperty['og:url'] !== expectedUrl)
    errors.push(`og:url is ${head.metaProperty['og:url'] ?? 'missing'}, expected ${expectedUrl}`);
  const image = head.metaProperty['og:image'];
  if (!image || !image.startsWith(`${siteUrl}/`))
    errors.push(`og:image is not an absolute URL under ${siteUrl}/: ${image ?? 'missing'}`);
  else if (!fileExists(image.slice(siteUrl.length)))
    errors.push(`og:image file missing from the export: ${image}`);
  if (head.metaName['twitter:card'] !== 'summary_large_image')
    errors.push('twitter:card is not summary_large_image');
  if (!head.metaName.keywords) errors.push('missing meta keywords');
  for (const p of ['og:image:width', 'og:image:height'])
    if (!/^\d+$/.test(head.metaProperty[p] ?? '')) errors.push(`missing or non-numeric ${p}`);
  if (!head.metaProperty['og:image:alt']) errors.push('missing og:image:alt');
  if (!head.metaName['twitter:image:alt']) errors.push('missing twitter:image:alt');
  if (!head.metaProperty['og:locale']) errors.push('missing og:locale');
  const noindex = /\bnoindex\b/.test(head.metaName.robots ?? '');
  if (!entry.index && !noindex) errors.push('noindex route without robots noindex');
  if (entry.index && noindex) errors.push('indexable route carries robots noindex');
  return errors;
}

/** 404.html is not a route: it needs title, description, referrer and noindex only. */
export function check404(html) {
  const head = readHead(html);
  const errors = [];
  if (!head.title) errors.push('missing <title>');
  if (!head.metaName.description) errors.push('missing meta description');
  if (head.metaName.referrer !== REFERRER) errors.push(`meta referrer is not ${REFERRER}`);
  if (!/\bnoindex\b/.test(head.metaName.robots ?? '')) errors.push('missing robots noindex');
  return errors;
}

/** sitemap.xml lists exactly the indexable routes, as absolute URLs. */
export function checkSitemap(xml, indexablePaths, siteUrl) {
  const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
  const listed = new Set(urls.map((u) => (u.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '').trim()));
  const expected = new Set(indexablePaths.map((p) => `${siteUrl}${p}`));
  const errors = [];
  for (const u of urls) {
    const loc = u.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
    const lastmod = u.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim();
    if (!lastmod || Number.isNaN(Date.parse(lastmod)) || !/^\d{4}-\d{2}-\d{2}/.test(lastmod))
      errors.push(`sitemap entry ${loc} has no ISO-8601 lastmod`);
  }
  for (const url of expected) if (!listed.has(url)) errors.push(`sitemap is missing ${url}`);
  for (const url of listed)
    if (!expected.has(url)) errors.push(`sitemap lists ${url}, which is not an indexable route`);
  return errors;
}

// ---------- llms.txt ----------

/** Lighthouse `llms-txt` rules (H1, a Markdown link, at least 50 characters) plus registry coverage. */
export function checkLlmsTxt(text, indexableUrls) {
  const errors = [];
  if (!/^\s*#\s+.+/m.test(text)) errors.push('no H1 line');
  if (!/\[.+\]\(.+\)/.test(text)) errors.push('no Markdown link');
  if (text.length < 50) errors.push(`only ${text.length} characters (at least 50)`);
  for (const url of indexableUrls)
    if (!text.includes(`](${url})`)) errors.push(`does not link ${url}`);
  for (const m of text.matchAll(/\]\(([^)]+)\)/g))
    if (/\/comic\/$/.test(m[1])) errors.push(`links the noindex page ${m[1]}`);
  return errors;
}

// ---------- Security: CSP placement, hash coverage, external URLs ----------

const isCspMeta = (n) =>
  n.nodeName === 'meta' &&
  (attr(n, 'http-equiv') ?? '').toLowerCase() === 'content-security-policy';
const preview = (text) => text.replace(/\s+/g, ' ').trim().slice(0, 80);
const LINK_RELS = new Set([
  'stylesheet',
  'preload',
  'modulepreload',
  'icon',
  'apple-touch-icon',
  'manifest',
]);

/** Every URL a page loads must stay under the project path (`<site>/`); img-src allows no data: URLs. */
/** Directive name -> set of sources, so policies compare regardless of source order. */
const directivesOf = (policy) =>
  new Map(
    policy
      .split(';')
      .map((d) => d.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...sources]) => [name, [...sources].sort().join(' ')])
  );

function policyDrift(actual, expected) {
  const [a, e] = [directivesOf(actual), directivesOf(expected)];
  const names = new Set([...a.keys(), ...e.keys()]);
  return [...names]
    .filter((name) => a.get(name) !== e.get(name))
    .map((name) =>
      !a.has(name)
        ? `policy is missing ${name}`
        : !e.has(name)
          ? `policy has unexpected ${name}`
          : `policy ${name} differs: "${a.get(name)}", expected "${e.get(name)}"`
    );
}

function urlOutside(value, site) {
  const v = value.trim();
  if (!v) return false;
  if (/^data:/i.test(v)) return true;
  if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(v)) return !v.startsWith(`${site}/`);
  if (v.startsWith('/')) return !v.startsWith(`${new URL(site).pathname}/`);
  return false;
}

export function checkSecurity(html, site) {
  const document = parse(html);
  const errors = [];
  const metas = [];
  const scripts = [];
  const urls = [];
  walk(document, (n) => {
    if (isCspMeta(n)) metas.push(n);
    if (n.nodeName === 'script') scripts.push(n);
    if (n.nodeName === 'script' && attr(n, 'src') !== undefined) urls.push(attr(n, 'src'));
    if (n.nodeName === 'img') {
      if (attr(n, 'src') !== undefined) urls.push(attr(n, 'src'));
      for (const part of (attr(n, 'srcset') ?? '').split(','))
        if (part.trim()) urls.push(part.trim().split(/\s+/)[0]);
    }
    if (n.nodeName === 'link' && (attr(n, 'rel') ?? '').split(/\s+/).some((r) => LINK_RELS.has(r)))
      urls.push(attr(n, 'href') ?? '');
    if (n.nodeName === 'style')
      for (const m of textOf(n).matchAll(/url\(\s*['"]?([^'")]+)/g)) urls.push(m[1]);
    for (const m of (attr(n, 'style') ?? '').matchAll(/url\(\s*['"]?([^'")]+)/g)) urls.push(m[1]);
  });

  if (metas.length !== 1) {
    errors.push(`expected exactly one CSP meta, found ${metas.length}`);
    return errors;
  }
  const meta = metas[0];
  const siblings = meta.parentNode.childNodes.filter(
    (c) => c.nodeName !== '#text' && c.nodeName !== '#comment'
  );
  const index = siblings.indexOf(meta);
  if (
    meta.parentNode.nodeName !== 'head' ||
    index < 1 ||
    attr(siblings[index - 1], 'charset') === undefined
  )
    errors.push('CSP meta is not immediately after <meta charset>');
  const firstScript = scripts[0];
  if (firstScript && meta.parentNode === firstScript.parentNode) {
    const all = meta.parentNode.childNodes;
    if (all.indexOf(firstScript) < all.indexOf(meta))
      errors.push('a <script> comes before the CSP meta');
  } else if (firstScript && firstScript.parentNode.nodeName === 'head') {
    errors.push('a <script> comes before the CSP meta');
  }

  const scriptSrc =
    (attr(meta, 'content') ?? '')
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith('script-src ')) ?? '';
  const allowed = new Set(scriptSrc.split(/\s+/).slice(1));
  const hashes = new Set();
  for (const n of scripts.filter(isInlineExecutable)) {
    const text = n.childNodes.map((c) => c.value ?? '').join('');
    hashes.add(hashScript(text));
    if (!allowed.has(hashScript(text)))
      errors.push(`inline script not covered by the policy: ${preview(text)}`);
  }
  // One source for the policy: the gate rebuilds it and any drift fails (NFR-16).
  errors.push(
    ...policyDrift(
      attr(meta, 'content') ?? '',
      buildPolicy({ hashes: [...hashes], site, upgradeInsecure: true })
    )
  );
  for (const url of urls)
    if (urlOutside(url, site)) errors.push(`URL outside ${site}/: ${preview(url)}`);
  return errors;
}

/** Every JSON-LD block on the page parses; the page must have at least one. */
export function checkJsonLd(html) {
  const blocks = [];
  walk(parse(html), (n) => {
    if (n.nodeName === 'script' && attr(n, 'type') === 'application/ld+json')
      blocks.push(textOf(n));
  });
  if (!blocks.length) return ['no JSON-LD block'];
  const errors = [];
  for (const text of blocks) {
    try {
      JSON.parse(text);
    } catch (err) {
      errors.push(`JSON-LD does not parse: ${err.message}`);
    }
  }
  return errors;
}

/** One JSON-LD block that parses, with the @types the page should carry and registry-only breadcrumbs. */
export function checkStructuredData(html, entry, routes, siteUrl) {
  const blocks = [];
  walk(parse(html), (n) => {
    if (n.nodeName === 'script' && attr(n, 'type') === 'application/ld+json')
      blocks.push(textOf(n));
  });
  if (blocks.length !== 1) return [`expected one JSON-LD block, found ${blocks.length}`];
  let data;
  try {
    data = JSON.parse(blocks[0]);
  } catch (err) {
    return [`JSON-LD does not parse: ${err.message}`];
  }
  const nodes = data['@graph'] ?? [data];
  const types = new Set(nodes.map((n) => n['@type']));
  const expected =
    entry.path === '/'
      ? ['WebSite', 'SoftwareSourceCode']
      : entry.path.startsWith('/inside-the-loop/')
        ? ['WebPage', 'BreadcrumbList']
        : ['WebPage'];
  const errors = expected.filter((t) => !types.has(t)).map((t) => `JSON-LD has no ${t}`);
  const registryUrls = new Set(routes.map((r) => `${siteUrl}${r.path}`));
  const crumbs = nodes.find((n) => n['@type'] === 'BreadcrumbList')?.itemListElement ?? [];
  for (const c of crumbs)
    if (!registryUrls.has(c.item)) errors.push(`breadcrumb item is not a registry URL: ${c.item}`);
  if (crumbs.length && crumbs.at(-1).item !== `${siteUrl}${entry.path}`)
    errors.push('breadcrumb does not end at the page');
  return errors;
}

// ---------- agent content index ----------

/** The site's agent-index.json lists exactly the indexable routes, each with title and text. */
export function checkAgentIndex(index, indexablePaths, maxBytes) {
  const errors = [];
  const size = Buffer.byteLength(JSON.stringify(index));
  if (size > maxBytes) errors.push(`agent-index.json is ${size} bytes (limit ${maxBytes})`);
  const entries = Array.isArray(index?.entries) ? index.entries : [];
  if (!entries.length) errors.push('agent-index.json has no entries');
  const listed = new Set(entries.map((e) => e.path));
  for (const p of indexablePaths)
    if (!listed.has(p)) errors.push(`agent-index.json is missing ${p}`);
  for (const e of entries) {
    if (!indexablePaths.includes(e.path))
      errors.push(`agent-index.json lists ${e.path}, which is not an indexable route`);
    if (!e.title) errors.push(`agent-index.json entry ${e.path} has no title`);
    if (!e.text) errors.push(`agent-index.json entry ${e.path} has no text`);
  }
  return errors;
}

// ---------- WebMCP origin trial ----------

const isOriginTrialMeta = (n) =>
  n.nodeName === 'meta' && (attr(n, 'http-equiv') ?? '').toLowerCase() === 'origin-trial';

/** The origin-trial meta is on the page exactly when a token is configured, right after the CSP meta. */
export function checkOriginTrial(html, token) {
  const metas = [];
  walk(parse(html), (n) => {
    if (isOriginTrialMeta(n)) metas.push(n);
  });
  if (!token)
    return metas.length
      ? ['origin-trial meta present but WEBMCP_ORIGIN_TRIAL_TOKEN is not set']
      : [];
  if (metas.length !== 1) return [`expected one origin-trial meta, found ${metas.length}`];
  const errors = [];
  if (attr(metas[0], 'content') !== token)
    errors.push('origin-trial meta does not carry the configured token');
  const siblings = metas[0].parentNode.childNodes.filter(
    (c) => c.nodeName !== '#text' && c.nodeName !== '#comment'
  );
  if (!isCspMeta(siblings[siblings.indexOf(metas[0]) - 1] ?? {}))
    errors.push('origin-trial meta is not right after the CSP meta');
  return errors;
}

/** The Search Console meta is on the page exactly when NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION is set. */
export function checkVerification(html, token) {
  const metas = [];
  walk(parse(html), (n) => {
    if (n.nodeName === 'meta' && attr(n, 'name') === 'google-site-verification') metas.push(n);
  });
  if (!token)
    return metas.length
      ? [
          'google-site-verification meta present but NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION is not set',
        ]
      : [];
  if (metas.length !== 1)
    return [`expected one google-site-verification meta, found ${metas.length}`];
  return attr(metas[0], 'content') === token
    ? []
    : ['google-site-verification meta does not carry the configured token'];
}

// ---------- CLI ----------

const pageFile = (outDir, routePath) => path.join(outDir, routePath, 'index.html');

async function main() {
  const { siteUrl } = await import('../src/site.ts');
  const { routes } = await import('../src/routes.ts');
  const outDir = path.resolve(process.argv[2] ?? 'out');
  const fileExists = (sitePath) => fs.existsSync(path.join(outDir, decodeURIComponent(sitePath)));
  const failures = [];
  const report = (file, errors) => {
    for (const e of errors) failures.push(`${path.relative(outDir, file)}: ${e}`);
  };

  for (const entry of routes) {
    const file = pageFile(outDir, entry.path);
    if (!fs.existsSync(file)) {
      failures.push(`${entry.path}: no exported page at ${path.relative(outDir, file)}`);
      continue;
    }
    report(file, checkMetadata(fs.readFileSync(file, 'utf8'), entry, { siteUrl, fileExists }));
  }

  const notFound = path.join(outDir, '404.html');
  report(
    notFound,
    fs.existsSync(notFound) ? check404(fs.readFileSync(notFound, 'utf8')) : ['missing']
  );

  const sitemap = path.join(outDir, 'sitemap.xml');
  const indexable = routes.filter((r) => r.index).map((r) => r.path);
  report(
    sitemap,
    fs.existsSync(sitemap)
      ? checkSitemap(fs.readFileSync(sitemap, 'utf8'), indexable, siteUrl)
      : ['missing']
  );

  const { siteOrigin, basePath } = await import('../src/site.ts');
  const site = `${siteOrigin}${basePath}`;
  const htmlFiles = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? htmlFiles(p) : e.name.endsWith('.html') ? [p] : [];
    });
  const pages = htmlFiles(outDir);
  const token = process.env.WEBMCP_ORIGIN_TRIAL_TOKEN || undefined;
  const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;
  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8');
    report(file, [
      ...checkSecurity(html, site),
      ...checkOriginTrial(html, token),
      ...checkVerification(html, verification),
    ]);
  }
  report(
    path.join(outDir, 'index.html'),
    checkJsonLd(fs.readFileSync(path.join(outDir, 'index.html'), 'utf8'))
  );
  for (const entry of routes.filter((r) => r.index)) {
    const file = pageFile(outDir, entry.path);
    if (fs.existsSync(file))
      report(file, checkStructuredData(fs.readFileSync(file, 'utf8'), entry, routes, siteUrl));
  }

  const agentIndex = path.join(outDir, 'agent-index.json');
  if (!fs.existsSync(agentIndex)) report(agentIndex, ['missing']);
  else {
    let index;
    try {
      index = JSON.parse(fs.readFileSync(agentIndex, 'utf8'));
    } catch (err) {
      report(agentIndex, [`does not parse: ${err.message}`]);
    }
    if (index) report(agentIndex, checkAgentIndex(index, indexable, 1024 * 1024));
  }

  const llms = path.join(outDir, 'llms.txt');
  const indexableUrls = indexable.map((p) => `${siteUrl}${p}`);
  report(
    llms,
    fs.existsSync(llms) ? checkLlmsTxt(fs.readFileSync(llms, 'utf8'), indexableUrls) : ['missing']
  );

  if (failures.length) {
    for (const f of failures) console.error(`check-site: ${f}`);
    console.error(`check-site: ${failures.length} problem(s)`);
    process.exit(1);
  }
  console.log(
    `check-site: metadata complete on ${routes.length} routes and 404.html; sitemap and llms.txt list ${indexable.length} URLs; CSP covers every inline script on ${pages.length} pages`
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
