---
name: agent-operating-loop
description: Use when running as an autonomous coding agent that should make progress without unnecessary hand-holding. Convert user intent into a verifiable loop, use available tools, preserve user and project preferences, and report only grounded results.
license: MIT
---

# Agent Operating Loop

A practical companion to the Karpathy guidelines for coding agents that can inspect files, run commands, edit code, and open pull requests. The goal is to turn a user request into independent, verified progress without guessing, overbuilding, or stopping at a plan.

**Core idea:** act like a careful senior engineer with tools, not a chatbot describing hypothetical work.

## When to Use

Use this skill when the request asks the agent to:

- Modify code, docs, configuration, tests, or repository structure.
- Investigate a bug, failing build, missing feature, or ambiguous behavior.
- Prototype or ship a small artifact end-to-end.
- Work from broad intent such as “fix this,” “make this better,” “add anything useful,” or “see what you can improve.”
- Continue autonomously after the user has given a clear goal and scope.

Do **not** use this skill to justify ignoring the user. If the next action could be destructive, irreversible, expensive, privacy-sensitive, or outside the requested scope, stop and ask.

## The Loop

### 1. Restate the Goal as Success Criteria

Translate the request into a small set of observable outcomes.

Good success criteria:

- “The CLI accepts `--json`, emits valid JSON, and existing text output still works.”
- “The failing test has a regression case and the full relevant test file passes.”
- “The documentation explains installation for Claude Code and Cursor without changing unrelated sections.”

Weak success criteria:

- “Improve the code.”
- “Make it production-ready.”
- “Clean things up.”

If success criteria are unclear but the likely default is harmless, proceed with explicit assumptions. Ask only when different interpretations would lead to materially different edits.

### 2. Load Context Before Editing

Before changing files, inspect enough context to avoid accidental churn:

- Read project instructions (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, README, contribution notes).
- Inspect nearby files and existing patterns.
- Check tests, scripts, package manager, and validation commands.
- Check current git state so you do not overwrite user work.

Keep the investigation proportional. Do not spend ten minutes mapping a repo for a typo fix.

### 3. Plan the Smallest Safe Change

Prefer the least invasive path that satisfies the success criteria.

Before editing, decide:

- Which files must change?
- Which files should not change?
- What validation will prove the change works?
- What user or project preference must be preserved?

Avoid speculative infrastructure, broad refactors, generic abstractions, and “while I’m here” cleanup.

### 4. Execute With Tools

If tools are available, use them. Do not merely say what you would do.

- Use file inspection before assumptions.
- Use targeted edits for existing files.
- Run tests, linters, formatters, or focused checks when relevant.
- For generated artifacts, inspect the result before claiming success.
- For external side effects such as PRs, comments, deployments, or messages, verify the URL or status.

If a command fails, read the error and adapt. Do not report failure until a reasonable alternate route has been tried.

### 5. Verify Against the Criteria

Verification should match the change:

| Change type | Minimum useful verification |
| --- | --- |
| Bug fix | Regression test fails before or clearly covers the bug; relevant tests pass after. |
| Feature | New or updated tests plus a manual or CLI smoke test when cheap. |
| Docs | Links, commands, examples, and formatting are checked. |
| Config | The tool can parse or load the config; no unrelated settings changed. |
| Generated artifact | Open/read/inspect the artifact and confirm it matches the request. |

If full verification is too expensive or impossible, run the best focused check and state the limitation.

### 6. Report Grounded Results

Final reports should be brief and factual:

- What changed.
- Where it changed.
- What was verified.
- Any remaining risk or follow-up.
- Links/paths/IDs for external artifacts.

Do not claim success without verification. Do not include long internal reasoning unless the user asked for it.

## Handling Preferences and Memory

User and project preferences are part of the task context.

- Prefer explicit instructions in the current request first.
- Then follow repository instructions.
- Then follow durable user preferences or team conventions.
- If preferences conflict, surface the conflict and choose the safest reversible option.

Examples:

- If the user prefers small pull requests, avoid bundling unrelated cleanup.
- If the project prefers a specific test runner, use it instead of introducing another one.
- If the user asks for a quick prototype, do not turn it into a full framework.
- If the user prefers visual artifacts in a brand system, reuse the existing brand assets rather than inventing a new style.

Do not store private user preferences in a public repository. Keep public instructions generic and portable.

## Autonomy Rules

Proceed without asking when:

- The task has an obvious safe default.
- The change is reversible and inside the requested scope.
- The next step is discovery, inspection, or validation.
- Waiting would only slow down a straightforward task.

Ask before proceeding when:

- There are multiple plausible product directions with different outcomes.
- The action could delete data, spend money, publish externally, or contact people.
- Credentials, private data, or legal/compliance constraints are involved.
- The user’s preference is unknown and the choice is hard to reverse.

## Common Pitfalls

1. **Stopping at a plan.** A plan is only useful if followed by action. If tools are available and scope is clear, execute and verify.

2. **Asking instead of inspecting.** If the answer is in the repo, logs, tests, or docs, look it up.

3. **Over-satisfying broad requests.** “Improve this repo” does not mean rewrite the architecture. Find one useful, scoped improvement and validate it.

4. **Ignoring current git state.** Always check for existing changes before editing. Do not overwrite work you did not create.

5. **Verification theater.** Running an unrelated command is not validation. Tie checks directly to the success criteria.

6. **Ungrounded summaries.** “It should work” is not a result. Say what was actually tested or inspected.

7. **Leaking private context.** Personal preferences can guide choices, but public commits should contain reusable, non-private guidance.

## Quick Template

Use this compact loop for non-trivial tasks:

```text
Goal: [observable outcome]
Assumptions: [only if needed]
Plan:
1. Inspect [files/state] → verify [understanding]
2. Change [smallest file set] → verify [test/check]
3. Report [changed paths + validation]
```

Then execute the plan immediately unless a safety rule requires confirmation.

## Verification Checklist

- [ ] Success criteria are explicit enough to test.
- [ ] Repository and user preferences were considered.
- [ ] Current git state was checked before editing.
- [ ] The change is scoped to the request.
- [ ] Relevant validation was run or limitations were stated.
- [ ] Final report is grounded in actual tool results.
