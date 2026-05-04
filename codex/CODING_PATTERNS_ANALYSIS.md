# Global Coding Patterns Reference

This file is a portable pattern catalog for use across projects.
It is not a rulebook and it does not override local repository conventions.

## Precedence

Use this file only after applying the normal decision order:

1. Direct user instruction
2. Nearest `AGENTS.md`
3. Project-local docs, code conventions, and established patterns
4. This file
5. Generic engineering fallback

## How To Use This File

- Use it to choose implementation patterns when the current repo does not already establish a stronger local pattern.
- Adapt patterns to the current stack instead of copying them mechanically.
- Prefer the smallest correct pattern for the problem at hand.
- Do not use this file as justification for unrelated refactors.

## Pattern Format

Each pattern lists:

- `Applies to`: where the pattern is usually relevant
- `Use when`: when it is a good fit
- `Avoid when`: when it is likely overkill or a mismatch
- `Tradeoffs`: what the pattern costs

## Universal Patterns

These patterns are broadly portable across languages and stacks.

### 1. Strong Domain Types

Applies to:
- typed languages
- APIs with multiple identifier or value categories

Use when:
- different values share the same primitive representation but mean different things
- mixing them would create real bugs

Avoid when:
- the codebase is lightly typed
- the abstraction cost is larger than the bug risk

Tradeoffs:
- more type wrappers
- slightly more conversion code at boundaries

Why it helps:
- catches invalid mixing at compile time or at validation boundaries

### 2. Exhaustive Configuration Validation

Applies to:
- typed configs
- enums, maps, registries, dispatch tables

Use when:
- missing keys or invalid modes would cause runtime failures
- configuration completeness matters

Avoid when:
- configuration is intentionally loose or user-extensible at runtime

Tradeoffs:
- stricter config shapes
- more maintenance when options change

Why it helps:
- catches drift and omissions earlier

### 3. Minimal-Change Reuse

Applies to:
- any repo

Use when:
- fixing bugs
- adding small features
- working in unfamiliar code

Avoid when:
- the current architecture is itself the blocker and a larger change is justified

Tradeoffs:
- may leave broader cleanup for later

Why it helps:
- reduces blast radius and regression risk

### 4. Memoize Expensive Stable Reads

Applies to:
- repeated expensive reads
- prompt or context assembly
- config parsing
- repository status collection

Use when:
- the same expensive result is reused during a task or session
- recalculation is costly and the value is stable enough

Avoid when:
- the value changes frequently and stale results are dangerous

Tradeoffs:
- cache invalidation complexity
- risk of stale data if invalidation is wrong

Why it helps:
- saves time, I/O, and repeated work

### 5. Explicit Cache Invalidation

Applies to:
- memoized state
- generated context
- derived configuration

Use when:
- a cached value depends on mutable settings or environment state

Avoid when:
- recomputation is cheap and invalidation logic would be fragile

Tradeoffs:
- extra bookkeeping

Why it helps:
- prevents subtle stale-state bugs

### 6. Domain-Specific Errors

Applies to:
- services
- parsing
- integrations
- permission systems

Use when:
- callers need to distinguish categories of failure
- recovery behavior depends on the error type

Avoid when:
- a generic error plus context is enough

Tradeoffs:
- more error classes or error codes

Why it helps:
- improves error handling, logging, and recovery logic

### 7. Terminal-State Guards

Applies to:
- jobs
- tasks
- workflows
- async processes

Use when:
- an entity has lifecycle states and should not transition after completion

Avoid when:
- state is simple and one-shot

Tradeoffs:
- more explicit state modeling

Why it helps:
- prevents invalid transitions and cleanup bugs

### 8. Semantic Environment Parsing

Applies to:
- CLI tools
- services with env-based configuration

Use when:
- environment flags influence behavior across multiple paths

Avoid when:
- config should be explicit and strongly typed elsewhere

Tradeoffs:
- one more utility layer

Why it helps:
- avoids inconsistent stringly-typed checks

