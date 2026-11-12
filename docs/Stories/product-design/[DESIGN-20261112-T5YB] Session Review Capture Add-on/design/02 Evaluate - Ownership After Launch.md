---
id: f29c3dd6
purpose: Judgment for Decision 3 (ownership of the Session Review drop-in after launch) of the Session Review Capture Add-on design — requirements matrix, tradeoffs, recommendation of Option F, and its WAF assessment
keywords: [design-t5yb, session-review, evaluate, patch-state, ownership]
---

# DESIGN-20261112-T5YB: Session Review Capture Add-on — Evaluate: Ownership After Launch

_Produced by the 🏗 Evaluate phase. This is the judgment artifact. The WAF summary is also recorded in `design/Report.md`._

## Requirements × Options Matrix

Viability check (Evaluate Step 1b): no viability question is open. OQ3-1, OQ3-3 and OQ3-7 were resolved at the Research sign-off and appear below as R6, R7 and R3. Option C (3) is carried in the matrix as not viable. Options A, B, D and E are scored as described in the research; the research's "Effect of the resolutions" section states the change each would need.

Rows = evaluation criteria; EC numbers refer to `design/00 Frame.md`, OQ numbers to the research files. Columns = options from `design/01 Research - Ownership After Launch.md`.
✅ satisfies · ⚠️ partially (see note) · ❌ does not satisfy

| Requirement | A (1) Existing baseline | B (2) Unit record | C (3) Install-once | D (4) Release recognition | E (5) Committed stamp | F (6) Stateless detection |
| ----------- | ----------------------- | ----------------- | ------------------ | ------------------------- | --------------------- | ------------------------- |
| R1 — EC3: never overwritten silently; the four cases | ⚠️ needs an exception to "unchanged permanent file: deploy" | ✅ a dedicated step | ✅ at launch only | ✅ | ✅ | ✅ |
| R2 — EC4: replaced as a set, `env` values and history kept | ❌ per file; `partial` is a normal outcome | ✅ | ⚠️ only inside launch | ✅ | ✅ | ✅ |
| R3 — EC5: unmodified kit content, line endings ignored (OQ3-7) | ⚠️ raw-byte baselines; needs a departure from "exact local baseline bytes" | ✅ | ✅ nothing is compared | ✅ | ✅ | ✅ |
| R4 — EC11: no baseline for files the harness did not install; `patch apply` never changes them on its own; never harvested | ⚠️ needs three exclusions; baselines exist for harness-installed files | ✅ | ✅ | ✅ | ✅ | ✅ by construction |
| R5 — EC13: partial installs are reported, not repaired | ⚠️ | ✅ it records what was added | ⚠️ status line only | ✅ a named class | ✅ | ⚠️ overlaps "older" when the file set changed between releases |
| R6 — The offer is made at launch and at `patch apply` (OQ3-1) | ✅ | ✅ | ❌ launch only | ✅ | ✅ | ✅ |
| R7 — The offer is independent of who installed, from any clone (OQ3-3) | ❌ keyed to a local mapping | ❌ keyed to a local record | ❌ | ⚠️ only if the record is dropped and the table kept | ⚠️ only if the stamp stops being a precondition | ✅ |
| R8 — The harness never removes the drop-in (OQ3-10) | ⚠️ `delete` is reachable unless ruled out | ✅ | ✅ | ✅ | ✅ | ✅ |
| R9 — Coexists with the kit's `deploy` | ❌ every changed file reads as a local edit | ⚠️ the record goes stale | ✅ a single channel | ✅ recognised | ⚠️ the stamp goes stale | ⚠️ nothing can go stale, but the two channels can alternate when an older kit instance downgrades a repo |
| R10 — A version-only release raises no phantom upgrade | ✅ | ✅ | ✅ | ✅ first-class | ✅ | ✅ detected exactly |
| R11 — A team's edit to a drop-in file is not lost unseen | ⚠️ seen on the launching machine only | ⚠️ launching machine only | ✅ the harness never writes | ✅ pristine and edited installs are told apart on any clone | ⚠️ only for harness-installed sets | ❌ an edited older install looks pristine |
| R12 — A declined offer does not repeat forever | ⚠️ | ⚠️ could be noted locally | ✅ no offer | ⚠️ | ⚠️ could be noted in the stamp | ❌ not remembered |
| R13 — Deterministic and testable (EC12) | ⚠️ apply is a prose recipe | ✅ | ✅ little to test | ⚠️ the most cases | ✅ | ✅ a pure function of the repo and the bundled release |
| R14 — Size of the state-contract change; no hook-script bytes in `state/objects/` | ❌ bytes are stored; four overrides to the generic rule | ⚠️ a second record shape | ✅ smallest | ❌ the most machinery; a shipped table that grows | ⚠️ a tenth file the kit does not know; departs from "bookkeeping lives under `package:state/`" | ✅ exclusions and one step |

