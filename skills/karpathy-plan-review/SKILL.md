---
name: karpathy-plan-review
description: Use when an existing workflow, prompt, or user invocation still refers to karpathy-plan-review; prefer plan-review for new plan review and execution work.
---

# karpathy-plan-review Compatibility Wrapper

`karpathy-plan-review` is retained as a compatibility alias.

Use the simplified skill name instead:

```text
plan-review
```

The simplified skill contains the full five-agent workflow: task-total-goal alignment, shared task envelope, supervised plan/review loop, P0/P1/P2 convergence, execution alignment, and permission/capability stop gates.

When this wrapper is loaded, immediately load and follow `plan-review`.
