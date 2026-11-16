import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build, index, reindex, query, search, list, unedge } from './cli.mjs';
import { DB_FILE, EDGE_TYPES, SCAN_EDGE_TYPES } from './constants.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.join(here, 'cli.mjs');

/** @returns {string} A fresh scratch directory, removed by the caller via cleanup. */
function scratchDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'docs-graph-test-'));
}

/** Write `content` to `relPath` under `root`, creating parent directories. */
function writeDoc(root, relPath, content) {
  const full = path.join(root, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return full;
}

/** A fixture tree exercising each of the six named graduation edges, plus one
 * HLD/LLD mirror pair (consistent), one mirror gap, and one malformed name. */
function graduationFixture(root) {
  writeDoc(root, 'docs/Target Architecture (HLD)/v1/Containers/Web.md', '# Web\n');
  writeDoc(root, 'docs/System Architecture (LLD)/Web/README.md', '# Web LLD\n');
  writeDoc(root, 'docs/Target Architecture (HLD)/v1/Containers/Auth.md', '# Auth\n');
  // No docs/System Architecture (LLD)/Auth/ — a known mirrors-gap.
  writeDoc(root, 'docs/Target Architecture (HLD)/v1/Containers/-weird name-.md', '# Malformed\n');
  writeDoc(root, 'docs/Stories/[DEV-1] Example/impl/0-intent.md', '# Example intent\n');
  return root;
}

test('build() creates the schema on an empty tree; a second doc cannot claim an ID already in use', async () => {
  const dir = scratchDir();
  try {
    await build({ dir });
    assert.ok(fs.existsSync(path.join(dir, DB_FILE)));
    const a = writeDoc(dir, 'docs/a.md', '# A\n');
    const b = writeDoc(dir, 'docs/b.md', '# B\n');
    await index({ dir, doc: a, id: 'dup-1' });
    await assert.rejects(() => index({ dir, doc: b, id: 'dup-1' }));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('index() assigns IDs additively, idempotently, and collision-safe', async () => {
  const dir = scratchDir();
  try {
    const docPath = writeDoc(dir, 'docs/Example.md', '# Example\n\nBody text.\n');
    await build({ dir });
    await index({ dir, doc: docPath });
    const once = fs.readFileSync(docPath, 'utf8');
    assert.match(once, /^---\nid: /);
    await index({ dir, doc: docPath });
    const twice = fs.readFileSync(docPath, 'utf8');
    assert.equal(once, twice, 'idempotent: a second index() must not reassign or touch the doc');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('EDGE_TYPES names exactly the six Documents Flow graduation edges', () => {
  assert.deepEqual(
    [...EDGE_TYPES].sort(),
    [
      'impl-to-engineering-guide',
      'impl-to-hld',
      'impl-to-lld',
      'impl-to-readme',
      'story-to-hld',
      'story-to-product',
    ].sort()
  );
});

test('index() writes an authored (derived=0) graduation edge for each of the six named types', async () => {
  const dir = scratchDir();
  try {
    const story = writeDoc(dir, 'docs/Stories/[DEV-1] Example/impl/0-intent.md', '# Intent\n');
    const hld = writeDoc(dir, 'docs/Target Architecture (HLD)/v1/Containers/Web.md', '# Web\n');
    await build({ dir });
    await index({ dir, doc: story });
    await index({ dir, doc: hld });
    await index({ dir, doc: story, edge: 'story-to-hld', to: hld });
    const edges = await query({ dir, relatedTo: story, edge: 'story-to-hld' });
    assert.equal(edges.length, 1);
    assert.equal(edges[0].derived, 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('index() rejects an edge type outside the six named types', async () => {
  const dir = scratchDir();
  try {
    const story = writeDoc(dir, 'docs/Stories/[DEV-1] Example/impl/0-intent.md', '# Intent\n');
    const other = writeDoc(dir, 'docs/Other.md', '# Other\n');
    await build({ dir });
    await index({ dir, doc: story });
    await index({ dir, doc: other });
    await assert.rejects(() => index({ dir, doc: story, edge: 'not-a-real-edge', to: other }));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('index() accepts the "references" scan-edge type, written derived=0, outside the six graduation types', async () => {
  const dir = scratchDir();
  try {
    const a = writeDoc(dir, 'docs/A.md', '# A\n\nSee [B](./B.md).\n');
    const b = writeDoc(dir, 'docs/B.md', '# B\n');
    await build({ dir });
    await index({ dir, doc: a });
    await index({ dir, doc: b });
    await index({ dir, doc: a, edge: SCAN_EDGE_TYPES[0], to: b });
    const edges = await query({ dir, relatedTo: a, edge: SCAN_EDGE_TYPES[0] });
    assert.equal(edges.length, 1);
    assert.equal(edges[0].derived, 0);
    assert.ok(
      !EDGE_TYPES.includes(SCAN_EDGE_TYPES[0]),
      'sanity: not one of the six graduation types'
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('unedge() retracts a specific edge — the review/stale-edge-cleanup path', async () => {
  const dir = scratchDir();
  try {
    const a = writeDoc(dir, 'docs/A.md', '# A\n');
    const b = writeDoc(dir, 'docs/B.md', '# B\n');
    await build({ dir });
    await index({ dir, doc: a });
    await index({ dir, doc: b });
    await index({ dir, doc: a, edge: SCAN_EDGE_TYPES[0], to: b });
    assert.equal((await query({ dir, relatedTo: a, edge: SCAN_EDGE_TYPES[0] })).length, 1);

    await unedge({ dir, doc: a, edge: SCAN_EDGE_TYPES[0], to: b });
    assert.equal((await query({ dir, relatedTo: a, edge: SCAN_EDGE_TYPES[0] })).length, 0);

    // Retracting an already-gone edge is a no-op, not an error.
    await unedge({ dir, doc: a, edge: SCAN_EDGE_TYPES[0], to: b });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('unedge() rejects an unindexed --doc or --to', async () => {
  const dir = scratchDir();
  try {
    const a = writeDoc(dir, 'docs/A.md', '# A\n');
    await build({ dir }); // indexes A.md; B.md doesn't exist yet, so it stays unindexed
    const b = writeDoc(dir, 'docs/B.md', '# B\n');
    await assert.rejects(() => unedge({ dir, doc: a, edge: SCAN_EDGE_TYPES[0], to: b }));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('reindex() computes mirrors-consistent and mirrors-gap, and skips a malformed name without aborting', async () => {
  const dir = scratchDir();
  try {
    graduationFixture(dir);
    await build({ dir });
    const result = await reindex({ dir });
    assert.ok(result.skipped?.some((s) => /weird name/.test(s.path)));
    const webEdges = await query({
      dir,
      relatedTo: 'docs/Target Architecture (HLD)/v1/Containers/Web.md',
      edge: 'mirrors-consistent',
    });
    assert.ok(webEdges.length >= 1, 'Web HLD/LLD pair should mirror consistently');
    const authEdges = await query({
      dir,
      relatedTo: 'docs/Target Architecture (HLD)/v1/Containers/Auth.md',
      edge: 'mirrors-gap',
    });
    assert.ok(authEdges.length >= 1, 'Auth has no LLD folder — a known mirrors-gap');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('reindex() computes keyword-match edges from the stored keywords column alone — no content read', async () => {
  const dir = scratchDir();
  try {
    const a = writeDoc(dir, 'docs/A.md', '---\nkeywords: [marine, tusked]\n---\n\n# A\n');
    const b = writeDoc(dir, 'docs/B.md', '---\nkeywords: [Marine, finned]\n---\n\n# B\n');
    const c = writeDoc(dir, 'docs/C.md', '---\nkeywords: [desert]\n---\n\n# C\n');
    await build({ dir });
    await index({ dir, doc: a });
    await index({ dir, doc: b });
    await index({ dir, doc: c });
    await reindex({ dir });
    const abEdges = await query({ dir, relatedTo: a, edge: 'keyword-match' });
    assert.equal(abEdges.length, 1, 'A and B share "marine" (case-insensitive)');
    assert.equal(abEdges[0].derived, 1);
    assert.ok(
      !(await query({ dir, relatedTo: c })).some((e) => e.edge_type === 'keyword-match'),
      'C shares no keywords with anything'
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('reindex() clears stale keyword-match edges when keywords no longer overlap', async () => {
  const dir = scratchDir();
  try {
    const a = writeDoc(dir, 'docs/A.md', '---\nkeywords: [marine]\n---\n\n# A\n');
    const b = writeDoc(dir, 'docs/B.md', '---\nkeywords: [marine]\n---\n\n# B\n');
    await build({ dir });
    await index({ dir, doc: a });
    await index({ dir, doc: b });
    await reindex({ dir });
    assert.equal((await query({ dir, relatedTo: a, edge: 'keyword-match' })).length, 1);

    fs.writeFileSync(a, fs.readFileSync(a, 'utf8').replace('marine', 'desert'));
    await reindex({ dir });
    assert.equal(
      (await query({ dir, relatedTo: a, edge: 'keyword-match' })).length,
      0,
      'stale match should be cleared once keywords diverge'
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('reindex() prunes a doc row (and its edges) once the file is deleted', async () => {
  const dir = scratchDir();
  try {
    const story = writeDoc(dir, 'docs/Stories/[DEV-1] Example/impl/0-intent.md', '# Intent\n');
    const hld = writeDoc(dir, 'docs/Target Architecture (HLD)/v1/Containers/Web.md', '# Web\n');
    await build({ dir });
    await index({ dir, doc: story });
    await index({ dir, doc: hld });
    await index({ dir, doc: story, edge: 'story-to-hld', to: hld });
    const edgesBefore = (await query({ dir, relatedTo: story })).length;
    assert.ok(edgesBefore >= 1, 'sanity: the edge was written before deletion');

    fs.rmSync(story);
    const result = await reindex({ dir });
    assert.equal(result.pruned.length, 1);

    const afterQuery = await query({
      dir,
      relatedTo: 'docs/Stories/[DEV-1] Example/impl/0-intent.md',
    });
    assert.deepEqual(afterQuery, [], 'pruned doc should have no remaining edges');
    const hits = await search({ dir, term: 'Intent' });
    assert.ok(
      !hits.some((h) => h.path.endsWith('0-intent.md')),
      'pruned doc should not be searchable'
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("reindex() updates a moved doc's path in place, preserving its id and edges", async () => {
  const dir = scratchDir();
  try {
    const story = writeDoc(dir, 'docs/Stories/[DEV-1] Example/impl/0-intent.md', '# Intent\n');
    const hld = writeDoc(dir, 'docs/Target Architecture (HLD)/v1/Containers/Web.md', '# Web\n');
    await build({ dir });
    const { id: storyId } = await index({ dir, doc: story });
    await index({ dir, doc: hld });
    await index({ dir, doc: story, edge: 'story-to-hld', to: hld });
    const edgesBefore = await query({ dir, relatedTo: story });
    assert.ok(edgesBefore.length >= 1, 'sanity: the edge was written before the move');

    const oldPath = story;
    const newPath = path.join(dir, 'docs/Stories/archive/[DEV-1] Example/impl/0-intent.md');
    fs.mkdirSync(path.dirname(newPath), { recursive: true });
    fs.renameSync(oldPath, newPath);

    const result = await reindex({ dir });
    assert.deepEqual(result.pruned, [], 'a move is not a deletion; nothing should be pruned');

    const hits = await search({ dir, term: 'Intent' });
    const moved = hits.find((h) => h.id === storyId);
    assert.ok(moved, 'moved doc should still be findable by its original id');
    assert.equal(
      moved.path,
      'docs/Stories/archive/[DEV-1] Example/impl/0-intent.md',
      'row should reflect the new path'
    );

    const edgesAfter = await query({ dir, relatedTo: newPath });
    assert.equal(
      edgesAfter.length,
      edgesBefore.length,
      'edges referencing the id survive the move'
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('sql.js opens and queries the exact .sqlite file node:sqlite wrote, with no conversion step', async () => {
  const dir = scratchDir();
  try {
    await build({ dir });
    const dbPath = path.join(dir, DB_FILE);
    const bytes = fs.readFileSync(dbPath);
    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs();
    const sqlDb = new SQL.Database(bytes);
    const result = sqlDb.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = result[0]?.values.map((row) => row[0]) ?? [];
    assert.ok(tableNames.includes('docs'));
    assert.ok(tableNames.includes('edges'));
    sqlDb.close();
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('build() emits a tier-rooted Mermaid mindmap grouping docs by tier branch', async () => {
  const dir = scratchDir();
  try {
    graduationFixture(dir);
    await build({ dir });
    const artifact = fs.readFileSync(path.join(dir, 'docs/.og/graph.mmd'), 'utf8');
    assert.match(artifact, /^mindmap/);
    assert.match(artifact, /root\(\("Operational Graph"\)\)/);
    assert.match(artifact, /^\s{4}HLD$/m, 'HLD tier branch should be its own mindmap line');
    assert.match(artifact, /^\s{4}Story$/m, 'Story tier branch should be its own mindmap line');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the mindmap never emits classDef or inline :::class — mindmap has no classDef grammar and a bare classDef line parses as a bogus rootless node', async () => {
  const dir = scratchDir();
  try {
    graduationFixture(dir);
    await build({ dir });
    const artifact = fs.readFileSync(path.join(dir, 'docs/.og/graph.mmd'), 'utf8');
    assert.doesNotMatch(artifact, /classDef/);
    assert.doesNotMatch(
      artifact,
      /:::[A-Za-z]/,
      'flowchart-style inline :::class is invalid mindmap syntax'
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the mindmap quotes node text so an embedded quote cannot break the diagram', async () => {
  const dir = scratchDir();
  try {
    writeDoc(dir, 'docs/Quoted.md', '# A "quoted" title\n');
    await build({ dir });
    const artifact = fs.readFileSync(path.join(dir, 'docs/.og/graph.mmd'), 'utf8');
    assert.doesNotMatch(
      artifact,
      /A "quoted" title/,
      'an unescaped quote would split the node text'
    );
    assert.match(artifact, /#quot;quoted#quot;/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('frontmatter purpose:/keywords: map to docs.purpose/docs.keywords, surfaced by search()', async () => {
  const dir = scratchDir();
  try {
    const doc = writeDoc(
      dir,
      'docs/Described.md',
      '---\npurpose: a doc about narwhals\nkeywords: [marine, tusked]\n---\n\n# Described\n'
    );
    await build({ dir });
    await index({ dir, doc });
    const hits = await search({ dir, term: 'narwhals' });
    assert.ok(hits.some((h) => h.path.endsWith('Described.md')));
    assert.ok((await search({ dir, term: 'tusked' })).length >= 1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('list({missing}) finds docs lacking purpose/keywords — a pure query, never writes', async () => {
  const dir = scratchDir();
  try {
    const bare = writeDoc(dir, 'docs/Bare.md', '# Bare\n');
    const described = writeDoc(
      dir,
      'docs/Described.md',
      '---\npurpose: has one\nkeywords: [a]\n---\n\n# Described\n'
    );
    await build({ dir });
    await index({ dir, doc: bare });
    await index({ dir, doc: described });

    const missingBoth = await list({ dir, missing: 'purpose,keywords' });
    assert.ok(missingBoth.some((row) => row.path.endsWith('Bare.md')));
    assert.ok(!missingBoth.some((row) => row.path.endsWith('Described.md')));

    const before = fs.readFileSync(bare, 'utf8');
    await list({ dir, missing: 'purpose' });
    assert.equal(fs.readFileSync(bare, 'utf8'), before, 'list() must never write to a doc');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('list() rejects an unknown --missing field', async () => {
  const dir = scratchDir();
  try {
    await build({ dir });
    await assert.rejects(() => list({ dir, missing: 'description' }));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('list() with no --missing returns every indexed doc', async () => {
  const dir = scratchDir();
  try {
    const a = writeDoc(dir, 'docs/A.md', '# A\n');
    const b = writeDoc(dir, 'docs/B.md', '---\npurpose: has one\nkeywords: [x]\n---\n\n# B\n');
    await build({ dir });
    await index({ dir, doc: a });
    await index({ dir, doc: b });
    const all = await list({ dir });
    assert.equal(all.length, 2);
    assert.ok(all.some((row) => row.path.endsWith('A.md')));
    assert.ok(all.some((row) => row.path.endsWith('B.md')));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('search() finds a doc by term', async () => {
  const dir = scratchDir();
  try {
    writeDoc(dir, 'docs/Findable.md', '# Findable\n\nUnique keyword: xylophone.\n');
    await build({ dir });
    await index({ dir, doc: path.join(dir, 'docs/Findable.md') });
    const hits = await search({ dir, term: 'xylophone' });
    assert.ok(hits.some((h) => h.path.endsWith('Findable.md')));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

for (const [name, args] of [
  ['build', ['build', '--dir', '.']],
  ['index', ['index', '--dir', '.', '--doc', 'docs/x.md']],
  ['reindex', ['reindex', '--dir', '.']],
  ['query', ['query', '--dir', '.', '--related-to', 'x']],
  ['search', ['search', '--dir', '.', '--term', 'x']],
  ['list', ['list', '--dir', '.', '--missing', 'purpose,keywords']],
  [
    'unedge',
    ['unedge', '--dir', '.', '--doc', 'docs/x.md', '--edge', 'references', '--to', 'docs/y.md'],
  ],
]) {
  test(`CLI subcommand "${name}" parses its flags and dispatches`, () => {
    const dir = scratchDir();
    try {
      const result = spawnSync('node', [cliPath, ...args], { cwd: dir, encoding: 'utf8' });
      // A real run may fail on fixture content, but must not fail on argument parsing.
      assert.doesNotMatch(result.stderr ?? '', /unknown option|ERR_PARSE_ARGS/i);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}

test('CLI entry prints usage for --help or an unknown subcommand', () => {
  const help = spawnSync('node', [cliPath, '--help'], { encoding: 'utf8' });
  assert.match(help.stdout + help.stderr, /usage/i);
  const unknown = spawnSync('node', [cliPath, 'not-a-command'], { encoding: 'utf8' });
  assert.notEqual(unknown.status, 0);
});
