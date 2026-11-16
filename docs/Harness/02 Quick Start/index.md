---
id: 32b4135e
purpose: Human-facing quick start for bringing the harness into a project — install the implementation-harness package through a channel, then run /implementation-harness launch
keywords: [quick start, onboarding, implementation-harness launch, install, channels]
---

# Quick Start

Install the `implementation-harness` package through one channel, then point an AI coding assistant at `/implementation-harness launch`. The assistant installs skills, agents, and guide docs, personalized to that project.

```mermaid
flowchart LR
    I["📦 Install\none channel"]:::install
    C["📋 Context\nread the project"]:::stage
    Q["❓ Q&A\nconfirm what's unclear"]:::stage
    G["⚙️ Generation\ninstall skills, agents, docs"]:::stage
    V["✅ Cleanup\nverify + report"]:::stage

    I --> C --> Q --> G --> V

    classDef install fill:#15803D,stroke:#14532D,color:#fff
    classDef stage fill:#D97706,stroke:#B45309,color:#fff
```

## Prerequisites

- A git repository — initialize one first if the project doesn't have one yet.
- An AI coding assistant with skill support: Claude Code, Codex, or Copilot CLI.

## Install

Pick one channel. The two most common:

```bash
# Plugin marketplace (Claude Code)
claude plugin marketplace add DataArt/artisyn-implementation-harness
claude plugin install artisyn@dataart

# npm install CLI (GitHub Packages, needs a read:packages token)
npx @dataart/artisyn-implementation-harness init
```

Every channel — Codex, Copilot CLI, skills.sh, `gh skill`, and the anonymous Release ZIP — is in [Distribution → Install](<../09 Distribution/01 Install.md>).

## Run it

Invoke the skill in the host's native syntax:

```
/implementation-harness launch           # Claude Code or Copilot CLI, direct install
$implementation-harness launch           # Codex, direct install
/artisyn:implementation-harness launch   # plugin install
```

No arguments also triggers launch.

## What to expect

- **Context** — the assistant reads the project: existing docs, code structure, stack.
- **Q&A** — it asks only what it can't determine from context (e.g. which containers exist, where docs should live).
- **Generation** — it installs personalized skills, agents, and guide docs under the project, plus a baseline manifest for future patch operations.
- **Cleanup** — it verifies the install and reports what was created.

Launch runs to completion in one session — it doesn't hand off mid-run and resume later. A dated report under `.harness/state/launch/reports/` records progress, and `.harness/state/launch/answers.json` records the answers given.

## After launch

Run a ticket through the lifecycle:

```
/design TKT-XXX <topic>   # solution design
/dev TKT-XXX <task>        # implement a ticket
```

→ See [03 Lifecycles](<../03 Lifecycles/00 Overview.md>) for the full ticket flow, or `@onboarding` inside the assistant for a guided walkthrough.

## Keeping the harness current

Refresh the package through its channel, then run `/implementation-harness patch apply` — see [Update](<../09 Distribution/02 Update.md>). The full patch router:

- `patch apply [scope | bundle path]` — personalize canonical updates into the project (consumer projects).
- `patch harvest [scope]` — generalize a permanent-file improvement into canonical files (harness source repository only).
- `patch prepare [scope]` — package a direct canonical edit into a portable bundle (harness source repository only).

→ See [03 Lifecycles](<../03 Lifecycles/00 Overview.md>) for how launch and patch fit the harness's other lifecycles.
