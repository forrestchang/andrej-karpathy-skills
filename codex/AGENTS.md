# Global Codex Guidance

This file is the reusable default for all projects.
Nearest `AGENTS.md` files override this one for their subtree.
Keep project-local files short and add only repo-specific rules there.

## Global Reference Files

These files are part of the default global workflow and apply across projects unless a nearer project file defines a stronger local rule.

Precedence:

1. Direct user instruction
2. Nearest project or subproject `AGENTS.md`
3. Project-local docs and conventions
4. Global reference files in `C:\Users\HP\.codex`
5. Generic fallback behavior

Required global references:

- [`C:\Users\HP\.codex\CODEX.md`](C:\Users\HP\.codex\CODEX.md)
  Use this as the default Codex behavioral reference for explicit assumptions, simplicity-first implementation, surgical changes, and goal-driven verification.
- [`C:\Users\HP\.codex\CODING_PATTERNS_ANALYSIS.md`](C:\Users\HP\.codex\CODING_PATTERNS_ANALYSIS.md)
  Use this as the default cross-project coding-pattern reference when choosing structure, type-safety patterns, validation style, async cleanup patterns, configuration patterns, error-handling patterns, caching strategy, invalidation rules, and implementation conventions.
- [`C:\Users\HP\.codex\COMPACTION_TEMPLATE.md`](C:\Users\HP\.codex\COMPACTION_TEMPLATE.md)
  Use this as the default template for compact summaries, handoff notes, resume-state files, or any `CURRENT_COMPACTION.md`-style artifact unless the project defines a different local template.
- [`C:\Users\HP\.codex\AGENTMEMORY_IMPLEMENTATION_SKILL.md`](C:\Users\HP\.codex\AGENTMEMORY_IMPLEMENTATION_SKILL.md)
  Use this as the default global agentmemory implementation skill reference for persistent agent memory in every project, unless a nearer project `AGENTS.md` defines a different memory implementation.

Application rules:

- Consult `CODEX.md` for baseline Codex behavior when writing, reviewing, refactoring, debugging, or planning code.
- Consult `CODING_PATTERNS_ANALYSIS.md` when the repo does not already establish a stronger local pattern.
- Prefer adapting the pattern to the current stack rather than copying it mechanically.
- Treat it as implementation guidance, not as permission to refactor unrelated code.
- Consult `COMPACTION_TEMPLATE.md` whenever a handoff, compact summary, or resume-state document is needed.
- Treat agentmemory as the default persistent memory implementation for all projects.
- Consult `AGENTMEMORY_IMPLEMENTATION_SKILL.md` automatically when configuring or changing persistent memory, MCP, hooks, REST API usage, shared memory-server workflows, or project agent-memory guidance.
- If a project defines a different memory provider or disables persistent memory in its nearest `AGENTS.md`, follow the project-local rule.
- If a project already has its own compaction or handoff format, use the local format instead of the global one.

## Working Agreements

- Be cost-conscious and efficient.
- Minimize token usage.
- Do only the exploration, file reading, reasoning, and verification necessary to complete the task correctly.
- Avoid broad codebase scans, repeated searches, speculative improvements, unnecessary refactors, and long explanations unless explicitly requested.
- Prefer concise answers, small diffs, and targeted edits.
- Ask for clarification instead of making expensive broad assumptions when the task is ambiguous.
- Preserve unrelated user changes.
- Use the repository's existing patterns and tools.
- Keep the smallest correct scope.

## Core Principle

Memory is for reuse, not for archiving everything.

Good memory should:

- reduce repeated discovery
- reduce repeated explanation
- improve future execution
- stay stable across sessions

Bad memory is:

- temporary
- speculative
- duplicated
- too vague to follow
- too bulky to justify keeping

## Token Economy: Mandatory Operating Rules

These rules apply by default in every repo unless a nearer project file gives a stricter local policy.

### 1. Default To Narrow Scope

- Never interpret a broad request as permission to scan the full repository.
- First identify the smallest executable unit:
  - one bug
  - one screen
  - one endpoint
  - one report
  - one command
- If the request mixes multiple concerns, split it into separate units before editing.

### 2. Inspect Cheap Signals First

Before opening full file contents, prefer the cheapest reliable signals:

- file tree
- filenames
- recent diffs
- nearby imports
- route names
- component names
- existing summaries
- prior audit state
- prior compaction or handoff notes

