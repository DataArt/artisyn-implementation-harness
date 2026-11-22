'use client';

import { useEffect } from 'react';
import { asset } from '../site';
import { TOOL_DEFINITIONS } from './definitions';
import { getModelContext } from './webmcp';

// Chrome's docs do not say what registering the same name twice does, so each tool is
// registered once per document; the root layout keeps this component mounted.
let registered = false;

const indexUrls = { site: asset('/agent-index.json'), docs: asset('/docs/agent-index.json') };

/** Registers the site's WebMCP tools when the browser supports WebMCP; renders nothing. */
export default function AgentTools() {
  useEffect(() => {
    const modelContext = getModelContext();
    if (!modelContext || registered) return;
    registered = true;
    for (const definition of TOOL_DEFINITIONS) {
      void modelContext.registerTool({
        ...definition,
        // The tool logic and the indexes load on the first call, not with the page.
        execute: async (input) =>
          (await import('./tools')).runTool(definition.name, input ?? {}, indexUrls),
      });
    }
  }, []);
  return null;
}
