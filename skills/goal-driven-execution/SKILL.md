---
name: goal-driven-execution
description: Use for multi-step coding work where the goal is already clear — bug fixes (write a failing reproducer first), performance work (state baseline + target number, verify with benchmark), and features that span more than one file or layer (numbered plan with a per-step verification check). Distinct from clarifying scope (handled separately): this fires once the user's intent is understood, to make execution verifiable and loop-safe rather than open-ended. Skip for single-line changes, exploration, or tasks where scope itself is still ambiguous.
license: MIT
---

# Goal-Driven Execution

**Define success criteria. Loop until verified.**

> "LLMs are exceptionally good at looping until they meet specific goals... Don't tell it what to do, give it success criteria and watch it go." — Karpathy

Vague tasks ("fix the bug", "make it work") force constant clarification. Verifiable goals let the work proceed independently.

## Rules

Transform imperative tasks into verifiable goals:

| Instead of... | Transform to... |
|---|---|
| "Add validation" | "Write tests for invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test that reproduces it, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after" |
| "Make it faster" | "Benchmark current p50, target <Xms, verify with benchmark" |

For multi-step tasks, state a brief plan up front:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

## When this fires

- Bug reports where the goal is clear but no failing test exists yet
- Performance work without a stated baseline + target number
- Features that span more than one file or layer
- Refactors where "before" and "after" need to be proven equivalent

If scope itself is unclear (vague "fix it" / "improve X" with no specifics), that's a `think-before-coding` situation first — clarify the goal, then come back here to make execution verifiable.

## Worked example

**Request:** "Add rate limiting to the API"

**❌ All at once, no checkpoints**

```
[300-line commit: Redis backend, multiple strategies, config system,
 monitoring — no clear verification, hard to review, hard to revert]
```

**✅ Incremental with verification**

```
Plan:

1. Basic in-memory rate limiting on /search
   verify: test — 11th request in a minute returns 429
   verify: curl 11x manually

2. Extract to middleware, apply to all endpoints
   verify: test — limits apply to /users and /posts
   verify: existing endpoint tests still pass

3. Redis backend (multi-server)
   verify: test — limit persists across app restart
   verify: test — two instances share the counter

4. Per-endpoint config
   verify: test — /search 10/min, /users 100/min
   verify: config file parsed correctly

Each step is independently verifiable and shippable. Start with 1?
```

## Test-first for bugs

**Request:** "Sorting breaks with duplicate scores"

**❌ Fix without reproducing**

```python
def sort_scores(scores):
    return sorted(scores, key=lambda x: (-x['score'], x['name']))  # hope this is it
```

**✅ Reproduce, then fix**

```python
# 1. Test that fails today
def test_sort_with_duplicate_scores():
    scores = [
        {'name': 'Alice',   'score': 100},
        {'name': 'Bob',     'score': 100},
        {'name': 'Charlie', 'score': 90},
    ]
    result = sort_scores(scores)
    assert [r['name'] for r in result] == ['Alice', 'Bob', 'Charlie']

# 2. Fix
def sort_scores(scores):
    return sorted(scores, key=lambda x: (-x['score'], x['name']))

# 3. Verify: test passes consistently across multiple runs
```

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| "I'll review and improve the code" | "Write test for X → make pass → no regressions" |
| Fix bug without a failing test | Reproduce first, then fix |
| One mega-commit for a multi-step feature | Per-step plan with checkpoints |
| "Make it faster" with no number | Benchmark + target |

## Tradeoff

Slower start (writing the test, stating the plan). Much faster finish — fewer back-and-forth clarifications, fewer "is this what you meant?" cycles.
