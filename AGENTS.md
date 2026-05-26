# Codex Operating Manual

This repository packages Karpathy-inspired agent behavior for Codex, Claude Code, Cursor, and reusable skills. Work here should make agent guidelines easy to install, verify, and keep in sync across supported tools.

## Operating Modes

Codex should explicitly choose one of these modes before doing substantial work:

### `explore`
- Read-only only.
- Gather facts from the repo, identify patterns, and note relevant files.
- End exploration with a short findings summary before proposing changes.

### `plan`
- Read-only plus high-value clarification only when a decision materially changes the outcome.
- Produce a concrete implementation plan using `.codex/templates/PLAN.md`.
- Plans should include critical files, acceptance criteria, and a test recipe.

### `execute`
- Mutating work is allowed.
- For tasks with 3 or more meaningful steps, keep a checklist using `.codex/templates/TODO.md`.
- Prefer small, verifiable changes that preserve the guideline bundle's clarity.

### `review`
- Default to a code review mindset.
- Findings come first: bugs, regressions, risky assumptions, missing tests, weak validation.
- Use `.codex/templates/REVIEW.md` for larger reviews.

## Core Workflow

1. Explore before editing.
2. Reuse existing patterns before inventing new ones.
3. Avoid rereading the same file unless there is a new question, a changed file, or a narrower section to inspect.
4. For substantial changes, keep the active plan and checklist aligned with the work.
5. Before closing a task, verify behavior or state clearly why verification could not be performed.

## Structured Questions

When Codex truly needs user input:
- Ask at most 3 short questions.
- Offer 2-4 concrete options.
- Put the recommended option first.
- Explain the tradeoff in one sentence per option.
- Do not ask questions that can be answered by searching the repo.

Use `.codex/schemas/structured-question.schema.json` as the reference shape.

## Skills

Prefer these repo-local skills when they fit:
- `.codex/skills/verify/SKILL.md`
- `.codex/skills/simplify/SKILL.md`
- `.codex/skills/skillify/SKILL.md`
- `.codex/skills/batch/SKILL.md`

Keep `skills/karpathy-guidelines/SKILL.md` aligned with the public guideline text used by Claude Code and Cursor.

## Artifacts

Use these artifacts to keep work explicit and reusable:
- Plan: `.codex/templates/PLAN.md`
- Checklist: `.codex/templates/TODO.md`
- Verification record: `.codex/templates/VERIFICATION.md`
- Review record: `.codex/templates/REVIEW.md`

The machine-readable interface references live in `.codex/schemas/`.

## Quality Bar

- If 3 or more checklist items were completed, include a verification step before finalizing.
- Final summaries should report outcome, verification, and remaining risk.
- If a workflow becomes repeatable, capture it as a skill rather than solving it from scratch next time.
- When changing the guideline principles, check whether `README.md`, `CLAUDE.md`, `.cursor/rules/karpathy-guidelines.mdc`, and `skills/karpathy-guidelines/SKILL.md` need the same update.
