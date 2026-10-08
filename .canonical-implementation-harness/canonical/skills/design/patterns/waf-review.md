# Pattern: WAF Review

A parameterized WAF assessment, callable against any design artifact at any point
in the lifecycle. Findings always append to `design/Report.md`'s `## WAF Assessment`
section — this pattern never produces a standalone review file.

Call with a `target` and, optionally, a `--pillars=` filter (default: all pillars).

## Target → artifact mapping

| Target     | Artifact(s) read                                   | Default review lens                                                           |
| ---------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `frame`    | `design/00 Frame.md`                               | Completeness, risk, missing ECs                                               |
| `research` | `design/01 Research*.md`                           | Coverage, credibility, option gaps                                            |
| `evaluate` | `design/02 Evaluate*.md`                           | Full WAF on recommended option                                                |
| `solution` | `solution/Architecture.md` + `solution/Design*.md` | Full WAF on the chosen approach; Architecture.md is the integrated E2E record |

If the target artifact does not exist, tell the developer which phase to complete
first and stop. Also read `design/Report.md` for existing WAF findings, to avoid
duplicating already-recorded items.

## Step 1 — Read architecture context

Read relevant docs under `{{DESIGN_DOCS_ROOT}}` (across its subfolders) for the
areas the design touches.

## Step 2 — Run the assessment

### Pillar definitions

{{WAF_PILLARS_TABLE}}

### RAG rating

| Rating   | Meaning                            |
| -------- | ---------------------------------- |
| 🟢 Green | Addressed adequately               |
| 🟡 Amber | Partially addressed — bounded risk |
| 🔴 Red   | Not addressed — material gap       |

### Output per pillar

```
### {Pillar} — {RAG}

**Strengths:** ...
**Gaps:** ...
**Recommendations:** P1 (block implementation) / P2 (address in impl) / P3 (backlog)
```

Assess only the pillars specified in `--pillars` (or all if not specified).

**For `frame` target:** focus on completeness (missing ECs, unstated constraints,
scope creep risk) and operational risk.

**For `research` target:** focus on option coverage (obvious alternatives missing?),
credibility of sources, and whether open questions would block evaluation.

**For `evaluate` target:** standard WAF assessment of the recommended option.

**For `solution` target:** standard WAF assessment of the chosen approach as
specified in `solution/Architecture.md`/`solution/Design.md` — this is the last WAF pass before the
human-approval gate, so treat any P1 here as blocking.

## Step 3 — Present findings

Present the full assessment in the console.

**Default (no caller instruction says otherwise):** this is a sign-off gate
(`patterns/approval-sign-off.md`). Say:

> "Review complete. Any corrections before I append to `design/Report.md`? (**yes** to save / **no** to discuss)"

**Stop and wait.** Apply corrections if requested.

**When the calling stage reference explicitly says not to stop here** (it
folds P1/failing findings into its own phase sign-off instead) — continue
straight to Step 4 without presenting or asking. The findings and any P1
items are the calling reference's responsibility to carry forward and name as
a decision at its own sign-off; this pattern never silently drops them.

## Step 4 — Append to Report.md

Apply the docs-writer authoring pattern (`{{provider:skills_root}}/design/patterns/docs-writer-authoring.md`):
delegate appending the dated block below to the `## WAF Assessment` section of
`design/Report.md` to `@docs-writer` rather than editing it directly.

```markdown
### Review — {target} — {YYYY-MM-DD} [pillars: {list}]

| Pillar | Rating | Headline |
| ------ | ------ | -------- |
| ...    | ...    | ...      |

**P1 items:**

- <list or "none">
```

If the `## WAF Assessment` section does not exist in `design/Report.md`, create it.

## Step 5 — Report back

> "WAF review ({target}) complete. Findings appended to `design/Report.md`.
>
> P1 items: <list or 'none'>"
