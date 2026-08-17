---
date: <YYYY-MM-DD>
reflections_processed: <N>
drafts_created: <N>
---

# Triage Summary — <date>

## Reflections Processed

| File         | Cluster          | Decision       |
| ------------ | ---------------- | -------------- |
| `<filename>` | `<cluster name>` | <action taken> |

---

## Clusters

### Cluster: <theme name>

- **Files:** `<reflection-1.md>`, `<reflection-2.md>`
- **Scope:** Cross-cutting | Agent-specific (`<agent>`) | Dev-flow (`<skill>`)
- **Options:**
  - A. <option A — what it entails>
  - B. <option B — what it entails>
- **Confirmed action:** <what was decided and why>
- **Output:** `<draft file path or agent/skill updated>` _(or n/a)_

---

## Existing Skill Audit

| Skill / Agent              | Status                                  | Finding            |
| -------------------------- | --------------------------------------- | ------------------ |
| `.claude/skills/<name>.md` | ✅ Keep / ⚠️ Gap / ❌ Archive candidate | <one-line finding> |

---

## No-Action Items

| File         | Reason                     | Disposition                |
| ------------ | -------------------------- | -------------------------- |
| `<filename>` | <why no skill was created> | Archived / Feedback memory |

---

## Drafts Created

| Draft file                        | Covers                 |
| --------------------------------- | ---------------------- |
| `.claude/skills/drafts/<name>.md` | <one-line description> |

---

## Next Steps

- Run `/skill-promote` on the drafts above after ~1 week of validation
- <any other follow-up items>
