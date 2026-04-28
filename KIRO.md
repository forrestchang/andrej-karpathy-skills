# Using this repo with Kiro

This project includes a **Kiro steering file** so the Karpathy-inspired behavioral guidelines apply automatically when you work here.

## In this repository

1. Open the folder in Kiro.
2. The steering file [`.kiro/steering/karpathy-guardrails.md`](.kiro/steering/karpathy-guardrails.md) is committed with `inclusion: auto`, so Kiro applies it to every interaction without extra setup.
3. You can verify it under Kiro's steering panel, where `karpathy-guardrails` should appear as an active rule.

## Use the same guidelines in another project

**Kiro (recommended):** Copy `.kiro/steering/karpathy-guardrails.md` into that project's `.kiro/steering/` directory (create the folders if needed). The `inclusion: auto` front-matter ensures it is applied automatically. Adjust or merge with existing steering files as you like.

**Other tools:** If a stack only supports a root instruction file, copy [`CLAUDE.md`](CLAUDE.md) into that project instead (or merge its contents into your existing instructions).

## Steering file front-matter

The file uses Kiro's standard steering front-matter:

```markdown
---
inclusion: auto
---
```

`inclusion: auto` means Kiro includes the file for every agent interaction in the workspace. Change it to `manual` if you want to invoke it on-demand instead.

## Claude Code vs Cursor vs Kiro

- **Claude Code:** Install via the plugin marketplace per [`README.md`](README.md); per-project use can also rely on `CLAUDE.md`.
- **Cursor:** Use the committed [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) file as described in [`CURSOR.md`](CURSOR.md).
- **Kiro:** Use the committed `.kiro/steering/karpathy-guardrails.md` file as described in this file. Kiro does not read `.claude-plugin/`, `CLAUDE.md`, or `.cursor/rules/` by default.

## For contributors

When you change the four principles, keep all three rule files in sync:

- **[`CLAUDE.md`](CLAUDE.md)**
- **[`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)**
- **[`.kiro/steering/karpathy-guardrails.md`](.kiro/steering/karpathy-guardrails.md)**

If the published skill/plugin text should also match, update **[`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md)** as well.