### 9. Locking For Shared Mutable Files

Applies to:
- config files
- state files
- caches

Use when:
- multiple sessions or processes can write the same file

Avoid when:
- only one writer exists
- the platform already guarantees safe writes another way

Tradeoffs:
- retry and lock cleanup complexity

Why it helps:
- prevents corruption and race conditions

### 10. Structured Streaming I/O

Applies to:
- CLI tools
- SDK bridges
- parent-child process communication

Use when:
- communication is incremental or long-running
- multiple message types must be exchanged safely

Avoid when:
- a simple request-response model is enough

Tradeoffs:
- protocol design
- parser complexity

Why it helps:
- avoids ad hoc parsing and buffering problems

### 11. Hierarchical Cleanup For Async Work

Applies to:
- cancellations
- timeouts
- nested async work

Use when:
- child work should stop when parent work stops

Avoid when:
- work is fully independent

Tradeoffs:
- more lifecycle management

Why it helps:
- reduces orphaned work and resource leaks

### 12. Sanitized Logging And Analytics

Applies to:
- telemetry
- logs
- audit events

Use when:
- raw inputs may contain secrets, paths, code, or user data

Avoid when:
- the system is local-only and no telemetry or shared logs exist

Tradeoffs:
- less raw detail in observability

Why it helps:
- reduces privacy and security leakage

### 13. Rule-Based Permissions

Applies to:
- tools
- automation
- command execution
- file access

Use when:
- decisions should be explainable and auditable

Avoid when:
- a single static mode is enough

Tradeoffs:
- more modeling and persistence logic

Why it helps:
- keeps permission behavior explicit and inspectable

### 14. Schema Or Boundary Validation

Applies to:
- config loading
- API inputs
- file parsing
- external integration boundaries

Use when:
- invalid input should fail early and clearly

Avoid when:
- the boundary is already strongly validated elsewhere

Tradeoffs:
- extra validation code

Why it helps:
- moves failures to the edge of the system

### 15. Resumable Output Tracking

Applies to:
- long-running jobs
- streamed logs
- incremental readers

Use when:
- output must be consumed incrementally without holding it all in memory

Avoid when:
- outputs are small and one-shot

Tradeoffs:
- file or offset tracking complexity

Why it helps:
- supports efficient resume and tail-like workflows

## Stack-Specific Patterns

These patterns are useful only when the current stack supports them directly.
Use them only when they match the repo's actual language, runtime, and conventions.

### TypeScript: Branded Types

Use when:
- multiple IDs share `string` representation

Avoid when:
- the repo does not already use strong nominal typing patterns

### TypeScript: `as const satisfies`

Use when:
- validating static maps and registries at compile time

Avoid when:
- the repo is not TypeScript

### Bun-Specific Fast Paths

Use when:
- the runtime is Bun and the repo already relies on Bun features

Avoid when:
- the project targets generic Node.js or multiple runtimes

### Lazy Schema Construction

Use when:
- the validation framework and module graph make recursive or circular schemas hard

Avoid when:
- plain direct schema declarations are sufficient

## Decision Heuristics

When multiple patterns could apply:

1. Prefer the local repo pattern.
2. Prefer the simpler pattern if it is sufficient.
3. Prefer boundary validation over deep internal defensive checks.
4. Prefer explicit lifecycle and cleanup rules for long-running async work.
5. Prefer patterns that reduce operational risk over patterns that only increase abstraction.

## Anti-Patterns

Do not use this file to justify:

- broad refactors during narrow fixes
- importing architecture from another codebase without evidence
- stack-specific abstractions in the wrong language or runtime
- extra wrappers that do not prevent real bugs
- caching without explicit invalidation strategy

## Review Checklist

Before applying a pattern from this file, ask:

1. Does the repo already have a stronger local convention?
2. Does this pattern fit the current language and runtime?
3. Does it reduce real risk, or only add abstraction?
4. Is there a smaller pattern that solves the same problem?
5. Does using it keep the change within scope?
