#!/usr/bin/env node
/** Emit a reviewable launch plan. Does not install files or perform INTENT reasoning. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadManifest, renderItem } from './provider-adapter.mjs';
import { walk } from './lib/fs-walk.mjs';
import { sha256 } from './lib/fs-safe.mjs';
import { resolvePlanReplacements } from './lib/tokens.mjs';
import { parseArgs } from './lib/cli.mjs';
import { SAFE_NAME_RE } from './lib/constants.mjs';

// Every file this script's own output causes to be re-rendered again at
// materialize time — so a plan built against one version can't silently be
// consumed by a different one.
const ADAPTER_SOURCES = [
  'scripts/provider-adapter.mjs',
  'scripts/lib/manifest.mjs',
  'scripts/lib/agent-format.mjs',
  'scripts/lib/mcp-config.mjs',
];

function assertSelectionShape(manifest, selection) {
  const providers = selection.providers;
  if (
    !Array.isArray(providers) ||
    !providers.length ||
    new Set(providers).size !== providers.length ||
    providers.some((p) => !Object.hasOwn(manifest.providers, p))
  )
    throw new Error('Select claude, codex, or both (unique provider list)');
  if (!/^[a-zA-Z0-9_-]+$/.test(selection.run_id ?? ''))
    throw new Error('A simple run_id is required');
  const skills = selection.skills ?? [];
  const agents = selection.agents ?? [];
  if (!Array.isArray(skills) || skills.some((s) => !SAFE_NAME_RE.test(s)))
    throw new Error('Invalid selected skill');
  if (
    !Array.isArray(agents) ||
    agents.some((a) => !SAFE_NAME_RE.test(a.template) || !SAFE_NAME_RE.test(a.name))
  )
    throw new Error('Agents need template and name');
  return { providers, skills, agents };
}

/** A file-collecting closure bound to one plan: reads a canonical source,
 * resolves its project-token replacements against the plan's growing `knowns`,
 * and appends a plan file entry with its frozen source hash and reviewed
 * existing-target hash.
 */
function createFileAdder(root, packageRoot, plan) {
  return (source, target, provider, extra = {}) => {
    const { instanceKnowns = {}, ...options } = extra;
    const bytes = fs.readFileSync(path.join(packageRoot, source));
    const text = bytes.toString('utf8');
    const { replacements, preserve_tokens } = resolvePlanReplacements(text, {
      planKnowns: plan.knowns,
      instanceKnowns,
      agentName: extra.agent_name,
    });
    const existing = path.join(root, target);
    plan.files.push({
      source,
      source_sha256: sha256(bytes),
      target,
      provider,
      expected_target_sha256: fs.existsSync(existing) ? sha256(fs.readFileSync(existing)) : null,
      replacements,
      preserve_tokens,
      ...options,
    });
  };
}

/** Instance knowns every agent gets in addition to its own selection knowns:
 * its chosen installed name, so the layer template's `{{LAYER_NAME}}` (and
 * equivalents on other templates) always resolves without per-caller wiring.
 */
function agentInstanceKnowns(agent) {
  return {
    ...agent.knowns,
    LAYER_NAME: {
      value: agent.name,
      source: 'launch selection: component identity',
      status: 'confirmed',
    },
  };
}

function planSkillFiles(provider, providerConfig, skill, manifest, packageRoot, add) {
  const base = `canonical/${manifest.canonical.skills}/${skill}`;
  if (
    !fs.existsSync(path.join(packageRoot, base, 'TEMPLATE.md')) ||
    !fs.existsSync(path.join(packageRoot, base, 'INTENT.md'))
  )
    throw new Error(`Incomplete skill ${skill}`);
  for (const file of walk(path.join(packageRoot, base))) {
    const target = `${providerConfig.skills}/${skill}/${file === manifest.skillEntrypoint.source ? manifest.skillEntrypoint.target : file}`;
    const installIntent = file === manifest.intentFilename;
    add(`${base}/${file}`, target, provider, {
      intent: `${base}/INTENT.md`,
      temporary_intent: installIntent,
      derive: installIntent
        ? []
        : [
            {
              rule: `${base}/INTENT.md`,
              action:
                'Apply applicable project substitutions, conditionals and verification checks; record evidence before completion.',
            },
          ],
    });
  }
  for (const file of manifest.runtimeFiles)
    add(
      `canonical/${providerConfig.runtimeSource}/${file}`,
      `${providerConfig.skills}/${skill}/runtime/${file}`,
      provider
    );
}

