---
name: verify
description: Use when Codex needs to verify a change, choose an appropriate test recipe, record evidence, or explain why verification could not be run.
---

# Verify

Use this skill before finalizing changes, especially after multi-step work.

## Workflow

1. Restate the behavior or artifact that needs proof.
2. Pick the smallest checks that cover the changed surface.
3. Prefer existing project commands over inventing new validation.
4. Run checks when available; otherwise inspect files directly.
5. Record the result with `.codex/templates/VERIFICATION.md` when the work is substantial.
6. In the final summary, include outcome, verification, and remaining risk.

## Check Selection

- Documentation-only change: verify links, headings, file paths, and consistency across related docs.
- Skill change: inspect frontmatter, trigger description, and body for concise procedural guidance.
- Schema change: parse the JSON and check required fields match the documented interface.
- Code change: run the narrowest existing tests that cover the touched behavior, then broaden only if risk justifies it.

## When Checks Cannot Run

Say what was skipped, why it was skipped, and what confidence remains from inspection. Do not imply behavior was tested when it was only reviewed.
