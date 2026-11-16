import { result, when } from '../../graders/grading.ts';
import type { GraderBinding } from '../../graders/_types.ts';
import { fixtures } from '../../../fixtures/_registry.ts';
import { describe, expect, it } from 'vitest';
import { runCase } from '../../engine/case-run.ts';
import { foldGrades } from '../../engine/grade.ts';
import { PROVIDERS } from '../../utils/providers.ts';
import type { CaseDefinition } from '../../cases/_types.ts';
import type { ScenarioDefinition } from '../../scenarios/_types.ts';

const check =
  (id = 'check'): GraderBinding =>
  () =>
    result(id, []);
const failing =
  (id = 'check'): GraderBinding =>
  () =>
    result(id, ['nope']);

function definition(
  scenario: ScenarioDefinition,
  overrides: Partial<CaseDefinition> = {}
): CaseDefinition {
  return {
    id: 'test',
    name: 'Test',
    fixture: fixtures.nxMonorepo,
    configuration: 'minimal',
    scenario,
    ...overrides,
  };
}

describe('scenario execution', () => {
  it('threads one context through the steps in order', async () => {
    const calls: string[] = [];
    const report = await runCase(
      definition({
        id: 'flow',
        steps: [
          {
            id: 'design',
            run: async ({ grade }) => {
              calls.push('design');
              grade.artifacts.set('design', 'approved');
              return { root: '/scratch' };
            },
            graders: [check()],
          },
          {
            id: 'dev',
            run: async ({ grade }) => {
              expect(grade.artifacts.get('design')).toBe('approved');
              expect(grade.root).toBe('/scratch');
              calls.push('dev');
            },
            graders: [check()],
          },
        ],
      })
    );
    expect(calls).toEqual(['design', 'dev']);
    expect(report.status).toBe('passed');
    expect(report.graders).toEqual({ 'design/check': 'pass', 'dev/check': 'pass' });
  });

  it('runs scenario-level graders once every step has passed', async () => {
    const report = await runCase(
      definition({
        id: 'flow',
        steps: [{ id: 'dev', run: async () => {}, graders: [check('step')] }],
        graders: [check('after')],
      })
    );
    expect(report.status).toBe('passed');
    expect(report.graders).toEqual({ 'dev/step': 'pass', 'flow/after': 'pass' });
  });

  it('reports a duplicate grader id at scenario level as a scenario failure', async () => {
    const report = await runCase(
      definition({
        id: 'flow',
        steps: [{ id: 'dev', run: async () => {}, graders: [check('step')] }],
        graders: [check('same'), check('same')],
      })
    );
    expect(report.status).toBe('failed');
    expect(report.failures.join('\n')).toContain('Scenario flow failed');
    expect(report.failures.join('\n')).toContain('duplicate grader id "same"');
  });

  it('blocks scenario-level graders when a step fails', async () => {
    const report = await runCase(
      definition({
        id: 'flow',
        steps: [{ id: 'dev', run: async () => {}, graders: [failing()] }],
        graders: [check('after')],
      })
    );
    expect(report.steps.map((s) => s.status)).toEqual(['failed', 'blocked']);
    expect(report.graders).toEqual({ 'dev/check': 'fail' });
  });

  it('appends transcript breadcrumbs to failing reports only', async () => {
    const withTranscript: ScenarioDefinition = {
      id: 'flow',
      steps: [
        {
          id: 'dev',
          run: async () => ({ transcriptPath: '/tmp/run.jsonl' }),
          graders: [failing()],
        },
      ],
    };
    const failed = await runCase(definition(withTranscript, { host: PROVIDERS.claude }));
    expect(failed.steps[0].failures).toEqual([
      '[check] nope',
      'Full claude transcript: /tmp/run.jsonl',
    ]);

    const passed = await runCase(
      definition(
        {
          id: 'flow',
          steps: [
            {
              id: 'dev',
              run: async () => ({ transcriptPath: '/tmp/run.jsonl' }),
              graders: [check()],
            },
          ],
        },
        { host: PROVIDERS.claude }
      )
    );
    expect(passed.steps[0].failures).toEqual([]);
  });

  it('skips graders whose predicate does not match', async () => {
    const report = await runCase(
      definition({
        id: 'flow',
        steps: [
          {
            id: 'dev',
            run: async () => {},
            graders: [when(() => false, failing('skipped')), check('ran')],
          },
        ],
      })
    );
    expect(report.status).toBe('passed');
    expect(report.graders).toEqual({ 'dev/ran': 'pass' });
  });

  it('blocks downstream work after a failure', async () => {
    let executed = false;
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
            },
            graders: [check()],
          },
        ],
      })
    );
    expect(report.steps.map((s) => s.status)).toEqual(['failed', 'blocked']);
    expect(executed).toBe(false);
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

  it('refuses a run that graded nothing', async () => {
    const report = await runCase(
      definition({ id: 'flow', steps: [{ id: 'dev', run: async () => {} }] })
    );
    expect(report.status).toBe('failed');
    expect(report.failures).toContain('Scenario completed without evaluating any grader');
  });
});

describe('scenario requirements', () => {
  const picky: ScenarioDefinition = {
    id: 'picky',
    requires: {
      fixtures: [fixtures.multiContainerProject],
      configurations: ['aws-dev'],
      hosts: [PROVIDERS.codex],
    },
    workspaces: 1,
    steps: [{ id: 'dev', run: async () => {}, graders: [check()] }],
  };

  it('rejects a mismatched case before creating any workspace, naming every mismatch', async () => {
    const report = await runCase(definition(picky, { host: PROVIDERS.claude }));
    expect(report.status).toBe('failed');
    const message = report.failures.join('\n');
    expect(message).toContain('Scenario picky does not accept this case');
    expect(message).toContain('fixture nx-monorepo');
    expect(message).toContain('configuration minimal');
    expect(message).toContain('host claude');
    // No step ran, so nothing was graded and no workspace was made.
    expect(report.steps).toEqual([]);
  });

  it('accepts a case that matches', async () => {
    const report = await runCase(
      definition(
        { ...picky, workspaces: 0 },
        {
          fixture: fixtures.multiContainerProject,
          configuration: 'aws-dev',
          host: PROVIDERS.codex,
        }
      )
    );
    expect(report.status).toBe('passed');
  });
});

describe('grade folding', () => {
  it('rejects a duplicate grader id rather than overwriting the first', () => {
    expect(() => foldGrades([result('docs', []), result('docs', ['bad'])])).toThrow(
      /duplicate grader id "docs"/
    );
  });

  it('prefixes each failure with its grader id', () => {
    const folded = foldGrades([result('a', ['x']), result('b', [])]);
    expect(folded.graders).toEqual({ a: 'fail', b: 'pass' });
    expect(folded.failures).toEqual(['[a] x']);
  });
});
