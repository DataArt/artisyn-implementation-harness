export const PROVIDERS = {
  claude: 'claude',
  codex: 'codex',
} as const;

export type Provider = (typeof PROVIDERS)[keyof typeof PROVIDERS];

export interface ProviderDetails {
  name: string;
  skills: string;
  instructions: string;
  agents: string;
  extension: string;
  settings: string;
  invocationPrefix: string;
}

export const PROVIDER_DETAILS: Record<Provider, ProviderDetails> = {
  [PROVIDERS.claude]: {
    name: 'Claude',
    skills: '.claude/skills',
    instructions: 'CLAUDE.md',
    agents: '.claude/agents',
    extension: 'md',
    settings: '.claude/settings.json',
    invocationPrefix: '/',
  },
  [PROVIDERS.codex]: {
    name: 'Codex',
    skills: '.agents/skills',
    instructions: 'AGENTS.md',
    agents: '.codex/agents',
    extension: 'toml',
    settings: '.codex/config.toml',
    invocationPrefix: '$',
  },
};
