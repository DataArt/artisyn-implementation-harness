---
id: 3f24cbe6
purpose: Judgment for Decision 2 (the launch flow that installs the Session Review drop-in) of the Session Review Capture Add-on design — requirements matrix, tradeoffs, recommendation of Option C, and its WAF assessment
keywords: [design-t5yb, session-review, evaluate, launch, install]
---

# DESIGN-20261112-T5YB: Session Review Capture Add-on — Evaluate: Launch Flow

_Produced by the 🏗 Evaluate phase. This is the judgment artifact. The WAF summary is also recorded in `design/Report.md`._

## Requirements × Options Matrix

Viability check (Evaluate Step 1b): no viability question is open. OQ2-4 was resolved at the Research sign-off — a harness script performs the settings merge (developer: 'go with the script') — and appears below as R10. OQ2-12 is resolved by Decision 1's recommendation, which places the vendored copy under `canonical/addons/`, outside `canonical/skills`.

Rows = evaluation criteria. EC numbers refer to `design/00 Frame.md`; OQ numbers refer to the research files. Columns = options from `design/01 Research - Launch Flow.md`.
✅ satisfies · ⚠️ partially (see note) · ❌ does not satisfy

| Requirement | A (1) Agent recipe + probe | B (2) Plan-native add-on | C (3) Installer script | D (4) Kit-owned recipe |
| ----------- | -------------------------- | ------------------------ | ---------------------- | ---------------------- |
| **R1** — EC1: installs on a yes when Claude is selected | ✅ | ✅ | ✅ | ✅ |
| **R2** — EC2: always asked, explicit answer, model default `opus`, answers machine-readable | ⚠️ one compound `Q12` value | ✅ `Q12`, `Q12b`, `Q12c` | ✅ the same keys; consent is also enforced at the script boundary | ⚠️ `Q12` only; subfolders are asked mid-install by the recipe |
| **R3** — EC3, EC13: the seven detection states are classified by code | ✅ probe | ✅ shared library, re-detected at plan time | ✅ `--detect`; the script refuses if the state changed | ✅ probe |
| **R4** — EC4: upgrade as a set, keeping `env` values and history | ⚠️ agent-performed; no actor deletes a file a newer kit dropped | ⚠️ the materializer never deletes; existing settings are merged by the agent | ✅ one script replaces the set and merges by key; the rule for dropped files is still to define | ❌ `INSTALL.md` has no upgrade path |
| **R5** — EC5: unmodified content at install | ✅ materializer write check, while the files stay token-free | ✅ raw-bytes branch | ✅ raw copy | ⚠️ agent shell copy, verified afterwards by hash |
| **R6** — EC8: nothing changes otherwise | ✅ | ⚠️ Claude-only logic enters provider-neutral tooling and needs regression cover | ✅ the script runs only on a yes with Claude selected | ✅ |
| **R7** — EC9: deterministic verification | ✅ `probe --verify` | ✅ the finalizer gates `verified` | ✅ `--verify` | ✅ probe |
| **R8** — EC10: formatter and pre-commit detection | ⚠️ the agent reads a signal table | ⚠️ an agent derive action | ⚠️ the script lists what it finds; the agent decides | ⚠️ a harness pre-step run by the agent |
| **R9** — EC12: deterministic cover including the merges; live runs never dispatch | ⚠️ merges untested; live runs answer no | ⚠️ the merge into an existing file is untested | ✅ every state, merge shape and re-run is covered | ⚠️ merges untested |
| **R10** — The settings merge is performed by a harness script (developer direction, OQ2-4) | ❌ the agent merges | ⚠️ only for a new settings file | ✅ | ❌ the agent follows the recipe |
| **R11** — Existing settings are preserved (hooks, permissions, unrelated keys) | ✅ agent reconciliation, as today | ✅ as today | ⚠️ a key-level merge preserves them, but the Block C and BOOT-005 rule must be restated and an unparseable file must be refused | ✅ as today |
| **R12** — Stays within the 15-row launch table and the frozen adapter surface | ✅ | ❌ touches the adapter surface and all three core scripts | ✅ core scripts unchanged; `SKILL.md` capabilities change | ✅ |
| **R13** — Reusable at `patch apply` (Decision 3 needs the same detection and offer at upgrade) | ⚠️ the probe is reusable; the install is redone by the agent | ❌ the planner and finalizer are launch-only tooling | ✅ re-runnable outside launch | ⚠️ the probe is reusable; the recipe has no upgrade |
| **R14** — Security-scan surface | ✅ one small read-only script | ⚠️ a broad change to core tooling | ⚠️ the most new code, and it registers hooks | ⚠️ the package instructs the agent to follow a vendored third-party document |
| **R15** — The kit stays the source of install knowledge | ⚠️ the recipe is restated in a reference | ⚠️ restated in code | ⚠️ restated in code; it can drift from `INSTALL.md` | ✅ the recipe is `INSTALL.md` |