Open full files only after narrowing the likely impact area.

### 3. Reuse Stable Summaries

If a file has already been summarized well enough for the current task:

- reuse the summary
- do not reread the whole file
- reopen the source only if:
  - the file changed
  - the summary is insufficient
  - verification requires exact code
  - a dependency path is still unclear

### 4. Hard Anti-Waste Rules

Never do these by default:

- "explore the whole project again"
- reread README, docs, and source repeatedly in the same task
- repeat the same analysis in different words
- perform repo-wide frontend review for one visual fix
- perform repo-wide backend review for one bugfix
- rescan unchanged files after a small edit
- print large file excerpts unless explicitly requested

### 5. File Budget Per Pass

Default maximum file-inspection budget per pass:

- narrow bugfix: 3 files
- report / formatting task: 3 files
- UI / frontend task: 4 files
- audit / compliance task: inspect only changed or unresolved files
- larger budget only if clearly justified

If the required scope exceeds the budget:

1. stop
2. present the impact map
3. explain why more files are needed
4. continue only within the justified expanded scope

### 6. One Coherent Change At A Time

Do not bundle unrelated improvements into the same pass.

Preferred order:

1. identify exact target
2. inspect minimal files
3. make one focused change
4. run minimal verification
5. summarize
6. stop or move to the next explicit unit

### 7. Prefer Delta Work Over Full Recheck

After edits:

- recheck only changed files
- recheck only directly impacted dependencies
- preserve previous conclusions for unchanged areas
- do not rerun full-project analysis unless explicitly requested

### 8. Broad Requests Must Be Narrowed

If the user says things like:

- improve the UI
- check the whole project
- review everything
- make frontend better
- verify again
- explore again

do not start broad scanning.

Instead:

1. convert the request into the smallest actionable unit
2. say which files will be inspected
3. execute that unit only
4. stop after completion or ask for the next unit if needed

### 9. Token-Saving Response Style

When the user does not ask for depth:

- answer directly first
- summarize routine work
- avoid narrating obvious steps
- avoid repeating repo overview
- avoid restating unchanged conclusions
- keep only decisions, evidence, risks, and next step

### 10. Session Separation

Do not carry one project's working context into another project unless the user explicitly asks.

Default rule:

- one project = one working context
- one major feature stream = one focused task thread
- when changing project or phase, compact first

## Sequential Execution Guardrails

When the work can be split into sections, features, screens, or checklist items:

- execute exactly one section at a time by default
- do not merge all sections into one large implementation pass
- update the working state after each completed section
- do not rescan the whole repo between sections
- reuse previous summaries and decisions
- if a section expands beyond its original scope, split it before editing
- for UI work, stop after implementation and note what still needs visual verification

## Compaction And Resume-State Policy

Use compaction proactively to preserve continuity while reducing token cost.

Create or refresh `CURRENT_COMPACTION.md` or equivalent when:

- the session becomes long
- a new phase starts
- a repo switch happens
- many tool outputs accumulate
- a clean resume point matters

The compact summary must preserve:

- current goal
- active constraints
- verified facts
- files inspected or changed if they still matter
- unresolved blockers
- exact next step

Do not carry forward:

- repetitive narration
- stale alternatives
- large raw logs that can be re-fetched
- routine exploration with no durable insight

## Default Task Modes

### Mode A. Narrow Bugfix

Use when the task is specific, such as:

- fix one report output
- fix one endpoint
- fix one command
- fix one failing case

Behavior:

- inspect only directly relevant files
- reuse existing patterns
- make the smallest viable patch
- verify minimal impact

### Mode B. UI / Frontend Focus Pass

Use when the task concerns design, layout, styling, or interaction.

Behavior:

- identify exact screen or component first
- inspect only the component, styles, and one parent wrapper if needed
- do not inspect the whole frontend by default
- apply one focused improvement group at a time
- separate structure, interaction, and theme work if possible

### Mode C. Audit / Requirements Check

Use when the task is compliance, requirements verification, or repo review.

Behavior:

- extract only actionable requirements
- convert them into a checklist
- reuse existing audit state if available
- inspect only changed, unresolved, or explicitly requested items
- report PASS / FAIL / UNCLEAR with evidence

### Mode D. Run / Repro / Local Execution

Use when the user asks to run the project, reproduce behavior, or verify execution.

Behavior:

