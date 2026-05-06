# Using with Kiro

[Kiro](https://kiro.dev) is an AI-native IDE by AWS that supports a skill system for guiding agent behavior.

## Setup

### Per-project (recommended)

Copy the `.kiro/` directory into your project root:

```bash
cp -r .kiro/ /path/to/your/project/.kiro/
```

### Global (all projects)

Copy the skill to your global Kiro skills directory:

```bash
cp -r .kiro/skills/karpathy-coding-principles ~/.kiro/skills/
```

## How It Works

Kiro automatically loads skills from `.kiro/skills/` in your project (or `~/.kiro/skills/` globally). The skill's `description` field in the YAML frontmatter tells Kiro when to activate it.

Once installed, Kiro will reference these principles when writing, reviewing, or refactoring code.

## Relation to Other Formats

| Tool | File | Location |
|------|------|----------|
| Claude Code | `CLAUDE.md` | Project root |
| Cursor | `.cursor/rules/*.mdc` | Project root |
| Kiro | `.kiro/skills/*/SKILL.md` | Project root or `~/.kiro/skills/` |

All versions encode the same four principles; the format differs per tool.
