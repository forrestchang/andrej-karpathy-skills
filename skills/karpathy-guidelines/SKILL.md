---
name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT
---

# Karpathy Guidelines

Behavioral guidelines to reduce common LLM coding mistakes, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

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

---

## Examples

### 1. Think Before Coding

**User:** "Add a feature to export user data"

❌ Silently assumes format, fields, scope, writes full implementation  
✅ Lists assumptions, asks: export all users? which format? which fields? what volume?

**User:** "Make the search faster"

❌ Adds caching + async + connection pooling without asking  
✅ Presents 3 interpretations (response time / throughput / perceived speed) with effort estimates, asks which matters

---

### 2. Simplicity First

**User:** "Add a function to calculate discount"

❌ Abstract base class + strategy pattern + dataclass config + calculator class (~60 lines)  
✅ `def calculate_discount(amount, percent): return amount * (percent / 100)` (2 lines)

**User:** "Save user preferences to database"

❌ PreferenceManager with cache, validator, merge flag, notify flag, 60+ lines  
✅ `db.execute("UPDATE users SET preferences = ? WHERE id = ?", (json.dumps(preferences), user_id))`

---

### 3. Surgical Changes

**User:** "Fix the bug where empty emails crash the validator"

❌ Also improves email regex, adds username length/alphanumeric checks, changes comments  
✅ Only patches the `if not user_data.get('email')` line to handle empty strings

**User:** "Add logging to the upload function"

❌ Adds type hints, docstring, changes quote style, reformats whitespace, rewrites boolean logic  
✅ Adds `logger.info/error/exception` calls only, matches existing single-quote style

---

### 4. Goal-Driven Execution

**User:** "Fix the authentication system"

❌ "I'll review, identify issues, make improvements, test" — no verifiable criteria  
✅ Defines: write test for specific bug → verify it fails → fix → verify it passes → run full suite

**User:** "Add rate limiting to the API"

❌ Full Redis + multi-strategy + config system in one 300-line commit, no steps  
✅ 4 incremental steps each with explicit verify criteria, independently deployable

**User:** "The sorting breaks with duplicate scores"

❌ Immediately changes sort logic without reproducing the bug  
✅ Writes failing test first → confirms it reproduces → fixes → confirms test passes

---

## Anti-Patterns Summary

| Principle | Anti-Pattern | Fix |
|-----------|-------------|-----|
| Think Before Coding | Silently picks interpretation | State assumptions, ask first |
| Simplicity First | Strategy pattern for one discount | One function until complexity is needed |
| Surgical Changes | Reformats while fixing bug | Only change lines tied to the request |
| Goal-Driven | "Review and improve" | "Test reproduces bug → fix → passes" |
