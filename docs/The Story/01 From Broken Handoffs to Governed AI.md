---
id: 9359b9ee
purpose: Tells the three-act story of broken handoffs, unwired AI, and the governed human/AI balance
keywords: [story, handoffs, governance, ai-assisted]
---

# From Broken Handoffs to Governed AI

> This page tells the story. [Target Agentic SDLC Setup](/The%20Story/05%20Target%20Agentic%20SDLC%20Setup.md) is the mechanics — which context layer feeds which phase, concretely.

Three acts: the handoff problem the industry has carried for years, what happens when AI is dropped into that same unwired pipeline today, and the balance — humans gating, AI carrying — that prepares for where this is heading next. Together they're three positions on the same spectrum:

| Position                       | What it is                                                                                                                                                                                                                                                   | Below |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| **Legacy — as-is**             | Every handover is a person interpreting for the next person. Broken telephone, one hop at a time.                                                                                                                                                            | Act 1 |
| **Fully Automated — no gates** | AI replaces the interpretation step but not the ambiguity. Same broken telephone, industrial speed.                                                                                                                                                          | Act 2 |
| **AI-Assisted — the balance**  | Humans gate meaning at consequential transitions; AI carries governed context and executes the rest. What [Anthropic, OpenAI, Google Cloud, and NIST converge on](#grounded-in-industry-guidance) — the industry-standard position, not this page's opinion. | Act 3 |

---

## 1. The Cost of an Unwired Pipeline

> **Intent degrades at every unwired handover — by the time it reaches the customer, what shipped only loosely resembles what was meant.**

![From Business Ideas to Customer Confusion](/images/context/From%20Business%20Ideas%20to%20Customer%20Confusion.png)

Without governed context, the problem is not that people are incompetent or that information disappears. The problem is that every phase interprets what came before and adds its own view — until all of those views become equally weighted inputs for the next person.

Business starts with a simple intent: "Buy tickets online." Architecture expands it into platform concerns — peering, queues, Kafka, ETL, ticket delivery. BA simplifies that into "Send ticket to customer." PM adds "1 Sep."

Nothing is obviously wrong in isolation. But all of those cards land in the same basket, without a clear distinction between intent, constraint, implementation idea, behaviour, and deadline.

By the time the work reaches Development, the engineer has plenty of information — but no governed hierarchy of meaning, and no explicit HOW. They have to rediscover patterns from the existing codebase while deciding what the mixed basket actually means. A perfectly reasonable interpretation becomes notification service + refactoring.

QA can verify that payment works and notifications fire, yet still feel that something is missing. The deadline has already passed, the inherited context is ambiguous, and the implementation is technically coherent, so it gets approved.

The customer finally presses Buy and gets a loading spinner instead of the QR ticket they expected.

This has been the industry's reality for years — the broken telephone game, played once per handover, on every project, long before AI entered the picture.

---

## 2. The AI Factory Doesn't Fix This — It Industrializes It

> **Dropping AI into an unwired pipeline doesn't remove the mixed basket. It just fills it faster.**

![AI Factory: From Intent to Confuse](/images/context/AI%20Factory%3A%20From%20Intent%20to%20Confuse.png)

AI can move extremely fast from intent to result — and still miss what the organisation actually meant.

The intent stays intact: "Buy tickets online." From there, autonomous AI moves through Analysis, Design, Implementation and Validation, producing reasonable generic outputs at every stage. Everything is coherent. Everything validates. Everything is green.

Two minutes later, the system proudly delivers a working result — but it is just a generic informational page about buying tickets, not the product capability the business expected.

The problem is not AI failure. It is ungated interpretation. Without humans injecting and approving the product-specific context, AI can efficiently build a perfectly valid answer to the wrong version of the problem.

Fully autonomous AI should be able to close this gap on its own eventually — but not yet. Years of legacy heritage sit undocumented in people's heads, and the surrounding company ecosystem (tooling, ownership, review process) isn't wired to feed AI the product-specific context it would need to close the loop unattended. Autonomy without governed context just industrializes the same confusion this page opened with.

---

## 3. Humans Gate, AI Carries Context

> **Humans provide intent, judgment, and approval. AI does the work and carries continuity forward.**

![AI-Powered Software Lifecycle Pipeline](/images/context/AI-Powered%20Software%20Lifecycle%20Pipeline.png)

Humans own intent, judgment, and consequential decisions. AI carries and enriches governed context, and performs the operational work autonomously within approved boundaries. Gates sit where meaning, risk, or authority changes — not after every single step; a checkpoint on every low-level operation just trades broken telephone for approval fatigue, which defeats the point of the gate.

By the time implementation starts, the AI does not need to reconstruct the story from scattered documents or conversations. It receives the accumulated **Business, Technical, Operational, and Project context**, together with the engineering **HOW** from the harness.

**The handover is no longer person-to-person. The handover is governed context — carried by AI, gated by humans.**

This is the balance for right now — not a permanent ceiling. It's what makes an organisation ready for the next revolution rather than exposed by it: when autonomy does become trustworthy end to end, it inherits a pipeline that already carries governed context cleanly, instead of a faster version of the same broken telephone game.

---

## Grounded in Industry Guidance

> **Anthropic, OpenAI, Google Cloud, and NIST converge on the same shape as this page: humans own intent and consequential decisions, AI carries context and executes, and gates sit at consequential transitions — not after every single step.**

| This page's claim                                            | Industry position  | Verdict |
| ------------------------------------------------------------ | ------------------ | ------- |
| Humans define what matters                                   | Strongly supported | ✅      |
| AI performs the operational work                             | Strongly supported | ✅      |
| Context must survive handoffs                                | Strongly supported | ✅      |
| Humans approve what becomes trusted context                  | Strongly aligned   | ✅      |
| Gates sit at consequential transitions, not after every step | Strongly aligned   | ✅      |
| Broad enterprises are ready for fully autonomous SDLC today  | Evidence says no   | ❌      |

- **Anthropic** — [harness design for long-running applications](https://www.anthropic.com/engineering/harness-design-long-running-apps) uses structured artifacts to carry context across agent sessions, because coherence degrades on long-running tasks without persistent state; the [Agentic Coding Trends Report](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf) describes engineers retaining high-level design and judgment while agents take on more implementation. [Containing Claude](https://www.anthropic.com/engineering/how-we-contain-claude) explicitly warns against approval fatigue — the direction is fewer, more meaningful gates, not a checkpoint per step.
- **OpenAI** — the [Practical Guide to Building AI Agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) recommends starting with constrained autonomy and expanding it as reliability improves. [OpenAI Presence](https://openai.com/index/introducing-openai-presence/) lets an organisation define what an agent may do autonomously versus what needs approval, then run inside that envelope. Internally, OpenAI runs coding agents at scale with automated monitoring and human escalation rather than manual review of every action ([How OpenAI monitors internal coding agents for misalignment](https://openai.com/index/how-we-monitor-internal-coding-agents-misalignment/)).
- **Google Cloud** — [Building the Agentic Enterprise](https://cloud.google.com/transform/building-the-agentic-enterprise-cloud) argues most enterprise process was built for a pre-agent, human-centric world and has to be redesigned for agents and humans to collaborate. The real management decision is where the autonomy boundary sits — not whether to remove humans from the loop.
- **NIST** — the [AI Risk Management Framework Playbook](https://airc.nist.gov/airmf-resources/playbook/map/) takes a risk-based approach: human oversight is required where decisions are high-risk or consequential, not prescribed as a checkpoint after every automated step.

That's exactly how Section 3 above states it: gates sit at consequential transitions — where meaning, risk, or authority changes — not after every single phase. It's also why Act 2 is framed as "not yet, not never": the constraint today is that most enterprise ecosystems aren't wired to hand AI product-specific context safely, not that a gate-every-step design is where this is headed.

---

The mechanics behind this balance — which context layer feeds which phase, and what each phase is required to leave behind — are in [Target Agentic SDLC Setup](/The%20Story/05%20Target%20Agentic%20SDLC%20Setup.md).
