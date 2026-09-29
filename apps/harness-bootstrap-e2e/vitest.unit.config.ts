import { defineConfig } from 'vitest/config';

/** Fast, deterministic script-layer tests — ported from
 * .canonical-implementation-harness/scripts/tests/*.test.mjs. No fixtures, no
 * subagent, safe to cache.
 */
export default defineConfig({
  test: {
    include: ['src/cases/unit/**/*.spec.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
