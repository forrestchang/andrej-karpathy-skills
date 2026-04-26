# Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Architecture & Boundaries

Enforce import direction, keep domain logic pure, and stop god files from growing.

### Layer Rules

Define and enforce the project layer map.

- **Presentation** (UI, API controllers, CLI): imports its own layer and the defined interface below it. It never reaches into data access, domain internals, or infrastructure.
- **Orchestration** (entry points, request handlers, process managers): wires dependencies and calls domain logic. If a body is more than a thin domain wrapper, move it to domain.
- **Domain** (business logic, rules, workflows): depends only on domain abstractions and data-layer types. It imports no infrastructure, presentation, or orchestration, and tests without frameworks, databases, or external services.
- **Data** (schema, ORM types, migrations): exports types and schema only. No business logic, formatters, filters, or helpers; logic near schema belongs in domain.

If a lower layer imports a higher layer, fix the direction. Do not paper over it.

### Size Budgets

- Over 400 lines is a smell; over 600 is a defect.
- Exceptions: tightly cohesive single-concern modules, such as one parser, state machine, schema, or configuration object.
- When a file nears the budget, stop and split before adding more.
- Identify "must shrink, not grow" files up front: usually the main entry point, root component, and files with unrelated responsibilities.

### Singletons & Initialization

- Do not use module-level nullable globals like `let foo: T | null = null` initialized elsewhere. They force `foo!` or guards that hide contract violations.
- A production `!`-bang is a bug report.
- Prefer constructor/function injection, or create one startup context object and pass it explicitly.
- Domain logic must not put mutable state in `static` fields on classes with instance methods. That is a singleton disguised as an instance.
- Process-lifetime state needs one explicit owner, constructed at boot.

### Module Shape

- Every module has an explicit public surface: a barrel that only re-exports, or a small file where exported means public.
- Do not export internal helpers. Test behavior through the public API, or use a test-only subclass under tests.
- Consumers should understand a module from its public surface, not its internals.
- Prefer functions over classes unless state is genuinely shared across calls. One state field plus a few methods is usually functions.
- Prefer composition over inheritance. Avoid deep hierarchies and abstract hook base classes; use functions with config.
- Do not wrap a third-party library unless there are at least two real implementations behind the wrapper.
- Barrel files contain re-exports only; logic belongs in a named sibling file.

### Types As Contracts

- Make illegal states unrepresentable.
- Use discriminated unions for status instead of boolean clusters.
- Use `{ kind: 'success', data } | { kind: 'error', error }` instead of optional `data`, `error`, and `success`.
- Use a non-empty array type instead of `T[]` plus length checks.
- If a type permits an impossible state, fix the type before adding runtime guards.

Parse, don't merely validate, at every boundary:

- External input: parse HTTP requests, CLI args, uploads, and form input at entry; handlers receive parsed types.
- IPC, queues, and service calls: parse received message shapes; do not trust sender types.
- External APIs: parse response shapes; do not trust third-party TypeScript declarations.
- Database rows: ORM types count as parsing, but repositories must parse JSON fields or enum-like text into domain types.

A domain function taking `unknown`, or doing object/property guards, means parsing happened too late.

### Boundary Contracts

- Put every message, channel, or endpoint name in one source of truth as a typed constant with request/response types.
- Register every handler once in the right layer. Never register inline in an entry-point file.
- New handlers go in domain-specific modules, not god handler files.
- Validate/parse every payload at the boundary with a schema library such as zod, joi, or pydantic.
- Handler bodies receive parsed types, never raw input.
- Consumers use typed wrappers, never raw invocations for convenience.

### Test Code, Seeds, Fixtures

- Production classes must not contain `simulate*`, `mock*`, `_test*`, or other test-only methods.
- Tests create unusual state through the real public API or a test-only subclass under tests.
- Mock data lives in test fixtures, never inline in production modules or bundles.
- Production seed data lives in one idempotent file.
- Date-stamped or scenario-stamped seeds are test fixtures.
- "Render with no real data" UI fallbacks are dev-only flags or stories, not production component code.

### Ownership

- One concept has one owner module; helpers, formatters, filters, and type derivations live there.
- "For backward compat" re-exports are a symptom. Stop and consolidate to one source.
- Similar code that changes for different reasons is not duplication. Similar code that changes for the same reason is duplication; extract on the third write, not the second.
- Every state value has a named owner.
- Do not mirror state locally when another layer owns it; fetch it through the proper interface.
- If the same data exists twice, one copy is the owner and the other is an explicit cache.
- Client caches need one invalidation path; optimistic and confirmed results reconcile through the same path.
- Convenience copies start drift bugs.

