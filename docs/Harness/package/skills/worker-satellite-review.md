# Worker Satellite Review Protocol

After completing any non-trivial step, worker agents invoke `@architect` as a read-only satellite reviewer before presenting the result to the developer.

## When to trigger

Trigger satellite review after:

- New module, service, or class boundary
- New endpoint contract or API surface change
- Cross-layer data-flow change
- IAM policy, security group, or infrastructure topology change
- Complex data transformation or medallion stage integration
- Any non-obvious workaround whose correctness is unclear

Skip for mechanical steps: rename, config value update, doc copy, decorator add, tag correction.

## Protocol

1. Complete the implementation step
2. Invoke `@architect` with a scoped read-only prompt:
   > "Review the changes in `<path>`. Check for: architectural correctness, adherence to layer boundaries, any patterns that could affect reliability, security, or performance. **Do not write or edit any files — return findings only.**"
3. If `@architect` returns **no issues**: present result to the developer and continue
4. If `@architect` finds **corrections**: apply them, then invoke `@architect` once more with the updated code
5. **Maximum 3 iterations.** If unresolved after 3, report the stalemate to the developer and stop — do not continue implementing

## Prompt template

```
Review the following change in {{path}}:

{{description of what was changed and why}}

Verify:
- Layer boundary respected ({{layer name}} must not {{what is forbidden}})
- No guarded-command anti-patterns introduced
- {{any domain-specific concern for this layer}}

Return findings only. Do not write or edit any files.
```

## Why

A structural issue found after multiple plan steps are complete requires cascading corrections. Satellite review catches it at the cheapest point — immediately after the step that introduced it, before downstream work locks the pattern in.
