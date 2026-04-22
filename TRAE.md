# Using this repo with Trae

This project includes a **Trae project rule** so the Karpathy-inspired behavioral guidelines apply automatically when you work here.

## In this repository

1. Open the folder in Trae.
2. The rule [`.trae/rules/karpathy-guidelines.md`](.trae/rules/karpathy-guidelines.md) is committed at the project root, so you do not need extra installation steps.
3. Trae will automatically pick up these instructions when using Builder or Chat.

## Use the same guidelines in another project

**Trae (recommended):** You have two options depending on your needs:

1. **As a Project Rule (Recommended for teams):** Copy `.trae/rules/karpathy-guidelines.md` into that project's `.trae/rules/` directory. This ensures everyone working on the project follows the Karpathy guidelines.
2. **As a Personal Rule (Recommended for individuals):** If you want these guidelines to apply to *all* your projects in Trae automatically without committing files to each repository, you can add them to your global user rules. In Trae: Settings -> Rules -> User Rules. This creates/updates `~/.trae/rules/user_rules.md`.

Alternatively, Trae also supports reading `CLAUDE.md` and `.cursorrules` and will apply them similarly if present.

## Claude Code vs Trae

- **Claude Code:** Install via the plugin marketplace and [`README.md`](README.md) instructions; the plugin exposes the skill from this repo. Per-project use can also rely on `CLAUDE.md`.
- **Trae:** Use the committed `.trae/rules/karpathy-guidelines.md` file as described above. Trae does not read `.claude-plugin/` automatically by default.

## For contributors

When you change the four principles, keep **[`CLAUDE.md`](CLAUDE.md)**, **[`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)**, and **[`.trae/rules/karpathy-guidelines.md`](.trae/rules/karpathy-guidelines.md)** in sync. If the published skill/plugin text should match, update **[`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md)** as well.