# Using this repo with Devin

This project includes **Devin-compatible instruction files** so the Karpathy-inspired behavioral guidelines apply automatically when you work with Devin (Cognition AI).

## In this repository

Devin reads instruction files from multiple locations. This repo provides two:

1. **[`AGENTS.md`](AGENTS.md)** — The recommended standard for Devin project instructions. Placed at the project root, Devin reads it automatically before it starts coding. No installation steps required.

2. **[`.devin/rules/karpathy-guidelines.md`](.devin/rules/karpathy-guidelines.md)** — A Devin CLI rule with `trigger: always_on`, equivalent to Cursor's `alwaysApply: true`. This provides the same guidelines through Devin CLI's rules system.

Both files contain the same four principles. You don't need both — either one is sufficient. They coexist for maximum compatibility across Devin's web app and CLI.

## Use the same guidelines in another project

**Devin (web app):** Copy `AGENTS.md` into that project's root directory. Devin will pick it up automatically.

**Devin CLI:** Copy `.devin/rules/karpathy-guidelines.md` into that project's `.devin/rules/` directory (create the folders if needed). Alternatively, copy `AGENTS.md` to the project root — the Devin CLI reads both.

**Other tools:** If a stack only supports a root instruction file, copy [`CLAUDE.md`](CLAUDE.md) into that project instead (or merge its contents into your existing instructions).

## Optional: global Devin rules

To apply these guidelines across **all** your Devin projects, place an `AGENTS.md` file in your global config directory:

- **Linux / macOS:** `~/.config/devin/AGENTS.md`
- **Windows:** `%APPDATA%\devin\AGENTS.md`

## Devin vs Claude Code vs Cursor

- **Claude Code:** Install via the plugin marketplace and [`README.md`](README.md) instructions; the plugin exposes the skill from this repo. Per-project use can also rely on `CLAUDE.md`.
- **Cursor:** Use the committed `.cursor/rules/` file as described in [`CURSOR.md`](CURSOR.md). Cursor does not read `.claude-plugin/` or `CLAUDE.md` by default.
- **Devin:** Use `AGENTS.md` (web app) or `.devin/rules/` (CLI). The Devin CLI also reads `CLAUDE.md` and `.cursor/rules/*.mdc` natively, but the dedicated Devin files are the recommended approach.

## For contributors

When you change the four principles, keep **[`CLAUDE.md`](CLAUDE.md)**, **[`AGENTS.md`](AGENTS.md)**, **[`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)**, and **[`.devin/rules/karpathy-guidelines.md`](.devin/rules/karpathy-guidelines.md)** in sync. If the published skill/plugin text should match, update **[`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md)** as well.
