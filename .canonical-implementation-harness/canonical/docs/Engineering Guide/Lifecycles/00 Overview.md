# Harness Bootstrap — Lifecycle Overview

_The four lifecycles, how they interact, and when to use each one._

Commands are written with a leading `{{SKILL_PREFIX}}` — your provider's skill-invocation
prefix. See `04 AI Coding Tool Compatibility.md` for the full provider mapping.

---

## The four lifecycles

| Lifecycle        | Orchestrator             | Phases                                                                                               |
| ---------------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Dev**          | `{{SKILL_PREFIX}}dev`    | Context → Ceremony → Plan → Implement → Test → Document                                              |
| **Design**       | `{{SKILL_PREFIX}}design` | Frame → Research → Evaluate → Solution → Review Gate → Address Feedback → Publish                    |
| **Skill**        | — (no orchestrator)      | Reflect → Triage → Draft → Validate → Adopt                                                          |
| **Architecture** | — (standalone commands)  | `{{SKILL_PREFIX}}where-we-are` · `{{SKILL_PREFIX}}war design` · `{{SKILL_PREFIX}}war implementation` |

Each orchestrator runs its phases in order. Dev continues routine authorized work and pauses only for material decisions or required human actions; other lifecycles retain their own review gates. Individual phase commands (`{{SKILL_PREFIX}}dev plan`, `{{SKILL_PREFIX}}design frame`, etc.) run the requested stage or support resuming mid-flow.

---

## When to use which lifecycle

| Situation                                     | Use                                                           |
| --------------------------------------------- | ------------------------------------------------------------- |
| Any ticket — feature, bug fix, chore          | Dev lifecycle always                                          |
| Ticket is large, novel, or crosses containers | Design lifecycle first, then Dev                              |
| Something surprised you during a ticket       | Evolve lifecycle (Reflect)                                    |
| Observed harness friction                     | Evolve lifecycle (Triage)                                     |
| End of sprint / before planning               | Architecture lifecycle (`{{SKILL_PREFIX}}where-we-are`)       |
| After major HLD changes                       | Architecture lifecycle (`{{SKILL_PREFIX}}war design`)         |
| Before a major release                        | Architecture lifecycle (`{{SKILL_PREFIX}}war implementation`) |

**Design is optional.** Small, well-understood changes within a single container that introduce no new integrations or architecture decisions — skip Design, go straight to Dev.

---

## Cross-lifecycle invariants

- Follow each lifecycle's approval contract. Dev reuses existing authorization across routine phase transitions; unresolved material decisions still require human input.
- No code is written until the plan is approved and the architecture audit passes.
- Documentation is mandatory — tickets are not complete until `{{SKILL_PREFIX}}dev document` has run.
- Architecture deviations approved at plan time are tracked through to the Document phase.
- Reflections are not optional ceremony — they are how conventions accumulate.

→ See `Engineering Guide/03 Engineer Role.md` for how engineers and AI divide responsibility within these lifecycles.

---

## Lifecycle interactions

```mermaid
flowchart TB
    TICKET(["🎫 Ticket"]):::ticket

    subgraph DESIGN ["  🎨 Design lifecycle (optional)  "]
        direction LR
        D1["Frame\nproblem + ECs"]:::design --> D2["Research\noptions via {{DESIGN_ARCHITECT_AGENT}}"]:::design --> D3["Evaluate\nmatrix + recommend"]:::design --> D4["Solution\ncertainty artifacts"]:::design --> D5["Publish\nMR → docs → tickets"]:::design
    end

    subgraph DEV ["  🔨 Dev lifecycle  "]
        direction LR
        V1["Plan\n+ arch audit"]:::dev --> V2["Implement\nstep-by-step"]:::dev --> V3["Test\n+ PR review"]:::dev --> V4["Document\n+ deviations"]:::dev
    end

    subgraph SKILL ["  💡 Evolve lifecycle  "]
        direction TB
        S1["Reflect"]:::skill --> S2["Triage"]:::skill --> S3["Promote"]:::skill
    end

    WAR["🏛️ WAR Audit\n{{SKILL_PREFIX}}war design · {{SKILL_PREFIX}}war implementation\nIs the architecture sound?"]:::war
    WWA["📊 Where We Are\n{{SKILL_PREFIX}}where-we-are\nDesigned vs implemented vs documented"]:::wwa

    TICKET -->|"large / novel"| DESIGN
    DESIGN -->|"Publish creates\nimpl tickets"| DEV
    TICKET -->|"routine"| DEV
    DESIGN -->|"feeds"| WAR
    DEV -->|"feeds"| WWA
    DEV -->|"surprises"| S1
    S3 -->|"updated skills"| DEV
    TICKET2(["🎫 New tickets"]):::ticket
    WAR -.->|"gap tickets"| TICKET2
    WWA -.->|"gap tickets"| TICKET2

    classDef ticket  fill:#2C3E50,stroke:#1A252F,color:#fff
    classDef design  fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef dev     fill:#1A6B3C,stroke:#14532d,color:#fff
    classDef skill   fill:#D97706,stroke:#B45309,color:#fff
    classDef war     fill:#1D4ED8,stroke:#1e3a8a,color:#fff
    classDef wwa     fill:#0E7490,stroke:#0c4a6e,color:#fff
```

---

→ `01 Dev Lifecycle.md` — Context → Ceremony → Plan → Implement → Test → Document  
→ `02 Design Lifecycle.md` — Frame → Research → Evaluate → Solution → Review Gate → Address Feedback → Publish  
→ `03 Evolve Lifecycle.md` — Reflect → Triage → Draft → Validate → Adopt
→ `04 Architecture Lifecycle.md` — `{{SKILL_PREFIX}}where-we-are` · `{{SKILL_PREFIX}}war design` · `{{SKILL_PREFIX}}war implementation`  
→ `05 Documents Flow.md` — how docs are born, graduate, and reach their permanent home
