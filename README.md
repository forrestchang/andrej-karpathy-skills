# Karpathy-Inspired Coding Agent Guidelines

Portable behavioral guidelines for coding agents, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) about common LLM coding failures.

Use the same four principles in **Claude Code**, **OpenAI Codex**, **Cursor**, or any agent that supports project instructions or Agent Skills.

English | [简体中文](README.zh.md)

> Also see [Multica](https://github.com/multica-ai/multica), an open-source platform for running coding agents with reusable skills.

## Why This Exists

Coding agents are capable, but they often fail in predictable ways: they silently assume, overengineer, modify unrelated code, and declare success without proving the result.

This repository turns those failure modes into four concrete working agreements:

| Principle | Working agreement | Prevents |
| --- | --- | --- |
| **Think Before Coding** | Surface assumptions, ambiguity, and tradeoffs before editing | Confident work based on the wrong interpretation |
| **Simplicity First** | Write the minimum code that solves the current problem | Speculative features and premature abstractions |
| **Surgical Changes** | Touch only lines that directly serve the request | Drive-by refactors and noisy diffs |
| **Goal-Driven Execution** | Define success criteria and verify them | Vague implementation and untested completion claims |

The complete guidelines live in tool-native formats so you can adopt them without translating the rules yourself.

## Supported Integrations

| Tool | Repository file | Best for |
| --- | --- | --- |
| **Claude Code** | [`CLAUDE.md`](CLAUDE.md) and [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md) | Plugin install, project instructions, or a reusable skill |
| **OpenAI Codex** | [`AGENTS.md`](AGENTS.md) and [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md) | Always-on project/global instructions or an invokable skill |
| **Cursor** | [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) | An always-applied project rule |
| **Other coding agents** | [`CLAUDE.md`](CLAUDE.md) | Copy or merge into the instruction file supported by your tool |

## Quick Start

### OpenAI Codex

Codex automatically reads `AGENTS.md` before it starts work. Choose the scope you want:

#### Current project

For a project that does not already have `AGENTS.md`:

```bash
curl -L https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/AGENTS.md -o AGENTS.md
```

If the project already has `AGENTS.md`, merge the four principles into it instead of overwriting project-specific instructions.

#### Every Codex project

Merge [`AGENTS.md`](AGENTS.md) into `~/.codex/AGENTS.md`. Codex loads this global file for every repository and then layers project-level instructions on top of it.

Verify the result from a repository root:

```bash
codex --ask-for-approval never "Summarize the current instructions."
```

#### Reusable Codex skill

In Codex, ask the built-in skill installer to install this repository's skill:

```text
$skill-installer Install karpathy-guidelines from https://github.com/multica-ai/andrej-karpathy-skills/tree/main/skills/karpathy-guidelines
```

Then invoke it explicitly with `$karpathy-guidelines`, or let Codex select it when a coding task matches the skill description.

See [`CODEX.md`](CODEX.md) for Windows commands, global vs. project scope, verification, and troubleshooting. The setup follows the official OpenAI documentation for [AGENTS.md](https://developers.openai.com/codex/guides/agents-md/) and [Codex skills](https://developers.openai.com/codex/skills/).

### Claude Code

#### Plugin install (recommended)

From Claude Code, add this repository as a marketplace and install the plugin:

```text
/plugin marketplace add multica-ai/andrej-karpathy-skills
/plugin install andrej-karpathy-skills@karpathy-skills
```

This makes the reusable skill available across projects.

#### Project instructions

For a project that does not already have `CLAUDE.md`:

```bash
curl -L https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/CLAUDE.md -o CLAUDE.md
```

If `CLAUDE.md` already exists, merge the guidelines instead of replacing the file.

### Cursor

Copy the committed rule into another project's `.cursor/rules/` directory:

```bash
mkdir -p .cursor/rules
curl -L https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/.cursor/rules/karpathy-guidelines.mdc -o .cursor/rules/karpathy-guidelines.mdc
```

The rule uses `alwaysApply: true`, so it is active whenever that project is open in Cursor. See [`CURSOR.md`](CURSOR.md) for details.

## The Four Principles

### 1. Think Before Coding

**Do not assume. Do not hide confusion. Surface tradeoffs.**

- State important assumptions before implementing.
- When multiple interpretations are plausible, present them instead of choosing silently.
- Point out a simpler approach or a meaningful downside when one exists.
- If missing information would materially change the solution, stop and ask.

### 2. Simplicity First

**Write the minimum code that solves the stated problem.**

- Do not add features that were not requested.
- Do not create an abstraction for one use case.
- Do not add configurability for hypothetical future needs.
- Match complexity to evidence from the current requirements.
- If 200 lines can clearly be 50, simplify.

### 3. Surgical Changes

**Touch only what the task requires. Clean up only what your change makes obsolete.**

- Do not reformat, rename, or refactor adjacent code without a task-related reason.
- Match the existing style and patterns.
- Mention unrelated problems rather than silently fixing them.
- Remove imports, variables, or functions only when your own change made them unused.

The test: every changed line should trace back to the request or to verification of the requested behavior.

### 4. Goal-Driven Execution

**Turn instructions into observable success criteria, then loop until verified.**

| Request | Verifiable goal |
| --- | --- |
| “Add validation” | Add tests for invalid inputs, then make them pass |
| “Fix the bug” | Reproduce it with a test, fix it, and run regression checks |
| “Refactor X” | Establish passing checks before and after the refactor |

For multi-step work, pair each step with its check:

```text
1. Reproduce the behavior -> verify: focused test fails for the expected reason
2. Make the smallest fix -> verify: focused test passes
3. Check for regressions -> verify: relevant suite and diff review pass
```

## What Good Adoption Looks Like

- Clarifying questions happen before costly implementation, not after it.
- Diffs contain fewer unrelated edits.
- Solutions have fewer speculative layers and abstractions.
- Completion reports name the checks that actually ran.
- Pull requests are smaller, easier to review, and easier to revert.

These are behavioral guidelines, not a substitute for project requirements, security policy, tests, or human review.

## Repository Map

```text
.
|-- AGENTS.md                              # Codex project instructions
|-- CLAUDE.md                              # Claude Code project instructions
|-- CODEX.md                               # Detailed Codex setup
|-- CURSOR.md                              # Detailed Cursor setup
|-- EXAMPLES.md                            # Before/after examples
|-- .claude-plugin/                        # Claude Code plugin metadata
|-- .cursor/rules/karpathy-guidelines.mdc  # Cursor project rule
`-- skills/karpathy-guidelines/SKILL.md     # Reusable Agent Skill
```

## Customize Without Losing Project Context

Treat these principles as a behavioral layer, then keep repository-specific facts in the native project instruction file:

```markdown
## Project-Specific Guidelines

- Use TypeScript strict mode.
- Run `npm test` after changing application code.
- Follow the error-handling pattern in `src/utils/errors.ts`.
```

When a target file already exists, review and merge. Blindly replacing it can delete important setup, testing, or safety instructions.

## Contributing

The tool-specific files intentionally express the same four principles. When changing their behavior, keep these files aligned:

- [`AGENTS.md`](AGENTS.md)
- [`CLAUDE.md`](CLAUDE.md)
- [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md)
- [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)

Documentation-only wording can remain tool-specific when it explains installation or discovery behavior.

## Tradeoff

These guidelines bias toward caution over speed. Use judgment for obvious typo fixes and other trivial, low-risk work; the goal is to prevent expensive mistakes without turning every one-line edit into a ceremony.

## Credits

Inspired by [Andrej Karpathy's observations on coding agents](https://x.com/karpathy/status/2015883857489522876). Repository maintained by [Multica](https://github.com/multica-ai).

## License

MIT
