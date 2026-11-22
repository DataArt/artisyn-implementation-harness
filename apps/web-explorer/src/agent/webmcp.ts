/**
 * Thin wrapper over the browser's native WebMCP API (Chrome: `document.modelContext`,
 * behind chrome://flags/#enable-webmcp-testing or the WebMCP origin trial). Lighthouse and
 * some implementations expose it on `navigator.modelContext`, so both are checked.
 */
export type RegisteredTool = {
  name: string;
  description: string;
  inputSchema: object;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: Record<string, unknown>) => Promise<unknown>;
};

type ModelContext = {
  registerTool(tool: RegisteredTool, options?: { signal?: AbortSignal }): Promise<void> | void;
};

export function getModelContext(): ModelContext | undefined {
  const host = (target: object) => (target as { modelContext?: ModelContext }).modelContext;
  return host(document) ?? host(navigator);
}
