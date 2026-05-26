---
name: skillify
description: Use when Codex should capture a repeatable workflow as a repo-local skill, update an existing skill, or decide whether a process deserves a skill.
---

# Skillify

Use this skill when a workflow has become repeatable enough to preserve.

## When To Create A Skill

Create or update a skill when at least one is true:
- The same workflow is likely to be reused in this repo.
- The workflow has non-obvious sequencing or verification.
- The workflow benefits from concise trigger metadata.
- A future agent would otherwise rediscover the same process.

## Workflow

1. Name the skill with lowercase letters, digits, and hyphens.
2. Keep `SKILL.md` self-contained and under 500 lines.
3. Write frontmatter with `name` and a trigger-focused `description`.
4. Put only essential procedure in the body.
5. Reference templates or schemas instead of duplicating them.
6. Verify the skill can be found from its description and followed without extra context.

## Avoid

- Extra README files inside a skill folder.
- Long background essays.
- Tool-specific setup unless the skill truly depends on it.
- Bundled resources that are not needed for the workflow.
