/** Load and validate `canonical/manifest.json`, and resolve `{{provider:*}}`
 * tokens against it. Manifest validation is deliberately strict: an unsafe path
 * or an unsupported provider shape fails loudly rather than being silently
 * accepted and mismapped later.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PROVIDER_NAMES, SUPPORTED_AGENT_FORMATS, INVOCATION_PREFIX_RE } from './constants.mjs';

const isSafeRelativePath = (value) =>
  typeof value === 'string' &&
  value.length > 0 &&
  !path.isAbsolute(value) &&
  !value.includes('\\') &&
  !value.includes('\0') &&
  value.split('/').every((part) => part && part !== '.' && part !== '..');

function assertCanonicalPaths(manifest) {
  const keys = ['skills', 'agents', 'docs', 'settings', 'mcp'];
  if (!manifest.canonical || keys.some((key) => !isSafeRelativePath(manifest.canonical[key])))
    throw new Error('Unsafe canonical manifest path');
}

function assertRuntimeInventory(manifest) {
  if (!manifest.providers || !manifest.runtimeFiles?.length)
    throw new Error('Invalid provider runtime inventory');
  if (manifest.runtimeFiles.some((file) => !isSafeRelativePath(file)))
    throw new Error('Invalid provider runtime inventory');
}

function assertEntrypointMapping(manifest) {
  if (
    manifest.skillEntrypoint?.source !== 'TEMPLATE.md' ||
    manifest.skillEntrypoint?.target !== 'SKILL.md' ||
    manifest.intentFilename !== 'INTENT.md'
  )
    throw new Error('Unsupported entrypoint or INTENT mapping');
}

function assertProviderShape(name, provider) {
  const pathKeys = [
    'skills',
    'agents',
    'instructions',
    'settings',
    'mcp',
    'runtimeSource',
    'agentRuntime',
  ];
  if (!PROVIDER_NAMES.includes(name) || pathKeys.some((key) => !isSafeRelativePath(provider[key])))
    throw new Error('Invalid provider paths');
  if (
    !SUPPORTED_AGENT_FORMATS.includes(provider.agentFormat) ||
    !INVOCATION_PREFIX_RE.test(provider.invocationPrefix ?? '')
  )
    throw new Error('Unsupported provider format');
}

export function loadManifest(packageRoot) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(packageRoot, 'canonical/manifest.json'), 'utf8')
  );
  if (manifest.schemaVersion !== 1) throw new Error('Unsupported provider manifest');
  assertCanonicalPaths(manifest);
  assertRuntimeInventory(manifest);
  assertEntrypointMapping(manifest);
  for (const [name, provider] of Object.entries(manifest.providers))
    assertProviderShape(name, provider);
  return manifest;
}

/** Resolve `{{provider:*}}` tokens in `text` for one selected `provider`:
 * skill/agent roots, the root instruction file, the agent runtime directory,
 * the native agent file extension, and `{{provider:invoke:<skill>}}` (that
 * provider's invocation prefix followed by the skill name) plus the bare
 * `{{provider:input}}` placeholder for "the text after the invocation".
 */
export function providerText(text, provider, manifest) {
  const p = manifest.providers[provider];
  if (!p) throw new Error(`Unknown provider: ${provider}`);
  const tokens = {
    skills_root: p.skills,
    agents_root: p.agents,
    instructions_file: p.instructions,
    agent_runtime: p.agentRuntime,
    agent_extension: p.agentFormat === 'toml' ? 'toml' : 'md',
    input:
      provider === 'claude' ? '$ARGUMENTS' : 'the user request accompanying this skill invocation',
  };
  return text.replace(/\{\{provider:([a-z_]+|invoke:[a-z-]+)\}\}/g, (token, key) => {
    if (key.startsWith('invoke:')) return p.invocationPrefix + key.slice(7);
    if (!Object.hasOwn(tokens, key)) throw new Error(`Unknown provider token: ${token}`);
    return tokens[key];
  });
}
