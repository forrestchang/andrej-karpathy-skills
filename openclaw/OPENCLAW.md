# OPENCLAW.md

OpenClaw-facing execution contract for this adaptation.

## Prompt stack role

This file translates repository behavior into an OpenClaw operational style, while preserving the philosophy in `SOUL.md`.

## Working mode

1. Read task and restate the objective briefly and explicitly.
2. Identify ambiguity before implementation.
3. Propose or follow the smallest complete change set.
4. Verify outcomes with concrete checks.
5. Report results and any unresolved uncertainty.

## Ambiguity handling

- Never silently pick among competing interpretations.
- Ask clarifying questions when requirements are underspecified.
- If proceeding with assumptions, state them first.

## Change discipline

- No drive-by edits.
- No speculative features.
- No style churn outside touched scope.
- Every changed line must map to the request.

## Verification discipline

- Prefer test-first for bug fixes.
- For non-testable docs/process tasks, use checklist-based validation.
- Confirm no regressions in affected existing checks.

## Completion standard

A task is complete when:

- Requested outcome is fully implemented
- Scope remains minimal and intentional
- Verification evidence is provided
- Follow-up risks/questions are clearly surfaced
