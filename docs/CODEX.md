# Using This Repo With Codex

This repository now includes a Codex operating layer alongside the original Claude Code and Cursor guidance.

## What Codex Reads

- `AGENTS.md` is the root operating manual.
- `.codex/templates/` contains reusable artifacts for plans, checklists, verification records, and reviews.
- `.codex/schemas/` contains machine-readable reference shapes for structured questions and work records.
- `.codex/skills/` contains repo-local skills that Codex should prefer for recurring workflows.

## Recommended Use

For a new project, copy `AGENTS.md` and `.codex/` into the project root. Then customize the repository-specific lines in `AGENTS.md` while preserving the operating modes and quality bar.

For this repository, keep the Codex files in sync with the public guideline surfaces:

- `README.md`
- `CLAUDE.md`
- `.cursor/rules/karpathy-guidelines.mdc`
- `skills/karpathy-guidelines/SKILL.md`

## Operating Modes

Codex should choose one mode before substantial work:

- `explore`: read-only fact gathering.
- `plan`: read-only implementation planning with `.codex/templates/PLAN.md`.
- `execute`: scoped edits with a checklist for 3 or more meaningful steps.
- `review`: findings-first review using `.codex/templates/REVIEW.md` for larger reviews.

## Structured Questions

When user input is truly required, follow `.codex/schemas/structured-question.schema.json`:

- Ask no more than 3 questions.
- Offer 2-4 concrete options.
- Put the recommended option first.
- Explain each option's tradeoff in one sentence.

## Verification

Substantial work should end with verification. Use `.codex/skills/verify/SKILL.md` to pick checks and `.codex/templates/VERIFICATION.md` to record evidence when a reusable artifact is useful.

Documentation-only changes should still be checked for:

- Existing file paths.
- Valid Markdown links.
- Consistent terminology across Codex, Claude Code, Cursor, and skill files.
- JSON schemas that parse successfully.

## Adding New Skills

Use `.codex/skills/skillify/SKILL.md` when a workflow becomes repeatable. Keep skills concise, procedural, and trigger-focused. Avoid adding extra files inside a skill folder unless they directly support the workflow.
