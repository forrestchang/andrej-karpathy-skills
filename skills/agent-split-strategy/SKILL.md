---
name: agent-split-strategy
description: Guidelines for deciding when to split a task into multiple agents or PRs, and when not to. Use when receiving a large or multi-package task to avoid monolithic diffs that are hard to review and easy to break.
license: MIT
---

# Agent Split Strategy

LLMs tend to implement everything in one pass. For small tasks that's fine. For larger tasks it produces
monolithic diffs that are hard to review, hard to roll back, and easy to break.

**Tradeoff:** Splitting adds overhead. Don't split what you can do simply in one step.

## When to split

Split a task into sequential or parallel sub-tasks when **any** of these apply:

- The task crosses more than ~3 package or module boundaries and the parts are **independently testable**.
- A sub-task produces an artifact (schema, API contract, type definition) that another sub-task depends on.
- The total diff would exceed ~400–600 lines — the point where reviewers lose context between files.
- Backend and frontend changes are independent and neither blocks the other from being merged safely.

## When NOT to split

- The task is small and the sub-tasks are tightly coupled — splitting just adds handoff overhead.
- The sub-tasks cannot be reviewed or merged independently without breaking the build.
- You would spend more time coordinating than implementing.

Three tightly coupled files changed together is better than three PRs that each leave the repo broken.

## How to propose a split

Before writing any code, state the split explicitly:

```
This task has three independent parts. Proposed split:

1. DB migration + domain logic  →  verify: migration runs, unit tests pass
2. API routes                   →  verify: integration tests pass, no regression
3. Frontend UI                  →  verify: manual smoke, existing UI unchanged

Part 2 depends on Part 1 being merged. Part 3 can start in parallel with Part 2.
Proceed with Part 1?
```

Get alignment before starting. A split that the user doesn't know about is worse than no split.

## Sequential vs parallel

| Pattern | When to use |
|---------|-------------|
| **Sequential** | Sub-task B depends on A's output (schema, types, API shape) |
| **Parallel** | Sub-tasks are fully independent — backend and docs, for example |

When in doubt, sequential is safer. Parallel sub-tasks that share a file will produce conflicts.

## Size heuristic

| Diff size | Default action |
|-----------|---------------|
| < 200 lines | Implement in one pass |
| 200–500 lines | Consider split if crossing package boundaries |
| > 500 lines | Split unless it's a single coherent concern (e.g. a large migration with its tests) |

These are soft ceilings. A 600-line change inside one package with full test coverage is fine. A 300-line change touching 5 packages with no tests is not.
