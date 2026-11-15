---
purpose: 'Evaluate phase output for DESIGN-20261115-V98J Decision 2: requirements matrix, tradeoffs and recommendation for what a fresh clone contains and how the canonical harness stays unaffected; recommends a repo-owned Nx wrapper with CI verify on a gitignored, local-scope layout'
keywords:
  [
    evaluate,
    log hub,
    canonical isolation,
    harness bootstrap,
    settings.json,
    plugin scope,
    recommendation,
    WAF,
    design phase,
  ]
---

# DESIGN-20261115-V98J: Log Hub Session Telemetry Integration — Evaluate: Repo integration footprint and canonical isolation

Viability OQs D1-2, D1-3, D1-4, D1-11 and D2-6 were left open at the Research sign-off by the developer's choice; the affected options are marked conditional below rather than removed.

_Produced by the 🏗 Evaluate phase. This is the judgment artifact for Decision 2. Options come from `01 Research - Repo integration footprint and canonical isolation.md`; criteria EC1–EC9 come from `00 Frame.md`; the sibling decision is `02 Evaluate - Server topology.md`. The WAF assessment is repeated in `design/Report.md`._

## Requirements × Options Matrix

Rows = evaluation criteria from `design/00 Frame.md` plus the Research-derived constraints. Columns = options from `design/01 Research - Repo integration footprint and canonical isolation.md`.
✅ satisfies · ⚠️ partially (see note) · ❌ does not satisfy

| Requirement                                | A Upstream default, commit all (conditional: D2-6)                              | B Per-developer only, gitignore + local scope (conditional: D2-3) | C Commit marketplace + config, local scope (conditional: D2-3, D2-6) | D Repo-owned Nx wrapper + CI verify (layout per policy)   | E Nothing in repo, personal install |
| ------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------- |
| EC1 sessions captured                      | ✅                                                                              | ✅                                                                | ✅                                                                   | ✅                                                        | ✅                                  |
| EC3 join path defined                      | ✅ one `claude plugin install`                                                  | ⚠️ manual installer + rescope steps                               | ⚠️ manual rescope steps                                              | ✅ `yarn nx run log-hub:install-hook`                     | ❌ undefined                        |
| EC3 stay-out path                          | ⚠️ plugin enabled for everyone; hooks run locally                               | ✅                                                                | ✅                                                                   | ✅ (with B layout)                                        | ✅                                  |
| EC4 launch isolation                       | ✅ existing derived-output rule                                                 | ✅ no bytes in scope                                              | ✅ no bytes in scope                                                 | ✅ asserted by `verify`                                   | ⚠️ incidental                       |
| EC4 harvest isolation                      | ⚠️ agent judgment + written rule only                                           | ✅ nothing to harvest                                             | ✅ nothing in registered paths                                       | ✅ asserted by `verify` + canonical hash check            | ⚠️ incidental                       |
| EC5 no credential committed                | ✅ installer hard-aborts if local file tracked                                  | ✅ + `.artisyn/` ignored                                          | ✅                                                                   | ✅ `verify` greps tracked config                          | ✅                                  |
| EC6 zero-upload fresh clone                | ⚠️ uploads nothing but 15 hooks execute and write local records without consent | ✅ nothing runs                                                   | ✅ nothing runs                                                      | ✅ nothing runs; wrapper prints disclosure before install | ✅                                  |
| EC7 reversible + verifiable                | ⚠️ surgical uninstall; verification manual                                      | ⚠️ uninstall leaves local-scope keys (D2-9); no repo check        | ⚠️ same                                                              | ✅ `uninstall` + `verify` targets; CI guard               | ❌ none                             |
| EC8 tamper surface                         | ⚠️ tracked `log-hub.json` + 45 scripts PR-reviewed                              | ✅ none tracked                                                   | ⚠️ tracked scripts + config                                          | ✅ wrapper script only (B layout)                         | ✅ none tracked                     |
| EC9 yarn convention                        | ❌ raw `npx` one-liner                                                          | ❌ raw `npx`                                                      | ❌ raw `npx`                                                         | ✅ single sanctioned invocation inside the wrapper        | ❌                                  |
| Public repo exposure of third-party code   | ❌ ~45 unsigned JS files                                                        | ✅ none                                                           | ❌ ~45 files                                                         | ✅ none (B layout)                                        | ✅                                  |
| Fork correctness (D2-5 marketplace hash)   | ⚠️ committed hash from upstream origin                                          | ✅ per-clone                                                      | ⚠️                                                                   | ✅ per-clone                                              | ✅                                  |
| Agent-e2e retained runs unaffected (D2-10) | ❌ project-scope plugin visible to `runs/` fixtures in repo tree                | ✅ local scope is per checkout `.claude/settings.local.json`      | ✅                                                                   | ✅                                                        | ✅                                  |
| Installer friction per install/upgrade     | ✅ none                                                                         | ❌ manual revert + rescope every time                             | ❌ same                                                              | ✅ automated                                              | ⚠️ revert                           |

