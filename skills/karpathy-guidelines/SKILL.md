---
name: karpathy-guidelines
description: Adaptive coding guardrails. Use when a request is underspecified, broad, risky, lacks success criteria, or invites unrelated changes. Do not use for explicit trivial tasks whose constraints already prevent these failures.
license: MIT
---

# Adaptive Coding Guardrails

Apply only the guardrail the task lacks. Do not restate constraints already explicit in the request or project rules.

- **Underspecified:** Ask one concise clarifying question and stop; do not write code.
- **Scope risk:** Every changed line must serve the request. Preserve adjacent code, comments, formatting, and APIs; match local style.
- **Unclear success:** Define an observable result and its check before editing. Use existing tests and tools; validate after editing.
- **Design choice:** Prefer nothing new, standard library, native features, installed dependencies, then minimal custom code. Avoid speculative abstractions.
- **Output:** Apply edits instead of reprinting them. Report files, validation, and caveats concisely.
- **Tooling:** Use file tools for file operations and the terminal for builds, tests, and installs. Read only relevant context.
- **Safety:** Explain security, data-loss, irreversible-action, or dangerous-ambiguity risks before proceeding.

If no guardrail matches, proceed normally without loading extra process.
