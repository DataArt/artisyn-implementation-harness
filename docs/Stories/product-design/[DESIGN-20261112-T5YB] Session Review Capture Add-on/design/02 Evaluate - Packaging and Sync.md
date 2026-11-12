---
id: 6e4f3fd3
purpose: Judgment for Decision 1 (packaging the vendored Session Review drop-in and keeping it in sync) of the Session Review Capture Add-on design — requirements matrix, tradeoffs, recommendation of Option B, and its WAF assessment
keywords: [design-t5yb, session-review, evaluate, packaging, vendoring]
---

# DESIGN-20261112-T5YB: Session Review Capture Add-on — Evaluate: Packaging and Sync

_Produced by the 🏗 Evaluate phase. This is the judgment artifact. The WAF summary is also recorded in `design/Report.md`._

## Requirements × Options Matrix

Viability check (Evaluate Step 1b): no viability question is open. OQ1-4 was resolved at the Research sign-off — a drop-in refresh must be able to travel in a patch bundle — so Option E (5) is carried in the matrix as not viable.

Rows = evaluation criteria; EC numbers refer to `00 Frame.md`, OQ numbers to `01 Research - Packaging and Sync.md`. Columns = the options from that research file, by template letter and comparison-table number.
✅ satisfies · ⚠️ partially (see note) · ❌ does not satisfy

| Requirement | A (1) Reference-driven | B (2) Manifest add-on | C (3) Existing roots | D (4) Pinned archive | E (5) `vendor/` root |
| --- | --- | --- | --- | --- | --- |
| R1 — EC5: installed bytes are the unmodified kit content | ⚠️ holds only while kit files stay token-free UTF-8; checked per file at materialize | ✅ raw copy in code; per-file lock | ✅ planner branch copies without rendering | ✅ one hash equals the kit's artifact | ✅ raw copy, as B |
| R2 — EC6: ships in the ZIP; the kit stays the source; the harness copy is never edited | ⚠️ ships, but nothing mechanical proves it equals the kit release | ✅ lock and check fail on any in-harness edit | ⚠️ lock and check, but spread over two roots and a remap | ✅ single hash; cannot be edited piecemeal | ✅ lock and check |
| R3 — EC8: nothing changes for Codex-only, Copilot-only or a "no" | ✅ `provider: "claude"` entries are rejected when Claude is not selected | ✅ the add-on is refused when its provider is not selected | ⚠️ the skills root is enumerated for all three providers; the planner and two test enumerations need gating | ✅ | ✅ |
| R4 — EC11: copy-only and excluded from harvest, machine-readably | ⚠️ prose rule only | ✅ declared as copy-only in the manifest | ❌ sits where `skill` mappings and registry rows normally apply; highest harvest exposure | ✅ nothing harvestable | ✅ path exclusion |
| R5 — EC12: the deterministic suite can cover the file list | ❌ the list is prose; tests would duplicate it | ✅ read from the manifest | ✅ | ✅ | ✅ |
| R6 — A refresh can travel in a patch bundle (OQ1-4, resolved) | ✅ text under `canonical/` | ✅ | ✅ | ⚠️ only as a whole new file per version, never a reviewable diff | ❌ its folder is excluded from patching by design |
| R7 — Protected from this repo's formatters and line-ending conversion | ⚠️ needs three ignore/attribute entries; nothing detects a miss | ✅ same entries, and the lock check detects a miss | ⚠️ entries for two paths; the lock detects a miss | ✅ a binary cannot be reformatted | ✅ as B |
| R8 — Reviewable and scannable (PR review, gitleaks, InfoSec scan) | ✅ plain text | ✅ plain text | ✅ plain text | ❌ opaque archive, plus new extraction code or a subprocess | ✅ plain text, though outside the `canonical/` carve-out the last scan relied on |
| R9 — Mirrors the kit zip, so refresh and upgrade work "as a set" (EC4, EC6) | ✅ | ✅ | ❌ split across two roots | ✅ it is the zip | ✅ |
| R10 — Consistent with the package's stated contract | ⚠️ no contradiction, but hand-authored plan entries are weaker against the README's determinism statement | ⚠️ extends the Copy treatment and adds an add-on concept | ❌ breaks the skill-bundle invariant | ❌ contradicts "Node standard library only" or the single-subprocess declaration | ❌ contradicts the single deployable root |
| R11 — Content identity beside the version string (2.2.5 raised the version without changing code) | ❌ provenance note only | ✅ per-file hashes | ✅ lock | ⚠️ zip hash only | ✅ per-file hashes |

## Tradeoffs

| Dimension | A (1) Reference-driven | B (2) Manifest add-on | C (3) Existing roots | D (4) Pinned archive | E (5) `vendor/` root |
| --- | --- | --- | --- | --- | --- |
| Operational Excellence | ⚠️ manual refresh; the file list is re-read by hand each release | ✅ scripted refresh with a `--check` that runs in the unit suite | ⚠️ scripted, but remaps one tree into two | ✅ one-file swap | ✅ scripted, as B |
| Security | ⚠️ no tamper or drift guard | ✅ hash lock; the scripts stay readable in review | ✅ lock; readable | ❌ hook scripts and dispatch code hidden in an archive; extraction is zip-slip-class code | ✅ as B |
| Reliability | ⚠️ a future kit file containing `{{…}}` text breaks materialization or is silently substituted | ✅ the copy does not depend on file content | ⚠️ gating a shared invariant risks regressions for Codex and Copilot | ⚠️ a new extraction path at launch | ✅ as B |
| Performance Efficiency | ✅ nine small files | ✅ nine small files | ✅ nine small files | ✅ nine small files | ✅ nine small files |
| Cost Optimization | ✅ lowest build cost | ⚠️ highest: validator, planner, refresh script, specs | ⚠️ medium to high, plus test enumeration changes | ⚠️ a zip reader or extraction step | ⚠️ as B plus a guard change |
| Sustainability | ✅ about 110 KB of text | ✅ | ✅ | ⚠️ one binary per version accumulates in git history | ✅ |
| Integration Complexity | ✅ none | ⚠️ manifest block, validator, plan shape | ❌ invariant, planner and tests | ⚠️ a new kind of plan source | ⚠️ a second deployable root |
| Vendor Lock-in (coupling to the kit) | ⚠️ the file map is transcribed in prose, with no change detector | ✅ transcribed once in the manifest; the refresh fails when the file set or `INSTALL.md` changes | ⚠️ transcription plus a remap | ✅ lowest: the kit's own artifact | ✅ as B |

