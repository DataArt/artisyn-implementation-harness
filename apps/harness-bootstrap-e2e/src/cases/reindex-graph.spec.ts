import { fixtures } from '../../fixtures/_registry.ts';
import { expect, it } from 'vitest';
import { runCase } from '../engine/case-run.ts';
import type { CaseDefinition } from './_types.ts';
import { reindexGraphScenario } from '../scenarios/_registry.ts';

export const reindexGraph: CaseDefinition = {
  id: 'reindex-graph',
  name: 'Standalone /harness-bootstrap reindex-graph picks up a doc added after materialization',
  fixture: fixtures.multiContainerProject,
  configuration: 'stubbed-baseline',
  scenario: reindexGraphScenario,
};

it(`${reindexGraph.id} ${reindexGraph.name}`, async () => {
  const report = await runCase(reindexGraph);
  expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
});
