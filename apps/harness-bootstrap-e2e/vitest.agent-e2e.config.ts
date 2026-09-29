import { defineConfig } from 'vitest/config';

/** Real Claude/Codex execution — small, expensive, deliberately not part of
 * the default `integration` run. Never cached by Nx; results depend on a
 * live model call every time.
 */
export default defineConfig({
  test: {
    include: ['src/cases/e2e/**/*.spec.ts'],
    testTimeout: 65 * 60_000,
    hookTimeout: 65 * 60_000,
    fileParallelism: false,
  },
});
