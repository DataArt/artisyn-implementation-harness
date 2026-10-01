import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PROVIDERS } from '../../utils/providers.ts';
import * as graderRegistry from '../../graders/_registry.ts';
import { runners } from '../../agent-runners/_registry.ts';
import { scenarios } from '../../scenarios/_registry.ts';
import { cases } from '../../cases/_registry.ts';

const srcDir = fileURLToPath(new URL('../../', import.meta.url));

function read(...segments: string[]): string {
  return fs.readFileSync(path.join(srcDir, ...segments), 'utf8');
}

/** Binding factories are the lowercase-initial `export const`s; the pure
 * `grade*` functions are `export function` and stay out of the registry.
 */
function declaredBindings(): Map<string, string> {
  const dir = path.join(srcDir, 'graders');
  const bindings = new Map<string, string>();
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.grader.ts')))
    for (const match of read('graders', file).matchAll(
      /^export const ([a-z][A-Za-z0-9]*)\s*[=:]/gm
    ))
      bindings.set(match[1], file);
  return bindings;
}

function declaredScenarios(): Map<string, string> {
  const dir = path.join(srcDir, 'scenarios');
  const declared = new Map<string, string>();
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.ts')))
    if (!file.startsWith('_'))
      for (const match of read('scenarios', file).matchAll(/^export const (\w+Scenario)\s*[:=]/gm))
        declared.set(match[1], file);
  return declared;
}

describe('grader registry', () => {
  it('re-exports every binding factory the grader modules declare', () => {
    const declared = declaredBindings();
    expect(declared.size).toBeGreaterThan(0);
    const missing = [...declared.entries()]
      .filter(([name]) => !(name in graderRegistry))
      .map(([name, file]) => `${name} (${file})`);
    expect(missing).toEqual([]);
  });

  it('exports nothing that no grader module declares', () => {
    const declared = declaredBindings();
    expect(Object.keys(graderRegistry).filter((name) => !declared.has(name))).toEqual([]);
  });

  it('exposes every export as a factory, not a bare binding', () => {
    for (const [name, factory] of Object.entries(graderRegistry)) {
      expect(typeof factory, `${name} should be a factory function`).toBe('function');
      expect(
        (factory as () => unknown).length,
        `${name} should take config, not a context`
      ).toBeLessThanOrEqual(3);
    }
  });
});

describe('scenario registry', () => {
  it('lists every scenario the modules declare, keyed by its own id', () => {
    const declared = declaredScenarios();
    expect(declared.size).toBeGreaterThan(0);
    const registered = new Set(Object.values(scenarios).map((scenario) => scenario.id));
    expect(registered.size).toBe(declared.size);
    for (const [id, scenario] of Object.entries(scenarios)) expect(scenario.id).toBe(id);
  });

  it('gives every scenario at least one step', () => {
    for (const [id, scenario] of Object.entries(scenarios))
      expect(scenario.steps.length, `${id} has no steps`).toBeGreaterThan(0);
  });
});

describe('runner registry', () => {
  it('has a runner for every provider', () => {
    expect(Object.keys(runners).sort()).toEqual(Object.values(PROVIDERS).sort());
    for (const [provider, runner] of Object.entries(runners))
      expect(typeof runner, `${provider} runner`).toBe('function');
  });
});

describe('case registry', () => {
  it('lists each E2E spec exactly once without registering its tests', async () => {
    const { readdir } = await import('node:fs/promises');
    const specs = (await readdir(path.join(srcDir, 'cases')))
      .filter((name) => name.endsWith('.spec.ts'))
      .sort();
    expect(cases.map((entry) => entry.path.split('/').at(-1)).sort()).toEqual(specs);
    expect(new Set(cases.map((entry) => entry.id)).size).toBe(cases.length);
    for (const entry of cases) expect(entry.path).toBe(`src/cases/${entry.id}.spec.ts`);
  });
});
