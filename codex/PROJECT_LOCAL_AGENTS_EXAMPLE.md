# Project-Local Codex Guidance Example

This file is an example project-local `AGENTS.md` for a specific repository.
It overrides global guidance where this repo needs stronger local rules.
Keep scope tight. Reuse the global defaults from `C:\Users\HP\.codex\AGENTS.md`.

## Project Scope

Repository focus:

- static or light-JS frontend for current project reading experience
- reader and overlay behavior
- data generation scripts for current project content
- docs and philology workflows
- GitHub Pages style deployment

Primary user priorities for this repo:

1. small visible improvements with minimal token burn
2. strong mobile readability
3. preserve content integrity
4. no random redesigns
5. no broad rescans between small UI tasks

## Repo Areas

Top-level areas and default intent:

- `index.html`, `app.js`, `styles.css`
  - main site shell
  - default target for UI fixes
- `read/`
  - reader UI and vendor-integrated reading flow
- `docs/`
  - generated or published data and reader assets
- `scripts/`
  - build, enrichment, extraction, and data pipeline scripts
- `data/`
  - source and generated data
- `MD/`
  - research notes, workflow docs, philology docs, instructions

## Local Priority Rules

When working in this repo, use this precedence:

1. direct user instruction
2. nearest deeper `AGENTS.md` in a subfolder if one exists
3. this project file
4. global `C:\Users\HP\.codex\AGENTS.md`

If a rule conflicts, prefer the narrower local rule for this repo.

## current project Default Modes

### 1. UI Fix Mode

Use for tasks like:

- fix header
- attach navigation to search block
- fix mobile overlap
- fix overlay
- improve one screen
- restyle one component

Rules:

- inspect only the exact screen, component, and styles needed
- default target files are:
  - `index.html`
  - `styles.css`
  - `app.js`
- do not inspect the whole frontend by default
- do not redesign the full site in one pass
- do one coherent visual unit at a time
- stop after completing one unit unless the user explicitly asks to continue

Default file budget for one UI pass:

- preferred: 2 files
- normal maximum: 3 files
- only exceed if clearly justified

### 2. Reader / Overlay Mode

Use for tasks involving:

- PDF reader
- modal or overlay behavior
- double-click interactions
- search shell behavior
- mobile reader controls

Rules:

- inspect only files directly tied to reader behavior
- prefer fixing behavior in place instead of restructuring the reader
- do not touch unrelated data files or scripts
- verify open, close, touch behavior, and visible mobile placement
- separate behavior fixes from theme or visual redesign if possible

### 3. Data / Script Mode

Use for tasks involving:

- section generation
- couplet enrichment
- glossary generation
- first 100 pages workflows
- build or backfill scripts

Rules:

- inspect only the relevant script and immediate inputs or outputs
- do not read all scripts in `scripts/`
- do not refactor the whole pipeline during a narrow task
- preserve data format compatibility
- mention exactly which artifacts may need regeneration

### 4. Documentation / Workflow Mode

Use for tasks involving:

- philology notes
- workflow docs
- README updates
- instruction files
- schema examples

Rules:

- prefer editing the closest relevant markdown file
- do not rewrite all docs when only one workflow changed
- preserve terminology, transliteration, and language distinctions
- keep documentation aligned with actual scripts and files

## Hard Token-Saving Rules For 

These are mandatory for this repo.

### 1. Never Execute The Whole current project UI Wishlist In One Pass

Requests like:

- improve the UI
- implement prompt-fix
- fix all screenshots
- modernize the frontend

must be narrowed into one of these units first:

- header/search block
- mobile metadata overlap
- one overlay
- one card group
- one theme task
- one text styling issue

### 2. One Screenshot Cluster = One Task

If the user has several screenshots with several issues:

- pick one issue cluster
- fix that cluster only
- summarize what changed
- stop

### 3. Theme Work Must Be Last

