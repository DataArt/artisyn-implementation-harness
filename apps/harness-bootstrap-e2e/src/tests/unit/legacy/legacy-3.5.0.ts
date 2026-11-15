/** Builds a small project that looks like a 3.5.0 install of the old `harness-bootstrap`
 * package, with its state inside the package. Built in code, not committed: the objects
 * are named by the sha256 of their bytes, and a formatter on committed files would break
 * that. This file names the retired package on purpose (see the rename gate allowlist).
 */
import path from 'node:path';
import { sha256, writeAll } from '../helpers/harness.ts';

export const LEGACY_README = 'readme v1\n';
export const LEGACY_SKILL = 'skill v1\n';
export const RUN_A = '{"run_id":"run-a","status":"materialized"}\n';
export const RUN_B = '{"run_id":"run-b","status":"materialized"}\n';

export interface LegacyProject {
  root: string;
  /** Old package folder, e.g. `<root>/.claude/skills/harness-bootstrap`. */
  packageDir: string;
  stateDir: string;
  readmeSha: string;
  skillSha: string;
}

export function buildLegacyProject(
  root: string,
  { packageRelative = '.claude/skills/harness-bootstrap', legacyLaunch = true } = {}
): LegacyProject {
  const packageDir = path.join(root, packageRelative);
  const readmeSha = sha256(LEGACY_README);
  const skillSha = sha256(LEGACY_SKILL);
  const index = {
    schema_version: 2,
    canonical: {
      'README.md': {
        recorded_sha256: readmeSha,
        snapshot: `state/objects/${readmeSha}`,
      },
      'SKILL.md': {
        recorded_sha256: skillSha,
        snapshot: 'release:artisyn-harness-bootstrap-v3.2.0.zip',
      },
    },
  };
  writeAll(packageDir, {
    'SKILL.md': '---\nname: harness-bootstrap\nmetadata:\n  version: 3.5.0\n---\nold skill\n',
    'harness-bootstrap.md': 'old root doc\n',
    'README.md': 'old readme\n',
    'state/answers.json': '{"schema_version":1,"answers":{}}\n',
    'state/index.json': JSON.stringify(index, null, 2) + '\n',
    [`state/objects/${readmeSha}`]: LEGACY_README,
    [`state/objects/${skillSha}`]: LEGACY_SKILL,
    'state/operations/launch.json': '{"operation":"launch"}\n',
    'state/launch/runs/run-a/materialization.json': RUN_A,
    'state/launch/reports/r1.md': '# report\n',
    'state/patch/APPLIED.md': '# Applied patch history\n',
  });
  if (legacyLaunch) {
    writeAll(path.join(root, '.harness/launch'), {
      'runs/run-a/materialization.json': RUN_A,
      'runs/run-b/materialization.json': RUN_B,
    });
  }
  return { root, packageDir, stateDir: path.join(packageDir, 'state'), readmeSha, skillSha };
}
