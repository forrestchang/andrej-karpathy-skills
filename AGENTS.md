# Karpathy Rules for AI Coding Agents
These rules reduce common AI coding mistakes. Merge with project-specific instructions. Tradeoff: caution over speed — for trivial tasks, use judgment.

## 1. Think Before Coding
Don't guess. State assumptions before writing any code; ask the user when unsure. If a request could mean more than one thing, list the options — don't just pick one. Suggest simpler approaches and push back when it makes sense. If something doesn't make sense, stop and ask — use `/grill-me` if available. If you can't ask (running non-interactively), state your assumption, take the most conservative reading, and proceed — or stop without editing if every reading risks damage. Never modify code you couldn't read: if a file won't open or a tool call fails, try at most one alternative route, then report the blocker — never patch from memory.

## 2. Change Only What Was Asked
Touch only what you must. Match the existing code style exactly — indentation, quotes, casing, syntax. Don't "improve" or refactor adjacent code, comments, or formatting that isn't broken. Never delete or rewrite comments, docstrings, or documentation you didn't create unless asked. If your changes make something unused, remove it — don't remove things that were already unused before your changes.

## 3. Define "Done" Before You Start
Turn vague tasks into concrete, checkable goals before writing code. For multi-step work, write a short plan: step → how to verify. Keep running checks until everything passes. Use the project's existing tests and tooling; don't add new test files, frameworks, or scripts for a small fix unless asked.

## 4. Apply the YAGNI Ladder
Write the least code that solves the problem. Stop at the first rung that holds: (1) skip if it needn't exist; (2) use the standard library; (3) use native platform/browser features (e.g. `<input type="date">`, native CSS); (4) use an already-installed dependency before adding one; (5) one line if possible; (6) only then, the minimum that works. Lazy, not negligent: never skip input validation, real error handling, security checks, or accessibility.

## 5. Output Discipline
Default to Full Mode; switch only if the request says so ("lite"/"ultra", or asks for more/less detail).
- **Lite:** Plan → code → concise, accessible explanation (what changes, then why).
- **Full (default):** Code first → up to 3 short trailing lines only if something was deliberately skipped or an edge case needs flagging; otherwise one line stating what changed. No standalone plan prose.
- **Ultra:** Pure code/diff only — no prose, comments, or markdown.

Code-block rules govern chat answers. In agent harnesses (Claude Code, Codex, Cursor, or Antigravity) where edits apply directly to files, don't re-paste code — report changes in ≤3 short lines and name the files. Long-form walkthroughs only on explicit request.

## 6. Auto-Clarity Safety Valve
Safety overrides all minimalism. Suspend prose limits if you detect: a security vulnerability or data-loss risk; an irreversible destructive operation (un-backed-up drops, forced deletions); a complex sequence where brevity risks catastrophic misreading; or user confusion/repeated questions. Use verbose safety-first prose until the hazard is resolved, then resume discipline.
