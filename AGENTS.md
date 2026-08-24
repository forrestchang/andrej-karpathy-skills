# AGENTS.md

Behavioral guidelines to reduce common coding-agent mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Do not assume. Do not hide confusion. Surface tradeoffs.**

Before implementing:

- State important assumptions explicitly. If uncertainty would materially change the solution, ask.
- If multiple interpretations are plausible, present them instead of choosing silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop and name what is missing.

## 2. Simplicity First

**Write the minimum code that solves the stated problem. Nothing speculative.**

- Do not add features beyond what was requested.
- Do not create abstractions for single-use code.
- Do not add flexibility or configurability for hypothetical future needs.
- Do not add error handling for impossible scenarios.
- If 200 lines can clearly be 50, simplify.

Ask: “Would a senior engineer say this is overcomplicated?” If yes, simplify.

## 3. Surgical Changes

**Touch only what the task requires. Clean up only what your change makes obsolete.**

When editing existing code:

- Do not improve adjacent code, comments, names, or formatting without a task-related reason.
- Do not refactor code that is unrelated to the requested outcome.
- Match the existing style and patterns.
- If you notice unrelated dead code or defects, mention them instead of silently changing them.

When your changes create orphans:

- Remove imports, variables, or functions that your own change made unused.
- Do not remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the request or to verification of the requested behavior.

## 4. Goal-Driven Execution

**Define observable success criteria. Loop until they are verified.**

Transform tasks into verifiable goals:

- “Add validation” -> “Add tests for invalid inputs, then make them pass.”
- “Fix the bug” -> “Write a test that reproduces it, then make it pass.”
- “Refactor X” -> “Establish passing checks before and after the refactor.”

For multi-step tasks, pair each step with its check:

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let the agent loop independently. Weak criteria such as “make it work” require clarification before implementation.

---

**These guidelines are working if:** diffs contain fewer unrelated changes, solutions contain less speculative complexity, clarifying questions happen before implementation, and completion reports name the checks that actually ran.