## Tradeoffs

| Dimension | A (1) Agent recipe + probe | B (2) Plan-native add-on | C (3) Installer script | D (4) Kit-owned recipe |
| --------- | -------------------------- | ------------------------ | ---------------------- | ---------------------- |
| Operational Excellence | ⚠️ agent-performed merges vary from run to run | ✅ one plan, one receipt | ✅ idempotent; `--check` shows the diff; re-runnable | ⚠️ launch behaviour changes whenever the vendored recipe changes |
| Security | ✅ the smallest new code | ⚠️ a wide change in scanned core tooling | ⚠️ a script writes hook registrations into settings; it must be limited to adding named keys and must refuse what it cannot parse | ⚠️ the agent follows third-party instructions |
| Reliability | ⚠️ the two merge mistakes `INSTALL.md` warns about (a second `SessionStart` key, a missing `timeout`) remain possible | ⚠️ the existing-file merge is still done by hand; two-pass ordering | ✅ the same result every run; refuses on stale detection | ⚠️ shell copy varies by platform; the dot-file is easily skipped |
| Performance Efficiency | ✅ | ✅ | ✅ fewest agent turns | ✅ |
| Cost Optimization | ⚠️ low build cost, agent tokens on every install | ❌ highest build and regression cost | ⚠️ medium build cost, lowest run cost | ⚠️ lowest build cost, agent tokens on every install |
| Sustainability | ✅ | ✅ | ✅ fewest agent tokens per install | ✅ |
| Integration Complexity | ✅ | ❌ | ⚠️ a second write path and receipt beside plan → materialize → finalize | ⚠️ an override list that must track the kit's recipe |
| Vendor Lock-in (coupling to the kit) | ⚠️ recipe restated | ⚠️ restated in core tooling | ⚠️ install knowledge in harness code, bounded if the refresh check fails when `INSTALL.md` or the settings fragment changes | ⚠️ least restatement, but launch behaviour is coupled to every kit refresh |

## Recommendation

**Recommended option: Option C (3) — Standalone idempotent installer script (detect, check, write, verify)**

Option C is the only option that meets R4, R9, R10 and R13 together: the developer's direction that a script performs the merge, deterministic cover of the merges, and one routine that can be re-run at `patch apply`, which Decision 3's resolved model requires.

The other options fail requirements in the matrix:

- Options A and D fail R10; D also fails R4.
- Option B fails R12 and R13, and meets R10 only for a new settings file.

**Accepted tradeoffs, and how each is bounded:**

- **R11:** the rule "existing configuration is reconciled by the orchestrator, never overwritten by tooling" becomes "tooling may add named keys to an existing settings file, and never replaces or removes anything". BOOT-005 gains that scoped case.
- **R14:** this is the most new code. It stays small by reading the file map, the lock and the settings fragment from Decision 1's manifest block and the vendored `settings.hooks.json`, not restating them.
- **R15:** drift from the kit is bounded by Decision 1's refresh check, which fails when `INSTALL.md` or the fragment changes.

**Consistency with the other decisions:**

- The script reads the add-on declared in Decision 1's manifest block.
- The main plan reserves the script's targets as derived outputs, so the finalizer's evidence still covers them.
- Decision 3 runs the same `--detect` at launch and at `patch apply`.

**Assumptions — if one is wrong, the recommendation is revisited as stated:**

