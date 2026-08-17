---
name: design-review
metadata:
  version: 0.4.0
description: WAF satellite review of design artifacts (/design-review). Assesses against Azure WAF 5 pillars, produces design/03 Review.md. Run before /design-publish.
---

The developer wants to run a Design Review (WAF assessment) for a design ticket. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise.

`/design-review` is a satellite skill — invokable at any phase, against any design artifact. Findings always append to `design/Report.md`'s WAF section.

**Syntax:** `/design-review {TICKET} [{target}] [--pillars=<p1,p2,...>]`

- `{target}` — one of: `frame`, `research`, `elaborate` (default: `elaborate`)
- `--pillars=` — comma-separated WAF pillars to assess (default: all)
  - Valid values: {{WAF_PILLAR_SHORTNAMES}}

**Examples:**

- `/design-review {{PROJECT_KEY}}-4` — full WAF on `02 Elaborate.md`
- `/design-review {{PROJECT_KEY}}-4 frame` — risk lens on `00 Frame.md`
- `/design-review {{PROJECT_KEY}}-4 research` — coverage lens on `01 Research.md`
- `/design-review {{PROJECT_KEY}}-4 elaborate --pillars=security,performance` — selective WAF on `02 Elaborate.md`

---

## Step 1 — Parse arguments and find folder

Parse `{TICKET}`, `{target}` (default `elaborate`), and `--pillars` from the arguments.

Glob for `docs/Stories/*{TICKET}*/**`. Derive the folder path.

Map target to artifact:

| Target      | Artifact read            | Default review lens                |
| ----------- | ------------------------ | ---------------------------------- |
| `frame`     | `design/00 Frame.md`     | Completeness, risk, missing ACs    |
| `research`  | `design/01 Research.md`  | Coverage, credibility, option gaps |
| `elaborate` | `design/02 Elaborate.md` | Full WAF on recommended option     |

If the target artifact does not exist, tell the developer which phase to complete first and stop.

Also read `design/Report.md` for existing WAF findings (to avoid duplicating already-recorded items).

---

## Step 2 — Read architecture context

Read relevant docs under `{{DESIGN_DOCS_ROOT}}` (across its subfolders) for the areas the design touches.

---

## Step 3 — Run the assessment

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

**For `frame` target:** focus on completeness (missing ACs, unstated constraints, scope creep risk) and operational risk.

**For `research` target:** focus on option coverage (obvious alternatives missing?), credibility of sources, and whether open questions would block elaboration.

**For `elaborate` target:** standard WAF assessment of the recommended option.

---

## Step 4 — Present findings

Present the full assessment in the console. Say:

> "Review complete. Any corrections before I append to `Report.md`? (**yes** to save / **no** to discuss)"

**Stop and wait.** Apply corrections if requested.

---

## Step 5 — Append to Report.md

Append a dated block to the `## WAF Assessment` section of `design/Report.md`:

```markdown
### Review — {target} — {YYYY-MM-DD} [pillars: {list}]

| Pillar | Rating | Headline |
| ------ | ------ | -------- |
| ...    | ...    | ...      |

**P1 items:**

- <list or "none">
```

If the WAF Assessment section does not exist in `Report.md`, create it.

---

## Step 6 — Report back

> "`/design-review` complete. Findings appended to `design/Report.md`.
>
> P1 items: <list or 'none'>"
