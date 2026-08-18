# Explore

A browsable tour of what the harness actually ships — the agents, skills, and lifecycles that make up `docs/Harness/package/`.

_Known:_ the package (`docs/Harness/package/`) itself isn't rendered in this site — its `{{PLACEHOLDER}}` template syntax collides with Vue's `{{ }}` interpolation, so it's excluded from the build (`srcExclude` in `config.ts`). It's browsable directly on GitHub or in a checkout.

_Placeholder:_ this page should eventually be a hand-authored, site-safe catalog — one entry per agent/skill, what it does, and a link to its source in the package — so people can explore the harness without leaving the site.
