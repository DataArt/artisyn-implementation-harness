import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fixtures } from '../../../fixtures/registry.ts';
import { PROVIDERS } from '../../testkit/providers.ts';
import { createFixture, installSkillPackage, type Workspace } from '../../testkit/fixture.ts';
import { runCodexSkill } from '../../agent-runners/run-codex-skill.ts';
import { runClaudeSkill } from '../../agent-runners/run-claude-skill.ts';
import { runBootstrap } from '../../scenarios/boot-e2e.shared.ts';
import type { SkillRunResult } from '../../agent-runners/types.ts';

vi.mock('../../testkit/fixture.ts');
vi.mock('../../agent-runners/run-codex-skill.ts');
vi.mock('../../agent-runners/run-claude-skill.ts');
let workspace: Workspace;
const launch: SkillRunResult = {
  exitCode: 0,
  stdout: '',
  stderr: '',
  durationMs: 0,
  events: [{ type: 'item.completed', item: { type: 'agent_message', text: 'Agent explanation' } }],
};
beforeEach(() => {
  vi.resetAllMocks();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hb-bootstrap-unit-'));
  workspace = {
    root,
    packageRoot: path.join(root, 'package'),
    fixture: fixtures.multiContainerProject,
    cleanup: vi.fn(async () => {}),
  };
  fs.mkdirSync(workspace.packageRoot);
  vi.mocked(createFixture).mockResolvedValue(workspace);
  vi.mocked(runCodexSkill).mockResolvedValue(launch);
  vi.mocked(runClaudeSkill).mockResolvedValue(launch);
});
afterEach(() => {
  fs.rmSync(workspace.root, { recursive: true, force: true });
});
it('reports agent failure with diagnostics and cleans up', async () => {
  vi.mocked(runCodexSkill).mockResolvedValue({ ...launch, exitCode: 1, stderr: 'CLI failed' });
  const grades = await runBootstrap(PROVIDERS.claude, PROVIDERS.codex);
  expect(grades).toHaveLength(1);
  expect(grades[0].grader).toBe('agent-run');
  expect(grades[0].failures.join('\n')).toContain('CLI failed');
  expect(grades[0].failures.join('\n')).toContain('Agent explanation');
  expect(installSkillPackage).toHaveBeenCalledWith(workspace, PROVIDERS.codex);
  expect(runClaudeSkill).not.toHaveBeenCalled();
  expect(workspace.cleanup).toHaveBeenCalledOnce();
});
it('retains initial grades and diagnoses a missing launch report', async () => {
  const grades = await runBootstrap(PROVIDERS.codex, PROVIDERS.claude);
  expect(grades.map((grade) => grade.grader)).toContain('filesystem');
  const state = grades.find((grade) => grade.grader === 'state');
  expect(state?.pass).toBe(false);
  expect(state?.failures.join('\n')).toContain('cannot identify primary launch run');
  expect(state?.failures.join('\n')).toContain('claude final response: Agent explanation');
  expect(workspace.cleanup).toHaveBeenCalledOnce();
});
it('cleans up when the runner throws', async () => {
  vi.mocked(runCodexSkill).mockRejectedValue(new Error('runner crashed'));
  await expect(runBootstrap(PROVIDERS.codex, PROVIDERS.codex)).rejects.toThrow('runner crashed');
  expect(workspace.cleanup).toHaveBeenCalledOnce();
});