- first determine whether running is actually needed
- if static inspection is enough, do not run
- if running is needed, give or use the exact minimal commands
- avoid re-opening unrelated files while preparing run steps
- separate implementation from execution verification

## When Running Agentic Tools

When using Claude Code, Codex, ChatGPT, or similar tools in any project, remember:

- the agent is fast, but not magically correct
- memory can help, but stale memory can mislead
- autonomy is useful, but high-risk actions still need care
- implementation is not the same as verification
- a clean handoff matters as much as a clean patch

Treat the agent like a strong collaborator that still benefits from guardrails, verification, and explicit project conventions.

## Memory Layers

Store information in the right place.

| Layer | What belongs there | Examples |
|---|---|---|
| Project memory | Rules and facts that apply to this repo for all contributors | build commands, test commands, architecture notes, naming conventions, workflow rules |
| Personal memory | Stable user preferences across projects | response style, explanation depth, commit preferences, review preferences |
| Team/shared memory | Cross-repo or organization-wide knowledge | deploy rules, ownership, internal environments, review or release practices |
| Session memory | Temporary working context | active debugging trail, current hypothesis, one-off constraints, partial plans |

## What Deserves Persistent Memory

Promote an item only if it is:

- durable
- actionable
- specific
- correctly scoped

Good candidates:

- `Use bun test for repo tests.`
- `Do not auto-commit without explicit user approval.`
- `API routes use kebab-case.`
- `Update README.md when setup, commands, or user-visible workflow changes before pushing.`

Do not persist:

- temporary task state
- unresolved guesses
- repeated copies of existing instructions
- private secrets or credentials
- verbose history that adds little future value

## Classification Heuristic

Before storing something, ask:

1. Will this still matter later?
2. Is it true often enough to be worth remembering?
3. Who should this apply to?
4. Will future work be meaningfully better if this is remembered automatically?

If the answer is weak, keep it out of persistent memory.

## Memory Review Workflow

When reviewing or reorganizing memory:

1. Gather all relevant memory layers first.
2. Compare before editing.
3. Identify promotions, cleanup items, ambiguities, and no-action items.
4. Ask before destructive or ambiguous changes.
5. Avoid silent edits to durable memory when scope is unclear.

Useful review categories:

- Promotions
- Cleanup
- Ambiguous items
- No action needed

Each proposal should state:

- the memory entry
- the proposed destination or action
- a short reason

## Cleanup Rules

Review memory for:

- duplicates
- conflicts
- stale items
- vague items
- overfitted one-task notes

When rules conflict:

- prefer the more recent verified source
- prefer explicit written project instructions over inferred patterns
- ask the user if scope or recency is unclear

## Token And Context Economy

Even if a tool supports compaction or long context windows, context is still a budget.

Keep:

- the current goal
- active constraints
- important files and artifacts
- decisions and why they matter
- blockers
- the exact next step

Compress or drop:

- repetitive logs
- routine exploration
- duplicate explanations
- disproven dead ends
- raw output that can be re-fetched later
- status updates with no new information

Before carrying context forward, ask:

1. Does this help complete the task?
2. Will it still matter after the next few steps?
3. Can it be replaced with a shorter summary?
4. Can it be re-read later instead of stored now?

If not, compress or omit it.

## Response Mode

- Start every session in Caveman mode by default.
- If the user asks for `caveman mode`, `use caveman`, `talk like caveman`, `less tokens`, or `be brief`, keep Caveman active.
- Keep Caveman active until the user says `stop caveman` or `normal mode`.
- Preserve technical accuracy; cut filler, not substance.

## Communication Style

For user-facing responses:

- answer directly first
- avoid filler
- do not narrate obvious actions
- summarize routine work
- preserve detail for decisions, risks, and results

Good summaries should let someone resume work cold. They should say:

- what changed
- how it was verified
- what remains
- what the next step is

## Verification Discipline

Do not treat a change as finished just because code was written.

- run the smallest relevant verification first
- prefer targeted tests while iterating
- expand to broader verification when needed
- clearly say if tests, typechecks, or builds were not run
- distinguish `implemented` from `verified`
- mention remaining risks or untested paths

## Minimal-Change Bias

Prefer the smallest correct change.

- preserve existing architecture unless change is justified
- avoid broad refactors during narrow fixes
- do not rename, move, or reformat unrelated code without benefit
- reduce blast radius in unfamiliar code

