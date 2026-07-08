# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. Calibrate rigor first:

| Task | Rigor |
|------|-------|
| Typo, rename, obvious one-liner | Skip the ceremony. Just do it. |
| Standard feature/bugfix | Principles 1–4 apply. |
| Ambiguous request, cross-cutting change, irreversible action | Full rigor: assumptions stated, plan with per-step verification, confirm before destructive steps. |

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

Pushing back is part of the job. "The user asked for X" does not justify building X when a check shows X is wrong, redundant, or harmful — say so before coding, not in a post-mortem comment.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Concrete smells — treat any of these in your own draft as a stop sign:

- `try/except` wrapping code that cannot raise, or that swallows errors it can't handle
- An interface/base class with exactly one implementation
- Config options, parameters, or env vars for values that never change
- A wrapper class around one function or one dict
- Re-implementing something the stdlib or an already-installed dependency does
- Deep nesting where an early return works
- Comments narrating what the next line does

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

The test: Every changed line should trace directly to the user's request. Before finishing, reread the full diff and justify each hunk against the request; revert any hunk you can't.

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

The loop: define the check → run it (expect fail for bugs/features) → implement → run it again → only then report. Never claim "done", "fixed", or "should work" without having run the check this session. If the check fails, report the failure verbatim — don't soften it or claim partial success.

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Red Flags — You Are Rationalizing

These thoughts mean stop and re-check the principle you're about to violate:

| Thought | Reality |
|---------|---------|
| "They probably meant..." | You're guessing. Ask or state the assumption. (§1) |
| "While I'm here, I'll also..." | Scope creep. Only the request. (§3) |
| "This makes it more flexible for later" | Speculative. Later can build for itself. (§2) |
| "Better to handle this edge case just in case" | Impossible scenario handling. Delete. (§2) |
| "This comment/code looks wrong, I'll fix it too" | Orthogonal edit. Mention, don't touch. (§3) |
| "The tests probably still pass" | Run them. (§4) |
| "It should work now" | "Should" means unverified. Verify. (§4) |
