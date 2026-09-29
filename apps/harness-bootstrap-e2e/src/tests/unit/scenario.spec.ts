import { fixtures } from '../../../fixtures/registry.ts';
import { describe, expect, it } from 'vitest';
import { runCase, type CaseDefinition, type ScenarioDefinition } from '../../testkit/scenario.ts';
import { cases } from '../../cases/registry.ts';

const pass = { grader: 'check', pass: true, failures: [] };
function definition(scenario: ScenarioDefinition): CaseDefinition {
  return {
    id: 'test',
    name: 'Test',
    fixture: fixtures.nxMonorepo,
    configuration: 'minimal',
    scenario,
  };
}
describe('scenario execution', () => {
  it('shares artifacts in order and cleans up after the final step', async () => {
    const calls: string[] = [];
    const report = await runCase(
      definition({
        id: 'flow',
        setup: async (context) => {
          context.artifacts.set('workspace', 'scratch');
          calls.push('setup');
        },
        steps: [
          {
            id: 'design',
            run: async (context) => {
              expect(context.artifacts.get('workspace')).toBe('scratch');
              context.artifacts.set('design', 'approved');
              calls.push('design');
              return [pass];
            },
          },
          {
            id: 'dev',
            run: async (context) => {
              expect(context.artifacts.get('design')).toBe('approved');
              calls.push('dev');
              return [pass];
            },
          },
        ],
        cleanup: async () => {
          calls.push('cleanup');
        },
      })
    );
    expect(calls).toEqual(['setup', 'design', 'dev', 'cleanup']);
    expect(report.status).toBe('passed');
    expect(report.graders).toEqual({ 'design/check': 'pass', 'dev/check': 'pass' });
  });
  it('blocks downstream work after a failure and still cleans up', async () => {
    let executed = false;
    let cleaned = false;
    const report = await runCase(
      definition({
        id: 'flow',
        steps: [
          {
            id: 'design',
            run: async () => {
              throw new Error('design crashed');
            },
          },
          {
            id: 'dev',
            run: async () => {
              executed = true;
              return [pass];
            },
          },
        ],
        cleanup: async () => {
          cleaned = true;
        },
      })
    );
    expect(report.steps.map((s) => s.status)).toEqual(['failed', 'blocked']);
    expect(executed).toBe(false);
    expect(cleaned).toBe(true);
    expect(report.passed).toBe(false);
  });
  it('reports unimplemented steps as blocked', async () => {
    const report = await runCase(
      definition({ id: 'stub', steps: [{ id: 'design' }, { id: 'dev' }] })
    );
    expect(report.status).toBe('blocked');
    expect(report.requiredGradersPassed).toBe(false);
    expect(report.steps[1].failures).toEqual(['Blocked by design']);
  });
  it('handles setup and cleanup failures and empty grades', async () => {
    const setup = await runCase(
      definition({
        id: 'flow',
        setup: async () => {
          throw new Error('setup');
        },
        steps: [{ id: 'dev' }],
      })
    );
    expect(setup.status).toBe('failed');
    expect(setup.steps[0].status).toBe('blocked');
    const cleanup = await runCase(
      definition({
        id: 'flow',
        steps: [{ id: 'dev', run: async () => [pass] }],
        cleanup: async () => {
          throw new Error('cleanup');
        },
      })
    );
    expect(cleanup.status).toBe('failed');
    const empty = await runCase(
      definition({ id: 'flow', steps: [{ id: 'dev', run: async () => [] }] })
    );
    expect(empty.status).toBe('failed');
  });
});
describe('case registry', () => {
  it('lists each E2E spec exactly once without registering its tests', async () => {
    const { readdir } = await import('node:fs/promises');
    const specs = (await readdir(new URL('../../cases/', import.meta.url)))
      .filter((name) => name.endsWith('.spec.ts'))
      .sort();
    expect(cases.map((c) => c.path.split('/').at(-1)).sort()).toEqual(specs);
    expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
    for (const entry of cases) expect(entry.path).toBe(`src/cases/${entry.id}.spec.ts`);
  });
});