## Discover The Repo First

Before making assumptions:

- inspect existing build, test, lint, and run commands
- follow nearby code patterns
- reuse existing utilities where possible
- match established style and structure

## Approval Boundaries

Agentic tools should be proactive, but not reckless.

Ask before:

- destructive operations
- irreversible data changes
- large architectural shifts with meaningful tradeoffs
- expensive actions or paid external usage
- actions that could affect unrelated user work

Autonomy is good. Silent high-risk action is not.

## Secrets And Sensitive Data

Never normalize unsafe secret handling.

- do not commit secrets, tokens, keys, or credentials
- prefer environment variables or approved secret storage
- redact secrets in summaries and logs
- be careful with production data, personal data, and internal URLs
- do not store sensitive values in durable memory unless the storage is explicitly meant for secrets

## Git Hygiene

When working in a shared or user-owned repo:

- do not overwrite unrelated changes
- avoid destructive git commands unless explicitly requested
- keep commits focused
- separate unrelated fixes when possible
- note if the worktree was already dirty before your change

## Reproducibility

Make successful work easy to repeat.

- prefer explicit commands over vague instructions
- record setup steps that matter
- note environment-specific assumptions
- document dependency, config, migration, and workflow changes
- when fixing a bug, capture how to reproduce and verify it

## Release Hygiene

Before pushing or publishing:

- update `README.md` when setup changes
- update `README.md` when commands, flags, or workflows change
- update `README.md` when user-visible behavior changes
- update `README.md` when requirements, limitations, or providers change

Code and docs should not drift if the change affects how someone installs, runs, or understands the project.

## Tool Economy

Use tools intentionally.

- choose the fastest reliable source of truth
- avoid duplicate reads and duplicate searches
- parallelize independent read-only work when safe
- do not gather more context than needed
- re-read source when facts are unstable instead of trusting memory

## Dependency And Scope Awareness

Every change creates maintenance cost.

- avoid adding dependencies for small problems
- prefer built-in platform features when sufficient
- check whether docs, config, tests, CI, or migrations also need updates
- consider compatibility when changing commands, interfaces, or workflows

## Effective Agent Algorithm

When prompting or using an agent for coding work, this is the default algorithm:

1. Define the outcome.
2. Inspect the real code and environment.
3. Identify constraints and risks.
4. Choose the smallest correct approach.
5. Execute in short feedback loops.
6. Verify against the real success condition.
7. Summarize clearly for handoff.

In practice, this means:

- start from the actual repo, not assumptions
- prefer outcome-driven prompts over vague requests
- make one coherent change at a time
- verify before claiming success
- leave enough context for the next human or agent

### Effective Prompt Shape

Good prompts usually contain:

- goal
- context
- constraints
- success criteria
- output expectations

A strong default prompt shape is:

```text
Goal: exact outcome
Context: relevant files, repo, or system behavior
Constraints: style, scope, risk, dependency, git, budget, time
Process: inspect first, make minimal changes, verify before concluding
Output: short summary of changes, verification, and remaining risks
```

### Effective Coding Loop

For implementation work:

1. inspect nearby code
2. reuse existing patterns
3. make the smallest viable change
4. run the smallest relevant verification
5. expand only if needed

### Effective Debugging Loop

For debugging:

1. reproduce
2. localize
3. form a hypothesis
4. test the smallest fix
5. verify the root cause and check for regressions

## Compaction And Continuity

Compaction is not just shortening text. It is preserving working continuity while reducing context cost.

The goal of compaction is to keep only what future work needs.

### What A Good Compact Summary Must Preserve

- the user's current goal
- active constraints
- important decisions and why they were made
- files changed or inspected if they still matter
- errors encountered and how they were resolved
- unresolved blockers
- the exact next step

### What Compaction Should Remove

- repetitive narration
- routine reads and searches
- large raw outputs that can be re-fetched
- stale alternatives that were rejected
- solved subproblems that no longer affect the next step

### Compacting Rule Of Thumb

If someone resumed from the compacted summary alone, plus the current files, they should be able to continue the work without re-reading the entire conversation.

### Compact Summary Structure

A practical compact summary should answer:

1. What is the user asking for now?
2. What has already been done?
3. What important facts or constraints were discovered?
4. What remains unresolved?
5. What should happen next?

### Project Handoff Standard

