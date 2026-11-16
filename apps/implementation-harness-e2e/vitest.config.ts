import { defineConfig } from 'vitest/config';

/** Deterministic bootstrap integration tests — no
 * subagent, safe to cache. See vitest.unit.config.ts and
 * vitest.agent-e2e.config.ts for the other two layers.
 */
export default defineConfig({
  test: {
    include: ['src/tests/integration/**/*.spec.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
