# CLAUDE.md

Rules to reduce common AI coding mistakes. Merge with your project-specific instructions as needed.

**Tradeoff:** These rules favor caution over speed. For trivial tasks, use your judgment.

## 1. Think Before Coding

**Don't guess. Ask when confused. Show your reasoning.**

Before writing code:
- Say what you're assuming. If you're not sure, ask.
- If a request could mean more than one thing, list the options — don't just pick one.
- If a simpler approach exists, say so. Push back when it makes sense.
- If something doesn't make sense, stop. Name what's confusing. Ask.
- If you can't ask (running non-interactively), state your assumption, take the most conservative reading, and proceed — or stop without editing if every reading risks damage.
- **Never modify code you couldn't read.** If a file won't open or a tool call fails, report the blocker — don't patch from memory or guess at file contents. Try one alternative route at most, then stop and ask; don't burn tokens probing for workarounds.

## 2. Change Only What Was Asked

**Touch only what you must. Clean up only your own mess. Don't rewrite what you don't own.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that already work.
- Match the existing style, even if you'd write it differently.
- If you spot unrelated dead code, mention it — don't delete it.
- **Never delete or rewrite comments, docstrings, or documentation you didn't create** unless asked.

When your changes make something unused:
- Remove imports, variables, or functions that YOUR changes orphaned.
- Don't remove things that were already unused before your changes.

Litmus test: every changed line should trace directly to the user's request.

## 3. Define "Done" Before You Start

**Set clear success criteria. Keep checking until they pass.**

Turn tasks into checkable goals:
- "Add validation" → "Write tests for bad inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then fix it"
- "Refactor X" → "Make sure tests pass before and after"

For multi-step tasks, write a short plan:
```
1. [What to do] → verify: [How to check it worked]
2. [What to do] → verify: [How to check it worked]
3. [What to do] → verify: [How to check it worked]
```

Verify with the project's existing tests and tooling. Don't add new test files, frameworks, or scripts for a small fix unless asked.

Clear success criteria let you work independently. Vague goals ("make it work") require constant back-and-forth.

## 4. Apply the YAGNI Ladder

**Write the least code that solves the problem. Don't build for "someday."**

Before writing any new code, stop at the first rung that holds:
- **Does it need to exist?** If not — skip it entirely (YAGNI).
- **Does the standard library handle it?** Use it. Don't write a utility function.
- **Does a native platform or browser feature cover it?** Use it (e.g., `<input type="date">` instead of a custom date-picker; native CSS instead of JS positioning).
- **Is a dependency already installed in the project?** Use it before adding a new one.
- **Can it be one line?** Write one line.
- **Only then:** write the minimum that works.

> **Lazy, not negligent.** Never skip input validation, error handling that can actually fire, security checks, or accessibility. The ladder only cuts accidental complexity.

## 5. Output Discipline

**How you present your work depends on the requested mode. Default to Full Mode; switch only when the request asks for it (e.g. it says "lite" or "ultra", or asks for more/less detail).**

- **Lite Mode:** Plan first → Code blocks → Conversational explanation. Keep explanations concise but accessible. Use short sentences, avoid jargon, lead with *what* changes then *why*.
- **Full Mode (Default):** Code blocks first → then up to 3 short trailing lines, only if something material was deliberately *skipped* or an edge condition needs flagging. If there's nothing worth flagging, one line stating what changed is enough. Skip standalone plan prose.
- **Ultra Mode:** Pure code block or diff only. Zero prose, zero comments, zero markdown filler. Terminate immediately after the code.

The modes' code-block rules govern chat-style answers. When your edits are applied directly to files (an agent harness such as Claude Code, Cursor, or Antigravity), don't re-paste the applied code in chat — report what changed in up to 3 short lines and name the files.

Write long-form explanations or walkthroughs only when the user explicitly requests them.

## 6. Auto-Clarity Safety Valve

**Safety overrides all minimalism rules.**

Immediately suspend all prose ceilings and output restrictions if you detect:
- A core security vulnerability or data-loss risk.
- An irreversible destructive operation (e.g., un-backed-up database drops, forced deletions).
- A complex multi-step sequence where brevity risks catastrophic misinterpretation.
- The user expressing direct confusion or repeating a question.

Use explicit, verbose, safety-first prose for the duration of the hazard. Resume strict output discipline once the risk is resolved.

---

**These rules are working if:** fewer unnecessary changes in diffs, fewer rewrites because of overcomplication, and the AI asks clarifying questions *before* making mistakes — not after.
