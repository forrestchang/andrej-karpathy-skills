# Using this repo with Codex

This project includes Codex support so the same Karpathy-inspired behavioral guidelines can also be used in Codex.

## In this repository

1. Open the folder in Codex.
2. The root [`AGENTS.md`](AGENTS.md) is committed, so Codex picks up the repository guidance automatically.
3. The repo-scoped skill [`.agents/skills/karpathy-guidelines/SKILL.md`](.agents/skills/karpathy-guidelines/SKILL.md) is also committed, so the skill is available from the repository without copying anything into your home directory.
4. In Codex, you can invoke the skill explicitly with `$karpathy-guidelines`, or let Codex pick it implicitly when the task matches the skill description.

## Use the same guidelines in another project

**Codex:** Copy [`AGENTS.md`](AGENTS.md) into that project's root so Codex loads the guidance automatically for the repository.

**Optional repo skill:** Copy `.agents/skills/karpathy-guidelines/` into that project's `.agents/skills/` directory when you want an explicit reusable skill in addition to root instructions.

**Optional personal skill:** Copy or symlink [`.agents/skills/karpathy-guidelines/`](.agents/skills/karpathy-guidelines/) into `~/.agents/skills/karpathy-guidelines/` to make it available across repositories in your Codex setup.

## Codex vs Claude Code vs Cursor

- **Codex:** Reads [`AGENTS.md`](AGENTS.md) automatically and discovers repo-scoped skills under [`.agents/skills/`](.agents/skills/).
- **Claude Code:** Install via the plugin marketplace and [`README.md`](README.md) instructions; per-project use can also rely on [`CLAUDE.md`](CLAUDE.md).
- **Cursor:** Use the committed [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) rule. Cursor does not read `.claude-plugin/`, `AGENTS.md`, or `.agents/skills/` by default.

## For contributors

When you change the four principles, keep [`AGENTS.md`](AGENTS.md), [`CLAUDE.md`](CLAUDE.md), [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc), [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md), and [`.agents/skills/karpathy-guidelines/SKILL.md`](.agents/skills/karpathy-guidelines/SKILL.md) in sync.
