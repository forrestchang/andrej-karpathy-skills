# Using this repo with Gemini CLI

This repository includes a `gemini-extension.json` so the Karpathy-inspired behavioral guidelines can be installed as a [Gemini CLI](https://github.com/google-gemini/gemini-cli) extension.

## Install the extension

```bash
gemini extensions install https://github.com/multica-ai/andrej-karpathy-skills
```

This installs the `karpathy-guidelines` skill globally. Once installed, the guidelines are available in every Gemini CLI session.

## Use in another project (local link)

```bash
git clone https://github.com/multica-ai/andrej-karpathy-skills
gemini extensions link ./andrej-karpathy-skills
```

## Verify the skill is loaded

Inside Gemini CLI, run:

```
/skills list
```

You should see `karpathy-guidelines` in the output.

## How it works

Gemini CLI reads `gemini-extension.json` at the repository root, then loads agent skills from the `skills/` directory. The `karpathy-guidelines` skill injects the four principles into every session context:

1. **Think Before Coding** — state assumptions, ask before guessing
2. **Simplicity First** — minimum code that solves the problem
3. **Surgical Changes** — touch only what the task requires
4. **Goal-Driven Execution** — define verifiable success criteria

## Claude Code vs Cursor vs Gemini CLI

| Tool | How it works |
|------|-------------|
| Claude Code | `/plugin install andrej-karpathy-skills@karpathy-skills` |
| Cursor | `.cursor/rules/karpathy-guidelines.mdc` (auto-applied) |
| Gemini CLI | `gemini extensions install <github-url>` |

See **[CLAUDE.md](CLAUDE.md)** and **[CURSOR.md](CURSOR.md)** for those tool's setup instructions.

## For contributors

When you update the four principles, keep [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md) in sync with [`CLAUDE.md`](CLAUDE.md) and [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc).