Note on R11: the kit owner confirmed on 2026-11-12 that teams do not edit the drop-in's files, only its settings. The scores above are unchanged; the row describes what each option could detect, not how often the case occurs.

## Tradeoffs

| Dimension | A (1) Existing baseline | B (2) Unit record | C (3) Install-once | D (4) Release recognition | E (5) Committed stamp | F (6) Stateless detection |
| --------- | ----------------------- | ----------------- | ------------------ | ------------------------- | --------------------- | ------------------------- |
| Operational Excellence | ❌ per-file resolution of false "local edits" | ⚠️ a record to maintain and re-stamp | ✅ | ⚠️ a table to ship and grow | ⚠️ a stale stamp to explain | ✅ nothing to maintain |
| Security | ⚠️ baseline bytes of hook scripts in `state/objects/` (the open LOW scan finding) | ✅ | ✅ | ✅ | ⚠️ a committed marker anyone can edit | ⚠️ no stored state, but direction rests on one editable version line |
| Reliability | ❌ line endings and `deploy` read as drift | ⚠️ no offer on another clone | ⚠️ no update route without a dashboard instance | ✅ the best classification | ⚠️ stale after `deploy` | ⚠️ cannot see an edit on an older install |
| Performance Efficiency | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cost Optimization | ⚠️ | ⚠️ | ✅ | ❌ highest | ⚠️ | ✅ |
| Sustainability | ✅ | ✅ | ✅ | ⚠️ a table that grows with every release | ✅ | ✅ |
| Integration Complexity | ⚠️ four overrides to the generic rule | ⚠️ a new record and step | ✅ | ❌ | ⚠️ | ✅ one step and three exclusions |
| Vendor Lock-in (coupling to the kit) | ⚠️ | ⚠️ | ❌ every later update depends on the kit's `deploy` | ⚠️ needs per-release digests | ⚠️ | ✅ needs only the version file and the bundled copy |

## Recommendation

**Recommended option: Option F (6) — Stateless detection, no ownership record.**

Option F is recommended on the matrix rows below; each of the other five options is ruled out or set aside by a named row.

- It is the only option that is viable as described after the resolutions (R6, R7), and it meets R1–R4, R8, R10, R13 and R14 with no change.
- Option C is not viable (R6).
- Options A, B and E fail R7 as described; after the changes the research states, their records no longer decide anything.
- Option D's table of known releases is the one mechanism that closes Option F's R11 gap, but it brings the most machinery (R14).

**Accepted tradeoffs, and how each is bounded:**

| Accepted tradeoff | How it is bounded |
| ----------------- | ----------------- |
| R11 — an edit on an older install is not seen | Before an accepted upgrade writes anything, the offer lists the files that differ from the bundled copy and reports uncommitted changes on the drop-in paths. The drop-in is committed in the repo, so an overwritten edit stays in git history, and the upgrade is a reviewable diff before the next commit. The kit owner confirms that teams do not edit the kit's files, so this case is not expected in practice; the listing and the git check remain as a safeguard. |
| R12 — the offer repeats | It repeats only when the harness is installed or upgraded, not in every session. |
| R5 and R9 | The overlap between "older" and "partial", and the alternation with an older kit instance, are left as open questions OQ3-16 and OQ3-6 below. |

**Consistency with the other decisions:** detection is Decision 2's script run with `--detect`, at launch and as one add-on step in `patch apply`; the bundled release and its per-file hashes come from Decision 1's lock.