function planAgentFiles(provider, providerConfig, agent, manifest, add) {
  const base = `canonical/${manifest.canonical.agents}/${agent.template}`;
  const extension = providerConfig.agentFormat === 'toml' ? 'toml' : 'md';
  add(`${base}/TEMPLATE.md`, `${providerConfig.agents}/${agent.name}.${extension}`, provider, {
    render: 'agent',
    agent_name: agent.name,
    instanceKnowns: agentInstanceKnowns(agent),
    intent: `${base}/INTENT.md`,
    derive: [
      {
        rule: `${base}/INTENT.md`,
        action: 'Specialize role from project evidence and verify the installed provider format.',
      },
    ],
  });
  add(
    `${base}/INTENT.md`,
    `${providerConfig.agentRuntime}/intents/${agent.name}/INTENT.md`,
    provider,
    {
      temporary_intent: true,
      agent_name: agent.name,
      instanceKnowns: agentInstanceKnowns(agent),
    }
  );
}

/** Settings/MCP config: added as a plain plan file when the target doesn't
 * already differ from the canonical rendering, otherwise reserved as a derived
 * output the orchestrator must reconcile with the existing local file by hand.
 */
function planProviderConfig(provider, providerConfig, manifest, root, packageRoot, plan, add) {
  const kinds = provider === 'codex' ? ['settings'] : ['settings', 'mcp'];
  for (const kind of kinds) {
    const target = providerConfig[kind];
    const source = `canonical/${manifest.canonical[kind]}`;
    const desired = renderItem('', { provider, render: kind }, packageRoot, manifest);
    const existing = path.join(root, target);
    if (fs.existsSync(existing) && fs.readFileSync(existing, 'utf8') !== desired) {
      plan.derived_outputs.push({
        target,
        expected_target_sha256: sha256(fs.readFileSync(existing)),
        rule: 'Reconcile canonical settings and MCP declarations with existing config. Preserve unrelated settings, hooks, servers and local policy; validate provider syntax.',
        inputs: [],
      });
    } else add(source, target, provider, { render: kind });
  }
}

function planInstructions(provider, providerConfig, root, plan) {
  plan.derived_outputs.push({
    target: providerConfig.instructions,
    expected_target_sha256: fs.existsSync(path.join(root, providerConfig.instructions))
      ? sha256(fs.readFileSync(path.join(root, providerConfig.instructions)))
      : null,
    rule: `Derive ${provider} root instructions from shared confirmed project facts. Preserve existing useful guidance and reference only installed skills and roles. Include an Agents table mapping each actual component, owned paths, specialist identity and responsibilities; never invent fixed component categories.`,
    inputs: [],
  });
}

function planProvider(provider, { skills, agents }, manifest, root, packageRoot, plan) {
  const providerConfig = manifest.providers[provider];
  const add = createFileAdder(root, packageRoot, plan);
  for (const skill of skills)
    planSkillFiles(provider, providerConfig, skill, manifest, packageRoot, add);
  for (const agent of agents) planAgentFiles(provider, providerConfig, agent, manifest, add);
  if (agents.length)
    for (const file of ['delegation.md', 'credentials.md'])
      add(
        `canonical/${providerConfig.runtimeSource}/${file}`,
        `${providerConfig.agentRuntime}/${file}`,
        provider
      );
  planProviderConfig(provider, providerConfig, manifest, root, packageRoot, plan, add);
  planInstructions(provider, providerConfig, root, plan);
}

function freezeAdapterSources(manifest, packageRoot, plan) {
  for (const source of [
    'canonical/manifest.json',
    `canonical/${manifest.canonical.settings}`,
    `canonical/${manifest.canonical.mcp}`,
    ...ADAPTER_SOURCES,
  ])
    plan.adapter_sources.push({
      source,
      sha256: sha256(fs.readFileSync(path.join(packageRoot, source))),
    });
}

function assertNoDuplicateTargets(plan) {
  const targets = plan.files.map((f) => f.target).concat(plan.derived_outputs.map((f) => f.target));
  if (new Set(targets).size !== targets.length) throw new Error('Duplicate selected outputs');
}

export function buildPlan(root, packageRoot, selection) {
  const manifest = loadManifest(packageRoot);
  const { providers, skills, agents } = assertSelectionShape(manifest, selection);
  const plan = {
    schema_version: 1,
    run_id: selection.run_id,
    providers,
    knowns: selection.knowns ?? {},
    adapter_sources: [],
    files: [],
    derived_outputs: [],
  };
  for (const provider of providers)
    planProvider(provider, { skills, agents }, manifest, root, packageRoot, plan);
  freezeAdapterSources(manifest, packageRoot, plan);
  assertNoDuplicateTargets(plan);
  return plan;
}

function main() {
  const args = parseArgs(process.argv.slice(2), {
    options: ['--root', '--package', '--selection'],
    defaults: {
      root: process.cwd(),
      package: path.dirname(path.dirname(fileURLToPath(import.meta.url))),
    },
  });
  if (!args.selection)
    throw new Error(
      'Usage: plan-provider-launch.mjs --selection FILE [--root ROOT] [--package PACKAGE]'
    );
  console.log(
    JSON.stringify(
      buildPlan(
        fs.realpathSync(args.root),
        fs.realpathSync(args.package),
        JSON.parse(fs.readFileSync(args.selection, 'utf8'))
      ),
      null,
      2
    )
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
