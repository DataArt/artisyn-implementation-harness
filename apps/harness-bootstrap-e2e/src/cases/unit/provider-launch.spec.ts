/* eslint-disable @typescript-eslint/no-explicit-any -- faithful port of a plain-JS
 * regression test (see git history) exercising untyped plan/manifest/evidence
 * shapes; typing every literal here would add ceremony without catching
 * anything the real scripts' own runtime validation doesn't already catch. */
/** Regression test for the provider planner/materializer/finalizer pipeline:
 * builds a real plan against a copy of this package and drives the CLI
 * scripts end to end in an isolated fake project. Run via
 * `nx run harness-bootstrap-e2e:unit` (or `vitest run --config vitest.unit.config.ts`).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { describe, it } from 'vitest';
// @ts-expect-error -- plain ESM .mjs, no type declarations published
import { buildPlan } from '../../../../../.canonical-implementation-harness/scripts/plan-provider-launch.mjs';
import {
  providerText,
  renderConfig,
  renderAgent,
  loadManifest,
  // @ts-expect-error -- plain ESM .mjs, no type declarations published
} from '../../../../../.canonical-implementation-harness/scripts/provider-adapter.mjs';

const origin = fileURLToPath(
  new URL('../../../../../.canonical-implementation-harness', import.meta.url)
);
const sha = (v: crypto.BinaryLike) => crypto.createHash('sha256').update(v).digest('hex');

describe('provider planner/materializer/finalizer pipeline', () => {
  it('plans, materializes, and finalizes a real selection across both providers', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'provider-launch-'));
    const pkg = path.join(root, 'harness-bootstrap');
    let checks = 0;
    const run = (script: string, args: string[], success = true) => {
      const result = spawnSync(
        process.execPath,
        [path.join(pkg, 'scripts', script), '--root', root, '--package', pkg, ...args],
        { encoding: 'utf8' }
      );
      assert.equal(result.status === 0, success, result.stderr + result.stdout);
      checks++;
      return result;
    };
    try {
      fs.mkdirSync(pkg);
      for (const folder of ['canonical', 'scripts'])
        fs.cpSync(path.join(origin, folder), path.join(pkg, folder), { recursive: true });
      const skills = fs.readdirSync(path.join(pkg, 'canonical/skills'));
      const agents = fs
        .readdirSync(path.join(pkg, 'canonical/agents'))
        .map((template) => ({ template, name: template === 'layer' ? 'web' : template }));
      agents.push({
        template: 'layer',
        name: 'processor',
        knowns: {
          LAYER_PATH: {
            value: 'packages/processor',
            source: 'fixture architecture',
            status: 'verified',
          },
        },
      } as any);
      const selection = {
        run_id: 'all',
        providers: ['claude', 'codex'],
        skills,
        agents,
        knowns: {
          PROJECT_NAME: {
            value: 'Project "quoted"\nSecond line',
            source: 'README.md',
            status: 'verified',
          },
        },
      };
      const plan: any = buildPlan(root, pkg, selection);
      assert.deepEqual(plan, buildPlan(root, pkg, selection));
      checks++;
      const planFile = path.join(root, 'plan.json');
      fs.writeFileSync(planFile, JSON.stringify(plan));
      run('materialize-launch.mjs', ['--plan', planFile, '--check']);
      assert(!fs.existsSync(path.join(root, '.claude')));
      checks++;
      run('materialize-launch.mjs', ['--plan', planFile, '--write']);
      assert(fs.existsSync(path.join(root, '.agents/skills/dev/SKILL.md')));
      assert(!fs.existsSync(path.join(root, '.agents/skills/dev/TEMPLATE.md')));
      assert(!fs.existsSync(path.join(root, '.claude/skills/dev/INTENT.md')));
      assert(!fs.existsSync(path.join(root, '.codex/harness-runtime/intents')));
      checks++;
      assert(
        fs
          .readFileSync(path.join(root, '.agents/skills/dev/references/03-plan.md'), 'utf8')
          .includes('.agents/skills/dev/runtime/planning.md')
      );
      assert(
        !fs
          .readFileSync(path.join(root, '.agents/skills/dev/references/03-plan.md'), 'utf8')
          .includes('Call `EnterPlanMode`')
      );
      checks++;
      const python = spawnSync(
        'python3',
        [
          '-c',
          'import pathlib,sys,tomllib\nfor p in pathlib.Path(sys.argv[1]).rglob("*.toml"): tomllib.loads(p.read_text())',
          path.join(root, '.codex'),
        ],
        { encoding: 'utf8' }
      );
      assert.equal(python.status, 0, python.stderr);
      checks++;
      for (const skill of skills) {
        for (const dir of ['.claude/skills', '.agents/skills']) {
          const content = fs.readFileSync(path.join(root, dir, skill, 'SKILL.md'), 'utf8');
          const meta = parseYaml(content.match(/^---\n([\s\S]*?)\n---/)![1]) as any;
          assert.equal(meta.name, skill);
          assert.equal(typeof meta.description, 'string');
        }
      }
      const processor = fs.readFileSync(path.join(root, '.codex/agents/processor.toml'), 'utf8');
      const web = fs.readFileSync(path.join(root, '.codex/agents/web.toml'), 'utf8');
      assert(processor.includes('packages/processor'));
      assert(!web.includes('packages/processor'));
      checks++;
      const toml = fs.readFileSync(path.join(root, '.codex/agents/architect.toml'), 'utf8');
      assert(toml.includes('Project \\"quoted\\"\\nSecond line'));
      assert(!toml.includes('sonnet'));
      for (const role of ['architect', 'product-architect']) {
        const content = fs.readFileSync(path.join(root, '.claude/agents', role + '.md'), 'utf8');
        const metadata = parseYaml(content.match(/^---\n([\s\S]*?)\n---/)![1]) as any;
        assert(!Object.hasOwn(metadata, 'model'), 'Agent must inherit model by default');
      }
      checks++;
      const mcp = {
        mcpServers: {
          demo: { command: 'demo', args: ['--stdio'], env: { TOKEN: '${TOKEN}' } },
          remote: { url: 'https://example.test/mcp', bearerTokenEnvVar: 'AUTH_TOKEN' },
        },
      };
      const settings = {
        schemaVersion: 1,
        claude: { env: {} },
        codex: { sandbox_mode: 'workspace-write' },
      };
      const config = renderConfig('settings', 'codex', settings, mcp);
      assert(config.includes('env_vars'));
      assert(config.includes('bearer_token_env_var'));
      assert(!config.includes('${TOKEN}'));
      assert(
        JSON.parse(renderConfig('mcp', 'claude', settings, mcp)).mcpServers.remote.headers
          .Authorization === 'Bearer ${AUTH_TOKEN}'
      );
      checks++;
      assert.throws(() =>
        renderConfig('settings', 'codex', settings, {
          mcpServers: { bad: { command: 'x', env: { TOKEN: 'literal' } } },
        })
      );
      checks++;
      assert.throws(() =>
        renderAgent('---\nname: x\ndescription: x\nhooks: x\n---\nx', 'codex', 'x')
      );
      checks++;
      assert.throws(() =>
        providerText(
          '{{provider:unknown_provider_token}}',
          'codex',
          JSON.parse(fs.readFileSync(path.join(pkg, 'canonical/manifest.json'), 'utf8'))
        )
      );
      checks++;
      // manifest.json is the source of truth for a provider's agentFormat/invocationPrefix
      // — loadManifest must accept whatever supported value it declares, not just the
      // one shipped value, and must still reject a format the renderer can't handle.
      {
        const manifestFixture = path.join(root, 'manifest-fixture');
        const base = JSON.parse(fs.readFileSync(path.join(pkg, 'canonical/manifest.json'), 'utf8'));
        const write = (manifest: any) => {
          fs.rmSync(manifestFixture, { recursive: true, force: true });
          fs.mkdirSync(path.join(manifestFixture, 'canonical'), { recursive: true });
          fs.writeFileSync(
            path.join(manifestFixture, 'canonical/manifest.json'),
            JSON.stringify(manifest)
          );
        };
        write({
          ...base,
          providers: {
            ...base.providers,
            claude: { ...base.providers.claude, invocationPrefix: '!' },
          },
        });
        assert.equal(loadManifest(manifestFixture).providers.claude.invocationPrefix, '!');
        checks++;
        write({
          ...base,
          providers: {
            ...base.providers,
            claude: { ...base.providers.claude, agentFormat: 'yaml' },
          },
        });
        assert.throws(() => loadManifest(manifestFixture));
        checks++;
        fs.rmSync(manifestFixture, { recursive: true, force: true });
      }
      run('materialize-launch.mjs', ['--plan', planFile, '--write']);
      // Adapted outputs cannot be overwritten by an old materialization plan.
      const target = path.join(root, '.agents/skills/dev/SKILL.md');
      const original = fs.readFileSync(target);
      fs.appendFileSync(target, '\nAdapted content\n');
      run('materialize-launch.mjs', ['--plan', planFile, '--write'], false);
      fs.writeFileSync(target, original);
      // Existing config is preserved and scheduled for reconciliation.
      fs.appendFileSync(path.join(root, '.codex/config.toml'), '\n# local setting\n');
      const next: any = buildPlan(root, pkg, { ...selection, run_id: 'next' });
      assert(!next.files.some((f: any) => f.target === '.codex/config.toml'));
      assert(next.derived_outputs.some((f: any) => f.target === '.codex/config.toml'));
      checks++;
      // Changed adapter inputs invalidate a frozen plan, before writes.
      const settingsFile = path.join(pkg, 'canonical/settings.json');
      const before = fs.readFileSync(settingsFile);
      fs.appendFileSync(settingsFile, '\n');
      run('materialize-launch.mjs', ['--plan', planFile, '--check'], false);
      fs.writeFileSync(settingsFile, before);
      // A rendering module the adapter imports is just as frozen as the adapter's
      // own file — decomposing provider-adapter.mjs into lib/* must not create a
      // gap where one of its dependencies can change without invalidating a plan.
      const agentFormatFile = path.join(pkg, 'scripts/lib/agent-format.mjs');
      const agentFormatBefore = fs.readFileSync(agentFormatFile);
      fs.appendFileSync(agentFormatFile, '\n');
      run('materialize-launch.mjs', ['--plan', planFile, '--check'], false);
      fs.writeFileSync(agentFormatFile, agentFormatBefore);
      // Finalization requires every output and final hash, including reserved derivations.
      const receiptPath = path.join(pkg, 'state/launch/runs/all/materialization.json');
      const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
      for (const item of plan.derived_outputs)
        fs.writeFileSync(path.join(root, item.target), 'Project guidance after evidence review\n');
      const evidence: any = {
        plan_sha256: receipt.plan_sha256,
        outputs: [],
        checks: [
          {
            status: 'passed',
            evidence: 'Synthetic fixture integrity check, not a real project launch.',
          },
        ],
      };
      for (const item of [
        ...receipt.files.filter((f: any) => !f.temporary_intent),
        ...receipt.derived_outputs,
      ]) {
        const file = path.join(root, item.target);
        // Simulate completed specialization. Preserve no project tokens in fixture.
        fs.writeFileSync(
          file,
          fs.readFileSync(file, 'utf8').replace(/\{\{[A-Za-z_][A-Za-z0-9_:.-]*\}\}/g, 'fixture')
        );
        evidence.outputs.push({
          target: item.target,
          sha256: sha(fs.readFileSync(file)),
          status: 'verified',
          evidence: 'Synthetic adapted fixture',
        });
      }
      const evidenceFile = path.join(root, 'evidence.json');
      fs.writeFileSync(evidenceFile, JSON.stringify(evidence));
      run('finalize-launch.mjs', ['--run', 'all', '--evidence', evidenceFile, '--check']);
      assert(!fs.existsSync(path.join(root, '.claude/skills/dev/INTENT.md')));
      checks++;
      fs.appendFileSync(target, 'changed');
      run('finalize-launch.mjs', ['--run', 'all', '--evidence', evidenceFile, '--write'], false);
      evidence.outputs.find((e: any) => e.target === '.agents/skills/dev/SKILL.md').sha256 = sha(
        fs.readFileSync(target)
      );
      fs.writeFileSync(evidenceFile, JSON.stringify(evidence));
      run('finalize-launch.mjs', ['--run', 'all', '--evidence', evidenceFile, '--write']);
      assert(!fs.existsSync(path.join(root, '.claude/skills/dev/INTENT.md')));
      assert(fs.existsSync(path.join(pkg, 'canonical/skills/dev/INTENT.md')));
      checks++;
      run('finalize-launch.mjs', ['--run', 'all', '--evidence', evidenceFile, '--write']);
      assert(fs.existsSync(path.join(pkg, 'state/launch/runs/all/verification.json')));
      for (const provider of ['claude', 'codex']) {
        const solo: any = buildPlan(root, pkg, {
          run_id: provider,
          providers: [provider],
          skills: ['where-we-are'],
        });
        assert(solo.files.every((f: any) => f.provider === provider));
        assert.equal(
          solo.derived_outputs.filter((f: any) => ['CLAUDE.md', 'AGENTS.md'].includes(f.target))
            .length,
          1
        );
        checks++;
      }
      assert.throws(() => buildPlan(root, pkg, { run_id: 'bad', providers: ['unknown'] }));
      assert.throws(() =>
        buildPlan(root, pkg, { run_id: 'bad', providers: ['claude'], skills: ['../escape'] })
      );
      checks++;
      // The bootstrap is disposable: no permanent runtime references or scripts need it.
      const installed = plan.files.filter((entry: any) => !entry.temporary_intent);
      fs.rmSync(pkg, { recursive: true, force: true });
      for (const entry of installed) {
        const file = path.join(root, entry.target);
        assert(fs.existsSync(file));
        if (entry.target.endsWith('.md') || entry.target.endsWith('.toml')) {
          const content = fs.readFileSync(file, 'utf8');
          for (const match of content.matchAll(
            /(?:\.agents|\.claude)\/skills\/[^\s`"<>]+\/runtime\/[a-z-]+\.md|\.(?:claude|codex)\/harness-runtime\/[a-z-]+\.md/g
          )) {
            assert(
              fs.existsSync(path.join(root, match[0])),
              `Missing permanent runtime: ${match[0]}`
            );
          }
        }
      }
      for (const [skill, script] of [
        ['dev', 'timing.mjs'],
        ['design', 'design-metrics.mjs'],
      ]) {
        const result = spawnSync(
          process.execPath,
          [
            path.join(root, '.agents/skills', skill, 'scripts', script),
            'init',
            '--dir',
            path.join(root, 'standalone-' + skill),
            '--ticket',
            'TEST-1',
          ],
          { encoding: 'utf8' }
        );
        assert.equal(result.status, 0, result.stderr + result.stdout);
      }
      checks++;
      console.log(
        `${checks} provider launch checks passed (isolated project; semantic adaptation simulated).`
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