**Assumptions — if one is wrong, the recommendation is revisited as stated:**

1. Teams do not edit the drop-in's files. Confirmed by the developer (kit owner) on 2026-11-12: teams change only the kit's settings, not its files; those settings are the `env` values that EC4 keeps on an upgrade. Option D's table of known release digests is therefore not planned. It stays the fallback if that ever changes: added to Decision 1's lock, it would let detection tell an edited install from a pristine older one without any ownership record.
2. The version file orders releases reliably (OQ3-15). Where it does not, direction cannot be decided, and such an install is reported and left alone.
3. An offer that repeats at each harness install or upgrade is acceptable. If it is not, a decline has to be stored, which reintroduces state (Option B or E).

**Open questions to resolve before implementation:**

| # | Question | Owner | Impact if unresolved |
| - | -------- | ----- | -------------------- |
| OQ3-5 | When installed and bundled differ only in the version file, is the outcome silence, a report, or an offer to update the version file? | Kit owner and harness author | Decides one classification outcome; the kit's `deploy` verification fails a repo whose version file differs |
| OQ3-13 | What must the offer do before overwriting: list differing files, take a backup, check git for uncommitted changes? | Harness author | Decides the R11 safeguard. With assumption 1 confirmed, listing the differing files and reporting uncommitted changes is proposed as sufficient; no backup. |
| OQ3-15 | What is the version comparison rule, and how is a malformed version file classified? | Kit owner; harness author | Blocks the direction test |
| OQ3-16 | When the bundled release has a file the older install lacks, is that "older" or "partial"? May an accepted upgrade add missing hook entries? | Harness author | Blocks the classifier's precedence rule |
| OQ3-17 | Does detection run on every `patch apply`, including a scoped one? | Harness author | Decides where the add-on step sits |
| OQ3-18 | Does detection run when Claude is not an installed provider but a hand-installed drop-in exists? | Harness author | EC8 and the "who installed does not matter" answer pull apart here |
| OQ3-8, OQ3-9 | Can a kit release change the hooks fragment, and what is "the set" when the file list changes? | Kit owner, then implementer | Blocks the upgrade-as-a-set rule |
| OQ3-6 | An older kit instance's `deploy` downgrades a harness-upgraded repo: accepted and documented, or will the kit add a guard? | Kit owner | A documented limitation unless the kit changes |
| OQ3-14 | Is a declined offer remembered? | Harness author | Assumption 3 |
| OQ3-19 | Will the kit publish per-release digests or file lists? | Kit owner | Not needed while assumption 1 holds. |
| OQ3-20 | How is the add-on result recorded when there is no mapping? | Implementer | Blocks the operation-record shape |

## WAF Assessment — recommended option

Assessed option: Option F (6) — Stateless detection, no ownership record.

### Operational Excellence — 🟢 Green

- **Strengths:** nothing to maintain; one routine at launch and at `patch apply`.
- **Gaps:** the offer repeats after a "no".
- **Recommendations:** P3 — revisit if teams report noise.

### Security — 🟢 Green

- **Strengths:** no baseline bytes of hook scripts in `state/objects/`; no removal path; no way for `patch apply` to write the files except the explicit offer.
- **Gaps:** direction rests on one editable version line.
- **Recommendations:** P3 — none beyond the Reliability items.

### Reliability — 🟡 Amber

- **Strengths:** no state to go stale; works from any clone.
- **Gaps:** an edited older install is indistinguishable from a pristine one; the two update channels can alternate; version ordering is undefined.
- **Recommendations:**
  - P2 — list differing files and report uncommitted changes before overwriting.
  - P2 — define the version comparison and treat a malformed version file as "existing, unknown".
  - P2 — document the downgrade limitation.

### Performance Efficiency — 🟢 Green

- **Strengths:** a comparison of nine small files.
- **Gaps:** none.
- **Recommendations:** none.

### Cost Optimization — 🟢 Green

- **Strengths:** the smallest state-contract change of the six options.
- **Gaps:** none.
- **Recommendations:** none.

### Sustainability — 🟢 Green

- **Strengths:** no stored state.
- **Gaps:** none.
- **Recommendations:** none.

**P1 items (resolve before implementation):** none.