Do not introduce or expand a theme system while basic layout, spacing, or overlay issues are still unresolved, unless the user explicitly prioritizes the theme first.

Theme changes are expensive and visually subjective.
Default rule: finish structure first, theme later.

### 4. Do Not Scan Unrelated Content Repos For UI Tasks

For UI tasks, do not inspect by default:

- `data/book/`
- `data/couplet_sections/`
- `docs/data/book/`
- large JSON corpora
- philology notes
- ingestion or enrichment scripts

unless the issue explicitly depends on them.

### 5. Preserve Content Integrity

Do not casually alter:

- original text
- line order
- verse numbering
- philology content
- glossary semantics
- transliteration conventions

unless the user explicitly asks for content editing.

### 6. Prefer Existing Hooks And Classes

For frontend work:

- reuse existing classes, variables, and layout patterns
- avoid adding many one-off selectors
- avoid random decorative additions
- unify repeated button or card behavior through existing style structure when possible

### 7. Visual Effect Must Be Easy To Verify

For UI tasks, always summarize in this format:

- target block
- files changed
- visible expected effect
- what to verify on mobile
- what to verify on desktop

If the change is not visually obvious, explain exactly where to look.

## current project UI Acceptance Standard

When changing UI, optimize for:

- readable mobile layout
- compact but premium composition
- clean text rendering
- consistent button language
- stable overlay behavior
- no overlap of counters, labels, or controls
- no random decorative noise
- no generic SaaS look
- minimal but meaningful motion

Unless the user explicitly asks otherwise, do not:

- introduce a full redesign
- add extra libraries
- add many animations
- split the first screen into too many visual blocks

## Default UI Prompt Handling

If the user gives a broad front-end request, convert it internally into this structure before acting:

1. exact target block
2. exact files to inspect
3. acceptance criteria
4. minimal patch plan
5. implementation
6. minimal verification
7. short handoff

## Default Output Format For This Repo

For implementation work in this repository, keep answers short and practical.

Use:

1. Scope
2. Files changed or inspected
3. What was changed
4. How it was verified
5. What to check visually next

Avoid long essays unless the user asks for them.

## Verification Rules For This Repo

### Frontend

For `index.html`, `styles.css`, `app.js`, `read/`, or reader-related work:

- verify syntax first
- verify no obvious selector or event mismatch
- say clearly if visual verification is still manual
- distinguish implemented from visually confirmed

### Scripts

For `scripts/` work:

- run the smallest relevant check first
- avoid full pipeline runs unless needed
- state what data output would need regeneration
- do not claim full pipeline correctness without verification

### Docs

For `MD/`, `README.md`, workflow docs:

- verify filenames, commands, and paths against the repo
- preserve existing local terminology

## Git And Change Boundaries

In this repo:

- do not auto-push unless explicitly asked
- do not claim something is pushed unless it was actually pushed
- keep commits focused by task cluster
- for UI work, one commit per visual unit is preferred
- do not mix script/data changes with front-end polish unless required

## AI Tool Session Ledger And Local Checkpoints

Purpose: every AI-assisted task in this repository must leave a recoverable local trail, so long Codex, Claude Code, ChatGPT agent, Gemini Code Assist, or other AI-tool chats can be reconstructed even if the UI freezes, opens blank, loses history, or shows only a partial task.

This rule applies to all AI tools working in this repository.

### 1. Mandatory session ledger

For every user request handled by an AI tool, create or append a local session ledger.

Default location:

```text
MD/AI_SESSIONS/YYYY-MM-DD.md
```

If `MD/AI_SESSIONS/` does not exist, create it.

At the start of every user request, append:

```text
## HH:MM - <short task title>

### User request
<exact user request if short, or concise summary if long>

### AI tool
- tool: Codex / Claude Code / Gemini Code Assist / ChatGPT agent / other
- model or mode, if visible:
- workspace:
- branch:
- HEAD:
- git status --short:
```

