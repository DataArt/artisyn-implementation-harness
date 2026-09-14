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
      'dist/**',
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
  }
);
