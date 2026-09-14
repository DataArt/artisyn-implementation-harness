---
name: x-ray
description: >
  Full-strength, project-aware code review (/x-ray). Runs the built-in `code-review` skill
  live (not a copied methodology — always the current version) for correctness/cleanup/altitude
  findings, adds project-aware convention checks delegated to the touched layer's own specialist
  ({{BACKEND_AGENT}}, {{FRONTEND_AGENT}}, {{DATA_AGENT}}) and an architecture-alignment pass (@architect, when the diff
  meets the existing satellite-review trigger criteria), optionally offers to verify web-layer
  findings live in a browser via Claude-in-Chrome (opt-in, declinable), then always offers — never
  builds without a yes — an interactive HTML demo via @interactive-demo, regardless of what was
  found.
  Heavier and slower than a plain /code-review; this is the team's standard deep-review pass, typically run by
  whoever is approving a merge request, not something the implementing developer needs to run
  themselves if they've already been through `/dev test`'s PR Review step.
---

The developer wants a full-strength, project-aware review of a diff. Here is their input:

---

## $ARGUMENTS

A diff range, PR number, branch name, or file path — same shape as `/code-review`'s target
argument. Optional `--effort=<low|medium|high|xhigh|max>` (default: `high`, passed straight
through to `code-review`).

---

> ⚠️ This skill orchestrates several other agents/skills as independent, parallel passes — not a
> sequence where one's output feeds the next. It does not reimplement any of their methodology —
> it calls them. If a step below says "invoke X", that means actually use the `Skill` or `Agent`
> tool to run X, not write your own version of what X does. In particular, the built-in
> `code-review` runs at full strength on the entire diff on its own; the project-aware convention
> and architecture checks are _additive_, never a filter that limits what `code-review` sees.

## Step 1 — Resolve scope and touched layers

Resolve the diff range exactly as `/code-review` Phase 0 does: `git diff @{upstream}...HEAD`,
falling back to `git diff {{DEFAULT_BRANCH}}...HEAD` / `git diff HEAD~1` / working-tree changes if
there's no upstream or the range is empty, or the explicit target from `$ARGUMENTS` if one was
given. This repo's default branch is `{{DEFAULT_BRANCH}}` — never fall back to a different default
branch name. Keep this resolved range/target as a single string — every sub-review in Step 2
reviews the _same_ scope, so pass it through unchanged.

Run `git diff <range> --name-only` and classify touched paths:

| Path prefix                                                       | Layer | Specialist                    |
| ----------------------------------------------------------------- | ----- | ----------------------------- |
| `{{BFF_APP_PATH}}`                                                | BFF   | `{{BACKEND_AGENT}}`           |
| `{{WEB_APP_PATH}}`                                                | Web   | `{{FRONTEND_AGENT}}`          |
| `{{DB_APP_PATH}}`                                                 | Data  | `{{DATA_AGENT}}`              |
| `{{INFRA_APP_PATH}}`, `{{CI_CONFIG_PATTERN}}`, `*.tf`, `*.tfvars` | Infra | none — architecture pass only |

A diff can touch multiple layers — spawn one specialist per touched layer with a matching
row, in parallel.

## Step 2 — Run every review pass in parallel and independently

These passes are **peers, not a pipeline.** None of them feeds, gates, scopes, or filters
another. Each one independently reviews the _entire_ resolved diff from Step 1 through its own
lens; the convention and architecture passes _add_ findings on top of the base sweep, they never
narrow what it looks at. Send all of them as Agent/Skill tool calls in a **single message** so
they run concurrently:

**2a. Base sweep — delegate, do not reimplement.**
Invoke `Skill(skill: "code-review", args: "<the resolved scope> --effort=<resolved effort>")`.
This is the built-in correctness + cleanup + altitude + generic-conventions methodology (8 finder
angles, 1-vote verify). **It reviews the whole diff at full strength, entirely on its own — it is
NOT scoped to, seeded by, gated on, or filtered through the convention/architecture passes, and
those passes never run "first."** All three passes fire together in the same message; 2a would
find exactly the same things if 2b/2c did not exist. Take its output as-is — it is already
verified (CONFIRMED/PLAUSIBLE); do not re-run or second-guess it. The whole point of calling it
live is that if Anthropic improves this skill later, `/x-ray` benefits automatically with zero
maintenance here.

### 2a-fallback — when the platform refuses the call

`code-review` is a built-in skill that may be flagged `disable-model-invocation`, meaning only a
human can start it. When that is the case, the `Skill` call above comes back with:

```
Skill code-review cannot be used with Skill tool due to disable-model-invocation
```

