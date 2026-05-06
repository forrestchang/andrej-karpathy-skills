# Using this repo with Antigravity

This project includes the Karpathy-inspired behavioral guidelines as an **Antigravity skill** so they apply when Antigravity detects a relevant task.

## In this repository

1. Open the folder in your editor with Antigravity active.
2. The skill [`.agents/skills/karpathy-guidelines/SKILL.md`](.agents/skills/karpathy-guidelines/SKILL.md) is committed — Antigravity reads it automatically from `.agents/skills/` when working in this project.
3. No extra installation steps are required.

## Use the same guidelines in another project

Antigravity supports two installation scopes:

| Location | Scope |
|----------|-------|
| `<workspace-root>/.agents/skills/karpathy-guidelines/` | Workspace-specific (this project only) |
| `~/.gemini/antigravity/skills/karpathy-guidelines/` | Global (applies to all workspaces) |

**Workspace-specific:** Copy the `.agents/skills/karpathy-guidelines/` folder into the target project root.

```bash
cp -r .agents/skills/karpathy-guidelines /path/to/your-project/.agents/skills/
```

**Global (all workspaces):** Copy the skill folder into your Antigravity global skills directory.

```bash
cp -r .agents/skills/karpathy-guidelines ~/.gemini/antigravity/skills/
```

Antigravity will pick up the skill automatically from either location.

## Claude Code vs Cursor vs Antigravity

- **Claude Code:** Install via the plugin marketplace; see [`README.md`](README.md). Per-project use can rely on `CLAUDE.md`.
- **Cursor:** Use the committed `.cursor/rules/karpathy-guidelines.mdc` file; see [`CURSOR.md`](CURSOR.md).
- **Antigravity:** Copy `.agents/skills/karpathy-guidelines/` to the workspace or global skills directory as described above.

## For contributors

When you change the four principles, keep **[`CLAUDE.md`](CLAUDE.md)**, **[`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)**, and **[`.agents/skills/karpathy-guidelines/SKILL.md`](.agents/skills/karpathy-guidelines/SKILL.md)** in sync.