### Infrastructure, Effects, And Work Placement

- Before writing a generic queue, scheduler, retry loop, event bus, DI container, or workflow engine, check the language, runtime, and installed dependencies.
- New infrastructure requires explicit justification.
- Keep effects at the edges: network, time, randomness, filesystem, external APIs, and framework calls stay outside the domain core.
- Domain code must be deterministic and unit-testable without mocking the world; pass current time as a parameter instead of reading `Date.now()`.
- CPU-heavy, network-heavy, or large-data work belongs in a background worker/job/process.
- The main process/thread triggers jobs and forwards results; it does not run long-running work.
- Presentation dispatches through the proper interface and observes via events or polling; it never does background work directly.
- "The dependency is in scope" is not a reason to do work inline.

### Schema As Contract

- Database schema is a contract between the data layer and consumers.
- Schema changes use migration tooling. Never hand-edit generated artifacts except to fix generator bugs.
- Shipped migrations are append-only; wrong migrations get fix-forward migrations.
- Dev-mode schema pushes are for scratch databases only, never real data.
- Renames/drops need explicit data-migration steps, not runtime fallbacks.
- Schema changes without paired migrations are bugs.
- Constraints belong in schema: foreign keys, `NOT NULL`, cascading deletes. If the ORM cannot express one, use raw SQL in the migration.

### Cross-Cutting Concerns

Pick one place for each concern; do not allow a second.

- **Logging:** one library, configured once, imported elsewhere. No ad-hoc committed logging.
- **Errors:** catch at layer boundaries. Each layer has a defined strategy.
- **Auth/secrets:** token and credential plaintext lives in exactly one module.
- **Encryption:** all secrets pass through one encryption module. No reimplemented crypto calls.
- **Configuration:** user settings use one settings mechanism; build-time config uses build config and env vars. No third system.
- **Time, randomness, IDs:** inject them. See effects-at-edges.

### Where New Code Goes

Answer in order before writing:

1. Domain logic: parsing, classifying, computing, filtering, business rules -> domain layer, relevant subfolder. Create a subfolder if a new concept has 3+ files.
2. Persistent state -> schema change, migration, repository.
3. Presentation needs it -> typed boundary interface, such as API or IPC, plus presentation-side typed wrapper.
4. Long-running work -> background job/worker, not inline main-process work.
5. UI -> reuse existing primitives; new screen/page in the right directory; shared pieces in the shared component directory.
6. Cross-cutting -> use the chosen cross-cutting location. Do not invent another.

If a feature does not map cleanly, it is bigger than it looks. Split it.

#### Checklist: New Boundary Endpoint

1. Define request/response types in the boundary definition file.
2. Define validation schemas for both.
3. Create or extend the domain handler. It parses the request at entry and returns the response shape.
4. Expose the method on the consumer-facing interface.
5. Expose a typed wrapper on the caller side.
6. Add at least one end-to-end integration test.
7. Do not register the handler inline in an entry-point file.

#### Checklist: New Domain Concept

1. Add schema/migration with constraints, indices, and timestamps.
2. Run migration tooling. Review the migration. Commit schema and migration together.
3. Add the owning repository/module and export it through the right barrel.
4. Add tests for public methods.
5. Add boundary endpoints if presentation needs it.
6. Add UI hook/controller if UI needs it.
7. Add fixtures if other tests need instances.

### When In Doubt

If the right file is not obvious under these rules, stop and ask. Never add code where the imports already happen to be; that grows god files.

### Self-Check Before Submitting

Before declaring done, verify:

1. Touched files did not cross forbidden layer boundaries.
2. No touched file crossed 400 lines; no new file crossed 600.
3. No new nullable module global; no new `!` on module-scope dependencies.
4. No boundary handler outside the handler directory; no handler without boundary parsing.
5. No production `simulate*`/`mock*` methods; no mock data in production modules.
6. Each touched concept has exactly one owner.
7. You did not hand-roll something an existing dependency provides.
8. No new type permits an impossible state.
9. No untrusted input reaches domain code unparsed.
10. No state is now owned by two places.
11. Schema changes include committed migrations.
12. New long-running work runs in background, not in main or presentation.

If any check fails, fix it or surface it explicitly. Do not ship violations silently.

## 6. Code-Level Discipline

Section 5 governs structure. This section governs lines, functions, and files. It counters bureaucratic names, narrating comments, defensive catches, log noise, type escapes, floating promises, and dependency creep.

### Naming & Ubiquitous Language

