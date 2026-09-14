// Contract tests for workflow orchestration using mocked Claude runtime primitives.
// These do not assert runtime discovery or filesystem effects of a real agent.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let checks = 0;
for (const kind of ['lld', 'hld']) {
  const source = await readFile(
    new URL(`../workflows/harness-bootstrap-${kind}.js`, import.meta.url),
    'utf8'
  );
  const run = new AsyncFunction(
    'pipeline',
    'agent',
    kind === 'lld' ? 'components' : 'containers',
    source.slice(source.indexOf('// The runtime'))
  );
  const item = {
    componentName: 'web',
    containerName: 'web',
    destPath: 'out/web.md',
    docIntentPath: 'contracts/interface.md',
    principlesPath: 'contracts/principles.md',
    contractPath: 'contracts/launch.md',
    filePaths: ['apps/web.ts'],
    lldPaths: ['lld/web.md'],
    intentPaths: [],
    greenfield: false,
    maxLines: 120,
  };
  const result = {
    path: item.destPath,
    status: 'complete',
    lineCount: 40,
    coverage: {
      scope: 'Overview',
      structure: 'Components',
      flows: 'Request sequence',
      contracts: 'Interfaces',
      constraints: 'Limits',
    },
    evidence: [
      { claim: 'Request handling', source: kind === 'lld' ? 'apps/web.ts:1' : 'lld/web.md' },
    ],
    unresolved: [],
    deviationsFound: [],
  };
  const pipeline = (items, worker) => Promise.all(items.map(worker));
  let prompts = [];
  const good = async (prompt, options) => {
    prompts.push(prompt);
    assert.deepEqual(options.schema.properties.coverage.required, [
      'scope',
      'structure',
      'flows',
      'contracts',
      'constraints',
    ]);
    assert(
      options.schema.required.includes('unresolved') && !options.schema.required.includes('gaps')
    );
    assert(!Object.hasOwn(options.schema.properties, 'gaps'));
    return structuredClone(result);
  };
  assert.equal((await run(pipeline, good, [item])).status, 'complete');
  checks++;
  assert(
    prompts[0].includes(item.docIntentPath) &&
      prompts[0].includes(item.contractPath) &&
      prompts[0].includes(item.principlesPath)
  );
  checks++;
  assert(
    prompts[0].includes('only in the returned unresolved metadata, never in') &&
      prompts[0].includes('apply them as written')
  );
  checks++;
  assert(
    prompts[0].includes(`under ${item.maxLines} lines`) &&
      prompts[0].includes('return failed rather than fabricate')
  );
  checks++;
  for (const key of ['scope', 'structure', 'flows', 'contracts', 'constraints']) {
    const missing = structuredClone(result);
    delete missing.coverage[key];
    assert.equal((await run(pipeline, async () => missing, [item])).status, 'partial');
    checks++;
  }
  const optional = { ...result, unresolved: ['Optional future display choice'] };
  assert.equal((await run(pipeline, async () => optional, [item])).status, 'complete');
  checks++;
  for (const bad of [
    null,
    { ...result, unresolved: undefined },
    { ...result, deviationsFound: ['Unresolved readability violation'] },
    {
      ...result,
      coverage: { identity: 'Overview', relationships: 'Flow', decisions: 'Choices', gaps: 'Gaps' },
    },
    { ...result, path: 'out/wrong.md' },
    { ...result, coverage: {} },
    { ...result, evidence: [] },
    { ...result, lineCount: 150 },
    { ...result, status: 'failed' },
  ]) {
    const actual = await run(pipeline, async () => bad, [item]);
    assert.equal(actual.status, 'partial');
    assert.deepEqual(actual.failedPaths, [item.destPath]);
    checks++;
  }
  const thrown = await run(pipeline, async () => {
    throw new Error('worker unavailable');
  }, [item]);
  assert.equal(thrown.results[0].error, 'worker unavailable');
  checks++;
  for (const batch of [[], [null], [result, result]]) {
    assert.equal((await run(async () => batch, good, [item])).status, 'partial');
    checks++;
  }
  for (const invalid of [
    [],
    [item, item],
    [{ ...item, destPath: '../escape.md' }],
    [{ ...item, destPath: item.docIntentPath }],
    [{ ...item, maxLines: undefined }],
  ]) {
    await assert.rejects(() => run(pipeline, good, invalid));
    checks++;
  }
  const second = { ...item, destPath: 'out/other.md' };
  const partial = await run(
    pipeline,
    async (prompt) => {
      if (prompt.includes('Write only out/other.md')) throw new Error('retry me');
      return structuredClone(result);
    },
    [item, second]
  );
  assert.deepEqual(partial.failedPaths, ['out/other.md']);
  assert.equal(partial.results[0].status, 'complete');
  checks++;
  if (kind === 'lld') {
    await assert.rejects(() => run(pipeline, good, [{ ...item, filePaths: [] }]));
    checks++;
  } else {
    await assert.rejects(() => run(pipeline, good, [{ ...item, greenfield: true, lldPaths: [] }]));
    checks++;
    prompts = [];
    const greenfield = {
      ...item,
      greenfield: true,
      lldPaths: [],
      intentPaths: ['reports/confirmed-intent.md'],
    };
    assert.equal((await run(pipeline, good, [greenfield])).status, 'complete');
    assert(prompts[0].includes('confirmed intent only'));
    checks++;
  }
}
console.log(`${checks} workflow contract checks passed (mock runtime).`);