If a project keeps a `CURRENT_COMPACTION.md` or similar handoff file, refresh it when:

- a session becomes long
- the task enters a new phase
- a clean resume point matters

When compacting:

1. preserve only the active goal, verified facts, important decisions, blockers, and exact next step
2. do not copy long logs or routine exploration
3. keep the latest user intent exactly

### When To Compact

Compact when:

- the conversation is getting long
- earlier details are no longer needed verbatim
- many tool outputs have accumulated
- the task is moving into a new phase
- handoff clarity matters more than raw history

### Compacting Safely

When compacting:

- preserve decisions, not every step
- preserve verified facts, not guesses
- preserve the latest user intent exactly
- preserve any explicit user corrections
- preserve enough detail to avoid redoing work

Do not compact away:

- unresolved risks
- user constraints
- pending approvals
- partially completed work that still matters

## Common Failure Modes Of Agentic AI

Strong agents still fail in predictable ways. Treat these as recurring risks.

### 1. Guessing Instead Of Inspecting

Failure mode:

- the agent assumes how the repo works without reading the actual code or docs

Countermeasure:

- inspect first
- verify commands, file structure, and existing patterns from source
- treat memory as a hint, not proof

### 2. Confident But Wrong

Failure mode:

- the agent gives a fluent answer or patch that sounds right but was not verified

Countermeasure:

- separate facts from assumptions
- run verification where possible
- clearly label uncertainty

### 3. Solving The Wrong Problem

Failure mode:

- the agent optimizes for an inferred task instead of the user's actual goal

Countermeasure:

- preserve the latest user intent exactly
- re-anchor on the current request before large changes
- prefer outcome over elaborate implementation

### 4. Over-Refactoring

Failure mode:

- the agent turns a narrow fix into a broad cleanup or redesign

Countermeasure:

- apply minimal-change bias
- keep unrelated cleanup separate
- ask before expanding scope

### 5. Incomplete Verification

Failure mode:

- the agent stops after editing code and treats that as done

Countermeasure:

- require relevant tests, typechecks, build checks, or reproduction steps
- explicitly say what was not verified

### 6. Losing Constraints Mid-Task

Failure mode:

- the agent forgets earlier restrictions such as no new dependencies, no destructive git, or keep changes small

Countermeasure:

- restate important constraints in durable memory or compact summaries
- preserve constraints alongside the next step

### 7. Context Bloat

Failure mode:

- too much low-value context crowds out what actually matters

Countermeasure:

- compact aggressively but safely
- keep decisions, blockers, and next actions
- drop repetitive narration and re-fetchable output

### 8. Repeating Work

Failure mode:

- the agent re-reads, re-searches, or re-implements things already resolved

Countermeasure:

- keep short durable summaries
- preserve decisions and prior findings
- reuse existing utilities and prior investigation

### 9. Unsafe Autonomy

Failure mode:

- the agent takes destructive, expensive, or irreversible actions without a pause

Countermeasure:

- ask before high-risk actions
- avoid destructive commands unless explicitly requested
- treat external spend and data changes as approval boundaries

### 10. Poor Handoff

Failure mode:

- the work is technically done, but the next person cannot tell what changed or what remains

Countermeasure:

- summarize what changed
- summarize how it was verified
- mention remaining risks
- state the exact next step when unfinished

## Practical Safeguard

Before concluding a task, ask:

1. Did I inspect the real source?
2. Did I preserve the user's latest intent?
3. Did I keep the scope tight?
4. Did I verify the result?
5. Could another human or agent resume from my summary?

If any answer is no, the task is probably not finished cleanly.

## Universal Skill Categories

These skill categories are useful in almost any project. Even if your project does not formalize them, awareness of each improves decision-making and reduces failure modes.

### Debugging

Standard loop: reproduce -> localize -> hypothesize -> test -> verify.

- Know how to isolate a problem to a specific component or code path
- Distinguish between fixing a symptom and fixing the root cause
- Test minimal fixes before committing to broad changes

### Verification

Rules for when to run tests, typechecks, builds, smoke tests, and how to report unverified areas.

- Distinguish `implemented` from `verified`
- Run the smallest relevant verification first, expand only if needed
- Clearly label what was and was not tested or verified before handoff

### Code Review

Review for correctness, regressions, risk, missing tests, and maintainability.

- Spot common patterns that could mask bugs
- Check for missing tests or error handling
- Verify that new code follows established patterns

