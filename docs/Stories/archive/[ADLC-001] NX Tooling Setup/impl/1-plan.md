---
id: 3d33ec18
---

# ADLC-001: NX Tooling Setup

| Field   | Value                            |
| ------- | -------------------------------- |
| Ticket  | ADLC-001                         |
| Branch  | `feat/adlc-001-nx-tooling-setup` |
| Created | 2026-07-15                       |

## Problem

The monorepo has three NX projects (`site`, `lambda-auth`, `infra`) with per-project `project.json` configs, but no root workspace to coordinate them. There is no `package.json` at root, no `yarn.lock`, no `nx.json`, and no `tsconfig.base.json` — even though both TypeScript apps already extend `../../tsconfig.base.json`. Tooling (prettier, eslint, husky) is also absent. This step establishes the full tooling baseline so that all subsequent tickets can rely on consistent linting, formatting, type-checking, and git-hook enforcement.

## Scope

**In scope:** root `package.json` (yarn workspaces), Yarn 4 via corepack (pinned in `packageManager`), Node v24 pinned via `.nvmrc` + `engines`, `nx.json`, `tsconfig.base.json`, prettier, ESLint (flat config), husky + lint-staged pre-commit hook.

**Out of scope:** changes to any app's runtime dependencies or build configuration; adding new NX targets beyond what already exists in project.json files; CI pipeline wiring.

## Acceptance Criteria

- [ ] `AC-0` — `node --version` reports `v24.x.x`; `yarn --version` reports `4.x.x`
- [ ] `AC-1` — `yarn nx show projects` lists `site`, `lambda-auth`, and `infra` without errors
- [ ] `AC-2` — `yarn nx run lambda-auth:typecheck` exits 0
- [ ] `AC-3` — `yarn nx run site:typecheck` exits 0
- [ ] `AC-4` — `yarn prettier --check .` exits 0 on a clean working tree
- [ ] `AC-5` — `yarn nx run lambda-auth:lint` exits 0
- [ ] `AC-6` — `yarn nx run site:lint` exits 0
- [ ] `AC-7` — staging a `.ts` file and running `git commit` triggers the pre-commit hook and runs lint-staged
- [ ] `AC-8` — `docs/Engineering Guide/05 Getting Started.md` exists and covers prerequisites, clone → install, per-app dev commands, and common NX commands

## Steps

---

### Step 1 — Root: Node + Yarn + `package.json` + `nx.json` (workspace bootstrap)

**Changes:**

- `.nvmrc` (new) — pins Node.js major version for nvm users
- `package.json` (new) — root workspace manifest; declares `workspaces`, Yarn 4 `packageManager` field, `engines.node`, and all shared tooling devDependencies
- `.yarnrc.yml` (new) — sets `nodeLinker: node-modules` (required for NX compatibility; Yarn Berry defaults to PnP which NX does not support); `yarnPath` is added automatically by `yarn set version stable`
- `nx.json` (new) — NX workspace config; defines `sharedGlobals` named input (referenced by both project.json files), target defaults for `build`, `typecheck`, and `lint` with caching
- Update root `.gitignore` — add Yarn Berry patterns (`.yarn/cache`, `.yarn/unplugged`, `.yarn/build-state.yml`)

`.nvmrc`:

```
24
```

Root `package.json` to create (note: `packageManager` version is updated by `yarn set version stable` — use a placeholder and let the command fill in the exact hash):

```json
{
  "name": "@artisyn-harness/root",
  "private": true,
  "workspaces": ["apps/*"],
  "packageManager": "yarn@4.x.x",
  "engines": {
    "node": ">=24"
  },
  "scripts": {
    "prepare": "husky",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint ."
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^10.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "nx": "^20.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.0.0"
  },
  "lint-staged": {
    "*.{ts,tsx,js,mjs}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yaml,yml}": ["prettier --write"]
  }
}
```

`.yarnrc.yml` initial content (before `yarn set version stable` adds `yarnPath`):

```yaml
nodeLinker: node-modules
```

