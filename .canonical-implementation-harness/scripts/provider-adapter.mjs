/** Provider rendering is deterministic; project reasoning belongs to INTENT.
 *
 * This file is the frozen public entry point other scripts, tests, and every
 * provider-plan `adapter_sources` hash depend on — its own path and export
 * surface must not change. Actual rendering logic lives in `lib/*`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { providerText } from './lib/manifest.mjs';
import { renderAgent } from './lib/agent-format.mjs';
import { renderConfig } from './lib/mcp-config.mjs';

export { providerText, renderAgent, renderConfig };

/** Render one plan file entry's already-substituted text into its final bytes:
 * apply `{{provider:*}}` tokens (unless already `adapted`), then the entry's
 * declared renderer (`agent`, `settings`/`mcp`, or plain `text`).
 */
export function renderItem(text, item, packageRoot, manifest, adapted = false) {
  if (!item.provider) return text;
  if (!adapted) text = providerText(text, item.provider, manifest);
  if (item.render === 'agent') return renderAgent(text, item.provider, item.agent_name);
  if (['settings', 'mcp'].includes(item.render)) {
    const c = manifest.canonical;
    return renderConfig(
      item.render,
      item.provider,
      JSON.parse(fs.readFileSync(path.join(packageRoot, 'canonical', c.settings), 'utf8')),
      JSON.parse(fs.readFileSync(path.join(packageRoot, 'canonical', c.mcp), 'utf8'))
    );
  }
  if (item.render && item.render !== 'text') throw new Error(`Unknown renderer: ${item.render}`);
  return text;
}

export { loadManifest } from './lib/manifest.mjs';
export { agentFields, toml } from './lib/agent-format.mjs';
