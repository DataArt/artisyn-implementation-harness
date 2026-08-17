---
name: patch-apply
description: >
  Apply phase of the patch workflow (/patch-apply or /patch orchestrator).
  Applies a bundle already copied into `.patch/` in this repo, file by file,
  with a diff review before each overwrite.
---

The developer wants to apply a patch bundle to this repo. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

## Overview

A patch bundle (see `/patch-prepare`) is a self-contained folder under `.patch/`: a `manifest.md` listing added/updated/renamed/deleted paths, and a `files/` tree with the new content for every added/updated/renamed path. This repo has no shared git history with wherever the bundle came from — treat every overwrite as a potential conflict with local changes, not a mechanical copy. That includes renames: a "new" path can carry forward — or clobber — content this repo already personalized at the old path (see Step 5).

This repo tracks applied bundles in its own `.patch/APPLIED.md` — never in `.patch/REGISTRY.md`. `REGISTRY.md` belongs to `/patch-prepare` and records bundles _this repo prepared_ for others; its IDs are only unique within this repo's own sequence. A bundle copied in from a sibling repo carries an ID that was sequential _there_, so two incoming bundles (or an incoming bundle and a locally-prepared one) can legitimately share the same numeric ID. `APPLIED.md` keys off the full bundle folder name (`NNNN-YYYY-MM-DD-slug`) for exactly this reason, and the two files are never merged.

If more than one bundle needs applying, apply them **one at a time, start to finish** (Steps 2–7 for bundle A — including its commit-message suggestion and stop — fully done before starting bundle B). Don't read multiple manifests up front or interleave file writes across bundles — each bundle's placeholder-resolution and conflict decisions are independent, and mixing them risks attributing one bundle's edits to another. The per-bundle stop in Step 7 also keeps each bundle as its own committable unit, rather than one large commit mixing unrelated changes from several bundles.

---

## Step 1 — Locate the bundle(s)

Parse `$ARGUMENTS` for a bundle ID or folder name.

If given: locate `.patch/<match>/`.

If not given: scan `.patch/` for bundle folders (`NNNN-YYYY-MM-DD-<slug>/`), cross-check each folder name against `.patch/APPLIED.md`. List any bundle not already marked `applied` in this repo's applied registry, and ask the developer which to apply and in what order (default: all unapplied, oldest date first).

If `.patch/APPLIED.md` doesn't exist yet, create it (header shown in Step 6) before continuing.

Once the list and order are confirmed, work through it one bundle at a time — repeat Steps 2–7 per bundle, stopping after each — rather than batching.

---

## Step 2 — Check for prior application

If this bundle's folder name already has an `applied` row in `.patch/APPLIED.md`, tell the developer and ask whether to re-apply (skip by default — idempotency matters more than convenience here).

---

## Step 3 — Read the manifest

Read `manifest.md` in full: the Added / Updated / Renamed / Deleted lists and the summary. Read the summary before touching any file — it's the only context this repo has for _why_ the change was made.

If the manifest has no explicit **Renamed** section but its Summary describes a rename or restructure (e.g. "renames X/ to Y/", "renumbers sections", "moves ... to ...") and both the Added and Deleted lists are non-empty, treat it as a **legacy bundle**: the rename relationships exist but weren't captured structurally. Carry that forward into Step 5 — every Added path needs a rename-pairing check against the Deleted list before it's safe to treat as a plain new file (see Step 5).

---

## Step 4 — Resolve this repo's placeholders

The source repo a bundle came from may still be unbootstrapped (placeholders like `DataArt` left literal) or bootstrapped for a _different_ client than this repo. Before writing anything, find this repo's real values so incoming content lands correctly, not with someone else's placeholder or someone else's client name:

1. Read this repo's own `CLAUDE.md` (the Why section) to find the real values already substituted here — e.g. the client name.
2. Scan the bundle's `files/` for bracket placeholders (`[[...]]`) and, separately, for any _other_ client name that doesn't match this repo's own (a sign the bundle came from a repo bootstrapped for someone else).
3. If a mapping is obvious (this repo has exactly one client name, the bundle uses exactly one placeholder or foreign name), propose the substitution and confirm before applying:
   > "This bundle uses `DataArt` / mentions `<foreign name>` — replace with `<this repo's real name>` throughout before writing? (yes / no / let me specify)"
4. If it's not obvious (multiple candidate names, or this repo's own CLAUDE.md still has unresolved placeholders), stop and ask rather than guessing.

Apply the confirmed substitution to file content in memory before Step 5 — never write the bundle's raw `[[...]]` placeholder or a foreign client name into this repo.

---

## Step 5 — Apply file by file

