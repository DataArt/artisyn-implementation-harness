import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.HARNESS_VERSION ??= '9.9.9';

const loadTools = () => import('./tools.ts');
const loadCommands = () => import('../views/get-started/commands.ts');

const SITE = 'https://dataart.github.io/artisyn-implementation-harness';
const entry = (source, path, title, text, extra = {}) => ({
  path,
  url: `${SITE}${path}`,
  title,
  description: `${title} description`,
  headings: [title],
  text,
  source,
  ...extra,
});

const site = {
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
      '/inside-the-loop/context/',
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
const docs = {
  source: 'docs',
  entries: [
    entry(
      'docs',
      '/docs/Harness/og',
      'Operational Graph',
      'The operational graph links every document.'
    ),
  ],
};
const both = { site, docs };

test(
  'search_site: a title match ranks first and results carry snippets',
  { todo: 'Step 21' },
  async () => {
    const { searchSite } = await loadTools();
    const { results, docsAvailable } = searchSite(both, { query: 'context' });
    assert.equal(docsAvailable, true);
    assert.equal(results[0].url, `${SITE}/inside-the-loop/context/`);
    for (const r of results) {
      assert.ok(r.snippet.toLowerCase().includes('context'));
      assert.ok(r.snippet.length <= 240);
      assert.ok(['site', 'docs'].includes(r.source));
    }
  }
);

test('search_site: never returns /comic/', { todo: 'Step 21' }, async () => {
  const { searchSite } = await loadTools();
  const { results } = searchSite(both, { query: 'comic context harness', limit: 10 });
  assert.ok(results.every((r) => !r.url.endsWith('/comic/')));
});

test('search_site: limit and source bounds', { todo: 'Step 21' }, async () => {
  const { searchSite } = await loadTools();
  assert.equal(searchSite(both, { query: 'the', limit: 1 }).results.length, 1);
  assert.throws(() => searchSite(both, { query: 'x', limit: 0 }));
  assert.throws(() => searchSite(both, { query: 'x', limit: 11 }));
  assert.throws(() => searchSite(both, { query: 'x', source: 'web' }));
  assert.ok(
    searchSite(both, { query: 'graph', source: 'docs' }).results.every((r) => r.source === 'docs')
  );
  assert.ok(
    searchSite(both, { query: 'context', source: 'site' }).results.every((r) => r.source === 'site')
  );
});

test(
  'search_site: works on the site index alone when docs are unavailable',
  { todo: 'Step 21' },
  async () => {
    const { searchSite } = await loadTools();
    const { results, docsAvailable } = searchSite({ site, docs: null }, { query: 'context' });
    assert.equal(docsAvailable, false);
    assert.ok(results.length > 0);
  }
);

test('search_site: rejects an empty or 201-character query', { todo: 'Step 21' }, async () => {
  const { searchSite } = await loadTools();
  assert.throws(() => searchSite(both, { query: '' }));
  assert.throws(() => searchSite(both, { query: 'a'.repeat(201) }));
  assert.doesNotThrow(() => searchSite(both, { query: 'a'.repeat(200) }));
});

test('get_page: returns a known page and rejects anything else', { todo: 'Step 21' }, async () => {
  const { getPage } = await loadTools();
  const page = getPage(both, { path: '/get-started/' });
  assert.equal(page.title, 'Get started');
  assert.ok(page.text.length > 0);
  assert.equal(getPage(both, { path: '/docs/Harness/og' }).source, 'docs');
  assert.throws(() => getPage(both, { path: '/nope/' }));
  assert.throws(() => getPage(both, { path: 'get-started/' }));
  assert.throws(() => getPage(both, { path: `/${'a'.repeat(300)}` }));
  assert.throws(() => getPage(both, { path: '/comic/' }));
});

test(
  'get_install_commands: every channel and provider matches commands.ts',
  { todo: 'Step 22' },
  async () => {
    const { getInstallCommands } = await loadTools();
    const { channels, providers, installBlocks, launchBlocks, updateBlocks, VERSION } =
      await loadCommands();
    for (const channel of channels)
      for (const provider of providers) {
        const result = getInstallCommands({ channel: channel.id, provider: provider.id }, SITE);
        assert.equal(result.version, VERSION);
        assert.deepEqual(result.install, installBlocks(channel, provider));
        assert.deepEqual(result.launch, launchBlocks(channel, provider));
        assert.deepEqual(result.update, updateBlocks(channel, provider));
        assert.equal(
          result.url,
          `${SITE}/get-started/?channel=${channel.id}&provider=${provider.id}`
        );
      }
  }
);

test(
  'get_install_commands: rejects an unknown channel or provider',
  { todo: 'Step 22' },
  async () => {
    const { getInstallCommands } = await loadTools();
    assert.throws(() => getInstallCommands({ channel: 'ftp', provider: 'claude' }, SITE));
    assert.throws(() => getInstallCommands({ channel: 'zip', provider: 'gemini' }, SITE));
  }
);
