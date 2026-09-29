import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { fixtures } from '../../../fixtures/registry.ts';
import { createFixture } from '../../testkit/fixture.ts';
import { fixturesRoot } from '../../testkit/paths.ts';

describe('fixture facts', () => {
  for (const fixture of Object.values(fixtures).filter((fixture) => fixture.populated)) {
    it(`${fixture.id} matches its repository evidence`, () => {
      const root = path.join(fixturesRoot, fixture.path);
      expect(fs.existsSync(path.join(root, 'docs'))).toBe(fixture.hasDocs);
      const hasHarness = [
        '.claude/skills/harness-bootstrap',
        '.agents/skills/harness-bootstrap',
      ].some((dir) => fs.existsSync(path.join(root, dir)));
      expect(hasHarness).toBe(fixture.hasHarness);
      expect(fs.readdirSync(path.join(root, 'apps')).sort()).toEqual(
        fixture.containers.map((container) => path.basename(container.path)).sort()
      );
      for (const container of fixture.containers) {
        const containerRoot = path.join(root, container.path);
        for (const evidence of container.evidence)
          expect(fs.existsSync(path.join(containerRoot, evidence))).toBe(true);
        const manifest = JSON.parse(
          fs.readFileSync(path.join(containerRoot, 'package.json'), 'utf8')
        );
        for (const dependency of container.stack)
          expect({ ...manifest.dependencies, ...manifest.devDependencies }).toHaveProperty(
            dependency
          );
      }
    });
  }
  it('rejects reserved fixtures before creating a workspace', async () => {
    await expect(createFixture(fixtures.installedHarness)).rejects.toThrow('not populated');
  });
});
