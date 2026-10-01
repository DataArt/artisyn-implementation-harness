import { result } from './grading.ts';
import type { GradeContext, GradeResult, GraderBinding } from './_types.ts';
import { PROVIDERS, PROVIDER_DETAILS } from '../utils/providers.ts';
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { readJson } from '../utils/fs.ts';
import { CANONICAL_AGENTS, CANONICAL_MANIFEST } from '../utils/constants.ts';

const SKILL_PROJECTION = 'projection/skills';
const AGENT_PROJECTION = 'projection/agents';
import type { Provider } from '../utils/build-launch.ts';
// @ts-expect-error -- plain ESM .mjs, no type declarations published
import { AGENT_WRITE_TOOLS } from '../../../../.canonical-implementation-harness/scripts/lib/constants.mjs';

function frontmatter(text: string): Record<string, unknown> {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error('No YAML frontmatter found');
  return parseYaml(match[1]) as Record<string, unknown>;
}

/** The canonical->TOML renderer (agent-format.mjs's `toml()`) always quotes
 * both keys and string values via JSON.stringify, so a plain top-level-key
 * regex is exact for the fields we care about — no TOML dependency needed.
 */
function tomlField(text: string, key: string): string | undefined {
  const match = text.match(new RegExp(`^${JSON.stringify(key)} = (".*")$`, 'm'));
  return match ? (JSON.parse(match[1]) as string) : undefined;
}

/** Structural cross-provider check: the same canonical skill, installed for
 * both providers, must carry the same `name`/`description` — provider-adapter.mjs
 * only ever substitutes `{{provider:*}}` tokens (paths, invocation prefix,
 * agent runtime, format), never the skill's declared identity or intent.
 * Catches a regression that lets provider text rendering leak into content
 * that's supposed to stay semantically identical across providers.
 */
/** A description legitimately mentions invoking any skill (`/dev` vs `$dev`,
 * `/where-we-are` vs `$where-we-are`, ...) per
 * manifest.providers[p].invocationPrefix — that's the one substitution
 * `{{provider:invoke:*}}` is allowed to make, and it isn't always the
 * described skill's own name. Claude's `/` prefix collides with an ordinary
 * file-path separator (e.g. "docs/System Architecture (LLD)/where-we-are/"),
 * so match only a known skill name, and only when not immediately followed
 * by another `/` (a real path continues; an invocation doesn't).
 */
function normalizeInvocations(text: string, prefix: string, skillNames: string[]): string {
  if (!prefix) return text;
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let result = text;
  for (const name of skillNames)
    result = result.replace(new RegExp(`${escapedPrefix}${name}(?!/)`, 'g'), '<<invoke>>');
  return result;
}

export function gradeSkillProjectionConsistency(
  root: string,
  skills: string[],
  providers: Provider[],
  invocationPrefixes: Partial<Record<Provider, string>> = {}
): GradeResult {
  const failures: string[] = [];
  for (const skill of skills) {
    const installed: Record<string, Record<string, unknown>> = {};
    for (const provider of providers) {
      const target = path.join(root, PROVIDER_DETAILS[provider].skills, skill, 'SKILL.md');
      if (!fs.existsSync(target)) {
        failures.push(`missing installed skill for ${provider}: ${target}`);
        continue;
      }
      const text = fs.readFileSync(target, 'utf8');
      if (/\{\{provider:[a-z_]+(?::[a-z-]+)?\}\}/.test(text))
        failures.push(`unresolved {{provider:*}} placeholder left in ${target}`);
      try {
        installed[provider] = frontmatter(text);
      } catch (error) {
        failures.push(`${target}: ${(error as Error).message}`);
      }
    }
    if (providers.length > 1 && providers.every((p) => installed[p])) {
      const [first, ...rest] = providers;
      for (const other of rest) {
        if (installed[first].name !== installed[other].name)
          failures.push(
            `skill "${skill}" name diverges across providers: ${first}=${installed[first].name}, ${other}=${installed[other].name}`
          );
        const firstDescription = normalizeInvocations(
          String(installed[first].description ?? ''),
          invocationPrefixes[first] ?? '',
          skills
        );
        const otherDescription = normalizeInvocations(
          String(installed[other].description ?? ''),
          invocationPrefixes[other] ?? '',
          skills
        );
        if (firstDescription !== otherDescription)
          failures.push(
            `skill "${skill}" description diverges across providers (${first} vs ${other})`
          );
      }
    }
  }
  return result(SKILL_PROJECTION, failures);
}