## Tradeoffs

| Dimension              | A Upstream default, commit all (conditional: D2-6)                            | B Per-developer only, gitignore + local scope (conditional: D2-3) | C Commit marketplace + config, local scope (conditional: D2-3, D2-6) | D Repo-owned Nx wrapper + CI verify (layout per policy)                                               | E Nothing in repo, personal install |
| ---------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Operational Excellence | ✅ upstream flow as-is                                                        | ❌ manual rescope each upgrade                                    | ❌ same                                                              | ✅ automated; ⚠️ tracks upstream installer internals                                                  | ❌ no process                       |
| Security               | ⚠️ third-party scripts committed; any committer controls every machine's hook | ✅ per-developer blast radius                                     | ⚠️ scripts committed                                                 | ✅ nothing third-party committed; remote tarball still unsigned (downloaded from own loopback server) | ⚠️ dirty-tree accidents             |
| Reliability            | ✅ documented path                                                            | ⚠️ depends on local-scope behaviour (D2-3)                        | ⚠️ same                                                              | ⚠️ same dependency, automated and spike-tested; fallback to A layout                                  | ❌                                  |
| Performance Efficiency | ⚠️ hooks run for all contributors                                             | ✅ only opted-in                                                  | ✅                                                                   | ✅                                                                                                    | ✅                                  |
| Cost Optimization      | ✅ no new code                                                                | ✅ docs only                                                      | ✅ docs only                                                         | ⚠️ wrapper + CI job to own                                                                            | ✅                                  |
| Sustainability         | ⚠️ needless local recording on every clone                                    | ✅                                                                | ✅                                                                   | ✅                                                                                                    | ✅                                  |
| Integration Complexity | ✅ low                                                                        | ⚠️ manual steps                                                   | ⚠️ manual steps                                                      | ⚠️ new Nx targets (shared with D1's project) + CI step                                                | ✅ none                             |
| Vendor Lock-in         | ⚠️ installer semantics in committed files                                     | ✅ none                                                           | ⚠️                                                                   | ⚠️ wrapper coupled to installer CLI/keys                                                              | ✅ none                             |

## Recommendation

**Recommended option: Option D — repo-owned Nx wrapper with CI verify, using Option B's layout (gitignore `.artisyn/`, plugin registered in local scope, nothing Log-Hub-related committed except the wrapper and docs).**

D with the B layout is the only combination that makes EC4 machine-checked for both launch and harvest, keeps EC6 true by construction (a fresh clone has no plugin, no hooks, no marketplace), keeps ~45 unsigned third-party scripts out of a public repo (sidestepping the open D2-6 decision), avoids the fork marketplace-hash problem (D2-5) and the agent-e2e side effect (D2-10), and resolves EC9 by giving contributors one sanctioned command. It shares the Nx project recommended in Decision 1 (`log-hub`), so the wrapper adds targets (`install-hook`, `upgrade-hook`, `uninstall-hook`, `verify`) rather than a second project.

B's weakness, fighting the installer on every install/upgrade, is exactly what the wrapper automates:

| Wrapper step   | Action                                                                                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `install-hook` | Print the disclosure first; run the upstream installer; restore `.claude/settings.json` from the `.bak` it writes; re-register with `--scope local`; apply repo defaults to `log-hub.json` (post-turn analysis off)                                    |
| `verify`       | Assert `.claude/settings.json` has no `enabledPlugins`/`extraKnownMarketplaces` keys; `.artisyn/` is ignored and untracked; `canonical/settings.json` hash matches `state/index.json`. Runs in CI as a plain script (no Docker, no Claude Code needed) |

**Acceptable tradeoffs:** new wrapper code coupled to the upstream installer's documented behaviour (step 8 `.bak`, step 9 scope), accepted because the upstream contract is documented and the spike (D2-3/8/9) pins it; a CI step for tooling only some contributors use, accepted because it is the proof EC7 asks for.

**Disqualifying factors:**

- A commits third-party scripts to a public repo (D2-6 unresolved), enables hooks for every contributor without consent (EC6 ⚠️), leaves harvest isolation to judgment, and lets retained agent-e2e runs see the plugin.
- C still commits the scripts and keeps B's manual rescope cost.
- B alone is the right layout but has no automation and no verification (EC7 ⚠️, EC3 ⚠️).
- E has no contributor path (EC3 ❌) and no verification.

**Falsifiable assumptions:**

1. D2-3: `claude plugin marketplace add ./.artisyn/marketplace --scope local` + `plugin install --scope local` registers a path marketplace and the hooks fire. Flags verified present in CLI 2.1.274; behaviour unverified. If false, the fallback is the A layout with `verify` asserting exactly the two allowed keys and a written harvest exclusion rule in the bootstrap registry, and D2-6 must then be answered.
2. D2-8: hook `upgrade` re-adds the project key. Assumed yes; the wrapper's `upgrade-hook` re-sanitises regardless.
3. D2-9: `uninstall` leaves local-scope keys. Assumed yes; the wrapper's `uninstall-hook` removes them.
4. D2-1: harvest is judgment-only today. If a mechanical harvest of settings keys exists, `verify`'s hash check catches it anyway.
5. D2-4: `yarn dlx <tarball-url>` works. If not, the wrapper uses `npx` internally as the one documented exception.

**Open questions to resolve before implementation:**

| #           | Question                                                                       | Owner                                    | Impact if unresolved                                                     |
| ----------- | ------------------------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------ |
| D2-3        | Local-scope path marketplace registers and loads                               | Spike (Efforts.md) before implementation | Blocks B layout; fallback to A layout                                    |
| D2-8 / D2-9 | `upgrade` re-adds project key; `uninstall` leaves local keys                   | Same spike                               | Wrapper `upgrade-hook`/`uninstall-hook` logic                            |
| D2-4        | `yarn dlx` with the tarball URL                                                | Spike, once a local server is up         | Decides `yarn dlx` vs internal `npx` exception                           |
| D2-1        | Harvest dry-run with plugin keys present                                       | Developer + @architect                   | Confirms `verify` is sufficient or a registry rule is also needed        |
| D2-7 / D1-8 | Shared server URL in committed docs                                            | Developer, when a shared target exists   | Disclosure wording only; loopback is all that is documented now          |
| D1-17       | `permissions.deny` `Read(./apps/log-hub/.local/**)` in `.claude/settings.json` | Solution                                 | A project-owned deny rule like the existing list; `verify` must allow it |

## WAF Assessment (recommended option)

Option D with the B layout.

| Pillar                 | Rating | Headline                                                                                                                                                                                                                                                                  |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟢     | Install, upgrade, uninstall and verify are one command each; CI runs `verify`. P2: pin the installer behaviours the wrapper relies on in a test (spike D2-3/8/9) so upstream changes fail loudly.                                                                         |
| Security               | 🟢     | Nothing third-party committed; API key and plugin registration per checkout; `verify` greps tracked config. P2: installer tarball is unsigned — document that it is fetched from the contributor's own loopback server, and record the tarball sha256 in the wrapper log. |
| Reliability            | 🟡     | Depends on local-scope path-marketplace behaviour (D2-3). P1: run the scratch-clone spike before implementation and record the fallback (A layout) decision if it fails.                                                                                                  |
| Performance Efficiency | 🟢     | Hooks run only where opted in.                                                                                                                                                                                                                                            |
| Cost Optimization      | 🟢     | Small wrapper shared with Decision 1's project; one CI script.                                                                                                                                                                                                            |
| Sustainability         | 🟢     | Fresh clones run nothing; no wasted local recording.                                                                                                                                                                                                                      |

**P1 items (resolve before implementation):**

1. Spike D2-3/8/9 in a scratch clone before implementation; if local-scope registration fails, switch to the A layout with `verify` allowing exactly the two keys plus a written harvest exclusion rule.
