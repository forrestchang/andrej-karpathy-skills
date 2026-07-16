# Karpathy Rules for AI Coding Agents

> **Stop AI coding agents from overcomplicating, guessing silently, and touching code they shouldn't.**  
> Based on [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.

English | [简体中文](./README.zh.md)

---

## The Problems

From Andrej's post:

> *"The models make wrong assumptions on your behalf and just run along with them without checking. They don't manage their confusion, don't seek clarifications, don't surface inconsistencies, don't present tradeoffs, don't push back when they should."*

> *"They really like to overcomplicate code and APIs, bloat abstractions, don't clean up dead code... implement a bloated construction over 1000 lines when 100 would do."*

> *"They still sometimes change/remove comments and code they don't sufficiently understand as side effects, even if orthogonal to the task."*

## The Solution

Seven compact rules, available as platform-specific instruction files and an adaptive skill, directly address these issues:

| Rule | What It Prevents |
|------|-----------------|
| **Think Before Coding** | Wrong assumptions, hidden confusion, missing tradeoffs |
| **Change Only What Was Asked** | Drive-by refactoring, style drift, orthogonal edits |
| **Define "Done" Before You Start** | Vague goals, no verification, infinite loops |
| **Apply the YAGNI Ladder** | Overengineering, bloat, premature abstractions |
| **Output Discipline** | Verbose responses, plan prose, unnecessary explanations |
| **Tool Discipline** | Redundant reads, unnecessary shell use, scratch-file churn |
| **Safety Override** | Catastrophic misinterpretation of risky operations |

## Benchmarks

An audit found that always loading the full rules improved synthetic-task quality but increased token usage. A repeated `gpt-5.3-codex` benchmark confirmed the regression: **+203.6% visible request tokens** and **+34.6% median latency**, despite pass rate improving from 66.7% to 100%.

The optimized skill now loads guardrails only when relevant and stops after one concise clarification on underspecified tasks. Across 30 calls it achieved **45.1% fewer visible request tokens**, **12.5% lower median latency**, and **100% pass rate**; the paired bootstrap 95% interval for token change was -64.6% to -16.4%. This is an instruction microbenchmark, not a full repository-editing agent benchmark. See the [benchmark report](benchmark/README.md), [analyzer](benchmark/analyze.py), and [raw results](benchmark/results-openai-optimized-v2.json) for methodology and limitations.

## Run Your Own Benchmarks

We provide 6 [`demo-tasks/`](demo-tasks/) for comparing AI behavior with and without the rules:

| Task | Principle | What It Tests |
|------|-----------|---------------|
| API Rate Limiter | Think Before Coding | Does the AI ask requirements or just code? |
| Date Formatter | YAGNI | Does it use native `Intl` or install `date-fns`? |
| CSS Color Fix | Surgical Changes | Does it fix only the color or "improve" the whole file? |
| Search Bug | Goal-Driven | Does it write a failing test first? |
| Binary Search | Output Discipline | Minimal code or verbose lecture? |
| Todo App Sort | Multiple rules | Multi-file, multi-principle challenge |

Each task has a rubric, pass/fail criteria, and a CSV template for tracking results across different AI tools.

## Install

### Option A: AGENTS.md (Antigravity / Codex / OpenCode)

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/sumonrh/karpathy-skills-for-antigravity-and-codex/main/AGENTS.md
```

### Option B: CLAUDE.md (Claude Code)

```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/sumonrh/karpathy-skills-for-antigravity-and-codex/main/CLAUDE.md
```

### Option C: Cursor Rule

Copy [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) into your project's `.cursor/rules/` directory. See [CURSOR.md](CURSOR.md) for details.

### Option D: Claude Code Plugin

```bash
/plugin marketplace add forrestchang/andrej-karpathy-skills
/plugin install andrej-karpathy-skills@karpathy-skills
```

### Option E: Google AI Studio / Hermes

Copy the system-instruction body from [GOOGLE_AI_STUDIO.md](GOOGLE_AI_STUDIO.md) or [HERMES.md](HERMES.md) into the corresponding platform.

## How to Know It's Working

- **Fewer unnecessary changes in diffs** — Only requested changes appear
- **Fewer rewrites due to overcomplication** — Code is simple the first time
- **Clarifying questions come before implementation** — Not after mistakes
- **Clean, minimal PRs** — No drive-by refactoring or "improvements"
- **Shorter AI outputs** — Less prose, more code

## Tradeoff Note

These guidelines bias toward **caution over speed**. For trivial tasks (simple typo fixes, obvious one-liners), use judgment — not every change needs the full rigor. The goal is reducing costly mistakes on non-trivial work, not slowing down simple tasks.

## Compatible Platforms

- **Antigravity** — via `AGENTS.md` + `skills/karpathy-guidelines/` skill
- **Claude Code** — via `CLAUDE.md` or the official plugin
- **Cursor** — via `.cursor/rules/karpathy-guidelines.mdc`
- **Google AI Studio** — via `GOOGLE_AI_STUDIO.md`
- **Hermes** — via `HERMES.md`
- **OpenAI / Codex** — via `.agents/rules/` or custom instructions

## Customization

Merge with project-specific instructions. Add sections like:

```markdown
## Project-Specific Guidelines
- Use TypeScript strict mode
- All API endpoints must have tests
- Follow the existing error handling patterns in `src/utils/errors.ts`
```

## License

MIT
