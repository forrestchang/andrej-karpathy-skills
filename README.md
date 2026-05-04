<p align="right">
  English | <a href="./README.zh.md">简体中文</a>
</p>

<h1 align="center">Andrej Karpathy Skills</h1>

<p align="center">
  A unified set of guidelines to improve the behavior of AI coding assistants, derived from Andrej Karpathy's observations.
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg">
  <img alt="Support" src="https://img.shields.io/badge/Agents-Claude_|_Cursor_|_Copilot_|_Hermes-7A3FFF.svg">
</p>

## The Problems

From Andrej's post:

> "The models make wrong assumptions on your behalf and just run along with them without checking. They don't manage their confusion, don't seek clarifications, don't surface inconsistencies, don't present tradeoffs, don't push back when they should."

> "They really like to overcomplicate code and APIs, bloat abstractions, don't clean up dead code... implement a bloated construction over 1000 lines when 100 would do."

> "They still sometimes change/remove comments and code they don't sufficiently understand as side effects, even if orthogonal to the task."

## The Solution

Four principles that directly address these issues:

| Principle | Addresses |
|-----------|-----------|
| **Think Before Coding** | Wrong assumptions, hidden confusion, missing tradeoffs |
| **Simplicity First** | Overcomplication, bloated abstractions |
| **Surgical Changes** | Orthogonal edits, touching code you shouldn't |
| **Goal-Driven Execution** | Leverage through tests-first, verifiable success criteria |

## Installation and Usage by Agent

Choose the integration method that matches your AI coding assistant:

### Claude Code
**Option A: Plugin (recommended)**
```bash
/plugin marketplace add tamochii/andrej-karpathy-skills
/plugin install andrej-karpathy-skills@karpathy-skills
```
**Option B: Project File**
```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/CLAUDE.md
```

### Cursor
This repository includes a committed Cursor project rule so the guidelines apply when you open the project in Cursor. 
See **[CURSOR.md](CURSOR.md)** for setup details.

### OpenCode
Download the SKILL.md into your project's `.opencode/skills` directory:
```bash
mkdir -p .opencode/skills/karpathy-guidelines
curl -o .opencode/skills/karpathy-guidelines/SKILL.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/.opencode/skills/karpathy-guidelines/SKILL.md
```

### Hermes Agent (and general autonomous agents)
Hermes Agent natively looks for `AGENTS.md` to define operational constraints. 
```bash
curl -o AGENTS.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/AGENTS.md
```

### VS Code Copilot (GitHub Copilot)
You can provide guidelines to Copilot via a `.github/copilot-instructions.md` file (or appending to it):
```bash
mkdir -p .github
curl -o .github/copilot-instructions.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/agents/vscode-copilot/COPILOT.md
```

### Codex, OpenClaw, Gemini CLI
For CLI-based agents, you can append the rules to your project's primary context file or drop them into their respective `.md` config files:
```bash
# Codex
curl -o CODEX.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/agents/codex/CODEX.md

# OpenClaw
curl -o OPENCLAW.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/agents/openclaw/OPENCLAW.md

# Gemini CLI
curl -o GEMINI.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/agents/gemini-cli/GEMINI.md
```

---

## How to Know It's Working

These guidelines are working if you see:

- **Fewer unnecessary changes in diffs** - Only requested changes appear
- **Fewer rewrites due to overcomplication** - Code is simple the first time
- **Clarifying questions come before implementation** - Not after mistakes
- **Clean, minimal PRs** - No drive-by refactoring or "improvements"

## Customization

These guidelines are designed to be merged with project-specific instructions. Add them to your existing configuration files.

For project-specific rules, add sections like:

```markdown
## Project-Specific Guidelines

- Use TypeScript strict mode
- All API endpoints must have tests
- Follow the existing error handling patterns in `src/utils/errors.ts`
```

## Tradeoff Note

These guidelines bias toward **caution over speed**. For trivial tasks (simple typo fixes, obvious one-liners), use judgment - not every change needs the full rigor.

The goal is reducing costly mistakes on non-trivial work, not slowing down simple tasks.

## License

MIT
