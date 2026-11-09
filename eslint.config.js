// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      '**/cdk.out/**',
      // Agent e2e run artifacts: copied fixtures and generated workspaces, not source.
      'apps/harness-bootstrap-e2e/runs/**',
      '**/.vitepress/dist/**',
      '**/.vitepress/cache/**',
      '.nx/**',
      '.yarn/**',
      // Workflow DSL files: the harness-bootstrap runtime injects pipeline()/agent()
      // and other bindings as globals at execution time, so standard no-undef checks
      // don't apply.
      '**/workflows/*.js',
    ],
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['apps/web-explorer/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // A handful of ported chart components (see 2-report.md, Step 9)
      // destructure a public prop they don't currently consume, matching
      // their upstream source — `_`-prefixed is the explicit "intentionally
      // unused" signal, scoped to this app only.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  }
);