This is not a diff problem, a scope problem, or something to work around — the pass simply never
started, and **it is the single most valuable pass in this skill.** Never treat this error as
"2a found nothing", never silently continue to Step 4 with only 2b/2c, and never substitute your
own correctness sweep for it (that is exactly the reimplementation this skill forbids).

Instead, hand it back to the developer as a **one-line, ready-to-run command** — they should not
have to type or assemble anything, only paste and press Enter. Keep 2b/2c's results (they fired
in the same message and are unaffected), then say exactly this and **stop**:

> The built-in correctness pass can only be started by you — the `Skill` tool is blocked from
> invoking it. Paste this and press Enter; I'll pick up its output and finish the review:
>
> ```
> /code-review <resolved scope> --effort=<resolved effort>
> ```
>
> (Or reply `skip` to get the conventions + architecture findings on their own — the review will
> be explicitly marked as missing its correctness pass.)

Rules for that handoff:

- The command block holds **nothing but the command** — no prose, no unresolved `<...>`.
  Substitute the real scope from Step 1 and the real effort level, e.g.
  `/code-review origin/{{DEFAULT_BRANCH}}...HEAD --effort=high`.
- Give exactly one command. No alternatives, no variants, no explanation of the flag unless asked.
- **Stop and wait.** Do not run Steps 3-5 with 2a missing while the answer is still pending.
- When `/code-review`'s output appears in the conversation, resume at Step 3 and treat that output
  as 2a's result, verbatim — same "already verified, do not second-guess" rule.
- If the developer replies `skip`, continue — but Step 4's correctness section must read
  `**NOT RUN** — blocked by disable-model-invocation, developer chose to skip` instead of "Clean",
  and Step 5 must pass that fact to `@interactive-demo` so the HTML report states it too. A
  skipped pass is never reported as a clean one.

**2b. Convention pass — one per touched layer.**
For each layer from Step 1's table, spawn its specialist via the `Agent` tool with a prompt like:

> "Review `<resolved diff range>` strictly against your own conventions (folder structure,
> naming, layer boundaries, exception handling, whatever your system prompt
> defines as non-negotiable) — do NOT write, edit, or fix anything, and do not evaluate general
> correctness bugs (that's covered separately). Return each violation as
> `{file, line, summary, failure_scenario}` where `failure_scenario` states which of your own
> rules is broken and quotes it. If nothing violates your conventions, return an empty list."

**2c. Architecture pass — conditional.**
Apply the exact trigger criteria from `.claude/skills/dev/patterns/satellite-review.md`'s "When
to trigger" section (read it now) to the Step 1 diff. If met, spawn `@architect` with the same
review-mode prompt shape that section already defines (HLD container boundaries, data-flow
direction, NFRs, layer best practices) scoped to `<resolved diff range>`. Skip this call entirely
if the trigger criteria aren't met — do not invent a lighter version of the check instead.

## Step 3 — Verify the new findings only

`code-review`'s output from Step 2a is already verified — leave it untouched.

For every candidate returned by Step 2b/2c (conventions + architecture), run one verifier per
candidate: give it the diff, the relevant file(s), and the candidate; it returns one of
**CONFIRMED / PLAUSIBLE / REFUTED**. Use the same recall-biased judgment `/code-review` uses —
default to PLAUSIBLE unless the candidate is factually wrong, provably impossible, or already
handled in this diff. Keep CONFIRMED and PLAUSIBLE, drop REFUTED, dedup near-duplicates first.

## Step 4 — Present as two native-vocabulary groups

Do not force convention/architecture findings into `code-review`'s CONFIRMED/PLAUSIBLE language,
and do not force `code-review`'s findings into Must-fix/Advisory language — present each in the
vocabulary its own process already uses, so nothing is lost or flattened in translation:

```
## /x-ray — <scope> — <date>

### Correctness & cleanup (code-review, effort: <level>)
<code-review's own ranked findings, verbatim — file/line/summary/failure_scenario>
If none: "Clean — code-review found nothing."
If skipped via 2a-fallback: "**NOT RUN** — blocked by disable-model-invocation, developer chose
to skip. This review has no independent correctness pass."

### Project conventions ({{BACKEND_AGENT}} / {{FRONTEND_AGENT}} / {{DATA_AGENT}})
| Code | Finding | File | Severity | Layer |
|------|---------|------|----------|-------|
| BUG-XXX / DESIGN-XXX / IMPROVE-XXX | ... | `path:line` | Must fix / Advisory / Optional | BFF/Web/Data |
If none: "No convention violations found."

### Architecture (@architect)
<only if Step 2c ran — the doc-to-code alignment table + gaps, as @architect's own output format>
If Step 2c was skipped: "Skipped — satellite-review trigger criteria weren't met."
```

## Step 4b — Browser verification (optional, web changes only)

Skip silently if `{{WEB_APP_PATH}}` isn't among Step 1's touched layers — this step verifies
actual behavior in a running browser, which only applies to frontend changes.

Unlike `/dev test`'s equivalent step, this one is opt-in — `/x-ray` is often run by a reviewer who
may not have a dev server running or want the extra round-trip. Ask:

> "Want me to verify this diff's behavior live in a browser — network requests, console, and any
> keyboard/ARIA wiring for accessibility-related findings? I'll need the dev server running.
> (yes / no)"

**Stop and wait.** If no (or no response), skip straight to Step 5 — this is a bonus check, never
a blocker on the rest of the review.

If yes and the `mcp__claude-in-chrome__*` tools aren't available in this session, walk the
developer through `.claude/skills/x-ray/references/claude-in-chrome-setup.md` (install + connect + grant
permission) before continuing.

**Scope restriction (always):** only navigate/interact with `{{LOCAL_WEB_URL}}` — never any
other URL or origin. Reading network requests the loaded page itself fires to other local ports
(e.g. `{{LOCAL_API_URL}}` for the BFF) via `read_network_requests` is fine — that's the page's own
traffic, not the browser navigating elsewhere.

Ask the developer to start the dev server(s) the diff needs (never run the serve command
yourself):

> "Please start the dev server(s) this diff needs (e.g. `{{NX_SERVE_WEB_CMD}}` /
> `{{NX_SERVE_BFF_CMD}}`) and let me know when they're up."

