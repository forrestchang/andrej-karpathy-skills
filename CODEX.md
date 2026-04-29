# Using this repo with Codex

This repository now supports Codex in three practical ways:

- `AGENTS.md` gives Codex project-level instructions when you open this repo, or when you copy the file into another project root.
- `skills/karpathy-guidelines/SKILL.md` is a reusable Codex skill.
- `skills/karpathy-guidelines/agents/openai.yaml` gives Codex UI metadata for the skill.

## In this repository

Open the folder in Codex. Codex reads `AGENTS.md` automatically as project guidance, so the behavioral guidelines apply while editing this repo.

## Install as a Codex skill

If your Codex install includes the skill installer, install directly from GitHub:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo forrestchang/andrej-karpathy-skills \
  --path skills/karpathy-guidelines
```

Restart Codex after installing so the new skill is discovered.

Manual install works too:

```bash
mkdir -p ~/.codex/skills
cp -R skills/karpathy-guidelines ~/.codex/skills/karpathy-guidelines
```

## Use in another project

For per-project behavior, copy `AGENTS.md` into that project's root or merge its contents into an existing `AGENTS.md`.

For reusable behavior across projects, install the skill once under `~/.codex/skills/karpathy-guidelines`.

## Skill metadata

The skill UI metadata lives at `skills/karpathy-guidelines/agents/openai.yaml`. Keep it short and focused so Codex can show a useful display name, description, and starter prompt.

## For contributors

When you change the four principles, keep these files aligned:

- `AGENTS.md` for Codex project instructions
- `CLAUDE.md` for Claude Code project instructions
- `.cursor/rules/karpathy-guidelines.mdc` for Cursor
- `skills/karpathy-guidelines/SKILL.md` for reusable skill installs
