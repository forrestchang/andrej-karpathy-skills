<div align="center">

# Karpathy-Inspired Agent Skills

Reusable Claude Code skills for safer coding, plan review, and multi-agent execution control.

English | [简体中文](./README.zh.md)

</div>

---

This repository packages Karpathy-inspired agent behavior as installable Claude Code skills. It keeps the original coding discipline skill and adds a `karpathy-plan-review` skill for complex work that needs explicit goals, independent review, and permission-aware execution.

> Inspired by [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on common LLM coding pitfalls.

## Available Skills

| Skill | Use when | Core behavior |
|---|---|---|
| `karpathy-guidelines` | Writing, reviewing, or refactoring code | Think before coding, keep changes simple, edit surgically, define verifiable success criteria |
| `karpathy-plan-review` | Reviewing or executing multi-step plans, handoffs, multi-file changes, ID/reference changes, or work with permission boundaries | Converts input into a task total goal, runs a five-agent plan/review loop, closes P0/P1/P2 risks, and executes only when aligned and permitted |

## Install

From within Claude Code, add the marketplace:

```text
/plugin marketplace add forrestchang/andrej-karpathy-skills
```

Then install the plugin:

```text
/plugin install andrej-karpathy-skills@karpathy-skills
```

After installation, Claude Code can load the skills from this plugin across projects.

## `karpathy-guidelines`

The original skill reduces common LLM coding mistakes through four principles:

| Principle | Addresses |
|---|---|
| **Think Before Coding** | Wrong assumptions, hidden confusion, missing tradeoffs |
| **Simplicity First** | Overcomplication and speculative abstractions |
| **Surgical Changes** | Unrelated edits and drive-by refactors |
| **Goal-Driven Execution** | Weak success criteria and unverified completion |

These guidelines are most useful for implementation work where the agent might otherwise overbuild, silently guess, or touch unrelated code.

## `karpathy-plan-review`

Use this skill before executing complex plans. Its core rule is that **the task total goal is the single source of truth**.

It uses a five-agent loop:

1. **Task Recognition Agent** identifies the task total goal from all received information.
2. **Supervisor Agent** passes a shared task envelope and enforces role discipline.
3. **Plan Agent** produces the best plan aligned to the task total goal.
4. **Review Agent** finds P0/P1/P2 risks without generating replacement plans.
5. **Execution Agent** checks alignment, permission, and capability before executing.

Key gates:

- Every agent receives the same shared task envelope.
- Every agent can use relevant superpower skills and Karpathy reasoning.
- P0/P1/P2 risks must be fixed or evidence-closed.
- Convergence requires two consecutive review rounds with zero new P0/P1/P2.
- Execution stops at human authorization, production access, irreversible actions, money, contracts, compliance, missing data, or capability limits.

## Using with Cursor

This repository includes a Cursor project rule at [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc), so the same coding guidelines can apply when you open the project in Cursor. See [CURSOR.md](CURSOR.md) for setup details.

## How to Know It Is Working

You should see:

- Fewer unnecessary changes in diffs.
- Fewer rewrites caused by overcomplication.
- Clearer assumptions before implementation.
- Plans that name success criteria and verification checks.
- Complex execution stopping at real permission or capability boundaries instead of guessing.

## Customization

These skills are designed to be combined with project-specific instructions. Keep project rules in `CLAUDE.md`, repository docs, or local agent instructions, and let these skills provide the reusable review and execution discipline.

## License

MIT
