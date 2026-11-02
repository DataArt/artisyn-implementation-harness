import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { result } from '../graders/grading.ts';
import type { GraderBinding } from '../graders/_types.ts';
import { fixtures } from '../../fixtures/_registry.ts';
import { PROVIDERS } from '../utils/providers.ts';
import { agentRunSucceeded } from '../graders/_registry.ts';
import type { ScenarioDefinition, StepContext } from './_types.ts';

const OG_DIR = 'docs/.og';
const DB_FILE = `${OG_DIR}/docs-operational-graph.sqlite`;
const NEW_DOC = 'docs/Reindex Fixture Doc.md';
const REFERENCE_TARGET = 'docs/Reindex Reference Target.md';
const SQLITE_BEFORE = 'reindexGraphSqliteBefore';

/** The operational-graph package's deployed files — mirrors
 * `docs-adoption.grader.ts`'s `DOCS_GRAPH_FILES`, deliberately not imported
 * from there since that list is Cleanup's concern and this one is this
 * scenario's own fixture setup. */
const OG_FILES = [
  'cli.mjs',
  'constants.mjs',
  'schema.mjs',
  'utils.mjs',
  'docs.mjs',
  'edges.mjs',
  'docs-operational-graph.sqlite',
];

function runNode(args: string[], cwd: string): void {
  const outcome = spawnSync('node', args, { cwd, encoding: 'utf8' });
  if (outcome.status !== 0)
    throw new Error(`node ${args.join(' ')} failed in ${cwd}:\n${outcome.stderr}`);
}

/**
 * Simulates launch's own "Materialize operational graph" stage having
 * already completed — deterministically, in test setup — so this scenario
 * tests `reindex-graph` as a standalone follow-up operation. The launch
 * stage itself is `bootstrapScenario`'s concern (`docsGraphAdopted()`), not
 * this one's.
 */
async function seedMaterializedGraph({ grade }: StepContext): Promise<void> {
  const workspace = grade.workspaces[0];
  const ogSrc = path.join(workspace.packageRoot, 'canonical/docs/.og');
  const ogDest = path.join(workspace.root, OG_DIR);
  fs.mkdirSync(ogDest, { recursive: true });
  for (const file of OG_FILES) fs.copyFileSync(path.join(ogSrc, file), path.join(ogDest, file));
  runNode([path.join(ogDest, 'cli.mjs'), 'build', '--dir', workspace.root], workspace.root);
  fs.writeFileSync(
    path.join(workspace.root, REFERENCE_TARGET),
    '# Reindex Reference Target\n\nA second fixture doc for the content-reference scan to point at.\n'
  );
  runNode([path.join(ogDest, 'cli.mjs'), 'build', '--dir', workspace.root], workspace.root);
  grade.artifacts.set(SQLITE_BEFORE, fs.readFileSync(path.join(workspace.root, DB_FILE)));
  fs.writeFileSync(
    path.join(workspace.root, NEW_DOC),
    `# Reindex Fixture Doc\n\nAdded after the graph was already materialized. Implements ` +
      `[Reindex Reference Target](./Reindex%20Reference%20Target.md).\n`
  );
}

/** The one thing this scenario proves: a standalone `reindex-graph` run
 * picks up a doc added after the graph already existed — without redeploying
 * the tool itself (no copy step, unlike launch's Materialize stage). */
const reindexGraphPickedUpNewDoc = (): GraderBinding => (c) => {
  const workspace = c.workspaces[0];
  const failures: string[] = [];
  const docPath = path.join(workspace.root, NEW_DOC);
  const content = fs.readFileSync(docPath, 'utf8');
  if (!/^---\nid: /.test(content)) failures.push(`${NEW_DOC} did not get an id assigned`);
  const after = fs.readFileSync(path.join(workspace.root, DB_FILE));
  const before = c.artifacts.get(SQLITE_BEFORE) as Buffer;
  if (Buffer.compare(before, after) === 0)
    failures.push(`${DB_FILE} is byte-identical to before the reindex — it was not rebuilt`);
  return result('reindex-graph/picked-up-new-doc', failures);
};

/** The second thing this scenario proves: `reindex-graph`'s default run
 * includes the intelligent frontmatter scan (reference's Step 2), not just
 * the deterministic build — the fixture doc has neither `purpose:` nor
 * `keywords:` to start, and nothing but the agent reading its content can
 * write them (`cli.mjs` never derives or writes either itself). */
const reindexGraphWroteFrontmatter = (): GraderBinding => (c) => {
  const docPath = path.join(c.workspaces[0].root, NEW_DOC);
  const content = fs.readFileSync(docPath, 'utf8');
  const failures: string[] = [];
  if (!/^purpose:/m.test(content)) failures.push(`${NEW_DOC} has no purpose: frontmatter`);
  if (!/^keywords:/m.test(content)) failures.push(`${NEW_DOC} has no keywords: frontmatter`);
  return result('reindex-graph/wrote-frontmatter', failures);
};

/** The third thing this scenario proves: Step 2b's content-reference scan ran —
 * the fixture doc explicitly links `REFERENCE_TARGET` in its own prose, which
 * only a content-reading agent can turn into an edge (`cli.mjs` has no
 * markdown-link parser of its own). */
const reindexGraphWroteReferenceEdge = (): GraderBinding => (c) => {
  const workspace = c.workspaces[0];
  const db = new DatabaseSync(path.join(workspace.root, DB_FILE));
  try {
    const from = db.prepare('SELECT id FROM docs WHERE path = ?').get(NEW_DOC) as
      { id: string } | undefined;
    const to = db.prepare('SELECT id FROM docs WHERE path = ?').get(REFERENCE_TARGET) as
      { id: string } | undefined;
    if (!from || !to)
      return result('reindex-graph/wrote-reference-edge', [
        `could not resolve both doc rows (from=${Boolean(from)}, to=${Boolean(to)})`,
      ]);
    const edge = db
      .prepare('SELECT 1 FROM edges WHERE from_id = ? AND to_id = ? AND derived = 0')
      .get(from.id, to.id);
    return result(
      'reindex-graph/wrote-reference-edge',
      edge ? [] : [`no authored edge from ${NEW_DOC} to ${REFERENCE_TARGET}`]
    );
  } finally {
    db.close();
  }
};

export const reindexGraphScenario: ScenarioDefinition = {
  id: 'reindex-graph',

  requires: {
    fixtures: [fixtures.multiContainerProject],
    configurations: ['stubbed-baseline'],
    hosts: [PROVIDERS.claude],
    providers: [PROVIDERS.claude],
  },
  workspaces: 1,
  installPackage: true,

  steps: [
    { id: 'seed', run: seedMaterializedGraph },
    {
      id: 'reindex',
      agent: {
        prompt: (c) =>
          `/harness-bootstrap reindex-graph (package at ${path.relative(
            c.workspaces[0].root,
            c.workspaces[0].packageRoot
          )})`,
        timeoutMs: 8 * 60_000,
      },
      graders: [
        agentRunSucceeded(),
        reindexGraphPickedUpNewDoc(),
        reindexGraphWroteFrontmatter(),
        reindexGraphWroteReferenceEdge(),
      ],
    },
  ],
};
