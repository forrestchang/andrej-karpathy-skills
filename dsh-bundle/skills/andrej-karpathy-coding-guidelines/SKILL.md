---
name: andrej-karpathy-coding-guidelines
description: Use this skill when writing, editing, or reviewing code to avoid common LLM coding mistakes. Guides the agent to think before coding, prefer simplicity, make surgical changes only, and define verifiable success criteria. Derived from Andrej Karpathy's observations on LLM coding pitfalls.
---

# Andrej Karpathy Coding Behavior Guidelines

> Source: [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.
> Original project: [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)

## The Problem

From Andrej's tweets:

> "Models make wrong assumptions on your behalf and then execute without hesitation. They don't manage their own confusion, don't seek clarification, don't surface contradictions, don't present tradeoffs, and don't push back when they should."

> "They really like to overcomplicate code and APIs, pile up abstractions, not clean up dead code... turning 100-line solutions into 1000-line bloated architectures."

> "They still sometimes modify or delete code and comments they don't fully understand, even when unrelated to the task."

## The Solution

Four principles that directly address these problems:

| Principle | Solves |
|-----------|--------|
| **Think Before Coding** | Wrong assumptions, hidden confusion, missing tradeoffs |
| **Simplicity First** | Over-engineering, bloated abstractions |
| **Surgical Changes** | Unrelated edits, touching what shouldn't be touched |
| **Goal-Driven Execution** | Test-first, verifiable success criteria |

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

LLMs often silently pick one interpretation and execute. This principle forces explicit reasoning:

- **State assumptions explicitly** — If uncertain, ask rather than guess
- **Present multiple interpretations** — When ambiguity exists, don't pick silently
- **Push back when warranted** — If a simpler approach exists, say so
- **Stop when confused** — Name what's confusing. Ask.

---

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

Counter the tendency to over-engineer:

- No features beyond what was asked
- No abstractions for single-use code
- No "flexibility" or "configurability" that wasn't requested
- No error handling for impossible scenarios
- If you write 200 lines and it could be 50, rewrite it

**Test:** Would a senior engineer say this is overcomplicated? If yes, simplify.

---

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting
- Don't refactor things that aren't broken
- Match existing style, even if you'd do it differently
- If you notice unrelated dead code, mention it — don't delete it

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused
- Don't remove pre-existing dead code unless asked

**Test:** Every changed line should trace directly to the user's request.

---

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform imperative tasks into verifiable goals:

| Don't say... | Transform to... |
|-------------|-----------------|
| "Add validation" | "Write tests for invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test that reproduces it, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after" |

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Usage Notes

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

**Signs these guidelines are working:** Fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
