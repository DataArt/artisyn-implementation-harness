import fs from 'node:fs';
import path from 'node:path';
import type { EvalCase } from '../../testkit/eval-case.ts';
import type { GradeResult } from '../../graders/filesystem.grader.ts';
import { createFixture } from '../../testkit/fixture.ts';
import { runStubbedLaunch } from '../../testkit/build-launch.ts';

interface PlannedFile {
  target: string;
}
interface DerivedOutput {
  target: string;
}
interface Plan {
  files: PlannedFile[];
  derived_outputs: DerivedOutput[];
}

const CLAUDE_SETTINGS = '.claude/settings.json';
const CODEX_CONFIG = '.codex/config.toml';
const LOCAL_CLAUDE_SETTINGS = JSON.stringify({ localCustomization: 'do-not-clobber' }, null, 2);
const LOCAL_CODEX_CONFIG =
  '# hand-written local setting, predates this launch\nsandbox_mode = "read-only"\n';

/** A target project that already has hand-edited settings/config before its
 * first (or a repeat) launch — the exact scenario plan-provider-launch.mjs's
 * planProviderConfig() branches on: "added as a plain plan file when the
 * target doesn't already differ from the canonical rendering, otherwise
 * reserved as a derived output the orchestrator must reconcile with the
 * existing local file by hand." materialize-launch.mjs never writes
 * derived_outputs itself (only plan `files` entries), so this is fully
 * deterministic to verify without any agent judgment: existing settings must
 * be scheduled for reconciliation, not silently planned as a direct rewrite,
 * and materialize must leave the local bytes untouched either way.
 */
export const boot005PreserveExistingSettings: EvalCase = {
  id: 'BOOT-005',
  name: 'Existing settings/config are reconciled, not rewritten',
  layer: 'integration',
  provider: 'both',
  async run(): Promise<GradeResult[]> {
    const workspace = await createFixture('nx-monorepo');
    try {
      fs.mkdirSync(path.join(workspace.root, '.claude'), { recursive: true });
      fs.mkdirSync(path.join(workspace.root, '.codex'), { recursive: true });
      fs.writeFileSync(path.join(workspace.root, CLAUDE_SETTINGS), LOCAL_CLAUDE_SETTINGS);
      fs.writeFileSync(path.join(workspace.root, CODEX_CONFIG), LOCAL_CODEX_CONFIG);

      const result = await runStubbedLaunch(workspace, ['claude', 'codex'], 'boot-005');
      const plan = result.plan as Plan;

      const failures: string[] = [];
      for (const target of [CLAUDE_SETTINGS, CODEX_CONFIG]) {
        if (plan.files.some((f) => f.target === target))
          failures.push(
            `${target} was planned as a direct rewrite instead of a derived reconciliation`
          );
        if (!plan.derived_outputs.some((f) => f.target === target))
          failures.push(`${target} was not scheduled as a derived output needing reconciliation`);
      }

      const claudeAfter = fs.readFileSync(path.join(workspace.root, CLAUDE_SETTINGS), 'utf8');
      if (claudeAfter !== LOCAL_CLAUDE_SETTINGS)
        failures.push(
          `${CLAUDE_SETTINGS} was modified by materialize despite being a derived output`
        );
      const codexAfter = fs.readFileSync(path.join(workspace.root, CODEX_CONFIG), 'utf8');
      if (codexAfter !== LOCAL_CODEX_CONFIG)
        failures.push(`${CODEX_CONFIG} was modified by materialize despite being a derived output`);

      return [{ grader: 'settings-preserved', pass: failures.length === 0, failures }];
    } finally {
      await workspace.cleanup();
    }
  },
};
