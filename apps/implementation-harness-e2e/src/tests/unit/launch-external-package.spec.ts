/** A launch from a package that lives outside the project (a host plugin cache). State is in the
 * project's `.harness/state/`, so the package only has to be readable. Covers review finding RF-030.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { pkgRoot, runNode, sha256, tmpDir, write } from './helpers/harness.ts';

const materialize = path.join(pkgRoot, 'scripts/materialize-launch.mjs');
const finalize = path.join(pkgRoot, 'scripts/finalize-launch.mjs');

function setup() {
  const root = tmpDir('launch-ext-project-');
  const pkg = tmpDir('launch-ext-package-');
  const templatePath = path.join(pkg, 'skills/demo/TEMPLATE.md');
  write(templatePath, 'Project {{PROJECT_KEY}}\n');
  write(path.join(pkg, 'skills/demo/INTENT.md'), 'Adapt scope from project evidence.\n');
  const plan = {
    schema_version: 1,
    run_id: 'ext',
    knowns: { PROJECT_KEY: { value: 'FLR', status: 'verified', source: 'AGENTS.md' } },
    files: [
      {
        source: 'skills/demo/TEMPLATE.md',
        source_sha256: sha256(fs.readFileSync(templatePath)),
        target: 'output/demo.md',
        expected_target_sha256: null,
        intent: 'skills/demo/INTENT.md',
        replacements: { '{{PROJECT_KEY}}': 'PROJECT_KEY' },
        preserve_tokens: [],
        derive: [{ rule: 'Scope', action: 'Describe actual layer' }],
      },
    ],
  };
  const planFile = write(path.join(root, 'plan.json'), JSON.stringify(plan));
  return { root, pkg, planFile };
}

describe('launch scripts with a package outside the project', () => {
  it('materializes and finalizes with state in the project and nothing written to the package', () => {
    const { root, pkg, planFile } = setup();
    const before = fs.readdirSync(pkg).sort();

    const written = runNode(materialize, [
      '--root',
      root,
      '--package',
      pkg,
      '--plan',
      planFile,
      '--write',
    ]);
    assert.equal(written.status, 0, written.stderr + written.stdout);
    assert.equal(fs.readFileSync(path.join(root, 'output/demo.md'), 'utf8'), 'Project FLR\n');
    const receiptFile = path.join(root, '.harness/state/launch/runs/ext/materialization.json');
    const receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
    assert.equal(receipt.status, 'materialized');

    const evidenceFile = write(
      path.join(root, 'evidence.json'),
      JSON.stringify({
        plan_sha256: receipt.plan_sha256,
        outputs: receipt.files
          .filter((entry: { temporary_intent?: boolean }) => !entry.temporary_intent)
          .map((entry: { target: string }) => ({
            target: entry.target,
            status: 'verified',
            evidence: 'read the file',
            sha256: sha256(fs.readFileSync(path.join(root, entry.target))),
          })),
        checks: [{ name: 'content', status: 'passed', evidence: 'matches the template' }],
      })
    );
    const done = runNode(finalize, [
      '--root',
      root,
      '--package',
      pkg,
      '--run',
      'ext',
      '--evidence',
      evidenceFile,
      '--write',
    ]);
    assert.equal(done.status, 0, done.stderr + done.stdout);
    assert.ok(fs.existsSync(path.join(root, '.harness/state/launch/runs/ext/verification.json')));
    assert.deepEqual(fs.readdirSync(pkg).sort(), before, 'the package folder was not written to');
  });

  it('still refuses a package that contains the project, and a package equal to it', () => {
    const { root, planFile } = setup();
    const inner = path.join(tmpDir('launch-ext-outer-'), 'inner-project');
    fs.mkdirSync(inner);
    write(path.join(inner, 'plan.json'), fs.readFileSync(planFile, 'utf8'));

    const same = runNode(materialize, [
      '--root',
      root,
      '--package',
      root,
      '--plan',
      planFile,
      '--check',
    ]);
    assert.notEqual(same.status, 0);
    assert.match(same.stderr, /cannot be or contain the project root/);

    const containing = runNode(materialize, [
      '--root',
      inner,
      '--package',
      path.dirname(inner),
      '--plan',
      path.join(inner, 'plan.json'),
      '--check',
    ]);
    assert.notEqual(containing.status, 0);
    assert.match(containing.stderr, /cannot be or contain the project root/);
  });
});
