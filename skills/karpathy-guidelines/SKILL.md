---
name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT
---

# Karpathy Guidelines

Behavioral guidelines to reduce common LLM coding mistakes, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## Executable Workflow

Use this workflow for non-trivial coding tasks:

1. **Assumption Check** - State the intended outcome, relevant scope, constraints, and success criteria. If intent or scope is ambiguous, ask before editing.
2. **Minimal Plan** - Give 2-5 concrete steps. Each step should include how it will be verified.
3. **Change Boundary** - Name the files or behavior you expect to touch, and name nearby things you will leave alone.
4. **Simplicity Gate** - Before coding, reject unrequested abstractions, frameworks, configuration, compatibility layers, or speculative features.
5. **Verification Contract** - Finish by reporting what you ran, what passed, what was not verified, and any remaining risk.

For trivial typo fixes or obvious one-line edits, keep this lightweight: preserve the spirit of the workflow without adding ceremony.

## When to Ask vs Proceed

Ask when the request has multiple plausible meanings, touches sensitive data, changes public APIs, risks data loss, or lacks success criteria.

Proceed when the task is narrow, reversible, and the expected outcome is obvious from nearby code, tests, or documentation.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Completion Response

End with evidence, not confidence. Summarize the changed behavior, list verification commands and outcomes, and call out anything not tested.