At the end of every user request, append:

```text
### Assistant response summary
- answer given:
- files inspected:
- files changed:
- commands run:
- checks run:
- errors/warnings:
- unresolved issues:
- next micro-step:
```

Do not rely only on the AI chat UI as the source of truth.

### 2. Command and output logging

Before running any shell command, append the command to the ledger.

Use this format:

````text
### Command
```powershell
<exact command>
```
````

After the command finishes, append:

```text
### Command result
- exit code:
- short result:
- output saved to:
```

If output is longer than 80 lines, save raw output separately instead of dumping it into the ledger.

Default raw log folder:

```text
reports/ai_sessions/YYYY-MM-DD/
```

Default raw log file:

```text
reports/ai_sessions/YYYY-MM-DD/HHMMSS-<short-slug>.log
```

The ledger should link to that raw log.

### 3. Changed data snapshot

When an AI tool changes files, append a compact changed-data snapshot:

```powershell
git status --short --untracked-files=all
git diff --stat
git diff --name-status
```

Save large diffs as files:

```text
reports/ai_sessions/YYYY-MM-DD/HHMMSS-<short-slug>.diff
```

Do not paste huge diffs into the chat or ledger unless the user explicitly asks.

### 4. Local checkpoint commits

After every coherent implementation unit that changes project files, create a local checkpoint commit unless the user explicitly says not to commit.

Important:

- checkpoint commits are local safety points
- do not push checkpoint commits unless the user explicitly asks to push
- keep each checkpoint focused
- do not mix unrelated UI, data, script, and docs changes
- do not commit secrets
- do not commit files over 50 MB without explicit review
- do not commit large generated artifacts blindly

Recommended flow:

```powershell
git status --short --untracked-files=all
git diff --stat
git add -A
git commit -m "checkpoint(ai): <short task summary>"
```

If the working tree contains unrelated changes, do not make a mixed commit. Instead create a patch checkpoint:

```powershell
mkdir reports\ai_sessions -Force
git status --short --untracked-files=all > reports\ai_sessions\status-before-<short-slug>.txt
git diff > reports\ai_sessions\patch-before-<short-slug>.diff
```

### 5. Backup branch before risky work

Before any risky data, deployment, Git, or bulk-generation work, create a backup branch:

```powershell
git branch backup-before-<short-slug>-YYYYMMDD-HHMMSS
```

Use backup branches especially for:

- PDF extraction or reader section regeneration
- mass JSON updates
- GitHub Pages deployment fixes
- service worker/cache changes
- root vs docs synchronization
- large UI restructuring
- reverting or re-applying commits

### 6. AI turn log template

For quick copy/paste, use this template in `MD/AI_SESSIONS/YYYY-MM-DD.md`:

```md
## HH:MM - <task>

### User request
...

### Starting state
- tool:
- branch:
- HEAD:
- git status:

### Plan
1.
2.
3.

### Commands
- command:
- result:
- raw log:

### Files changed
- ...

### Verification
- ...

### Local checkpoint
- commit created: yes/no
- commit hash:
- pushed: no, unless explicitly requested

### Assistant response summary
...
```

### 7. Secret redaction

Never write secrets into AI session logs, commits, patches, or reports.

Always redact:

```text
API keys
GitHub tokens
cookies
session tokens
SSH private keys
VPS passwords
database passwords
OAuth secrets
personal identity numbers
payment data
private emails if not needed for the task
```

Use:

```text
[REDACTED]
```

### 8. No silent long-running AI work

An AI tool must not silently perform a long multi-step task without updating the local ledger.

For long tasks, append a progress checkpoint after each stage:

```text
1. inspection
2. plan
3. implementation
4. verification
5. local checkpoint commit or patch checkpoint
6. final answer summary
```

If the task lasts more than one visible step, the ledger must make it possible to reconstruct what happened without opening the AI chat.

### 9. GitHub Pages and reader data rule

