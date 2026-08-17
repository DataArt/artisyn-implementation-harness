# <TICKET> — Implementation Design

## Approach

_One paragraph describing the implementation approach and the key patterns used._

## Integration Points

| System | Interface | Direction | Notes |
| ------ | --------- | --------- | ----- |

```mermaid
flowchart LR
    classDef primary  fill:#4A90D9,stroke:#2C5F8A,color:#fff
    classDef external fill:#E8F4FD,stroke:#4A90D9,color:#2C5F8A
    classDef store    fill:#F0F7EE,stroke:#5A8A5A,color:#2D4A2D

    A["<This system>"]:::primary -->|"<interface>"| B["<System B>"]:::external
    A -->|"<interface>"| C[("<Store>")]:::store
```

## Security Controls

| Control | Implementation |
| ------- | -------------- |

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant IdP as <Identity Provider>
    participant Svc as <Service>

    User->>IdP: authenticate
    IdP-->>User: token
    User->>Svc: request + token
    Svc->>IdP: validate token
    IdP-->>Svc: claims
    Svc-->>User: authorised response
```

## Error Handling & Edge Cases

| Scenario | Handling |
| -------- | -------- |

## Observability

| Signal  | What to capture |
| ------- | --------------- |
| Metrics |                 |
| Logs    |                 |
| Traces  |                 |
| Alerts  |                 |

## Testing Strategy

| Layer       | Approach |
| ----------- | -------- |
| Unit        |          |
| Integration |          |
| E2E         |          |
