import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { gradeCodexPlanToolConfigured } from '../../../graders/config.grader.ts';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

function workspace(config?: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plan-settings-grader-'));
  roots.push(root);
  fs.mkdirSync(path.join(root, '.codex'));
  if (config !== undefined) fs.writeFileSync(path.join(root, '.codex/config.toml'), config);
  return root;
}

it.each([
  '["tools"."update_plan"]\n"enabled" = true\n',
  '[tools.update_plan]\nenabled = true # native progress\n',
  'tools.update_plan.enabled = true\n',
  '[tools]\nupdate_plan = { enabled = true }\n',
])('accepts the installed native setting: %s', (config) => {
  expect(gradeCodexPlanToolConfigured(workspace(config)).pass).toBe(true);
});

it.each([
  undefined,
  '',
  '[tools.update_plan]\nenabled = false\n',
  '[tools.update_plan]\nenabled = "true"\n',
  '# tools.update_plan.enabled = true\n',
  '[unrelated.update_plan]\nenabled = true\n',
  '["tools.update_plan"]\nenabled = true\n',
  '[tools.update_plan]\nenabled = true\nenabled = false\n',
])('rejects missing, disabled, misplaced or invalid settings: %s', (config) => {
  const result = gradeCodexPlanToolConfigured(workspace(config));
  expect(result.pass).toBe(false);
  expect(result.failures).toHaveLength(1);
});