When work touches current project reader data or deployment, the ledger must explicitly record:

```text
- whether GitHub Pages deploys root, docs, or artifact
- which index.html/app.js/styles.css were changed
- whether root and docs versions differ
- whether data/reader and docs/data/reader are synced
- section count
- manifest/search-index status
- max section id
- missing section ids or gaps
- cache-buster version
- service worker cache version
- local URL used for verification
- published URL checked, if any
```

### 10. Required final checkpoint line

At the end of every implementation answer, include a compact checkpoint line:

```text
Checkpoint:
- log updated: yes/no
- local checkpoint commit: yes/no
- commit hash:
- pushed: yes/no, only if explicitly requested
```

If the AI tool cannot write the ledger or create a checkpoint, it must say so clearly and provide the exact text that should be pasted manually into:

```text
MD/AI_SESSIONS/YYYY-MM-DD.md
```

### 11. Push rule remains unchanged

This session logging rule does not give permission to push.

The existing project rule still applies:

```text
do not auto-push unless explicitly asked
```

Local checkpoint commits are allowed for recovery. Remote push is allowed only after the user explicitly asks for push.

## Recommended Local Compaction For current project

When a current project session gets long, create or refresh a compact state file such as:

- `MD/CURRENT_COMPACTION.md`

Use it to preserve:

- current UI issue or workflow task
- files touched
- accepted visual direction
- unresolved issues
- exact next micro-task

Do not dump raw logs or long narrative history into it.

## Suggested Deeper Local Files

If this repo keeps growing, optional nested `AGENTS.md` files can be added later:

- `scripts/AGENTS.md`
  - only if script/pipeline rules need to differ strongly
- `read/AGENTS.md`
  - only if reader behavior becomes significantly more specialized
- `MD/AGENTS.md`
  - only for markdown workflow, philology, and documentation subtrees

Do not create extra local `AGENTS.md` files unless the subtree truly needs different rules.

## Practical Safeguard For This Repo

Before finishing any current project task, ask:

1. Did I change only the files needed?
2. Is this one coherent unit of work?
3. Did I avoid scanning unrelated current project content?
4. Is the visible result clear enough to verify quickly?
5. Did I preserve the text and data integrity?

If any answer is no, tighten scope before proceeding.

## current project Interactive Cost Rules
## current project Session Discipline

### 1. One screenshot cluster per pass
If the user provides many screenshots or many UI complaints:
- select one screenshot cluster
- fix one visual unit only
- summarize expected visible effect
- stop

### 2. One visible result per implementation pass
Every UI pass should produce one clearly checkable result, for example:
- header and search block alignment
- one overlay cleanup
- one mobile overlap fix
- one card group normalization
- one text rendering fix

Do not spread effort across many tiny invisible adjustments in one pass.

### 3. Rewrite vague UI follow-ups into precise tasks
If feedback is vague, such as:
- not good
- still strange
- nothing changed
- do it better

convert it internally into:
1. exact target block
2. exact defect
3. files to inspect
4. acceptance criteria
5. minimal patch

### 4. Visual verification is mandatory after each major UI pass
For every UI change, always state:
- where to look
- what should look different
- what to check on mobile
- what to check on desktop
- whether the effect is structural, visual, or behavioral

### 5. Do not expand into theme work too early
Theme, art direction, ornamental styling, and premium visual language are allowed only after:
- spacing is stable
- mobile overlap is fixed
- overlays behave correctly
- core buttons and layout are coherent

### 6. Separate UI from content and pipeline work
When the task is UI-only:
- do not inspect large JSON corpora
- do not inspect philology notes
- do not inspect generation scripts
unless the current issue explicitly depends on them

### 7. Create short handoff after each major current project milestone
Recommended handoff file:
- `MD/CURRENT_COMPACTION.md`

After each major pass, record:
- current target
- files changed
- visible result
- remaining issue
- exact next micro-task
