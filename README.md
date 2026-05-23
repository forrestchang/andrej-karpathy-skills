<p align="right">
  English | <a href="./README.zh.md">简体中文</a>
</p>

<h1 align="center">Karpathy Guidelines for OpenCode</h1>

<p align="center">
  Behavioral guidelines to reduce common LLM coding mistakes, derived from Andrej Karpathy's observations — packaged as an OpenCode skill.
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg">
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

## Installation

There are two levels of installation. **Global** makes the guidelines available in every project. **Project** scopes them to a single repository. Do both if you want the guidelines everywhere with per-project overrides.

### Global Install

The skill is auto-discovered by OpenCode from two locations. Pick one:

**Option A — Global skills directory (recommended):**
```bash
mkdir -p ~/.config/opencode/skills/karpathy-guidelines
curl -o ~/.config/opencode/skills/karpathy-guidelines/SKILL.md \
  https://raw.githubusercontent.com/chius-me/andrej-karpathy-skills-opencode/main/.opencode/skills/karpathy-guidelines/SKILL.md
```

**Option B — Agent skills directory (auto-discovered external skills):**
```bash
mkdir -p ~/.agents/skills/karpathy-guidelines
curl -o ~/.agents/skills/karpathy-guidelines/SKILL.md \
  https://raw.githubusercontent.com/chius-me/andrej-karpathy-skills-opencode/main/.opencode/skills/karpathy-guidelines/SKILL.md
```

To also load the guidelines as default system instructions in every project, add to `~/.config/opencode/opencode.json`:

```json
{
  "instructions": ["~/AGENTS.md"]
}
```

Then copy the instructions file:

```bash
curl -o ~/AGENTS.md \
  https://raw.githubusercontent.com/chius-me/andrej-karpathy-skills-opencode/main/AGENTS.md
```

### Project Install

Each new project needs two files. The skill file makes the guidelines available as a loadable skill. The instructions file makes them active by default.

```bash
cd your-project

# 1. Install the skill (auto-discovered by OpenCode)
mkdir -p .opencode/skills/karpathy-guidelines
curl -o .opencode/skills/karpathy-guidelines/SKILL.md \
  https://raw.githubusercontent.com/chius-me/andrej-karpathy-skills-opencode/main/.opencode/skills/karpathy-guidelines/SKILL.md

# 2. Install the instructions (auto-loaded by OpenCode from project root)
curl -o AGENTS.md \
  https://raw.githubusercontent.com/chius-me/andrej-karpathy-skills-opencode/main/AGENTS.md
```

If you already have an `AGENTS.md` or prefer to use `opencode.json`, add the instructions path explicitly:

```json
{
  "instructions": ["AGENTS.md"]
}
```

### Verify

OpenCode will log something like the following on startup:

```
Loaded skill: karpathy-guidelines
Loaded instructions from AGENTS.md
```

## How to Know It's Working

These guidelines are working if you see:

- **Fewer unnecessary changes in diffs** — Only requested changes appear
- **Fewer rewrites due to overcomplication** — Code is simple the first time
- **Clarifying questions come before implementation** — Not after mistakes
- **Clean, minimal PRs** — No drive-by refactoring or "improvements"

## Customization

Merge with project-specific instructions by editing `AGENTS.md` or adding rules to your project's `opencode.json`:

```markdown
## Project-Specific Guidelines

- Use TypeScript strict mode
- All API endpoints must have tests
- Follow the existing error handling patterns in `src/utils/errors.ts`
```

## Tradeoff Note

These guidelines bias toward **caution over speed**. For trivial tasks (simple typo fixes, obvious one-liners), use judgment — not every change needs the full rigor.

The goal is reducing costly mistakes on non-trivial work, not slowing down simple tasks.
