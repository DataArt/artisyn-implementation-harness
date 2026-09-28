# Pattern: Satellite Review (Design)

After completing a design artifact or applying architecture doc changes, invoke `{{DESIGN_ARCHITECT_AGENT}}` as a read-only reviewer before presenting the result to the developer.

## When to trigger

- After `solution/Architecture.md` is confirmed — before beginning `solution/Design.md` (see `design-architect-review.md` for the Architecture.md-specific prompt and scope rules)
- After `{{DESIGN_DOCS_ROOT}}` docs are updated in Publish — before archiving

Skip for non-structural artifacts: `solution/Stack.md`, `solution/Efforts.md`, Efforts table updates.

## Review protocol

1. Complete the artifact or apply the changes
2. Invoke `{{DESIGN_ARCHITECT_AGENT}}` with a read-only prompt scoped to the artifact — **"Do not write or edit any files — return output only"**
3. If **OK / no issues**: present result to the developer and continue
4. If **corrections needed**: apply corrections, then re-invoke once more
5. **Maximum 2 iterations.** If still unresolved after 2, report the stalemate to the developer and stop

## Why

Design artifacts drive `{{DESIGN_DOCS_ROOT}}` updates (Publish) and implementation plans (Dev). A structural gap found after Design.md and Stack.md are written cascades corrections across multiple files. An earlier satellite review catches issues at the cheapest point — before downstream artifacts are locked in.