**Stop and wait.** Once confirmed, use the Claude-in-Chrome tools to exercise the changed
behavior directly, rather than taking Step 4's findings on faith:

1. Navigate to the affected page(s) and exercise the change the diff introduces.
2. Inspect the resulting network requests (`read_network_requests`) to confirm wire-level behavior
   actually matches what the diff claims.
3. Check `read_console_messages` for new errors/warnings.
4. For any Step 4 finding about keyboard focus, ARIA wiring, or screen-reader behavior, verify it
   directly via `javascript_tool` (focus the element, assert the resulting DOM state) instead of
   relying on a screenshot or the finding's own description.
5. Fold the result back into the Step 4 findings already presented — e.g. "confirmed live: X" /
   "could not reproduce: Y" — rather than presenting it as a separate, untethered report.

Follow the existing browser-automation guardrails: stop and ask the developer after 2-3 failed
attempts at any single check rather than retrying in a loop, and never trigger a blocking
dialog/alert. If the dev server isn't reachable, or the tools fail repeatedly, say so and move on
to Step 5 — do not block the rest of the review on this step. This step does not itself write to
`2-report.md`, matching this skill's own "read-only, presentation-only" scope (see Output below).

## Step 5 — Always offer the interactive demo (never build without a yes)

Regardless of what Steps 2-4 found — critical issues, only minor cleanup items, or nothing at
all — always ask at the end:

> "Want an interactive HTML version of this review via `@interactive-demo`? (yes / no)"

**Stop and wait.** If yes, invoke `@interactive-demo`, passing it: the resolved diff scope, the
full findings list from Step 4 (with severities and source group intact, even if empty), whether
the 2a correctness pass ran or was skipped via 2a-fallback, and ticket context if one is
identifiable (`docs/Stories/*{TICKET}*/`). A clean/near-empty findings
list is a valid input, not a reason to skip the offer — `@interactive-demo` degrades gracefully
to an Overview-only-of-substance page in that case (see its own "Critical issues" tab rule for
the empty case). If no, stop here — do not build anything.

**Do not tell `@interactive-demo` where to save the file** — it defaults to the ticket's
`docs/Stories/*{TICKET}*/interactive-review/` folder on its own, which is where the report
belongs. Never pass it a scratchpad or temp path; only pass an explicit save path if the
developer named one.

**When `@interactive-demo` returns, report the local file path and STOP — do not publish it.**
The report is a local HTML file for the developer to open; it stays on disk. Do NOT call the
`Artifact` tool (or otherwise upload/host the page) on your own initiative, and do not offer or
promise to — publishing sends the review content to claude.ai's servers, which is only ever done
when the developer explicitly asks for a hosted/shareable link in a later turn. Silence or a
"yes" to the demo offer is not consent to publish.

## Output

If a ticket folder was identified, this skill does not itself write into `2-report.md` — that
file's `## PR Review` section belongs to `/dev test`'s own review-gate flow (verify → classify →
write → stop-for-confirmation → per-fix loop), which `/x-ray` does not replicate. `/x-ray` is a
read-only, presentation-only pass: report the findings to the developer as shown in Step 4, and
let them decide what to do with them.
