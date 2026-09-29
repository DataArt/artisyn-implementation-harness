import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'smol-toml';
import type { GradeResult } from './filesystem.grader.ts';

/** Check the installed setting, independent of tool calls in the launch session. */
export function gradeCodexPlanToolConfigured(root: string): GradeResult {
  const configPath = path.join(root, '.codex/config.toml');
  const failures: string[] = [];
  try {
    const config = parse(fs.readFileSync(configPath, 'utf8'));
    const tools = config.tools;
    const plan = tools && typeof tools === 'object' && 'update_plan' in tools
      ? tools.update_plan
      : undefined;
    if (!plan || typeof plan !== 'object' || !('enabled' in plan) || plan.enabled !== true)
      failures.push('.codex/config.toml must set tools.update_plan.enabled = true (boolean)');
  } catch (error) {
    failures.push(`Cannot read or parse .codex/config.toml: ${(error as Error).message}`);
  }
  return { grader: 'config', pass: failures.length === 0, failures };
}