### Planning

How to break work into minimal safe steps before large changes.

- Identify high-risk areas that need extra care
- Separate unrelated changes to reduce blast radius
- Plan verification step by step, not after the fact

### Refactoring Discipline

How to improve code without expanding scope or damaging behavior.

- Avoid mixing cleanup with feature work
- Preserve behavior while changing structure
- Keep changes small and reversible

### Documentation Hygiene

When to update README.md, comments, migration notes, and examples.

- Update docs when setup, commands, or user-visible workflow changes
- Keep comments tied to why decisions were made, not what the code does
- Record migration steps when changing interfaces or config

### Git Hygiene

Commit boundaries, branch safety, handling dirty worktrees, and non-destructive behavior.

- Keep commits focused and reversible
- Separate unrelated fixes and cleanup
- Never overwrite unrelated changes
- Note if the worktree was dirty before your change

### Security Hygiene

Secrets, credentials, production data, unsafe commands, and external network caution.

- Never commit or normalize unsafe secret handling
- Redact sensitive values in logs and summaries
- Treat production data and personal data with explicit care
- Be cautious with commands that could expose or delete data

### Performance Awareness

Watch for repeated work, N+1 patterns, heavy startup paths, and over-fetching.

- Spot inefficient patterns that could scale poorly
- Recognize when work is repeated unnecessarily
- Consider cache efficiency and load time implications

### Handoff

How to leave summaries another human or agent can resume from quickly.

- State what changed, how it was verified, and what remains
- Preserve constraints and unresolved blockers
- Include the exact next step
- Compact aggressively but safely

### Dependency Discipline

When not to add packages, and how to justify new dependencies.

- Prefer built-in platform features when sufficient
- Challenge new dependencies: what is the cost vs. benefit?
- Check whether new dependencies need updates to docs, tests, CI, or migrations

### Prompting Discipline

A reusable structure for goal, context, constraints, success criteria, and output format.

Good prompts contain:

- **Goal**: exact outcome
- **Context**: relevant files, repo, or system behavior
- **Constraints**: style, scope, risk, dependency, git, budget, time
- **Process**: inspect first, make minimal changes, verify before concluding
- **Output**: short summary of changes, verification, and remaining risks

## Universal Patterns From Production Codebases

The following patterns come from successful production systems and can be adapted to almost any project.

### Issue Triage And Lifecycle Management

Structured issue triage prevents drift and keeps backlogs actionable.

Key patterns:

- Lifecycle labels such as `needs-repro` and `needs-info` should be applied automatically when critical information is missing.
- Categorize first using labels like bug, enhancement, question, or invalid before engineering investment.
- Do not require traditional reproduction steps when the issue is about model or agent behavior and examples are sufficient.
- `needs-info` means the community must provide missing details, not that engineering should investigate.
- Prefer automation over manual triage when possible.

Benefits:

- prevents issues from lingering in undefined states
- makes blocking signals explicit
- reduces evergreen backlogs

### Multi-Agent Code Review With Confidence Scoring

High-confidence reviews reduce false positives.

Pattern:

1. Launch multiple specialized agents in parallel, each reviewing the same change from different angles:
   - compliance
   - correctness
   - history
   - comments and clarity
2. Each agent independently scores findings on a 0-100 confidence scale.
3. Keep only issues at or above a high-confidence threshold.
4. Combine and deduplicate findings.

Why this works:

- parallel agents catch different categories
- independent scoring prevents groupthink
- confidence thresholds reduce speculation and noise

### Structured Feature Development Workflow

Feature work is most efficient with explicit phases:

1. Discovery: clarify the feature, constraints, and success criteria
2. Codebase exploration: find similar features and architecture patterns
3. Clarifying questions: identify ambiguities such as edge cases or backward compatibility
4. Architecture design: design the solution with reference to found patterns
5. Implementation: write code following established patterns
6. Quality review: test, check regressions, verify edge cases
7. Integration and handoff: merge and document for future maintainers

Key insight:

- Do not skip phases.
- Jumping to implementation usually costs more time due to rework.

### Security Hooks: Proactive Issue Prevention

Monitor for common errors before they ship.

Pattern:

- Warn about command injection in shell inputs.
- Warn about cross-site scripting from unescaped HTML.
- Warn about dangerous stdlib usage such as `eval`, unsafe pickle loads, or unvalidated `os.system`.
- Warn about hardcoded secrets or credentials.
- Warn about dangerous file operations such as path traversal or symlink attacks.

