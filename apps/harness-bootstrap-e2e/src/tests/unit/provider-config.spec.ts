/* eslint-disable @typescript-eslint/no-explicit-any -- provider plans use untyped ESM exports. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { expect, it } from 'vitest';
// @ts-expect-error -- plain ESM .mjs
import { buildPlan } from '../../../../../.canonical-implementation-harness/scripts/plan-provider-launch.mjs';
// @ts-expect-error -- plain ESM .mjs
import { renderConfig } from '../../../../../.canonical-implementation-harness/scripts/provider-adapter.mjs';
const origin = fileURLToPath(
  new URL('../../../../../.canonical-implementation-harness', import.meta.url)
);

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'provider-config-'));
  const pkg = path.join(root, 'bootstrap');
  for (const dir of ['canonical', 'scripts'])
    fs.cpSync(path.join(origin, dir), path.join(pkg, dir), { recursive: true });
  const write = (file: string, value: unknown) =>
    fs.writeFileSync(path.join(pkg, file), JSON.stringify(value));
  const run = (plan: any, mode = '--write') => {
    const planFile = path.join(root, 'plan.json');
    fs.writeFileSync(planFile, JSON.stringify(plan));
    return spawnSync(
      process.execPath,
      [
        path.join(pkg, 'scripts/materialize-launch.mjs'),
        '--root',
        root,
        '--package',
        pkg,
        '--plan',
        planFile,
        mode,
      ],
      { encoding: 'utf8' }
    );
  };
  const receipt = () =>
    JSON.parse(
      fs.readFileSync(path.join(pkg, 'state/launch/runs/config/materialization.json'), 'utf8')
    );
  return {
    root,
    pkg,
    write,
    run,
    receipt,
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

it.each([
  ['claude', 'copilot'],
  ['copilot', 'claude'],
])(
  'writes equal shared config once for %j, records owners and resumes',
  (...providers: string[]) => {
    const f = fixture();
    try {
      const plan = buildPlan(f.root, f.pkg, { run_id: 'config', providers });
      const entry = plan.files.find((item: any) => item.target === '.mcp.json');
      expect(entry.providers).toEqual(['claude', 'copilot']);
      expect(plan.files.filter((item: any) => item.target === entry.target)).toHaveLength(1);
      expect(plan.derived_outputs.some((item: any) => item.target === entry.target)).toBe(false);
      for (let repeat = 0; repeat < 2; repeat++) {
        const result = f.run(plan);
        expect(result.status, result.stderr).toBe(0);
      }
      expect(JSON.parse(fs.readFileSync(path.join(f.root, entry.target), 'utf8'))).toEqual({
        mcpServers: {},
      });
      const record = f.receipt().files.find((item: any) => item.target === entry.target);
      expect(record.provider).toBe('shared');
      expect(record.providers).toEqual(['claude', 'copilot']);
      const next = buildPlan(f.root, f.pkg, { run_id: 'next', providers });
      expect(next.files.some((item: any) => item.target === entry.target)).toBe(true);
      const invalid = structuredClone(plan);
      invalid.files.find((item: any) => item.target === entry.target).providers.push('codex');
      const rejected = f.run(invalid, '--check');
      expect(rejected.status).not.toBe(0);
      expect(rejected.stderr).toContain('Invalid file provider ownership');
    } finally {
      f.cleanup();
    }
  }
);

it('deduplicates matching settings at a manifest-defined path as well as MCP', () => {
  const f = fixture();
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(f.pkg, 'canonical/manifest.json'), 'utf8')
    );
    manifest.providers.claude.settings = 'config/shared.json';
    manifest.providers.copilot.settings = 'config/shared.json';
    f.write('canonical/manifest.json', manifest);
    f.write('canonical/settings.json', { schemaVersion: 1, claude: {}, copilot: {} });
    const plan = buildPlan(f.root, f.pkg, { run_id: 'config', providers: ['claude', 'copilot'] });
    const entry = plan.files.find((item: any) => item.target === 'config/shared.json');
    expect(entry.providers).toEqual(['claude', 'copilot']);
    expect(plan.files.filter((item: any) => item.target === entry.target)).toHaveLength(1);
    const result = f.run(plan);
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(fs.readFileSync(path.join(f.root, entry.target), 'utf8'))).toEqual({});
  } finally {
    f.cleanup();
  }
});

it.each(['absent', 'matches-first', 'local-edit'])(
  'reserves one derivation for differing renderings when current config is %s',
  (existing) => {
    const f = fixture();
    try {
      const mcp = { mcpServers: { demo: { command: 'demo', args: ['--stdio'] } } };
      f.write('canonical/mcp.json', mcp);
      const settings = JSON.parse(
        fs.readFileSync(path.join(f.pkg, 'canonical/settings.json'), 'utf8')
      );
      const prior =
        existing === 'matches-first'
          ? renderConfig('mcp', 'claude', settings, mcp)
          : '{"mcpServers":{"local":{"command":"keep"}}}';
      if (existing !== 'absent') fs.writeFileSync(path.join(f.root, '.mcp.json'), prior);
      const plan = buildPlan(f.root, f.pkg, { run_id: 'config', providers: ['claude', 'copilot'] });
      expect(plan.files.some((item: any) => item.target === '.mcp.json')).toBe(false);
      const outputs = plan.derived_outputs.filter((item: any) => item.target === '.mcp.json');
      expect(outputs).toHaveLength(1);
      expect(outputs[0].providers).toEqual(['claude', 'copilot']);
      expect(outputs[0].renderings).toEqual([
        { source: 'canonical/mcp.json', provider: 'claude', render: 'mcp' },
        { source: 'canonical/mcp.json', provider: 'copilot', render: 'mcp' },
      ]);
      const result = f.run(plan);
      expect(result.status, result.stderr).toBe(0);
      if (existing === 'absent') expect(fs.existsSync(path.join(f.root, '.mcp.json'))).toBe(false);
      else expect(fs.readFileSync(path.join(f.root, '.mcp.json'), 'utf8')).toBe(prior);
      expect(
        f.receipt().derived_outputs.find((item: any) => item.target === '.mcp.json').providers
      ).toEqual(['claude', 'copilot']);
    } finally {
      f.cleanup();
    }
  }
);

it('reserves local edits even when every provider renders identical config', () => {
  const f = fixture();
  try {
    const prior = '{"mcpServers":{"local":{"command":"keep"}}}';
    fs.writeFileSync(path.join(f.root, '.mcp.json'), prior);
    const plan = buildPlan(f.root, f.pkg, { run_id: 'config', providers: ['copilot', 'claude'] });
    expect(plan.files.some((item: any) => item.target === '.mcp.json')).toBe(false);
    const entries = plan.derived_outputs.filter((item: any) => item.target === '.mcp.json');
    expect(entries).toHaveLength(1);
    expect(entries[0].providers).toEqual(['claude', 'copilot']);
    const result = f.run(plan);
    expect(result.status, result.stderr).toBe(0);
    expect(fs.readFileSync(path.join(f.root, '.mcp.json'), 'utf8')).toBe(prior);
  } finally {
    f.cleanup();
  }
});

it('continues rejecting collisions outside provider configuration', () => {
  const f = fixture();
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(f.pkg, 'canonical/manifest.json'), 'utf8')
    );
    manifest.providers.copilot.skills = manifest.providers.claude.skills;
    f.write('canonical/manifest.json', manifest);
    expect(() =>
      buildPlan(f.root, f.pkg, {
        run_id: 'config',
        providers: ['claude', 'copilot'],
        skills: ['where-we-are'],
      })
    ).toThrow('Duplicate selected outputs');
  } finally {
    f.cleanup();
  }
});
