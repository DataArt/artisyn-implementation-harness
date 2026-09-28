# Browser verification

Use an exposed, authorized browser integration; do not require Claude-in-Chrome.
Check capabilities separately: navigation, interaction, network inspection, console
inspection, and DOM/accessibility inspection. Follow the integration's tool rules.
Do not replace missing network or DOM evidence with a screenshot claim.
Preserve the skill's origin scope and explicit opt-in. Report unsupported checks
as not verified; optional browser checks never block the rest of the review.

## When no browser integration is exposed

Do not silently downgrade the check. Name the missing capability, ask the developer
whether their host offers an authorized browser integration, and follow that host's
own setup instructions rather than assuming a particular extension. If none can be
enabled, record the browser checks as not verified and continue with the rest of the
review. Integration-level site permissions are broader than the calling skill's
scope: keep to the origin that skill names regardless of what the integration allows.
