# Using This Repository with OpenAI Codex

This repository supports Codex in two complementary forms:

- [`AGENTS.md`](AGENTS.md) provides always-on instructions at global or project scope.
- [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md) provides a reusable skill that can be invoked explicitly or selected when relevant.

Use `AGENTS.md` when you want the four principles applied to every coding task in scope. Use the skill when you want opt-in or task-matched behavior.

## In This Repository

No setup is required. Codex reads the root [`AGENTS.md`](AGENTS.md) before working in this repository.

To confirm which guidance is active, start a new Codex run from the repository root:

```bash
codex --ask-for-approval never "Summarize the current instructions."
```

## Use the Guidelines in One Project

If the target project does not already contain `AGENTS.md`, download it at the project root.

macOS, Linux, or Git Bash:

```bash
curl -L https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/AGENTS.md -o AGENTS.md
```

Windows PowerShell:

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/AGENTS.md" -OutFile "AGENTS.md"
```

If `AGENTS.md` already exists, review both files and merge the four behavioral sections. Do not replace existing project setup, test commands, architecture notes, or safety rules.

Codex walks from the repository root toward the current working directory, so nested `AGENTS.md` or `AGENTS.override.md` files can add more specific instructions for a subdirectory.

## Use the Guidelines in Every Codex Project

Codex reads global guidance from `~/.codex/AGENTS.md` unless `~/.codex/AGENTS.override.md` is present. On Windows, the default path is `%USERPROFILE%\.codex\AGENTS.md`.

If the global file does not exist, create it from this repository.

macOS or Linux:

```bash
mkdir -p ~/.codex
curl -L https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/AGENTS.md -o ~/.codex/AGENTS.md
```

Windows PowerShell:

```powershell
$codexDir = Join-Path $env:USERPROFILE ".codex"
New-Item -ItemType Directory -Force -Path $codexDir | Out-Null
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/AGENTS.md" -OutFile (Join-Path $codexDir "AGENTS.md")
```

If the global file already exists, back it up and merge the guidelines manually. Project-level files are loaded after global guidance and can provide repository-specific rules.

Start a new Codex session after changing instruction files, then verify:

```bash
codex --ask-for-approval never "List the instruction sources you loaded and summarize their guidance."
```

## Install as a Reusable Skill

In Codex, ask the built-in installer to install the skill from this repository:

```text
$skill-installer Install karpathy-guidelines from https://github.com/multica-ai/andrej-karpathy-skills/tree/main/skills/karpathy-guidelines
```

Codex detects newly installed skills automatically. If the skill is not listed, restart Codex. You can then:

- Type `$karpathy-guidelines` to invoke it explicitly.
- Use `/skills` in Codex CLI or the IDE extension to inspect available skills.
- Let Codex select it automatically when the task matches its description.

## Choose the Right Scope

| Desired behavior | Recommended setup |
| --- | --- |
| Apply to every coding task in every repository | Merge into global `~/.codex/AGENTS.md` |
| Apply automatically in one repository | Add or merge root `AGENTS.md` |
| Apply automatically in one subdirectory | Add nested `AGENTS.md` or `AGENTS.override.md` |
| Invoke only when useful | Install `karpathy-guidelines` as a skill |

## Troubleshooting

- **Nothing loads:** Confirm that Codex is running from the intended repository and that the instruction file is not empty.
- **Unexpected guidance wins:** Look for `AGENTS.override.md` in the Codex home directory or closer to the current working directory.
- **Changes look stale:** Start a new run or restart the current Codex session; instructions are discovered at the beginning of a run.
- **The skill is missing:** Run `/skills`, check the installer result, and restart Codex if necessary.
- **Existing project rules disappeared:** Restore the previous file and merge instead of overwriting.

## Official Documentation

- [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md/)
- [Build and install Codex skills](https://developers.openai.com/codex/skills/)

## For Contributors

When the principles change, keep [`AGENTS.md`](AGENTS.md), [`CLAUDE.md`](CLAUDE.md), [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md), and [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) behaviorally aligned.
