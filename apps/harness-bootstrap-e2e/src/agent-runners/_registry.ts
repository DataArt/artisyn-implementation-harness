import { PROVIDERS, type Provider } from '../utils/providers.ts';
import { runClaudeSkill } from './run-claude-skill.ts';
import { runCodexSkill } from './run-codex-skill.ts';
import type { SkillRunner } from './_types.ts';

export { runClaudeSkill } from './run-claude-skill.ts';
export { runCodexSkill } from './run-codex-skill.ts';

/** The headless CLI adapter for each host. Keyed so a scenario resolves its
 * runner from the provider it was given instead of branching.
 */
export const runners: Record<Provider, SkillRunner> = {
  [PROVIDERS.claude]: runClaudeSkill,
  [PROVIDERS.codex]: runCodexSkill,
};
