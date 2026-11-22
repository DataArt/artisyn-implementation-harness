import './test-env.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getHarnessCapabilities,
  getInstallInstructions,
  getPage,
  loadIndexes,
  searchDocumentation,
  workflowTarget,
  type AgentIndex,
} from './tools.ts';
import { WORKFLOWS, WORKFLOW_IDS } from './workflows.ts';
import { CAPABILITIES, PILLARS } from '../views/landing/capabilities.ts';
import { scenarios as terminalScenarios } from '../views/landing/scenarios.ts';

const loadCommands = () => import('../views/get-started/commands.ts');
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

const SITE = 'https://dataart.github.io/artisyn-implementation-harness';
type Entry = {
  path: string;
  url: string;
  title: string;
  description: string;
  headings: string[];
  text: string;
  source: string;
};

const entry = (source: string, path: string, title: string, text: string, extra = {}): Entry => ({
  path,
  url: `${SITE}${path}`,
  title,
  description: `${title} description`,
  headings: [title],
  text,
  source,
  ...extra,
});

const site: AgentIndex = {
  source: 'site',
  entries: [
    entry(
      'site',
      '/',
      'Artisyn — Implementation Harness',
      'Structured AI engineering with context and lifecycles.'
    ),
    entry(
      'site',
      '/cookbook/team-adoption-path/context/',
      'Context',
      'Context engineering keeps the agent grounded in the architecture.'
    ),
    entry(
      'site',
      '/get-started/',
      'Get started',
      'Pick a channel and a provider, then copy the install commands.'
    ),
    entry('site', '/comic/', 'Comic', 'A comic about context and the harness.'),
  ],
};
const docs: AgentIndex = {
  source: 'docs',
  entries: [
    entry(
      'docs',
      '/docs/Harness/og',
      'Operational Graph',
      'The operational graph links every document.'
    ),
    entry('docs', '/docs/Harness/07%20Operational%20Graph.html', 'Graph overview', 'Overview.'),
  ],
};
const both = { site, docs };

test('search_documentation: a title match ranks first and results carry snippets', async () => {
  const { results, docsAvailable } = searchDocumentation(both, { query: 'context' });
  assert.equal(docsAvailable, true);
  assert.equal(results[0].url, `${SITE}/cookbook/team-adoption-path/context/`);
  for (const r of results as { snippet: string; source: string; url: string }[]) {
    assert.ok(r.snippet.toLowerCase().includes('context'));
    assert.ok(r.snippet.length <= 240);
    assert.ok(['site', 'docs'].includes(r.source));
  }
});

test('search_documentation: never returns /comic/', async () => {
  const { results } = searchDocumentation(both, { query: 'comic context harness', limit: 10 });
  assert.ok(results.every((r: { url: string }) => !r.url.endsWith('/comic/')));
});

test('search_documentation: limit and source bounds', async () => {
  assert.equal(searchDocumentation(both, { query: 'the', limit: 1 }).results.length, 1);
  assert.throws(() => searchDocumentation(both, { query: 'x', limit: 0 }));
  assert.throws(() => searchDocumentation(both, { query: 'x', limit: 11 }));
  assert.throws(() => searchDocumentation(both, { query: 'x', source: 'web' }));
  assert.ok(
    searchDocumentation(both, { query: 'graph', source: 'docs' }).results.every(
      (r: { source: string }) => r.source === 'docs'
    )
  );
  assert.ok(
    searchDocumentation(both, { query: 'context', source: 'site' }).results.every(
      (r: { source: string }) => r.source === 'site'
    )
  );
});

test('search_documentation: works on the site index alone when docs are unavailable', async () => {
  const { results, docsAvailable } = searchDocumentation(
    { site, docs: null },
    { query: 'context' }
  );
  assert.equal(docsAvailable, false);
  assert.ok(results.length > 0);
});

test('search_documentation: rejects an empty or 201-character query', async () => {
  assert.throws(() => searchDocumentation(both, { query: '' }));
  assert.throws(() => searchDocumentation(both, { query: 'a'.repeat(201) }));
  assert.doesNotThrow(() => searchDocumentation(both, { query: 'a'.repeat(200) }));
});

