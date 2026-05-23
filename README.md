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

## Installation — OpenCode

The skill is already included in this repository at `.opencode/skills/karpathy-guidelines/SKILL.md`. OpenCode auto-detects it.

To use in **another project**:

```bash
# Copy the skill into your project
mkdir -p .opencode/skills/karpathy-guidelines
curl -o .opencode/skills/karpathy-guidelines/SKILL.md https://raw.githubusercontent.com/chius-me/AK-skills-opencode/main/.opencode/skills/karpathy-guidelines/SKILL.md

# Copy the instructions file (loaded via AGENTS.md convention)
curl -o AGENTS.md https://raw.githubusercontent.com/chius-me/AK-skills-opencode/main/AGENTS.md
```

## How to Know It's Working

These guidelines are working if you see:

- **Fewer unnecessary changes in diffs** - Only requested changes appear
- **Fewer rewrites due to overcomplication** - Code is simple the first time
- **Clarifying questions come before implementation** - Not after mistakes
- **Clean, minimal PRs** - No drive-by refactoring or "improvements"

## Customization

Merge with project-specific instructions by adding to `AGENTS.md` or project config.

## Tradeoff Note

These guidelines bias toward **caution over speed**. For trivial tasks (simple typo fixes, obvious one-liners), use judgment - not every change needs the full rigor.

The goal is reducing costly mistakes on non-trivial work, not slowing down simple tasks.
