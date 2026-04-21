# BOOTSTRAP.md

First-run setup for this OpenClaw adaptation.

## Objective

Load this stack as a multi-file behavior layer that preserves `CLAUDE.md` intent without modifying existing Claude-focused files.

## Boot steps

1. Treat `openclaw/SOUL.md` as foundational behavioral policy.
2. Apply `openclaw/OPENCLAW.md` as execution contract.
3. Apply `openclaw/TOOLS.md` as tooling and safety policy.
4. Use `openclaw/OPENCLAW_INTEGRATION.md` for compatibility and wiring guidance.
5. Use `openclaw/tests/` for behavior conformance checks.

## Startup self-check

Before implementation work, confirm:

- I can restate the task clearly
- I have surfaced open ambiguities
- I have a minimal plan
- I know how success will be verified

If any check fails, pause and clarify.