`nx.json`:

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "defaultBase": "main",
  "namedInputs": {
    "sharedGlobals": [
      "{workspaceRoot}/tsconfig.base.json",
      "{workspaceRoot}/eslint.config.js",
      "{workspaceRoot}/.prettierrc.json"
    ]
  },
  "targetDefaults": {
    "build": { "cache": true },
    "typecheck": { "cache": true },
    "lint": {
      "cache": true,
      "inputs": ["default", "{workspaceRoot}/eslint.config.js"]
    }
  }
}
```

**Verification:**

> Switch to Node 24 and enable corepack:
>
> ```
> nvm install 24 && nvm use 24
> corepack enable
> ```
>
> Expected: `node --version` → `v24.x.x`
>
> Pin Yarn 4 (run from repo root after creating `package.json`):
>
> ```
> yarn set version stable
> ```
>
> Expected: creates `.yarn/releases/yarn-4.x.x.cjs`, updates `packageManager` field in `package.json` with exact version + hash, appends `yarnPath` to `.yarnrc.yml`
>
> Run: `yarn install`
> Expected: resolves without errors; `node_modules/nx/` exists at repo root
>
> Run: `yarn --version` → `4.x.x`; `yarn nx show projects`
> Expected: output includes `site`, `lambda-auth`, `infra` (one per line)

⚠️ **Stop here. Verify this step before proceeding to Step 2.**

---

### Step 2 — Root: `tsconfig.base.json`

**Changes:**

- `tsconfig.base.json` (new) — shared TypeScript compiler options; both `apps/docs-web/tsconfig.json` and `apps/lambda-auth/tsconfig.json` already extend this path and will pick it up automatically

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**Verification:**

> Run: `yarn nx run lambda-auth:typecheck`
> Expected: exits 0, no type errors
>
> Run: `yarn nx run site:typecheck`
> Expected: exits 0, no type errors

⚠️ **Stop here. Verify this step before proceeding to Step 3.**

---

### Step 3 — Root: Prettier

**Changes:**

- `.prettierrc.json` (new) — formatting rules applied workspace-wide

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- `.prettierignore` (new) — excludes generated output, Terraform files, and secrets

```
node_modules
dist
.vitepress/dist
.vitepress/cache
.nx
*.tf
*.tfvars
*.tfstate
.secrets.*
```

**Verification:**

> Run: `yarn prettier --check .`
> Expected: exits 0 (no files flagged), or lists files that need formatting — run `yarn prettier --write .` once, then re-check

⚠️ **Stop here. Verify this step before proceeding to Step 4.**

---

### Step 4 — Root: ESLint (flat config)

**Changes:**

- `eslint.config.js` (new) — ESLint v9 flat config with TypeScript support and prettier integration; ignores Terraform (`apps/infra/`) and build outputs

```js
// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, prettier, {
  ignores: [
    'node_modules/**',
    'dist/**',
    '.vitepress/dist/**',
    '.vitepress/cache/**',
    '.nx/**',
    'apps/infra/**',
  ],
});
```

**Verification:**

> Run: `yarn nx run lambda-auth:lint`
> Expected: exits 0, no lint errors
>
> Run: `yarn nx run site:lint`
> Expected: exits 0, no lint errors
>
> Run: `yarn lint` (from repo root)
> Expected: exits 0 across the whole workspace

⚠️ **Stop here. Verify this step before proceeding to Step 5.**

---

### Step 5 — Root: Husky + lint-staged

**Changes:**

- `.husky/pre-commit` (new) — pre-commit hook that runs `lint-staged` on staged files
- The `prepare` script in `package.json` (added in Step 1) installs husky automatically on `yarn install`

`.husky/pre-commit` content:

```sh
yarn lint-staged
```

**Verification:**

> Run: `yarn husky` (or confirm `.husky/pre-commit` file was created and is executable)
>
> Test the hook by staging any `.ts` file and committing:
>
> ```
> git add apps/lambda-auth/src/<any-file>.ts
> git commit -m "test: verify pre-commit hook"
> ```
>
> Expected: pre-commit hook fires, lint-staged runs eslint + prettier on the staged file, commit proceeds if clean
>
> To undo the test commit: `git reset HEAD~1`

⚠️ **Stop here. Verify this step before proceeding to Step 6.**

---

### Step 6 — Docs: Getting Started guide (`docs/Engineering Guide/05 Getting Started.md`)

**Changes:**

- `docs/Engineering Guide/05 Getting Started.md` (new) — onboarding and quick-start guide covering prerequisites, first-time setup, per-app dev commands, and common NX commands

Sections to include:

1. **Prerequisites** — Node v24 via nvm (`nvm install 24 && nvm use 24`), corepack (`corepack enable`), Yarn 4 (`yarn set version stable`)
2. **Clone & install** — `git clone …`, `yarn install`
3. **Run apps** — `yarn nx run site:serve` (docs site), `yarn nx run lambda-auth:build` (auth handler), Terraform commands for infra
4. **Common NX commands** — `yarn nx run <project>:<target>`, `yarn nx affected --target=lint`, `yarn nx show projects`, `yarn nx graph`
5. **Code quality** — `yarn format`, `yarn lint`, `yarn nx run <project>:typecheck`

**Verification:**

> Open `docs/Engineering Guide/05 Getting Started.md` in the browser (via `yarn nx run site:serve`) or in a Markdown preview.
> Confirm all commands in the guide match the NX targets in `project.json` files and the scripts in root `package.json`.

⚠️ **Stop here. Verify this step before proceeding. This is the final step.**