test('get_page: returns a known page and rejects anything else', async () => {
  const page = getPage(both, { path: '/get-started/' });
  assert.equal(page.title, 'Get started');
  assert.ok(page.text.length > 0);
  assert.equal(getPage(both, { path: '/docs/Harness/og' }).source, 'docs');
  for (const form of [
    '/docs/Harness/07%20Operational%20Graph.html',
    '/docs/Harness/07 Operational Graph.html',
  ])
    assert.equal(getPage(both, { path: form }).title, 'Graph overview');
  assert.throws(() => getPage(both, { path: '/docs/%E0%A4%A' }));
  assert.throws(() => getPage(both, { path: '/nope/' }));
  assert.throws(() => getPage(both, { path: 'get-started/' }));
  assert.throws(() => getPage(both, { path: `/${'a'.repeat(300)}` }));
  assert.throws(() => getPage(both, { path: '/comic/' }));
});

test('get_install_instructions: every channel and provider matches commands.ts', async () => {
  const { channels, providers, installBlocks, launchBlocks, updateBlocks, VERSION } =
    await loadCommands();
  for (const channel of channels)
    for (const provider of providers) {
      const result = getInstallInstructions({ channel: channel.id, provider: provider.id }, SITE);
      assert.equal(result.version, VERSION);
      assert.deepEqual(result.install, installBlocks(channel, provider));
      assert.deepEqual(result.launch, launchBlocks(channel, provider));
      assert.deepEqual(result.update, updateBlocks(channel, provider));
      assert.equal(
        result.url,
        `${SITE}/get-started/?channel=${channel.id}&provider=${provider.id}`
      );
    }
});

test('get_install_instructions: rejects an unknown channel or provider', async () => {
  assert.throws(() => getInstallInstructions({ channel: 'ftp', provider: 'claude' }, SITE));
  assert.throws(() => getInstallInstructions({ channel: 'zip', provider: 'gemini' }, SITE));
});

test('open_workflow: each lifecycle maps to an existing docs article; unknown ids are rejected', () => {
  assert.deepEqual(
    WORKFLOWS.map((w) => w.id),
    [...WORKFLOW_IDS]
  );
  for (const w of WORKFLOWS) {
    assert.ok(fs.existsSync(path.join(repoRoot, 'docs', `${w.docsSource}.md`)), w.docsSource);
    const target = workflowTarget({ workflow: w.id }, 'https://example.test/docs/');
    assert.equal(target.workflow, w.id);
    assert.ok(target.opened.startsWith('https://example.test/docs/Harness/03%20Lifecycles/'));
    assert.ok(target.opened.endsWith('.html'));
  }
  assert.throws(() => workflowTarget({ workflow: 'deploy' }));
  assert.throws(() => workflowTarget({}));
});

test('get_harness_capabilities: returns its source modules unchanged', async () => {
  const { channels, providers, VERSION } = await loadCommands();
  const caps = getHarnessCapabilities([
    { id: 'e2e', label: 'End-to-end flow', desc: 'Start to finish' },
  ]);
  assert.equal(caps.version, VERSION);
  assert.deepEqual(caps.capabilities, CAPABILITIES);
  assert.deepEqual(
    caps.pillars,
    PILLARS.map(({ title, text }) => ({ title, text }))
  );
  assert.deepEqual(
    caps.lifecycles.map((l) => l.id),
    [...WORKFLOW_IDS]
  );
  assert.deepEqual(
    caps.providers.map((p) => p.id),
    providers.map((p) => p.id)
  );
  assert.deepEqual(
    caps.channels.map((c) => c.id),
    channels.map((c) => c.id)
  );
  assert.deepEqual(
    caps.demoScenarios.map((d) => d.id),
    Object.keys(terminalScenarios)
  );
  assert.deepEqual(caps.knowledgeFlowScenarios, [
    { id: 'e2e', label: 'End-to-end flow', description: 'Start to finish' },
  ]);
});

test('loadIndexes: a failed site index load is retried on the next call', async () => {
  const realFetch = globalThis.fetch;
  let siteUp = false;
  globalThis.fetch = (async (url: string) =>
    String(url).includes('site') && siteUp
      ? new Response(JSON.stringify(site))
      : new Response('', { status: 503 })) as typeof fetch;
  try {
    await assert.rejects(loadIndexes('/site.json', '/docs.json'));
    siteUp = true;
    const loaded = await loadIndexes('/site.json', '/docs.json');
    assert.equal(loaded.site.entries.length, site.entries.length);
    assert.equal(loaded.docs, null);
  } finally {
    globalThis.fetch = realFetch;
  }
});