/** Same idea for agents: Claude Markdown frontmatter vs Codex TOML must carry
 * the same name/description, and Codex's derived `sandbox_mode` must agree
 * with whether Claude's `tools` field includes a write-capable tool — the
 * one piece of real semantic derivation agent-format.mjs performs per provider.
 */
export function gradeAgentProjectionConsistency(
  root: string,
  agents: Array<{ name: string }>,
  providers: Provider[],
  invocationPrefixes: Partial<Record<Provider, string>> = {},
  skillNames: string[] = []
): GradeResult {
  const failures: string[] = [];
  for (const { name } of agents) {
    let claudeFields: Record<string, unknown> | undefined;
    let codexText: string | undefined;
    if (providers.includes(PROVIDERS.claude)) {
      const target = path.join(root, PROVIDER_DETAILS[PROVIDERS.claude].agents, `${name}.md`);
      if (!fs.existsSync(target)) failures.push(`missing installed agent for claude: ${target}`);
      else {
        const text = fs.readFileSync(target, 'utf8');
        if (/\{\{provider:[a-z_]+(?::[a-z-]+)?\}\}/.test(text))
          failures.push(`unresolved {{provider:*}} placeholder left in ${target}`);
        claudeFields = frontmatter(text);
      }
    }
    if (providers.includes(PROVIDERS.codex)) {
      const target = path.join(root, PROVIDER_DETAILS[PROVIDERS.codex].agents, `${name}.toml`);
      if (!fs.existsSync(target)) failures.push(`missing installed agent for codex: ${target}`);
      else codexText = fs.readFileSync(target, 'utf8');
    }
    if (claudeFields && codexText) {
      const codexName = tomlField(codexText, 'name');
      const codexDescription = tomlField(codexText, 'description');
      if (codexName !== claudeFields.name)
        failures.push(
          `agent "${name}" name diverges: claude=${claudeFields.name}, codex=${codexName}`
        );
      const claudeNormalized = normalizeInvocations(
        (claudeFields.description as string).trim(),
        invocationPrefixes.claude ?? '',
        skillNames
      );
      const codexNormalized = normalizeInvocations(
        codexDescription ?? '',
        invocationPrefixes.codex ?? '',
        skillNames
      );
      if (claudeNormalized !== codexNormalized)
        failures.push(`agent "${name}" description diverges between claude and codex`);
      const tools = String(claudeFields.tools ?? '')
        .split(',')
        .map((t) => t.trim());
      const expectedSandbox = tools.some((t: string) => AGENT_WRITE_TOOLS.includes(t))
        ? 'workspace-write'
        : 'read-only';
      const sandboxMatch = codexText.match(/^"sandbox_mode" = "(.*)"$/m);
      if (sandboxMatch?.[1] !== expectedSandbox)
        failures.push(
          `agent "${name}" sandbox_mode "${sandboxMatch?.[1]}" doesn't match claude tools=${claudeFields.tools} (expected ${expectedSandbox})`
        );
    }
  }
  return result(AGENT_PROJECTION, failures);
}

/** Each provider's invocation prefix comes from the canonical manifest rather
 * than the launch, so consistency is judged against the declared contract.
 */
function invocationPrefixes(c: GradeContext): Partial<Record<Provider, string>> {
  const manifest = readJson<{ providers: Record<string, { invocationPrefix: string }> }>(
    path.join(c.packageRoot, CANONICAL_MANIFEST)
  );
  return Object.fromEntries(
    c.providers.map((p) => [p, manifest.providers[p].invocationPrefix])
  ) as Partial<Record<Provider, string>>;
}

/** The `layer` agent template expands into one agent per discovered container. */
function expectedAgents(c: GradeContext): Array<{ name: string }> {
  return fs
    .readdirSync(path.join(c.packageRoot, CANONICAL_AGENTS))
    .flatMap((template) =>
      template === 'layer' ? c.containers.map((name) => ({ name })) : [{ name: template }]
    );
}

/** `skillsKey` names the artifact the launch step recorded its skill list under. */
export const skillProjectionConsistency =
  (skillsKey: string): GraderBinding =>
  (c) =>
    gradeSkillProjectionConsistency(
      c.root,
      c.artifacts.get(skillsKey) as string[],
      c.providers,
      invocationPrefixes(c)
    );

export const agentProjectionConsistency =
  (skillsKey: string): GraderBinding =>
  (c) =>
    gradeAgentProjectionConsistency(
      c.root,
      expectedAgents(c),
      c.providers,
      invocationPrefixes(c),
      c.artifacts.get(skillsKey) as string[]
    );
