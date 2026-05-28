# Using this repo with CodeWhale

This repository is already structured as a CodeWhale skill package. CodeWhale discovers skills from workspace `skills/` directories, and the reusable guideline skill lives at [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md).

## Install from GitHub

From CodeWhale:

```
/skill install github:forrestchang/andrej-karpathy-skills
```

Then confirm the skill is available:

```
/skills
/skill karpathy-guidelines
```

If CodeWhale asks for trust confirmation for the installed community skill, use:

```
/skill trust karpathy-guidelines
```

## Use in this repository

When this repository is the active workspace, CodeWhale can discover the skill from:

```
skills/karpathy-guidelines/SKILL.md
```

Do not also copy the same skill into `.agents/skills/` in this repo. CodeWhale checks `.agents/skills` before `skills`, so a duplicate would shadow the canonical skill and create drift risk.

## Why this is a skill, not a plugin

The content is reusable agent behavior: think before coding, prefer simplicity, make surgical changes, and define verifiable success criteria. CodeWhale's skill system is the native fit for that kind of behavior. A plugin wrapper would add packaging surface without adding runtime capability.

CodeWhale's GitHub installer scans downloaded repositories for `SKILL.md` and supports the `skills/<name>/SKILL.md` layout used here, so a separate CodeWhale plugin manifest is unnecessary.

## For contributors

When changing the guideline content, keep these files aligned:

- [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md) for CodeWhale and other skill-aware agents
- [`CLAUDE.md`](CLAUDE.md) for per-project Claude Code use
- [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) for Cursor

The CodeWhale documentation in this file should only need updates when install commands or repository layout change.
