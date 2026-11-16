import { defineConfig } from 'vitest/config';
import { AGENT_E2E_TEST_TIMEOUT_MS } from './src/utils/constants.ts';

/** Real Claude/Codex execution — small, expensive, deliberately not part of
 * the default `integration` run. Never cached by Nx; results depend on a
 * live model call every time.
 *
 * Because a run costs real money and up to an hour, its workspace and results
 * are kept under `runs/<datetime>/` rather than discarded (see
 * `utils/run-output.ts`). `fileParallelism` stays off so the cases in one
 * invocation share a single run directory and report.
 */
export default defineConfig({
  test: {
    include: ['src/cases/*.spec.ts'],
    testTimeout: AGENT_E2E_TEST_TIMEOUT_MS,
    hookTimeout: AGENT_E2E_TEST_TIMEOUT_MS,
    fileParallelism: false,
    env: { HB_E2E_PERSIST_RUNS: '1' },
  },
});