- Avoid bureaucratic suffixes: `Manager`, `Helper`, `Util`, `Handler`, `Service`, `Wrapper`, `Engine`, `Processor`, `Provider`. Use one only when the domain genuinely uses that word.
- Name things for what they are (`TokenStore`, `LabelCache`, `SyncState`) or do (`syncEmails`, `refreshToken`, `applyLabels`), not their bureaucratic role.
- Match product/team language exactly: if the product says "Topics", code says topics, not categories/tags/labels.
- Function names start with verbs; type/class names start with nouns.
- Booleans read as predicates: `isExpired`, `hasUnreadEmails`, `shouldRetry`; not `expired`, `unread`, `retry`.
- Single-letter variables (`e`, `i`, `x`) are only for trivial loops/callbacks. Prefer `error`, `index`, `item`.
- Avoid non-domain abbreviations such as `usr`, `cfg`, `tmpl`, `proc`.

### Comments

- Comment only what code cannot: non-obvious tradeoffs, known-bug workarounds, external API quirks, or invariants readers would otherwise derive.
- Ban narrating comments (`// loop over emails`, `// return the result`, `// set the state`).
- Ban docstrings on trivial helpers.
- Ban assistant chatter in comments: "Here we...", "This function will...", "Now we need to...".
- TODOs need an owner and ticket reference; `// TODO: handle this later` is a defect.
- Top-of-file "what this file does" block comments are redundant when exports say it.
- Delete comments that restate the next line.

### Error Handling

- Catch only what you can handle; unexpected errors bubble to one boundary per layer.
- Domain code throws; consumers handle.
- Boundary handlers (API, IPC, message consumers) catch at wrappers and return structured errors.
- Presentation surfaces errors through notifications, fallback UI, error boundaries, or explicit hook/controller catches.
- Ban empty catches, log-and-continue catches, and defensive try-blocks around code that cannot throw.
- A new try/catch needs a one-line comment saying what it recovers from and why.
- Convert third-party errors into your own at the boundary if you depend on their shape. Do not leak external library error types into domain code.

### Logging

- Use one configured logging library. No ad-hoc committed logging.
- One log line describes one event, with stable structured shape, for example `log.info('sync.cycle.start', { historyId, lookbackDays })`.
- Log facts, not narration: structured `sync.cycle.start`, not "Starting sync cycle...".
- Levels mean what they say: `error` bug, `warn` recoverable anomaly, `info` milestone, `debug` diagnosis. If everything is `info`, nothing is.
- No emoji, multi-line messages, or UI-looking output.
- Never log secrets, API keys, tokens, credentials, or personal data at any level.

### Type Hygiene

- Ban `as any` and `as unknown as X`.
- Ban `// @ts-ignore`. `// @ts-expect-error` is allowed only with an inline reason and TODO link.
- Ban `Object`, `{}`, and `Function` types; use `Record<string, ...>`, the real interface, or a function signature.
- A type assertion claims you know more than the compiler. Usually the type is wrong; fix it.
- Optional chaining is for legitimately optional values, not ignored invariants. Chains over assumed-present values hide contract violations.
- Prefer `unknown` over `any` only when genuinely unknown, then parse it.

### Async & Promises

- Every promise is awaited, returned, or explicitly discarded with `void`.
- No bare `.then()` chains without `.catch()` or a top-level catching boundary.
- No `setInterval(async () => ...)` without a clear failure path.
- Long-lived callbacks (subscriptions, intervals, listeners) read state through refs, not stale closure captures.
- Do not `Promise.all` unbounded data; use a concurrency limit.
- Do not race timers and IO without explicit reason; prefer client-supported timeouts.
- `await` inside `forEach` is useless. Use `for...of` for sequential work, or limited parallelism for concurrent work.

### Dependencies

- Adding a package needs a one-paragraph PR/commit justification explaining why the existing stack cannot solve it.
- Default to the existing stack; check language, runtime, and installed dependencies first.
- Adding a router, state library, HTTP client, scheduler, queue, or date library requires explicit approval.
- Do not add transitive utility packages (`lodash`, `ramda`, `underscore`) for one helper; write the helper.
- Removing a dependency also requires verification that nothing imports it.

### Database Migrations

- Schema changes go through migration tooling. Never hand-edit generated artifacts except for generator bugs.
- Shipped migrations are append-only; fix forward with new migrations.
- Dev schema pushes are scratch-database only. For real data: generate, review, commit, run.
- A schema change without a migration is a bug.
- Review each migration for data preservation, index coverage, and rollback/fix-forward feasibility.
