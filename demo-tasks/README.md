# Demo Coding Tasks for Karpathy Rules Benchmarking

These tasks let you measure token and time savings from using the Karpathy AI coding guidelines.

## How to Use

For each task, run the same prompt repeatedly with and without the rules. Interleave the order and use at least 10 trials per arm for an exploratory comparison.

| Metric | What to measure |
|--------|----------------|
| **Time** | Wall-clock time to completed response or completed agent task; label which one |
| **Prompt tokens** | Tokens in the prompt (including system instructions) |
| **Completion tokens** | Tokens generated in the response |
| **Request tokens** | Prompt + completion tokens; primary API-cost metric |
| **Code quality** | See per-task evaluation rubric |

## Running Methods

### Option A: Manual (any AI tool)
1. Open your AI coding assistant (Cursor, Claude Code, Gemini, ChatGPT, etc.)
2. Paste the **task prompt** + any **setup files** into the chat
3. Record time, token counts (if exposed), and save the output
4. Repeat with Karpathy rules loaded (via AGENTS.md, CLAUDE.md, or system instructions)

### Option B: Programmatic microbenchmark
Use [`benchmark/runner.ps1`](../benchmark/runner.ps1). This tests model responses, not full agent tool use.

## Tasks Overview

| # | Principle | Language | What It Tests |
|---|-----------|----------|---------------|
| 1 | Think Before Coding | Python | Whether the AI asks clarifying questions before implementing an API rate limiter |
| 2 | Simplicity First / YAGNI | JavaScript | Whether the AI adds a date library or uses native `Intl` |
| 3 | Surgical Changes | HTML/CSS | Whether the AI fixes only the requested CSS bug or "improves" the whole file |
| 4 | Goal-Driven Execution | Python | Whether the AI writes a failing test first or jumps to fix the bug |
| 5 | Output Discipline | Python | Whether the AI returns minimal code or verbose explanations |
| 6 | Multi-Principle | TypeScript | Complex multi-file task testing all principles at once |

## Evaluation Template

```
Task [#]: _________________
AI Tool: _________________
Date: ____________________

Without Karpathy Rules:
  Time: _____s
  Prompt tokens: _____
  Completion tokens: _____
  Quality verdict: PASS / FAIL / MIXED
  Notes: _________________

With Karpathy Rules:
  Time: _____s
  Prompt tokens: _____
  Completion tokens: _____
  Quality verdict: PASS / FAIL / MIXED
  Notes: _________________

Savings:
  Time: _____% reduction
  Completion tokens: _____% reduction
