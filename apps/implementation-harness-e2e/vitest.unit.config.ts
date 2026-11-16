import { defineConfig } from 'vitest/config';

/** Deterministic script, testkit, and grader unit tests.
 * No live agents; safe to cache.
 */
export default defineConfig({
  test: {
    include: ['src/tests/unit/**/*.spec.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
