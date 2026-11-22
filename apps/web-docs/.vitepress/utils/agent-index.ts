import fs from 'node:fs';
import path from 'node:path';
import { parse, type DefaultTreeAdapterTypes } from 'parse5';

type Node = DefaultTreeAdapterTypes.Node;
type Element = DefaultTreeAdapterTypes.Element;

// The GitHub Pages project site. The origin and project path are fixed public
// URLs (not deployment configuration); `base` must sit under SITE_ROOT.
const SITE_ORIGIN = 'https://dataart.github.io';
const SITE_ROOT = '/artisyn-implementation-harness/';

/** Largest allowed agent-index.json, in bytes. */
export const AGENT_INDEX_MAX_BYTES = 5 * 1024 * 1024;

export interface AgentIndexEntry {
  path: string;
  url: string;
  title: string;
  description: string;
  headings: string[];
  text: string;
}

export interface AgentIndex {
  source: 'docs';
  entries: AgentIndexEntry[];
}

export interface AgentIndexResult {
  index: AgentIndex;
  /** UTF-8 size of JSON.stringify(index), in bytes. */
  bytes: number;
  /** Max characters kept per entry `text`, or null when no cap was needed. */
  textCap: number | null;
}

// Not visible article text: anchors render a zero-width "#" permalink,
// code blocks carry a language label and a copy button.
const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'template', 'button', 'svg']);
const SKIP_CLASSES = ['header-anchor', 'lang'];

// Block-level tags get a space around them so adjacent blocks don't glue words.
const BLOCK_TAGS = new Set(
  (
    'address article aside blockquote br dd details div dl dt figcaption figure footer ' +
    'h1 h2 h3 h4 h5 h6 header hr li main nav ol p pre section summary table td th tr ul'
  ).split(' ')
);

const isElement = (node: Node): node is Element => 'tagName' in node;

const attr = (el: Element, name: string): string | undefined =>
  el.attrs.find((a) => a.name === name)?.value;

const hasClass = (el: Element, cls: string): boolean =>
  (attr(el, 'class') ?? '').split(/\s+/).includes(cls);

const collapse = (s: string): string => s.replace(/[\s\u200b]+/g, ' ').trim();

function find(node: Node, pred: (el: Element) => boolean): Element | undefined {
  if (isElement(node) && pred(node)) return node;
  if (!('childNodes' in node)) return undefined;
  for (const child of node.childNodes) {
    const hit = find(child, pred);
    if (hit) return hit;
  }
  return undefined;
}

function findAll(node: Node, pred: (el: Element) => boolean, out: Element[] = []): Element[] {
  if (isElement(node) && pred(node)) out.push(node);
  if ('childNodes' in node) for (const child of node.childNodes) findAll(child, pred, out);
  return out;
}

function rawText(node: Node, parts: string[] = []): string[] {
  if (node.nodeName === '#text' && 'value' in node) {
    parts.push(node.value);
    return parts;
  }
  if (isElement(node)) {
    if (SKIP_TAGS.has(node.tagName)) return parts;
    if (SKIP_CLASSES.some((cls) => hasClass(node, cls))) return parts;
    const block = BLOCK_TAGS.has(node.tagName);
    if (block) parts.push(' ');
    for (const child of node.childNodes) rawText(child, parts);
    if (block) parts.push(' ');
    return parts;
  }
  if ('childNodes' in node) for (const child of node.childNodes) rawText(child, parts);
  return parts;
}

const textOf = (node: Node): string => collapse(rawText(node).join(''));

function listHtmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) out.push(...listHtmlFiles(full));
    else if (d.isFile() && d.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/**
 * Page link relative to `base`, the way VitePress links it with cleanUrls off:
 * `<dir>/index.html` -> `<dir>/`, other pages keep `.html`; each segment is
 * percent-encoded (spaces -> %20), matching the browser-resolved href.
 */
function pageLink(outDir: string, file: string): string {
  const segments = path.relative(outDir, file).split(path.sep);
  if (segments[segments.length - 1] === 'index.html') segments[segments.length - 1] = '';
  return segments.map(encodeURIComponent).join('/');
}

function buildEntry(
  html: string,
  link: string,
  base: string,
  docsPrefix: string,
  siteTitle: string,
  siteDescription: string
): AgentIndexEntry {
  const doc = parse(html);

  const titleEl = find(doc, (el) => el.tagName === 'title');
  let title = titleEl ? textOf(titleEl) : '';
  const suffix = ` | ${siteTitle}`;
  if (siteTitle && title.endsWith(suffix)) title = title.slice(0, -suffix.length);

  // VitePress renders frontmatter `description` into this meta tag, falling back to the
  // site description; that shared fallback says nothing about the page, so it is dropped.
  const metaDesc = find(doc, (el) => el.tagName === 'meta' && attr(el, 'name') === 'description');
  const metaText = collapse(metaDesc ? (attr(metaDesc, 'content') ?? '') : '');
  const description = metaText === siteDescription ? '' : metaText;

  // Article content. The home layout's .vp-doc is an empty slot under the hero, so a
  // .vp-doc without text falls back to the home container.
  const article = find(doc, (el) => hasClass(el, 'vp-doc'));
  const content =
    article && textOf(article) ? article : (find(doc, (el) => hasClass(el, 'VPHome')) ?? article);

  const headings = content
    ? findAll(content, (el) => el.tagName === 'h1' || el.tagName === 'h2' || el.tagName === 'h3')
        .map(textOf)
        .filter((h) => h.length > 0)
    : [];

  if (!title) title = headings[0] ?? siteTitle;

  return {
    path: `${docsPrefix}${link}`,
    url: `${SITE_ORIGIN}${base}${link}`,
    title,
    description,
    headings,
    text: content ? textOf(content) : '',
  };
}

const byteSize = (index: AgentIndex): number => Buffer.byteLength(JSON.stringify(index), 'utf8');

function capText(text: string, cap: number): string {
  if (text.length <= cap) return text;
  // Don't leave a lone high surrogate at the cut.
  return text.slice(0, cap).replace(/[\uD800-\uDBFF]$/, '');
}

/**
 * Builds the docs agent index from the built site in `outDir` (run after the
 * VitePress build). `base` is the VitePress `base`; `siteTitle` is stripped
 * from `<title>` (VitePress renders `:title | siteTitle`); a description equal to
 * `siteDescription` (the site-wide fallback) is left empty.
 */
export function buildAgentIndex(
  outDir: string,
  base: string,
  siteTitle: string,
  siteDescription: string
): AgentIndexResult {
  if (!base.startsWith(SITE_ROOT))
    throw new Error(`agent-index: base "${base}" is not under "${SITE_ROOT}"`);
  const docsPrefix = `/${base.slice(SITE_ROOT.length)}`;

  const files = listHtmlFiles(outDir)
    .filter((f) => path.relative(outDir, f) !== '404.html')
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const entries = files.map((file) =>
    buildEntry(
      fs.readFileSync(file, 'utf8'),
      pageLink(outDir, file),
      base,
      docsPrefix,
      siteTitle,
      siteDescription
    )
  );

  const index: AgentIndex = { source: 'docs', entries };
  const bytes = byteSize(index);
  if (bytes <= AGENT_INDEX_MAX_BYTES || entries.length === 0)
    return { index, bytes, textCap: null };

  // Over budget: cap every entry's text at one fixed length. Start from the
  // budget left after everything but text, then shrink until it fits.
  const overhead = byteSize({ source: 'docs', entries: entries.map((e) => ({ ...e, text: '' })) });
  const margin = 64 * 1024;
  let cap = Math.max(0, Math.floor((AGENT_INDEX_MAX_BYTES - overhead - margin) / entries.length));
  for (;;) {
    const capped: AgentIndex = {
      source: 'docs',
      entries: entries.map((e) => ({ ...e, text: capText(e.text, cap) })),
    };
    const cappedBytes = byteSize(capped);
    if (cappedBytes <= AGENT_INDEX_MAX_BYTES || cap === 0)
      return { index: capped, bytes: cappedBytes, textCap: cap };
    cap = Math.floor(cap * 0.9);
  }
}
