---
name: story-folder-glob
description: Glob rule for story folders — use *{TICKET}* not [{TICKET}]*. Loaded on demand by skills that search docs/Stories/. Not invoked directly.
---

# Story Folder Glob Pattern

Applied whenever searching for story folders under `docs/Stories/`. Read before writing any glob or file-search pattern targeting story folders.

## Rule

**Always use `*{TICKET}*` — never `[{TICKET}]*`.**

Story folders are named like `[ADLC-42] 🔨 Implement — Short Title/`. The opening `[` is a literal character in the folder name. In glob syntax, `[...]` is a character class — a metacharacter — so `[ADLC-42]*` will never match a folder named `[ADLC-42] ...`.

The correct pattern uses asterisk wildcards:

```
docs/Stories/*ADLC-42*/**
```

This matches any path containing the ticket string, including the literal brackets.

## Why

Glob implementations treat `[...]` as a character class (match any one of the characters listed). `[ADLC-42]*` would match any path starting with one of the characters `A`, `D`, `L`, `C`, `-`, `4`, `2` — which is entirely wrong. The Glob tool will silently return no results, causing skills to fail to find story folders and either report "not found" or create duplicate folders.

## Examples

**Wrong:**

```
docs/Stories/[ADLC-42]*/impl/1-plan.md
```

**Correct:**

```
docs/Stories/*ADLC-42*/impl/1-plan.md
```

**Wrong (with /** suffix for directory detection):**

```
docs/Stories/[ADLC-42]*/**
```

**Correct:**

```
docs/Stories/*ADLC-42*/**
```

Note: the `/**` suffix is required when using the Glob tool to detect directories, since Glob matches files — at least one file inside the folder must exist for the pattern to return a result.
