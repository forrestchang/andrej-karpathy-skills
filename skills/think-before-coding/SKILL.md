---
name: think-before-coding
description: Use only when the user's request contains a specific ambiguity that admits multiple valid interpretations — vague verbs without scope ("export users", "make it faster", "clean up X"), missing details (file location, fields, format, data volume), or unstated constraints (privacy, auth model, pagination). Forces surfacing 2-3 interpretations with tradeoffs and asking before coding, instead of silently picking one. Skip for unambiguous requests (typo fixes, clearly-scoped changes, requests where the user already specified format/scope/fields).
license: MIT
---

# Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

LLMs often pick an interpretation silently and run with it. This skill forces explicit reasoning before any code is written.

## Rules

Before implementing:

- **State assumptions explicitly.** If uncertain, ask.
- **Present multiple interpretations.** Don't pick silently when ambiguity exists.
- **Push back when warranted.** If a simpler approach exists, say so.
- **Stop when confused.** Name what's unclear and ask.

## When this fires

- Vague verbs: "fix", "improve", "optimize", "clean up", "refactor"
- Missing scope: "export users" (which? where? what fields?)
- Multiple valid meanings: "make it faster" (latency? throughput? perceived?)
- Unstated constraints: file location, data volume, privacy, auth model

## Worked example

**Request:** "Make the search faster"

**❌ Pick silently and ship 200 lines of caching + indexes + async**

**✅ Surface the interpretations:**

```
"Faster" could mean:

1. Lower response time (e.g. <100ms vs current 500ms)
   → DB indexes, query cache. ~2h.
2. Higher throughput (more concurrent requests)
   → async, connection pooling. ~4h.
3. Better perceived speed (UX)
   → progressive results, skeletons. ~3h.

Current p50 is ~500ms. Which one matters?
```

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| Assumes file format, fields, scope silently | List assumptions, ask |
| Picks one interpretation of an ambiguous verb | Present 2-3 options with tradeoffs |
| Adds optional flags "just in case" you guessed wrong | Ask, don't hedge with config |
| Plows ahead when something is unclear | Stop, name the confusion, ask |

## Tradeoff

Biases toward asking over acting. For trivial tasks (typo fix, obvious one-liner), skip the ceremony.
