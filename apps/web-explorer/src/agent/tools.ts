/**
 * WebMCP tool logic. Pure functions over the two static agent indexes (the site's
 * agent-index.json and Web Docs' docs/agent-index.json), which are fetched once on the
 * first call. Plain Node imports this file in tests, so it keeps to erasable TypeScript
 * and `.ts` import extensions.
 */
import {
  channels,
  installBlocks,
  launchBlocks,
  providers,
  updateBlocks,
  VERSION,
} from '../views/get-started/commands.ts';
import { scenarios as terminalScenarios } from '../views/landing/scenarios.ts';
import { CAPABILITIES, PILLARS } from '../views/landing/capabilities.ts';
import { routeFor } from '../routes.ts';
import { siteUrl } from '../site.ts';
import { docsUrl, repoUrl } from '../env.ts';
import { WORKFLOWS, workflowUrl } from './workflows.ts';
export type IndexEntry = {
  path: string;
  url: string;
  title: string;
  description: string;
  headings: string[];
  text: string;
};

export type AgentIndex = { source: 'site' | 'docs'; entries: IndexEntry[] };
export type Indexes = { site: AgentIndex; docs: AgentIndex | null };

export type SearchResult = {
  source: 'site' | 'docs';
  title: string;
  url: string;
  path: string;
  description: string;
  snippet: string;
};

const EXCLUDED_PATHS = new Set(['/comic/']);
const SNIPPET_LENGTH = 200;

function fail(message: string): never {
  throw new Error(`Invalid input: ${message}`);
}

const tokenize = (text: string): string[] => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

function snippetFor(entry: IndexEntry, tokens: string[]): string {
  const lower = entry.text.toLowerCase();
  const hit = tokens
    .map((t) => lower.indexOf(t))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];
  if (hit === undefined) return (entry.description || entry.text).slice(0, SNIPPET_LENGTH);
  const start = Math.max(0, hit - 60);
  const body = entry.text.slice(start, start + SNIPPET_LENGTH).trim();
  return `${start > 0 ? '…' : ''}${body}${start + SNIPPET_LENGTH < entry.text.length ? '…' : ''}`;
}

function score(entry: IndexEntry, tokens: string[]): number {
  const title = entry.title.toLowerCase();
  const headings = entry.headings.join(' ').toLowerCase();
  const description = entry.description.toLowerCase();
  const text = entry.text.toLowerCase();
  let total = 0;
  for (const t of tokens) {
    if (title.includes(t)) total += 5;
    if (headings.includes(t)) total += 3;
    if (description.includes(t)) total += 2;
    if (text.includes(t)) total += 1;
  }
  return total;
}

function* entriesOf(indexes: Indexes, source: 'all' | 'site' | 'docs') {
  const lists: AgentIndex[] = [];
  if (source !== 'docs') lists.push(indexes.site);
  if (source !== 'site' && indexes.docs) lists.push(indexes.docs);
  for (const list of lists)
    for (const entry of list.entries)
      if (!EXCLUDED_PATHS.has(entry.path)) yield { source: list.source, entry };
}

