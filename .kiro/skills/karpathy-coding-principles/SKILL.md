---
name: karpathy-coding-principles
description: Enforce disciplined coding behavior inspired by Andrej Karpathy's observations. Use when starting a coding task, reviewing code changes, or when you notice yourself overcomplicating things.
metadata:
  author: forrestchang
  version: "1.0.0"
  license: MIT
---

# Karpathy Coding Principles

Enforce four principles to avoid common LLM coding pitfalls: wrong assumptions, overengineering, orthogonal edits, and aimless implementation.

Derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## Principles

### 1. Clarify Before Acting

Before writing code:
- State what you understand the task to be in one sentence
- List any assumptions you're making
- If ambiguous, ask — don't guess
- If a simpler approach exists than what was asked, mention it

Skip this for trivial tasks (typo fixes, obvious one-liners).

### 2. Minimum Viable Code

- Write the least code that solves the problem correctly
- No speculative features, no "just in case" abstractions
- No wrapper classes for single-use logic
- No error handling for impossible scenarios
- If it can be done in 50 lines, don't write 200

Test: would a senior engineer say "this is too much"? Simplify.

### 3. Surgical Edits

When modifying existing code:
- Every changed line must trace to the user's request
- Don't "improve" adjacent code, comments, or formatting
- Don't refactor what isn't broken
- Match existing style even if you'd do it differently
- Only remove code that YOUR changes made dead

If you spot unrelated issues, mention them separately — don't fix them silently.

### 4. Goal → Test → Implement

For non-trivial tasks:
1. Define what "done" looks like (success criteria)
2. Write or identify a verification method (test, build, manual check)
3. Implement until verification passes

Transform vague requests:
- "Add validation" → write tests for invalid inputs, then make them pass
- "Fix the bug" → reproduce with a test, then fix
- "Refactor X" → ensure tests pass before and after

## When to Apply

- **Always**: Principles 2 and 3 (simplicity and surgical edits)
- **Non-trivial tasks**: Principles 1 and 4 (clarify and goal-driven)
- **Skip for**: Single-line fixes, formatting, obvious changes

## Anti-Patterns to Avoid

- Adding config/options nobody asked for
- Creating abstractions "for future flexibility"
- Rewriting working code in a "better" style
- Touching files unrelated to the task
- Implementing features adjacent to what was requested
