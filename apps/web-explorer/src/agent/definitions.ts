/**
 * The WebMCP tools this site registers: names, descriptions, input schemas and annotations.
 * The registration shim and the agents page both read this list, so what the page documents
 * is what the browser registers. Plain data; no tool logic here.
 */
import { channels, providers } from '../views/get-started/commands';
import { WORKFLOW_IDS } from './workflows';

export type JsonSchema = {
  type: 'object';
  properties: Record<string, Record<string, unknown>>;
  required?: string[];
  additionalProperties?: boolean;
};

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  annotations: { readOnlyHint: boolean };
};

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'search_documentation',
    description:
      'Search the Artisyn Implementation Harness documentation articles and website pages by keyword. Returns ranked results with title, URL, path, description and a short snippet.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 1, maxLength: 200, description: 'Search keywords' },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 10,
          description: 'Maximum number of results (default 5)',
        },
        source: {
          type: 'string',
          enum: ['all', 'site', 'docs'],
          description: 'Search the website pages, the documentation, or both (default all)',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'get_page',
    description:
      'Get the title, description, headings and full text of one website page or documentation article, by the path a search_documentation result returned.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          minLength: 1,
          maxLength: 300,
          description:
            "Site path starting with '/', for example '/get-started/' or a '/docs/…' article path",
        },
      },
      required: ['path'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'get_install_instructions',
    description:
      'Get the install, launch and update instructions for the Artisyn Implementation Harness for one AI provider and one installation channel, with the exact commands and notes.',
    inputSchema: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: providers.map((p) => p.id),
          description: 'AI coding assistant',
        },
        channel: {
          type: 'string',
          enum: channels.map((c) => c.id),
          description: 'Installation channel',
        },
      },
      required: ['provider', 'channel'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'open_workflow',
    description:
      "Open a harness workflow's documentation in this browser tab: the dev, design, evolve or architecture lifecycle, or the documents flow.",
    inputSchema: {
      type: 'object',
      properties: {
        workflow: { type: 'string', enum: [...WORKFLOW_IDS], description: 'Workflow to open' },
      },
      required: ['workflow'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false },
  },
  {
    name: 'get_harness_capabilities',
    description:
      'Explain what the Artisyn Implementation Harness does: its capabilities, lifecycles and their commands, supported AI providers and installation channels, and demo scenarios.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
];
