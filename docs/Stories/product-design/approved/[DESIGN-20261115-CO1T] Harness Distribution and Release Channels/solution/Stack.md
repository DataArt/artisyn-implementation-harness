---
id: 86f39066
purpose: 'Stack for DESIGN-20261115-CO1T: the technologies this solution adds or changes for releasing and distributing the Artisyn Implementation Harness package, with version constraints, owners and compatibility notes'
keywords:
  [
    design,
    solution,
    stack,
    harness distribution,
    nx release,
    semantic-release,
    github packages,
    github actions,
    attestations,
    claude code plugin,
    codex marketplace,
    skills.sh,
    gh skill,
    yarn workspaces,
    agent skills spec,
  ]
---

# DESIGN-20261115-CO1T — Stack

Only technologies this solution adds or changes are listed. Rationale is in `design/02 Evaluate - *.md`; decision IDs refer to `solution/Architecture.md`.

---

## Technology table

| Technology                              | Used for                                                                                                          | Version / constraint                                           | Owner            | Compatibility note                                                                                        |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| Nx Release (independent mode)           | version, changelog, tag, GitHub Release for the harness project (D-16)                                            | Nx 23.3.1 (already in repo); keys verified in `nx-schema.json` | Release pipeline | Root semantic-release stays for the repo version                                                          |
| semantic-release (root)                 | repo version `v*`                                                                                                 | existing; `releaseRules` ignore scope `harness`                | Repo             | unchanged otherwise                                                                                       |
| GitHub Actions                          | `release-harness.yml`, CI gates                                                                                   | GitHub-hosted runners                                          | Repo             | `GITHUB_TOKEN` least privilege; release identity as ruleset bypass actor (D-17)                           |
| GitHub Packages npm registry            | `@dataart/artisyn-implementation-harness` (D-08)                                                                  | scope = org owner; consumers need `read:packages` token        | Release pipeline | `publishConfig.registry`; no npm provenance on GitHub Packages, so GitHub attestations are used instead   |
| `actions/attest-build-provenance`       | attestations for tarball + ZIP (D-09)                                                                             | current major                                                  | Release pipeline | verify with `gh attestation verify`                                                                       |
| GitHub Releases                         | ZIP + `.sha256` assets, tag `artisyn-implementation-harness-v*` (D-09)                                            | —                                                              | Release pipeline | root `v*` releases coexist                                                                                |
| Claude Code plugin + marketplace format | `.claude-plugin/plugin.json` (plugin `artisyn`), `.claude-plugin/marketplace.json` (marketplace `dataart`) (D-06) | `claude plugin validate --strict`; `github` source with `ref`  | Repo             | read by Claude Code and Copilot CLI; install `artisyn@dataart`, command `/artisyn:implementation-harness` |
| Codex plugin marketplace format         | `.agents/plugins/marketplace.json` (marketplace `dataart`, plugin `artisyn`) (D-06)                               | `git-subdir` source; `policy.*`, `category`                    | Repo             | legacy-compat read of the Claude file is not relied on; command `$artisyn:implementation-harness`         |
| skills.sh CLI (`npx skills`)            | discovery + install from `skills/` (D-07)                                                                         | Node ≥ 22.20 on consumer; `skills.sh.json` `paths`             | Consumer         | symlink mode installs into `.agents/skills/`                                                              |
| `gh skill`                              | install/update by tag (D-07)                                                                                      | gh ≥ 2.90 (preview)                                            | Consumer         | `@tag` pin                                                                                                |
| Node.js                                 | install CLI + package scripts (D-11)                                                                              | ≥ 22 consumer floor (repo itself ≥ 24)                         | Package          | no dependencies; `node:` stdlib only                                                                      |
| Yarn 4 workspaces                       | harness `package.json` joins `workspaces`                                                                         | 4.9.2                                                          | Repo             | yarn-only in repo; consumer docs show `npx`                                                               |
| Agent Skills spec                       | `SKILL.md` frontmatter (`name` = folder = `implementation-harness`, `metadata.version`) (D-15)                    | agentskills.io                                                 | Package          | `skills-ref validate` optional                                                                            |

---

## Consumer configuration example

Consumers add a `.npmrc` with the `@dataart` scope and a read-only token. The repo holds no credentials; the token comes from the consumer's environment.

```
@dataart:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```