export function searchDocumentation(
  indexes: Indexes,
  input: { query?: unknown; limit?: unknown; source?: unknown }
): { results: SearchResult[]; docsAvailable: boolean } {
  const { query, limit = 5, source = 'all' } = input ?? {};
  if (typeof query !== 'string' || query.trim().length === 0 || query.length > 200)
    fail('query must be a string of 1–200 characters');
  if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > 10)
    fail('limit must be an integer from 1 to 10');
  if (source !== 'all' && source !== 'site' && source !== 'docs')
    fail("source must be 'all', 'site' or 'docs'");

  const tokens = [...new Set(tokenize(query))];
  const scored = [...entriesOf(indexes, source)]
    .map((item, order) => ({ ...item, order, score: score(item.entry, tokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit);
  return {
    results: scored.map(({ source: from, entry }) => ({
      source: from,
      title: entry.title,
      url: entry.url,
      path: entry.path,
      description: entry.description,
      snippet: snippetFor(entry, tokens),
    })),
    docsAvailable: indexes.docs !== null,
  };
}

export function getPage(indexes: Indexes, input: { path?: unknown }) {
  const { path } = input ?? {};
  if (typeof path !== 'string' || !path.startsWith('/') || path.length > 300)
    fail("path must be a string of up to 300 characters starting with '/'");
  for (const { source, entry } of entriesOf(indexes, 'all'))
    if (entry.path === path)
      return {
        source,
        title: entry.title,
        url: entry.url,
        path: entry.path,
        description: entry.description,
        headings: entry.headings,
        text: entry.text,
      };
  return fail(`no page at ${path}; use a path from search_documentation results`);
}

// ---------- install, workflow and capability tools ----------

export function getInstallInstructions(
  input: { channel?: unknown; provider?: unknown },
  site: string = siteUrl
) {
  const { channel: channelId, provider: providerId } = input ?? {};
  const channel = channels.find((c) => c.id === channelId);
  const provider = providers.find((p) => p.id === providerId);
  if (!channel) fail(`channel must be one of ${channels.map((c) => c.id).join(', ')}`);
  if (!provider) fail(`provider must be one of ${providers.map((p) => p.id).join(', ')}`);
  return {
    version: VERSION,
    channel: {
      id: channel.id,
      label: channel.label,
      kind: channel.kind,
      soon: channel.soon ?? false,
      pickWhen: channel.pickWhen,
    },
    provider: { id: provider.id, label: provider.label },
    install: installBlocks(channel, provider),
    launch: launchBlocks(channel, provider),
    update: updateBlocks(channel, provider),
    url: `${site}/get-started/?channel=${channel.id}&provider=${provider.id}`,
  };
}

/** The docs article a workflow id opens; open_workflow navigates there. */
export function workflowTarget(input: { workflow?: unknown }, docs: string = docsUrl) {
  const workflow = WORKFLOWS.find((w) => w.id === input?.workflow);
  if (!workflow) fail(`workflow must be one of ${WORKFLOWS.map((w) => w.id).join(', ')}`);
  return { workflow: workflow.id, name: workflow.name, opened: workflowUrl(workflow, docs) };
}

export type DocsFlowScenario = { id: string; label: string; desc?: string };

export function getHarnessCapabilities(docsFlowScenarios: DocsFlowScenario[] = []) {
  const home = routeFor('/');
  return {
    name: 'Artisyn Implementation Harness',
    summary: home.description,
    version: VERSION,
    site: `${siteUrl}/`,
    documentation: docsUrl,
    repository: repoUrl,
    pillars: PILLARS.map(({ title, text }) => ({ title, text })),
    capabilities: CAPABILITIES,
    lifecycles: WORKFLOWS.map((w) => ({
      id: w.id,
      name: w.name,
      commands: w.commands,
      phases: w.phases,
      purpose: w.purpose,
      docs: workflowUrl(w, docsUrl),
    })),
    providers: providers.map(({ id, label }) => ({ id, label })),
    channels: channels.map((c) => ({
      id: c.id,
      label: c.label,
      kind: c.kind,
      soon: c.soon ?? false,
      pickWhen: c.pickWhen,
    })),
    demoScenarios: Object.values(terminalScenarios).map(({ id, label, command }) => ({
      id,
      label,
      command,
    })),
    docsFlowScenarios: docsFlowScenarios.map(({ id, label, desc }) => ({
      id,
      label,
      description: desc ?? '',
    })),
    install: `${siteUrl}/get-started/`,
  };
}

// ---------- browser runner ----------

let indexes: Promise<Indexes> | undefined;

async function fetchIndex(url: string): Promise<AgentIndex | null> {
  try {
    const res = await fetch(url);
    return res.ok ? ((await res.json()) as AgentIndex) : null;
  } catch {
    return null;
  }
}

/** Fetches both indexes once; the docs index is optional (it is absent in local dev and preview). */
export function loadIndexes(siteIndexUrl: string, docsIndexUrl: string): Promise<Indexes> {
  indexes ??= Promise.all([fetchIndex(siteIndexUrl), fetchIndex(docsIndexUrl)]).then(
    ([site, docs]) => {
      if (!site) throw new Error('The site index could not be loaded');
      return { site, docs };
    }
  );
  return indexes;
}

export async function runTool(
  name: string,
  input: Record<string, unknown>,
  urls: { site: string; docs: string }
): Promise<unknown> {
  if (name === 'get_install_instructions') return getInstallInstructions(input);
  if (name === 'get_harness_capabilities') {
    const { scenarios } = await import('../views/docs-flow/flow');
    return getHarnessCapabilities(scenarios);
  }
  if (name === 'open_workflow') {
    const target = workflowTarget(input);
    // Navigate on the next tick so the agent receives the answer before the page unloads.
    setTimeout(() => window.location.assign(target.opened), 0);
    return target;
  }
  const loaded = await loadIndexes(urls.site, urls.docs);
  if (name === 'search_documentation') return searchDocumentation(loaded, input);
  if (name === 'get_page') return getPage(loaded, input);
  throw new Error(`Unknown tool ${name}`);
}
