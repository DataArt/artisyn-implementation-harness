# Stage router

| Entry                                            | Load                       | Result                                         |
| ------------------------------------------------ | -------------------------- | ---------------------------------------------- |
| /evolve reflect <observation> | [Reflect](01-reflect.md)   | Persisted observation; stop                    |
| /evolve triage [request]      | [Triage](02-triage.md)     | Inactive draft candidates or archive decisions |
| /evolve validate <candidate>  | [Validate](04-validate.md) | Evidence and verdict                           |
| /evolve adopt <candidate>     | [Adopt](05-adopt.md)       | Integrated local change                        |

Concrete improvement requests enter Triage without inventing reflection history.
Draft is an internal Triage procedure, not a command. Direct Validate and Adopt verify their inputs first. Do not mark bypassed
stages completed: record them as not applicable with the entry reason.
