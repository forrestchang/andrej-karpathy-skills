# Using This Repo with Cursor

This project includes a **Cursor project rule** so the Karpathy guidelines apply automatically when you work here.

## In this repository

1. Open the folder in Cursor.
2. The rule [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) is committed with `alwaysApply: true`, so no extra setup is needed.
3. You can confirm it under **Settings → Rules** (or the project rules panel), where `karpathy-guidelines` should appear.

## Use the same guidelines in another project

**Cursor (recommended):** Copy `.cursor/rules/karpathy-guidelines.mdc` into that project's `.cursor/rules/` directory (create the folders if needed). Adjust or merge with existing rules.

**Other tools:** If a tool only supports a single root instruction file, copy [`CLAUDE.md`](CLAUDE.md) into that project instead (or merge its contents into your existing instructions).

## Optional: personal Agent Skills

If you want the same rules available as a reusable skill, use [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md). Copy or symlink it into your personal skills directory.

## Claude Code vs Cursor

- **Claude Code:** Install via the plugin marketplace (see [`README.md`](README.md) instructions). For per-project use, copy `CLAUDE.md` into your project.
- **Cursor:** Use the committed `.cursor/rules/` file as described above. Cursor doesn't read `.claude-plugin/` or `CLAUDE.md` by default.

## For contributors

When you change the rules, keep **[`CLAUDE.md`](CLAUDE.md)** and **[`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)** in sync. If the published skill text should match, update **[`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md)** as well.
