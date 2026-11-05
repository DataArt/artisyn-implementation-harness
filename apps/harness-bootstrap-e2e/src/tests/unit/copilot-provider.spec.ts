/* eslint-disable @typescript-eslint/no-explicit-any -- plans and adapter exports are untyped ESM. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';
import { parse as parseYaml } from 'yaml';
// @ts-expect-error -- plain ESM .mjs
import { buildPlan } from '../../../../../.canonical-implementation-harness/scripts/plan-provider-launch.mjs';
import {
  renderAgent,
  renderConfig,
  providerText,
  loadManifest,
  // @ts-expect-error -- plain ESM .mjs
} from '../../../../../.canonical-implementation-harness/scripts/provider-adapter.mjs';
const origin = fileURLToPath(
  new URL('../../../../../.canonical-implementation-harness', import.meta.url)
);
const settings = { schemaVersion: 1, copilot: {} };
const mcp = {
  mcpServers: {
    local: { command: 'demo', args: ['--stdio'], env: { TOKEN: '${TOKEN}' } },
    remote: { url: 'https://example.test/mcp', bearerTokenEnvVar: 'AUTH_TOKEN' },
  },
};
const agent =
  '---\nname: reviewer\ndescription: Review a change\ntools: Read, Glob, Grep, Write, Edit, Bash, Task, WebSearch, WebFetch, mcp__demo__check\n---\nReview the supplied changes.\n';

describe('Copilot provider', () => {
  it('renders a native restricted agent, preserving identity and deduplicating tools', () => {
    const result = renderAgent(agent, 'copilot', 'reviewer');
    const fields = parseYaml(result.match(/^---\n([\s\S]*?)\n---/)![1]);
    expect(fields).toMatchObject({
      name: 'reviewer',
      description: 'Review a change',
      tools: ['read', 'search', 'edit', 'execute', 'agent', 'web', 'demo/check'],
      'strict-tools-list': true,
      'include-custom-instructions': true,
    });
    expect(fields.model).toBeUndefined();
    expect(result).toContain('Review the supplied changes.');
    expect(
      renderAgent(
        agent.replace(
          'tools: Read, Glob, Grep, Write, Edit, Bash, Task, WebSearch, WebFetch, mcp__demo__check',
          'tools: Read, Glob, Grep'
        ),
        'copilot',
        'reviewer'
      )
    ).not.toContain('"edit"');
    expect(
      renderAgent(
        agent.replace('tools:', 'model: claude-sonnet-4.6\ntools:'),
        'copilot',
        'reviewer'
      )
    ).toContain('model: "claude-sonnet-4.6"');
    for (const model of ['sonnet', 'opus', 'haiku', 'inherit'])
      expect(() =>
        renderAgent(agent.replace('tools:', `model: ${model}\ntools:`), 'copilot', 'reviewer')
      ).toThrow('native model ID');
    expect(() =>
      renderAgent(
        agent.replace(
          'Read, Glob, Grep, Write, Edit, Bash, Task, WebSearch, WebFetch, mcp__demo__check',
          '*'
        ),
        'copilot',
        'reviewer'
      )
    ).toThrow('Unsupported Copilot agent tool');
    expect(() => renderAgent(agent.replace(/^tools:.*\n/m, ''), 'copilot', 'reviewer')).toThrow(
      'explicit tool scope'
    );
    expect(() => renderAgent(agent + 'x'.repeat(30001), 'copilot', 'reviewer')).toThrow('30000');
    expect(() => renderAgent(agent, 'unknown', 'reviewer')).toThrow('Unknown provider');
    expect(
      providerText(
        '{{provider:agents_root}}/x.{{provider:agent_extension}} {{provider:invoke:dev}}',
        'copilot',
        loadManifest(origin)
      )
    ).toBe('.github/agents/x.agent.md /dev');
  });

  it('renders portable MCP configuration without expanding credentials', () => {
    const native = JSON.parse(renderConfig('mcp', 'copilot', settings, mcp));
    expect(native.mcpServers.local).toMatchObject({
      type: 'stdio',
      env: { TOKEN: '${TOKEN}' },
      tools: ['*'],
    });
    expect(native.mcpServers.remote.headers.Authorization).toBe('Bearer ${AUTH_TOKEN}');
    expect(mcp.mcpServers.remote).toHaveProperty('bearerTokenEnvVar');
    expect(JSON.parse(renderConfig('settings', 'copilot', settings, mcp))).toEqual({});
    expect(() =>
      renderConfig(
        'settings',
        'copilot',
        { schemaVersion: 1, copilot: { approval_policy: 'never' } },
        mcp
      )
    ).toThrow('repository setting');
    expect(() =>
      renderConfig(
        'settings',
        'copilot',
        { schemaVersion: 1, copilot: { disabledSkills: [42] } },
        mcp
      )
    ).toThrow('requires strings');
    expect(() =>
      renderConfig(
        'settings',
        'copilot',
        { schemaVersion: 1, copilot: { contextTier: 'huge' } },
        mcp
      )
    ).toThrow('contextTier');
    expect(() =>
      renderConfig('mcp', 'copilot', settings, {
        mcpServers: { bad: { command: 'demo', env: { TOKEN: 'literal' } } },
      })
    ).toThrow('environment variable');
    expect(() => renderConfig('unknown', 'copilot', settings, mcp)).toThrow('Unknown config kind');
  });

  it.each([
    [{ contextTier: '' }, 'contextTier'],
    [{ mergeStrategy: '' }, 'mergeStrategy'],
    [{ mergeStrategy: 'squash' }, 'mergeStrategy'],
    [{ enabledPlugins: { 'demo@local': 'false' } }, 'enabledPlugins'],
    [{ enabledPlugins: { 'demo@local': null } }, 'enabledPlugins'],
    [{ extraKnownMarketplaces: { local: {} } }, 'extraKnownMarketplaces'],
    [{ extraKnownMarketplaces: { local: null } }, 'extraKnownMarketplaces'],
    [{ extraKnownMarketplaces: { local: { source: [] } } }, 'extraKnownMarketplaces'],
    [
      { extraKnownMarketplaces: { local: { source: { source: 'unknown' } } } },
      'extraKnownMarketplaces',
    ],
    [
      { extraKnownMarketplaces: { local: { source: { source: 'github' } } } },
      'extraKnownMarketplaces',
    ],
    [
      { extraKnownMarketplaces: { local: { source: { source: 'github', repo: 'repo' } } } },
      'extraKnownMarketplaces',
    ],
    [
      { extraKnownMarketplaces: { local: { source: { source: 'git', url: '' } } } },
      'extraKnownMarketplaces',
    ],
    [
      { extraKnownMarketplaces: { local: { source: { source: 'directory', path: ' ' } } } },
      'extraKnownMarketplaces',
    ],
    [
      {
        extraKnownMarketplaces: {
          local: { source: { source: 'github', repo: 'org/repo', ref: 42 } },
        },
      },
      'extraKnownMarketplaces',
    ],
    [
      {
        extraKnownMarketplaces: {
          local: { source: { source: 'directory', path: './plugins' }, autoUpdate: 'true' },
        },
      },
      'extraKnownMarketplaces',
    ],
  ])('rejects invalid repository settings %j', (copilot, field) => {
    for (const kind of ['settings', 'mcp'])
      expect(() => renderConfig(kind, 'copilot', { schemaVersion: 1, copilot }, mcp)).toThrow(
        field
      );
  });

  it.each([
    { source: 'github', repo: 'example/plugins', ref: 'main', path: 'marketplace' },
    { source: 'git', url: 'https://example.test/plugins.git', ref: 'v1' },
    { source: 'directory', path: './plugins' },
  ])('preserves valid native repository settings and marketplace %j', (source) => {
    const copilot = {
      contextTier: 'long_context',
      mergeStrategy: 'rebase',
      enabledPlugins: { 'enabled@local': true, 'disabled@local': false },
      extraKnownMarketplaces: { local: { source, autoUpdate: false } },
    };
    const before = structuredClone(copilot);
    expect(
      JSON.parse(renderConfig('settings', 'copilot', { schemaVersion: 1, copilot }, mcp))
    ).toEqual(before);
    expect(copilot).toEqual(before);
    expect(
      JSON.parse(
        renderConfig(
          'settings',
          'copilot',
          {
            schemaVersion: 1,
            copilot: { contextTier: 'default', mergeStrategy: 'merge' },
          },
          mcp
        )
      )
    ).toEqual({ contextTier: 'default', mergeStrategy: 'merge' });
  });

  it.each([
    ['copilot'],
    ['claude', 'copilot'],
    ['codex', 'copilot'],
    ['claude', 'codex', 'copilot'],
    ['copilot', 'claude'],
  ])(
    'materializes an isolated selection %j with unique outputs and permanent runtime',
    (...providers: string[]) => {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-launch-'));
      const pkg = path.join(root, 'bootstrap');
      try {
        for (const dir of ['canonical', 'scripts'])
          fs.cpSync(path.join(origin, dir), path.join(pkg, dir), { recursive: true });
        const selection = {
          run_id: 'copilot',
          providers,
          skills: ['dev'],
          agents: [{ template: 'architect', name: 'architect' }],
          knowns: { PROJECT_NAME: { value: 'Fixture', source: 'fixture', status: 'verified' } },
        };
        const plan = buildPlan(root, pkg, selection);
        expect(plan).toEqual(buildPlan(root, pkg, selection));
        const outputs = [...plan.files, ...plan.derived_outputs].map((f: any) => f.target);
        expect(new Set(outputs).size).toBe(outputs.length);
        expect(plan.files.some((f: any) => f.target === '.github/agents/architect.agent.md')).toBe(
          true
        );
        if (providers.includes('claude')) {
          expect(plan.derived_outputs.some((f: any) => f.target === '.mcp.json')).toBe(false);
          expect(plan.files.find((f: any) => f.target === '.mcp.json').providers).toEqual([
            'claude',
            'copilot',
          ]);
        }
        const planFile = path.join(root, 'plan.json');
        fs.writeFileSync(planFile, JSON.stringify(plan));
        const run = (...args: string[]) =>
          spawnSync(
            process.execPath,
            [
              path.join(pkg, 'scripts/materialize-launch.mjs'),
              '--root',
              root,
              '--package',
              pkg,
              '--plan',
              planFile,
              ...args,
            ],
            { encoding: 'utf8' }
          );
        for (const mode of ['--check', '--write', '--write']) {
          const result = run(mode);
          expect(result.status, result.stderr).toBe(0);
        }
        expect(fs.existsSync(path.join(root, '.vscode'))).toBe(false);
        expect(JSON.parse(fs.readFileSync(path.join(root, '.mcp.json'), 'utf8'))).toHaveProperty(
          'mcpServers'
        );
        expect(fs.existsSync(path.join(root, '.github/skills/dev/INTENT.md'))).toBe(false);
        const receipt = JSON.parse(
          fs.readFileSync(path.join(pkg, 'state/launch/runs/copilot/materialization.json'), 'utf8')
        );
        expect(receipt.providers).toEqual(providers);
        fs.appendFileSync(path.join(pkg, 'scripts/lib/constants.mjs'), '\n');
        const changed = run('--check');
        expect(
          changed.stderr,
          JSON.stringify({ status: changed.status, error: changed.error, stdout: changed.stdout })
        ).toContain('Adapter input changed');
        fs.rmSync(pkg, { recursive: true, force: true });
        expect(fs.existsSync(path.join(root, '.github/skills/dev/runtime/review.md'))).toBe(true);
        expect(
          fs.readFileSync(path.join(root, '.github/agents/architect.agent.md'), 'utf8')
        ).toContain('.github/harness-runtime/delegation.md');
        if (!providers.includes('codex'))
          expect(fs.existsSync(path.join(root, '.codex'))).toBe(false);
        if (!providers.includes('claude'))
          expect(fs.existsSync(path.join(root, '.claude'))).toBe(false);
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    }
  );

  it('preserves existing MCP, repository settings and editor configuration', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-plan-'));
    try {
      const selection = { run_id: 'copilot', providers: ['copilot'] };
      const plan = buildPlan(root, origin, selection);
      expect(plan.files.map((f: any) => f.target)).toEqual([
        '.github/copilot/settings.json',
        '.mcp.json',
      ]);
      const localMcp = '{"mcpServers":{"local":{"command":"existing"}}}';
      const localSettings = '{"disabledSkills":["local-skill"]}';
      const editorConfig = '{"inputs":[{"id":"token"}],"servers":{"local":{}}}';
      fs.mkdirSync(path.join(root, '.github/copilot'), { recursive: true });
      fs.mkdirSync(path.join(root, '.vscode'));
      fs.writeFileSync(path.join(root, '.mcp.json'), localMcp);
      fs.writeFileSync(path.join(root, '.github/copilot/settings.json'), localSettings);
      fs.writeFileSync(path.join(root, '.vscode/mcp.json'), editorConfig);
      const preserved = buildPlan(root, origin, selection);
      expect(preserved.files).toEqual([]);
      expect(preserved.derived_outputs.map((f: any) => f.target).sort()).toEqual([
        '.github/copilot-instructions.md',
        '.github/copilot/settings.json',
        '.mcp.json',
      ]);
      expect(fs.readFileSync(path.join(root, '.mcp.json'), 'utf8')).toBe(localMcp);
      expect(fs.readFileSync(path.join(root, '.github/copilot/settings.json'), 'utf8')).toBe(
        localSettings
      );
      expect(fs.readFileSync(path.join(root, '.vscode/mcp.json'), 'utf8')).toBe(editorConfig);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
