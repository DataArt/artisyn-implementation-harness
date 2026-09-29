import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { gradeIntentCleanup } from './cleanup.grader.ts';

function tmpRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-grader-test-'));
}

describe('gradeIntentCleanup', () => {
  it('passes when no INTENT.md was copied into provider destinations', () => {
    const root = tmpRoot();
    fs.mkdirSync(path.join(root, '.claude/skills/dev'), { recursive: true });
    fs.writeFileSync(path.join(root, '.claude/skills/dev/SKILL.md'), '# dev\n');
    expect(gradeIntentCleanup(root, ['.claude']).pass).toBe(true);
  });

  it('fails when a skill INTENT.md is copied, even before finalization', () => {
    const root = tmpRoot();
    fs.mkdirSync(path.join(root, '.claude/skills/dev'), { recursive: true });
    fs.writeFileSync(path.join(root, '.claude/skills/dev/INTENT.md'), 'Adapt scope.\n');
    const result = gradeIntentCleanup(root, ['.claude']);
    expect(result.pass).toBe(false);
    expect(result.failures[0]).toMatch(/must not be copied/);
  });

  it('fails when an agent runtime INTENT.md was left behind', () => {
    const root = tmpRoot();
    fs.mkdirSync(path.join(root, '.claude/harness-runtime/intents/web'), { recursive: true });
    fs.writeFileSync(
      path.join(root, '.claude/harness-runtime/intents/web/INTENT.md'),
      'Specialize role.\n'
    );
    expect(gradeIntentCleanup(root, ['.claude']).pass).toBe(false);
  });

  it('ignores INTENT.md under an excluded path (the canonical package)', () => {
    const root = tmpRoot();
    const packageRoot = path.join(root, '.agents/skills/harness-bootstrap');
    fs.mkdirSync(path.join(packageRoot, 'canonical/skills/dev'), { recursive: true });
    fs.writeFileSync(path.join(packageRoot, 'canonical/skills/dev/INTENT.md'), 'Adapt scope.\n');
    expect(gradeIntentCleanup(root, ['.claude'], [packageRoot]).pass).toBe(true);
  });
});
