---
name: patch
description: Cross-project patch router (/patch). Prompts prepare vs apply, delegates to /patch-prepare or /patch-apply.
---

The developer wants to move a change between sibling projects (repos instantiated from this same starter kit). Here is their input:

---

## $ARGUMENTS

---

## Route

Parse `$ARGUMENTS`:

- If it contains `prepare` or `p`: run `/patch-prepare $ARGUMENTS`
- If it contains `apply` or `a`: run `/patch-apply $ARGUMENTS`
- If no argument, or it's ambiguous: present the options below and ask which to run

Present:

> "Which patch action would you like to run?
>
> - **A — Prepare** (`/patch-prepare`): package changes made in _this_ repo into a bundle under `.patch/`, for copying into sibling projects.
>
> - **B — Apply** (`/patch-apply`): apply a bundle already copied into `.patch/` in _this_ repo, to bring in changes made in a sibling project.
>
> (**A** / **B**)"

Wait for confirmation. Then follow the selected skill exactly.

---

## What this is for

`/patch` moves already-made changes — docs conventions, VitePress config, Engineering Guide articles, narrative content, anything worth having in more than one project — between projects that already exist. A patch bundle is a self-contained folder under `.patch/`: it does not assume the target repo shares git history with the source repo, so it works even between projects that diverged long ago. Each repo keeps its own bookkeeping — `.patch/REGISTRY.md` for bundles it prepared, `.patch/APPLIED.md` for bundles it applied — so a bundle folder can simply be copy-pasted into a sibling's `.patch/` directory and applied there without touching the source repo's state.
