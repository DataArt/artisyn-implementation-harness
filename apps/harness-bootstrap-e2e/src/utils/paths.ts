import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const appRoot = fileURLToPath(new URL('../..', import.meta.url));
export const workspaceRoot = path.resolve(appRoot, '../..');
export const fixturesRoot = path.join(appRoot, 'fixtures');

/** The real, current harness-bootstrap skill package — copied fresh into a
 * scratch workspace per test, never read from in place. This is the same
 * `origin` this skill's own scripts/tests/provider-launch.test.mjs uses, so
 * BOOT-* cases exercise the actual canonical content, not a synthetic stand-in.
 */
export const skillPackageRoot = path.join(workspaceRoot, '.canonical-implementation-harness');

export const materializeLaunchScript = path.join(
  skillPackageRoot,
  'scripts/materialize-launch.mjs'
);
export const finalizeLaunchScript = path.join(skillPackageRoot, 'scripts/finalize-launch.mjs');
export const planProviderLaunchScript = path.join(
  skillPackageRoot,
  'scripts/plan-provider-launch.mjs'
);
