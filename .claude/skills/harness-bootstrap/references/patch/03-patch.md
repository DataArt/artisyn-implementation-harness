# Patch router

There are exactly three patch operations:

| Operation | Direction                                  | Result                                                                                                                             |
| --------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `harvest` | Permanent → generalization → canonical     | Promote selected project improvements into reusable templates and record a portable patch.                                         |
| `prepare` | Canonical (direct edits) → portable bundle | Package canonical sources already edited directly — no permanent file involved — into a bundle. No personalization, no deployment. |
| `apply`   | Canonical → personalization → permanent    | Deploy current canonical changes, or import and deploy a supplied canonical patch.                                                 |

For `/harness-bootstrap patch` without a direction, ask the developer which
they intend — harvest, prepare, or apply — before doing anything else. Then follow
`04-patch-harvest.md`, `07-patch-prepare.md`, or `05-patch-apply.md`. There is no
separate add or sync workflow. Optional scope limits which components any operation
touches; new components and companions are handled by the same recipe.

`prepare` is not a plan-then-execute pair with `apply` — it never decides anything
`apply` has to honor beyond the bundle it produces, and running it is optional:
`apply` packages direct canonical edits itself when no `prepare` bundle exists for
the requested scope. Use `prepare` when the bundle needs to exist (for review, or to
carry to another project) before any permanent file is touched.

The bootstrap folder remains authoritative in every direction. Harvest explicitly
promotes an improvement; it does not make all permanent files authoritative.
See `06-patch-state.md` for manifests, baselines, and portable bundle contents.