## Recommendation

**Recommended option: Option B (2) — Manifest-declared add-on with a hash lock and a refresh script**

It is the only option that meets R1, R2, R4, R5, R7 and R11 mechanically while still travelling in a patch bundle (R6) and staying readable to review and scan (R8).

Disqualifying factors for the other options:

- Option A fails R5 and R11, and leaves EC6 and EC11 to discipline. It is the fallback if the manifest change is refused (assumption 2).
- Option C fails R4, R9 and R10: it breaks the skill-bundle invariant, puts a closed-vocabulary skill where harvest normally operates, and splits the set across two roots.
- Option D fails R8 and R10.
- Option E fails R6 and is not viable after OQ1-4.

**Accepted tradeoff:** B has the highest build cost and introduces an add-on concept for one consumer. Decision 2 reduces that cost: its recommended installer script performs the copy, so B's planner and materializer part shrinks to declaring the add-on in the manifest and reserving its targets in the plan. The raw-copy branch in `materialize-launch.mjs` and the finalizer exemption described in the research are then not needed. The exact division is settled in Solution.

The location `canonical/addons/session-review/payload/` is under `canonical/` and outside `canonical/skills`, which resolves OQ2-12 in the Decision 2 research.

**Assumptions — if one is wrong, the recommendation is revisited as stated:**

1. The `addons` block is additive under `schemaVersion: 1` (OQ1-7). If a version bump is required, the cost rises and the recommendation holds.
2. The harness author accepts an add-on concept in the manifest. If not, fall back to Option A's location with Option B's lock and refresh check, which keeps R2, R7 and R11.
3. Claude Code does not discover the payload's nested `SKILL.md` as a skill (OQ1-5). If it does, the payload stores that file under another name and the manifest maps it to `SKILL.md` at install.

**Open questions to resolve before implementation:**

| # | Question | Owner | Impact if unresolved |
| --- | --- | --- | --- |
| OQ1-5 | Does Claude Code discover a `SKILL.md` nested inside the installed package? | Implementer | A duplicate or un-installed `session-review` skill could appear in consumer repos |
| OQ1-7 | Are the manifest block and plan reservation additive under schema version 1? | Harness author | Decides whether the manifest and plan versions bump |
| OQ1-8 | Where does the refresh script live, and how does it unzip? | Harness author; implementer | Blocks the refresh script |
| OQ1-9 | On what platform is the release ZIP built, and is the payload pinned to LF? | Harness author | A Windows-built ZIP could ship CRLF copies |
| OQ1-6 | How does the InfoSec scanner treat vendored hook scripts, and do `SKILL.md`'s capability and Origin statements change? | Harness author, with InfoSec | Blocks the release that ships it, not implementation |
| OQ1-2, OQ1-3 | Will the kit publish the zip's sha256 and a machine-readable file map? | Kit owner | Without them the harness computes the hash and keeps a transcription with a change detector |
| OQ1-10 | Is the version string opaque in the lock? | Harness author | Bears on Decision 3's version comparison |

## WAF Assessment — recommended option (Option B)

### Operational Excellence — 🟢 Green

- **Strengths:** scripted refresh; a check in the unit suite; the file list lives in the manifest.
- **Gaps:** the file map is a transcription of the kit's deploy list.
- **Recommendations:** P2 — the refresh fails when the kit's file set or `INSTALL.md` changes.

### Security — 🟡 Amber

- **Strengths:** the lock makes any in-harness edit a failing check; the vendored files are plain text in review.
- **Gaps:** vendored hook scripts and a headless `claude -p` dispatch enter the package's per-version scan scope, and `SKILL.md`'s capability and Origin statements become inaccurate.
- **Recommendations:** P2 — InfoSec re-scan and updated `SKILL.md` statements before the release that ships the add-on; P3 — ask the kit to publish the zip hash.

### Reliability — 🟢 Green

- **Strengths:** the copy does not depend on file content; the lock catches formatter and line-ending damage.
- **Gaps:** the release ZIP is built from the working tree and could carry CRLF copies.
- **Recommendations:** P2 — pin the payload to LF in `.gitattributes` and check it in the release script.

### Performance Efficiency — 🟢 Green

- **Strengths:** nine small files.
- **Gaps:** none.
- **Recommendations:** none.

### Cost Optimization — 🟡 Amber

- **Strengths:** a one-time cost, reusable for later add-ons.
- **Gaps:** the highest build cost of the options.
- **Recommendations:** P3 — keep the add-on block minimal while it has one consumer.

### Sustainability — 🟢 Green

- **Strengths:** about 110 KB of text.
- **Gaps:** none.
- **Recommendations:** none.

**P1 items (resolve before implementation):** none.