1. The harness author accepts restating the Block C / BOOT-005 rule as a scoped key-level merge. If not, the merge returns to the agent while detection, copy and verification stay in the script; the developer's direction is then unmet and goes back to the developer.
2. `.claude/settings.json` files are plain JSON that the script can parse and rewrite without losing content. Where one is not, the script refuses and reports, and the agent merges that file by hand.
3. Package scripts may spawn `git` for `check-ignore` and `check-attr` (OQ2-5). If not, those two checks are run by the agent and recorded as evidence.

**Open questions to resolve before implementation:**

| #      | Question | Owner | Impact if unresolved |
| ------ | -------- | ----- | -------------------- |
| OQ2-5  | May package scripts spawn `git`? | Harness author | Decides whether the ignore and attribute checks are in the script or agent-run |
| OQ2-6  | Does a nested settings file the harness creates carry only the session-review block, or the canonical `env` as well, and is it a harness-installed output? | Harness author; kit owner | Blocks the subfolder part of the merge |
| OQ2-7  | How is the sweep added to an existing `SessionStart`, how are older command forms recognised, and does an upgrade rewrite them? | Kit owner | Blocks the merge rules |
| OQ2-8  | After reporting a partial install, may launch offer a repair on an explicit yes? How are the unnamed sub-states classified? | Harness author | Decides the script's behaviour for partial states |
| OQ2-9  | Who deletes files a newer kit dropped, and are backups taken? | Kit owner and harness author | Blocks the upgrade-as-a-set rule |
| OQ2-10 | Is `eol=lf` part of EC9, and does a failed or unrunnable check block `verified`? | Kit owner and harness author | Decides how verification gates launch |
| OQ2-11 | Is the runner env guard wanted beside the prompt answer, and must live fixtures be their own git repo? | Implementer, with harness author | Blocks the e2e design for the yes path |
| OQ2-13 | Which formatter and hook tools are in the EC10 signal list, and may launch edit ignore files without confirmation? | Implementer | Blocks the formatter step |
| OQ2-3  | Is a repo "older" when only the version file differs? | Kit owner, with harness author | Decides what is offered for a version-only difference (same as OQ3-5) |

## WAF Assessment — recommended option (Option C)

### Operational Excellence — 🟢 Green

- **Strengths:** idempotent; a dry-run diff before any write; its own receipt; a verify step.
- **Gaps:** a second receipt beside the launch plan.
- **Recommendations:**
  - P2 — the plan reserves the script's targets so the finalizer's evidence covers them.

### Security — 🟡 Amber

- **Strengths:** consent is enforced at the script boundary (an explicit decision argument, and the detected from-version for an upgrade); the script refuses when detection has changed.
- **Gaps:** a package script registers hooks that run node scripts at every session start and end; it changes an existing harness rule; it adds code to a package that is scanned per version.
- **Recommendations:**
  - **P1** — the harness author confirms the restated rule for existing settings (add named keys only, never replace or remove) at the Review Gate.
  - P2 — the script refuses unparseable settings and writes nothing outside its declared targets.
  - P2 — InfoSec re-scan and updated `SKILL.md` capabilities before release.

### Reliability — 🟡 Amber

- **Strengths:** deterministic; idempotent on re-run; refuses on a changed state.
- **Gaps:** rewriting JSON may reorder or reformat a settings file; there is no rule yet for files a newer kit dropped; the hooks need Git Bash on Windows and a recent CLI, which the install does not check.
- **Recommendations:**
  - P2 — preserve formatting where possible and show the diff before writing.
  - P2 — state the Git Bash and CLI prerequisites in the launch report.
  - P2 — define the dropped-file rule (OQ2-9).

### Performance Efficiency — 🟢 Green

- **Strengths:** the install is one script run.
- **Gaps:** none.
- **Recommendations:** none.

### Cost Optimization — 🟡 Amber

- **Strengths:** no agent tokens for the install itself.
- **Gaps:** answering yes commits the team to one headless review run per session, on `opus` by default (EC2), which is a running cost in the target repo.
- **Recommendations:**
  - P2 — the question states that cost and the model choice when it is asked.

### Sustainability — 🟢 Green

- **Strengths:** the fewest agent turns per install of the four options.
- **Gaps:** the per-session review run noted under Cost.
- **Recommendations:** none beyond the Cost item.

**P1 items (resolve before implementation):** the harness author confirms, at the Review Gate, that a package script may add named keys to an existing `.claude/settings.json` (restating the Block C / BOOT-005 rule).
