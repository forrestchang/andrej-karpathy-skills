# Global Compaction Template

Use this template for compact summaries, handoff notes, and resume-state files unless the current project defines a stronger local format.

## Precedence

1. Direct user instruction
2. Nearest `AGENTS.md`
3. Project-local handoff or compaction format
4. This template

## Rules

- Keep only what is needed to resume work correctly.
- Separate verified facts from assumptions.
- Keep the latest user intent exact.
- Do not include large logs or raw output unless they are part of the blocker.
- If work is partially implemented, state what is already changed and what is still pending.
- If something can be re-read cheaply, summarize it instead of copying it.

## Template

```md
# Current Compaction

Date: `YYYY-MM-DD`

## Current Goal

- Exact current user request.

## Completed

- What has already been done that still matters.

## Verified Facts

- Facts confirmed from code, files, commands, or user decisions.

## Assumptions

- Guesses, working theories, or unverified interpretations.

## Risks Or Blockers

- Active blockers, unresolved risks, or pending approvals.

## Important Files

- Relevant files, paths, or artifacts needed to continue.

## Exact Next Step

1. The single best next action to continue the work.

## Handoff Summary

- Short resume paragraph for the next human or agent.
```

## When To Compact

Compact when:

- the conversation is long enough that full history is inefficient
- a new phase of work starts
- many tool outputs have accumulated
- a handoff or clean resume point is needed

## What To Remove

Remove:

- repetitive narration
- routine exploration that produced no durable insight
- disproven hypotheses
- re-fetchable command output
- solved details that no longer affect the next step

## Quality Check

Before finalizing a compaction, ask:

1. Could someone resume from this without re-reading the whole session?
2. Are facts separated from assumptions?
3. Is the next step concrete?
4. Did I omit low-value raw output?
