# The Context Landscape

> The story of how to build mature product context: which layers already exist somewhere in every organisation, and the one layer that has to be built deliberately because nobody owns it by default.

Every layer of context already exists somewhere. Business goals are set. Technical standards are
governed. Integration contracts are negotiated. Workload is built.

> **Project Context — is the one that is not kept.** It changes every sprint, lives in Slack
> threads, and resets with every new AI session. It is the most unstable and the least maintained.
> It is also the most valuable for AI-assisted development — without it, the AI has no
> project-specific signal and falls back to generic patterns. That is the gap.

![Context Landscape](/images/context/context-landscape.svg)

Every layer above the projects exists — it is owned, governed, and maintained by the organisation.
The integration context between projects is negotiated and documented. What is routinely missing is
the **Project Context**: the live, current, non-contradictory record of what was decided, what was
built, and how this project works. That is exactly what the harness generates and maintains.

Maturity means closing that one gap deliberately, not assuming it closes itself — by making the
right context a first-class output of the work, not by adding more process. [The Challenges](./03%20Challenges.md)
diagnoses exactly where each layer stands against this map today — which of the ten patterns are
live, and at which layer.

---

## The Map Analogy

Think about navigating from city A to city B. The route exists at every zoom level — but each level
tells you something different, and no single level is enough on its own.

**Zoom out to the country.** You see the full journey — the distance, the direction, which highway
to take. This is strategic. It tells you where you are going and roughly how. It does not tell you
anything about the road surface, the traffic, or the exit you need.

::: screenshot
![Strategic view — full route](/images/context/map-01-strategic.png)
:::

**Zoom into the city.** You see the district, the arterial roads, the sequence of turns approaching
the destination. This is tactical. You can now plan the approach — which side of the city to enter
from, which interchange connects to the right road. You still cannot see whether the left lane is
blocked or whether there is construction on the last stretch.

::: screenshot
![Tactical view — city section](/images/context/map-02-tactical.png)
:::

**Zoom to the street.** Now you see the exact intersection, the one-way constraint, the building on
the corner that confirms you are in the right place. This is operational. This is what you need
_right now_ to make the correct move.

::: screenshot
![Operational view — the exact turn](/images/context/map-03-operational.png)
:::

All three levels are true. All three describe the same journey. But they answer completely different
questions — and confusing one for another leads to confident wrong turns.

| Zoom    | What it answers                                       | Context equivalent              |
| ------- | ----------------------------------------------------- | ------------------------------- |
| Country | Where are we going? Why this route?                   | Business Context                |
| City    | How do we approach it? What are the main constraints? | Technical · Integration Context |
| Street  | What is the exact move to make right now?             | **Project Context**             |

> Country and city maps are worth having — but neither one is the street-level map. Hand an AI
> only the layers above the project, and it still has to guess the turn.
