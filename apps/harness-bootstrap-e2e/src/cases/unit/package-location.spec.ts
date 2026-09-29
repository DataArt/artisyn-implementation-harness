import fs from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';
import { createFixture, installSkillPackage } from '../../testkit/fixture.ts';

it.each([
  ['claude', '.claude/skills/harness-bootstrap'],
  ['codex', '.agents/skills/harness-bootstrap'],
] as const)('copies package contents into the %s skill directory', async (host, relativePath) => {
  const workspace = await createFixture('nx-monorepo');
  try {
    installSkillPackage(workspace, host);
    expect(workspace.packageRoot).toBe(path.join(workspace.root, relativePath));
    expect(fs.existsSync(path.join(workspace.packageRoot, 'SKILL.md'))).toBe(true);
    expect(
      fs.existsSync(path.join(workspace.packageRoot, 'canonical/adaptors/codex/task-tracking.md'))
    ).toBe(true);
    expect(fs.existsSync(path.join(workspace.root, '.canonical-implementation-harness'))).toBe(
      false
    );
    expect(fs.existsSync(path.join(workspace.root, '.harness'))).toBe(false);
    const otherHostPath = path.join(workspace.root, host === 'claude' ? '.agents' : '.claude');
    expect(fs.existsSync(otherHostPath)).toBe(false);
  } finally {
    await workspace.cleanup();
  }
});
