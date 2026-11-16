import { result } from './grading.ts';
import type { GradeResult, GraderBinding } from './_types.ts';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'smol-toml';
import { PROVIDERS, PROVIDER_DETAILS } from '../utils/providers.ts';

/** Check the installed setting, independent of tool calls in the launch session. */
export function gradeCodexPlanToolConfigured(root: string): GradeResult {
  const settings = PROVIDER_DETAILS[PROVIDERS.codex].settings;
  const configPath = path.join(root, settings);
  const failures: string[] = [];
  try {
    const config = parse(fs.readFileSync(configPath, 'utf8'));
    const tools = config.tools;
    const plan =
      tools && typeof tools === 'object' && 'update_plan' in tools ? tools.update_plan : undefined;
    if (!plan || typeof plan !== 'object' || !('enabled' in plan) || plan.enabled !== true)
      failures.push(`${settings} must set tools.update_plan.enabled = true (boolean)`);
  } catch (error) {
    failures.push(`Cannot read or parse ${settings}: ${(error as Error).message}`);
  }
  return result('config', failures);
}

export const codexPlanToolConfigured = (): GraderBinding => (c) =>
  gradeCodexPlanToolConfigured(c.root);