Implementation:

- Pattern-match code before execution.
- Show warnings with examples of safe alternatives.
- Allow the user to proceed or fix the issue.

Scope:

- Applies to any codebase where code execution, secrets, or user input are concerns.

### Plugin Architecture For Extensibility

Decoupled plugins enable feature velocity without monolithic core.

Typical structure:

```text
plugin-name/
├── .claude-plugin/
│   └── plugin.json
├── commands/
├── agents/
├── skills/
├── hooks/
└── .mcp.json
```

Key benefits:

- clear ownership boundaries
- removable modules without core changes
- shared skill library prevents duplication
- hooks allow cross-cutting concerns such as security, logging, and UI

Universal adaptation:

- Use one module per domain when a project has distinct concerns such as auth, payments, reporting, or admin tooling.
- Keep shared utilities separate from domain-specific instructions.

### Git Workflow Automation

Automate low-value mechanical work.

Pattern:

- Chain git workflows such as branch creation, add, commit, push, and PR creation in one agent invocation when appropriate.
- Check current status, branch, and diff before mutation.
- Keep destructive git operations out of automation by default.

Benefits:

- fewer steps
- fewer mistakes
- clearer audit trail
- safer defaults

### Bug Report Best Practices

Well-structured bug reports reduce back-and-forth.

Required fields:

1. preflight checklist
2. what's wrong
3. what should happen
4. error messages or logs
5. steps to reproduce
6. model or environment
7. regression check

Why this matters:

- structured templates reduce reporter friction
- they improve automation and triage

### Issue Auto-Deduplication With Verification

Automated duplicate detection prevents noise and fragmentation.

Workflow:

1. Check whether the issue is already closed or too vague to act on.
2. Summarize the issue.
3. Search for duplicates using multiple query variants.
4. Filter false positives.
5. Comment only when confidence is high.

Why parallel lines work:

- different keywords catch different wording
- filters reduce noise
- human-in-the-loop prevents low-confidence spam

## Practical Safeguard

Before concluding a task, ask:

1. Did I inspect the real source?
2. Did I preserve the user's latest intent?
3. Did I keep the scope tight?
4. Did I verify the result?
5. Could another human or agent resume from my summary?

If any answer is no, the task is probably not finished cleanly.

## Interactive Token Discipline
## Token Survival Habits

These habits apply by default in long interactive coding work.

### 1. Prefer prompt replacement over correction chains
If the task was misunderstood and little real progress was made:
- prefer rewriting the request cleanly
- avoid stacking multiple corrective follow-ups
- if needed, restate the goal once in a cleaner scoped prompt

### 2. Fresh session after context inflation
Default triggers:
- 15-20 substantial turns
- project switch
- phase switch
- after a long debugging or exploratory branch
- after too many repeated references to old context

Before restarting:
- create a compact handoff
- preserve only the active goal, key constraints, verified facts, changed files, blockers, and exact next step

### 3. Batch related questions when risk is low
If multiple asks belong to one narrow task:
- combine them into one scoped request
- avoid splitting them into many tiny follow-ups

Exception:
- visual UI work
- ambiguous architecture work
- risky refactors
These should still be split into sequential units.

### 4. Reuse recurring files and stable docs
If the same long docs, specs, or guides are reused:
- prefer project-level memory, persistent local docs, or compact summary files
- avoid repasting the same large content
- reopen only the specific part needed for the current task

### 5. Default to the cheapest sufficient model
Use:
- cheaper/smaller model for formatting, summarization, light cleanup, naming, restructuring, and simple text transforms
- coding-focused mid-tier model for implementation and debugging
- strongest model only for high ambiguity, architecture, or difficult reasoning

### 6. Disable expensive extras unless required
Do not use by default:
- web search
- external tools
- broad scans
- deep reasoning mode
- unnecessary terminal-heavy exploration

Use them only when the task truly needs them.

### 7. Summaries beat raw logs
For large outputs:
- summarize instead of carrying raw logs
- keep only evidence, blockers, and next step
- store long outputs in files when needed instead of dragging them through the session

### 8. One active project per thread
Do not mix unrelated projects in one long thread.
When switching projects:
- compact first
- start fresh
- carry only the minimum useful state
