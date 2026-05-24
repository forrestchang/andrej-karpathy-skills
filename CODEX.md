# Using this repo with Codex

This project includes **Codex repository instructions** so the Karpathy-inspired behavioral guidelines apply automatically when Codex works here.

## In this repository

1. Open the folder in Codex.
2. The root [`AGENTS.md`](AGENTS.md) file is committed, so Codex loads it as project guidance.
3. The reusable skill remains available at [`skills/karpathy-guidelines`](skills/karpathy-guidelines).

## Use the same guidelines in another project

**Codex project instructions (recommended):** Copy [`AGENTS.md`](AGENTS.md) into that project's root, or merge its contents into an existing `AGENTS.md`.

**Reusable skill:** Copy or symlink [`skills/karpathy-guidelines`](skills/karpathy-guidelines) into your Codex skills directory if you want to invoke it explicitly as `$karpathy-guidelines`.

**Codex plugin:** Add this repo as a Codex plugin marketplace:

```bash
codex plugin marketplace add forrestchang/andrej-karpathy-skills
codex plugin add andrej-karpathy-skills@karpathy-skills
```

This exposes the plugin package under [`plugins/andrej-karpathy-skills`](plugins/andrej-karpathy-skills). Keep its skill copy aligned with the root [`skills/karpathy-guidelines`](skills/karpathy-guidelines) source when changing the four principles.

## Claude Code vs Codex vs Cursor

- **Claude Code:** Install via the plugin marketplace and [`README.md`](README.md) instructions; the plugin exposes the skill from this repo. Per-project use can also rely on `CLAUDE.md`.
- **Codex:** Use the root [`AGENTS.md`](AGENTS.md) file for project guidance, or install the reusable skill from [`skills/karpathy-guidelines`](skills/karpathy-guidelines).
- **Cursor:** Use the committed `.cursor/rules/` file described in [`CURSOR.md`](CURSOR.md).

## For contributors

When you change the four principles, keep **[`AGENTS.md`](AGENTS.md)**, **[`CLAUDE.md`](CLAUDE.md)**, **[`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)**, **[`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md)**, and the packaged Codex plugin skill in sync.