**A path listed as "Added" is not necessarily new content — it can be existing, locally-personalized content that simply moved.** This repo may have filled in, edited, or personalized a file at its _old_ path (bootstrap narrative sections, local corrections) after the bundle's source repo diverged from it. If the manifest's Deleted list is treated as unrelated to the Added list, that personalization is silently destroyed: the old path gets deleted, the new path gets the bundle's — possibly blank/template — version, and nothing in the diff process ever compares the two. This has actually happened (a bootstrapped narrative section was overwritten with the unfilled `/bootstrap-client` placeholder because the target path "didn't exist yet" was taken as proof it was safe to write blindly). Do not repeat it: every Added path needs a rename check before it's treated as a clean add.

### 5a — Pair renames before writing anything

- If the manifest has an explicit **Renamed** section (`old/path.md` → `new/path.md`), that pairing is authoritative — use it directly.
- Otherwise (legacy bundle, per Step 3), build the pairing yourself: for each Added path, check the Deleted list for a path with the same basename (final path segment — e.g. both end in `index.md`, or both end in `01 Overview.md`) whose containing folder corresponds under the rename the Summary describes (e.g. `Connect Framework/` → `01 Process/`). Where a basename is ambiguous (appears more than once in either list, e.g. many `index.md`), disambiguate using the folder correspondence from the Summary — if it's still ambiguous, ask rather than guess.

### 5b — Apply Added paths

For each **Added** path:

1. If it pairs with a Deleted path (a rename) **and** that old path currently exists in this repo: treat it like an **Updated** path, not a clean add. Diff the old path's _current repo content_ (not the bundle's copy of it — the bundle doesn't carry old-path content) against the bundle's incoming content for the new path (after Step 4 substitution). Expected differences are exactly what the manifest's Summary describes (renamed links, reworded headings/labels, restructured sections). Anything else — most importantly, real prose on the old-path side where the new-path side has a placeholder, bracketed template text, or a "Populated During Bootstrap / not yet answered" callout — is a local-edit conflict: flag it explicitly, show both sides, and ask before writing. Do not write until confirmed.
2. Otherwise (no rename pairing, or the paired old path doesn't currently exist): take `files/<path>` from the bundle as the incoming content, and check the current repo file at `<path>`.
   - Doesn't exist: clean add — create it.
   - Exists and is identical to the incoming content: skip, nothing to do.
   - Exists and differs: show the diff. If the existing content looks like it carries local, repo-specific edits (not just the expected pre-patch baseline), flag that explicitly and ask before overwriting — don't assume the incoming version should always win.

### 5c — Apply Updated paths

For each **Updated** path: same treatment as 5b's second bullet (diff against current repo content, flag and confirm on anything beyond the expected pre-patch baseline).

### 5d — Apply Deleted paths (and the old half of renames)

For each **Deleted** path:

1. If it doesn't exist in this repo: nothing to do, note it as already absent.
2. If it was reconciled as the old half of a rename pairing in 5b.1: safe to delete once the paired Added path has been written and confirmed.
3. Otherwise: confirm before deleting — a file with the same path may have been repurposed locally.

Batch the confirmations sensibly (e.g. "these 6 are clean adds, apply all?") rather than prompting once per file when there's nothing ambiguous to decide — but never fold a rename-pairing conflict (5b.1) into a batch; those need their own explicit call-out since they're exactly the case that's bitten this repo before.

---

## Step 6 — Register

Append (or update) a row in this repo's `.patch/APPLIED.md` for this bundle, with Status `applied` and today's date. Carry over the ID, Slug, and Summary from the bundle's own `manifest.md`. Create the file with this header if it doesn't exist yet:

```markdown
# Applied Patches

Tracks patch bundles applied _to this repo_ from sibling projects. Local to this repo — does not sync itself, and is separate from `.patch/REGISTRY.md` (this repo's own _prepared_ bundles). Keyed by bundle folder name, not bare ID, since IDs are only sequential within their repo of origin.

| Bundle Folder | Date Applied | Slug | Summary | Status |
| ------------- | ------------ | ---- | ------- | ------ |
```

Then append one row per bundle:

| Bundle Folder        | Date Applied | Slug     | Summary                               | Status    |
| -------------------- | ------------ | -------- | ------------------------------------- | --------- |
| `<full folder name>` | `<today>`    | `<slug>` | `<one-line summary from manifest.md>` | `applied` |

---

## Step 7 — Suggest a commit, then stop

Summarize this bundle's outcome: files added, updated, deleted, and anything skipped (already up to date, or held back pending developer review). Propose a commit message for _this bundle's changes only_, following this repo's Conventional Commits format (`<type>(<scope>): <what>`, per root `CLAUDE.md`) — infer type/scope from the manifest summary and the paths touched.

**Stop here and wait.** Committing is the developer's call, same as any other edit — don't stage or commit it yourself. Only after they respond should you proceed: if more unapplied bundles remain in the list confirmed back in Step 1, return to Step 2 for the next one; otherwise the batch is done.

---

## Step 8 — Final report

Once every bundle in the batch has been through Steps 2–7, give one short closing summary listing each bundle applied (or skipped) in order. No further action needed beyond what was already confirmed per bundle.
