---
name: simplify
description: Use when Codex is asked to reduce complexity, avoid overengineering, make a smaller implementation, or review whether code or instructions are more elaborate than needed.
---

# Simplify

Use this skill to keep changes minimal and easy to review.

## Workflow

1. Identify the exact user-visible goal.
2. Separate required behavior from speculative flexibility.
3. Remove or avoid abstractions that have only one current use.
4. Prefer direct language, direct data structures, and existing patterns.
5. Keep every changed line traceable to the request.
6. Verify that the simpler result still satisfies the goal.

## Guardrails

- Do not delete unrelated dead code unless the user asked for cleanup.
- Do not flatten useful boundaries that already make the project clearer.
- Do not trade explicitness for cleverness.
- If a larger design may be needed later, note it as future work instead of building it now.

## Useful Question

Would a senior maintainer understand why this exists after a quick scan? If not, simplify or add one concise explanation.
