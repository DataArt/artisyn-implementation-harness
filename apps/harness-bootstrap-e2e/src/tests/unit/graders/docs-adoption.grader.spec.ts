import { PROVIDERS } from '../../../testkit/providers.ts';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  gradeRootReadmeBudget,
  gradeAppReadmesLinkToArchitecture,
  gradeHldCoversContainers,
  gradeDocsIndexExists,
  gradeContainerAgentsDeployed,
} from '../../../graders/docs-adoption.grader.ts';

function tmpRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'docs-adoption-test-'));
}

describe('gradeRootReadmeBudget', () => {
  it('passes a short README that links to docs/', () => {
    const root = tmpRoot();
    fs.writeFileSync(path.join(root, 'README.md'), '# Fixture\n\nSee docs/README.md.\n');
    expect(gradeRootReadmeBudget(root).pass).toBe(true);
  });

  it('fails a missing README', () => {
    const root = tmpRoot();
    expect(gradeRootReadmeBudget(root).pass).toBe(false);
  });

  it('fails an oversized README', () => {
    const root = tmpRoot();
    fs.writeFileSync(path.join(root, 'README.md'), 'x'.repeat(7000) + '\nsee docs/\n');
    const result = gradeRootReadmeBudget(root);
    expect(result.pass).toBe(false);
    expect(result.failures[0]).toMatch(/over the root-context budget/);
  });

  it('fails a README that never links to docs/', () => {
    const root = tmpRoot();
    fs.writeFileSync(path.join(root, 'README.md'), '# Fixture\n\nA short readme with no links.\n');
    const result = gradeRootReadmeBudget(root);
    expect(result.pass).toBe(false);
    expect(result.failures[0]).toMatch(/does not link to docs/);
  });
});

describe('gradeAppReadmesLinkToArchitecture', () => {
  it('passes when the app README links to both HLD and LLD', () => {
    const root = tmpRoot();
    fs.mkdirSync(path.join(root, 'apps/fe'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'apps/fe/README.md'),
      'See Target Architecture (HLD) and System Architecture (LLD).\n'
    );
    expect(gradeAppReadmesLinkToArchitecture(root, ['fe']).pass).toBe(true);
  });

  it('fails when the app README is missing', () => {
    const root = tmpRoot();
    const result = gradeAppReadmesLinkToArchitecture(root, ['fe']);
    expect(result.pass).toBe(false);
    expect(result.failures[0]).toMatch(/is missing/);
  });

  it('fails when the app README exists but has no architecture links', () => {
    const root = tmpRoot();
    fs.mkdirSync(path.join(root, 'apps/fe'), { recursive: true });
    fs.writeFileSync(path.join(root, 'apps/fe/README.md'), 'A placeholder app.\n');
    const result = gradeAppReadmesLinkToArchitecture(root, ['fe']);
    expect(result.pass).toBe(false);
    expect(result.failures).toHaveLength(2);
  });
});

describe('gradeHldCoversContainers', () => {
  it('passes when every container is mentioned somewhere in the HLD tree', () => {
    const root = tmpRoot();
    fs.mkdirSync(path.join(root, 'docs/Target Architecture (HLD)/v1'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'docs/Target Architecture (HLD)/README.md'),
      'Active version v1.\n'
    );
    fs.writeFileSync(
      path.join(root, 'docs/Target Architecture (HLD)/v1/README.md'),
      'Containers: fe, be.\n'
    );
    expect(gradeHldCoversContainers(root, ['fe', 'be']).pass).toBe(true);
  });

  it('fails when the HLD README is missing entirely', () => {
    const root = tmpRoot();
    expect(gradeHldCoversContainers(root, ['fe']).pass).toBe(false);
  });

  it('fails when a container is never mentioned', () => {
    const root = tmpRoot();
    fs.mkdirSync(path.join(root, 'docs/Target Architecture (HLD)'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'docs/Target Architecture (HLD)/README.md'),
      'Containers: fe.\n'
    );
    const result = gradeHldCoversContainers(root, ['fe', 'be']);
    expect(result.pass).toBe(false);
    expect(result.failures[0]).toMatch(/"be"/);
  });
});

describe('gradeDocsIndexExists', () => {
  it('passes when docs/README.md exists', () => {
    const root = tmpRoot();
    fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(root, 'docs/README.md'), 'Index.\n');
    expect(gradeDocsIndexExists(root).pass).toBe(true);
  });

  it('fails when docs/README.md is absent', () => {
    const root = tmpRoot();
    expect(gradeDocsIndexExists(root).pass).toBe(false);
  });
});

describe('gradeContainerAgentsDeployed', () => {
  it('passes when every container has a deployed agent', () => {
    const root = tmpRoot();
    fs.mkdirSync(path.join(root, '.claude/agents'), { recursive: true });
    fs.writeFileSync(path.join(root, '.claude/agents/fe.md'), '---\nname: fe\n---\n');
    expect(gradeContainerAgentsDeployed(root, PROVIDERS.claude, ['fe']).pass).toBe(true);
  });

  it('fails a container with no deployed agent', () => {
    const root = tmpRoot();
    const result = gradeContainerAgentsDeployed(root, PROVIDERS.claude, ['fe']);
    expect(result.pass).toBe(false);
    expect(result.failures[0]).toMatch(/"fe"/);
  });

  it('checks the codex path/extension for codex', () => {
    const root = tmpRoot();
    fs.mkdirSync(path.join(root, '.codex/agents'), { recursive: true });
    fs.writeFileSync(path.join(root, '.codex/agents/be.toml'), 'name = "be"\n');
    expect(gradeContainerAgentsDeployed(root, PROVIDERS.codex, ['be']).pass).toBe(true);
  });
});
