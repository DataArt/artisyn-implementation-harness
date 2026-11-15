---
skill: agents/infra
output: {{provider:agents_root}}/infra.{{provider:agent_extension}}
---

## Purpose

Specialist agent for infrastructure as code (CDK, Terraform, Pulumi, etc.). Enforces secrets management, no hardcoding of env-specific config, correct deployment command patterns, and Known Pitfalls for common container deployment failures on cloud-managed compute (ECS, Cloud Run, etc.).

## Substitutions

| Placeholder             | Source                           | Notes                                             |
| ----------------------- | -------------------------------- | ------------------------------------------------- |
| `{{CLOUD_INFRA_STACK}}` | Q2 — IaC tool and cloud provider | e.g. "AWS CDK (TypeScript)", "Terraform (HCL)"    |
| `{{INFRA_APP_PATH}}`    | Q3 — infra container path        | e.g. `apps/infra/`, `infra/`                      |
| `{{INFRA_RESOURCES}}`   | Q2/Q3 — cloud resources used     | e.g. "ECS Fargate, RDS, CloudFront, S3, ALB"      |
| `{{GUARDED_COMMANDS}}`  | Q7 — guarded commands            | e.g. "`cdk`, `git commit`, `git push`, `yarn nx`" |

## Conditionals

- If not using ECS/container compute: remove platform-mismatch and dockerignore pitfall rows
- If not using CloudFront Functions: remove CF Function pitfall row
- If not using Alpine-based images: adjust or remove package manager pitfall row
- Add project-specific policy/SCP restrictions as additional Known Pitfalls rows based on Q9 constraints discovered during first deployment

## Verify checklist

- [ ] Six sections present: Role, Layer scope, What to enforce, Satellite review, What never to do, Known Pitfalls
- [ ] No literal account IDs, region strings, or hardcoded env values in the agent body
- [ ] Guarded commands match Q7
- [ ] Known Pitfalls retained: at minimum platform mismatch, asset staging recursion, and SCP/policy diagnosis
- [ ] `{{INFRA_APP_PATH}}` resolved — no literal placeholder remaining
- [ ] Satellite review section references `{{provider:skills_root}}/dev/patterns/satellite-review.md`
- [ ] Satellite review section specifies that the worker invokes @architect directly (not the orchestrator)
