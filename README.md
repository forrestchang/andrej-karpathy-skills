# Karpathy++ (Think-Before-Code)

> A rule set that helps coding AI agents think like real software engineers:
>
> - Don't guess
> - Don't over-engineer
> - Don't touch unrelated code
> - Don't stop until success is verified

Inspired by Andrej Karpathy's observations on common LLM coding failures.

[English](./README.md) |[Vietnamese](./READMW.vn.md)| [简体中文](./README.zh.md)

Supports:

- Claude Code
- Gemini CLI
- Cursor
- Antigravity
- Cline
- Aider
- Roo Code
- Any coding agent

---

# The Problem

According to Andrej Karpathy:

> Models often make assumptions on behalf of users and continue coding without verification.

> They do not manage uncertainty, ask clarifying questions, or present tradeoffs.

> They tend to overcomplicate code and APIs.

> They sometimes modify or remove unrelated code they do not fully understand.

In real-world development, this leads to:

❌ bloated code  
❌ unnecessary architecture  
❌ dirty diffs  
❌ hidden bugs  
❌ painful code reviews  
❌ wasted engineering time  

---

# The Solution

Karpathy++ solves these problems with four core principles:

| Principle | Solves |
|-----------|--------|
| Think Before Coding | Wrong assumptions, ambiguity |
| Simplicity First | Over-engineering |
| Surgical Changes | Unrelated edits |
| Goal-Driven Execution | Unverified fixes |

---

# 1. Think Before Coding

## Never guess. Understand before implementation.

The AI must:

✅ analyze requirements  
✅ state assumptions explicitly  
✅ identify ambiguity  
✅ ask clarifying questions  
✅ present alternatives  
✅ explain tradeoffs  

Never:

❌ silently choose one interpretation  
❌ pretend confidence when uncertain  
❌ hallucinate APIs  

Example:

Instead of:

"Ok, I'll use MySQL."

Do:

"There are three options:

1. SQLite
2. MySQL
3. File storage

If this is a single server → SQLite is simpler.  
If this is distributed → MySQL is better.

Which direction do you want?"

---

# 2. Simplicity First

## Write the minimum code that solves the problem.

The AI should prefer:

✅ fewer files  
✅ fewer abstractions  
✅ fewer dependencies  
✅ standard libraries first  

Never:

❌ create patterns without need  
❌ introduce single-use abstractions  
❌ add future-proof features  
❌ add configuration nobody asked for  

Principle:

> If 50 lines solve it, don't write 500.

Test:

> Would a senior engineer call this overcomplicated?

If yes → simplify.

---

# 3. Surgical Changes

## Change only what must be changed.

The AI must:

✅ modify only relevant code  
✅ preserve project style  
✅ preserve naming conventions  
✅ clean only what its own changes created  

Never:

❌ refactor unrelated code  
❌ reformat entire files  
❌ rename unrelated variables  
❌ remove existing comments  
❌ delete old dead code unless requested  

Test:

> Every changed line must directly trace back to the user's request.

---

# 4. Goal-Driven Execution

## Don't just do tasks. Define success.

Instead of:

"Fix the bug"

Transform into:

"Write a test that reproduces the bug → make it pass."

Examples:

| Instead of | Transform into |
|------------|----------------|
| Add validation | Write failing validation tests |
| Fix bug | Reproduce with tests, then pass |
| Refactor | Ensure tests pass before and after |

Workflow:

1. Define success criteria
2. Define verification
3. Implement
4. Verify
5. Repeat until success

---

# Debugging Rules

Always debug using:

1. Reproduce
2. Isolate
3. Hypothesize
4. Verify
5. Patch
6. Regression test

Never:

❌ patch blindly  
❌ fix by intuition only  

---

# Security Rules

Never:

❌ hardcode secrets  
❌ expose credentials  
❌ disable validation  
❌ bypass authentication  
❌ disable security checks  

---

# When Uncertain

If confidence < 90%:

Stop.

Ask.

Never hallucinate.

---

# How to Know It's Working

You will notice:

✅ AI asks before coding  
✅ smaller diffs  
✅ fewer rewrites  
✅ less over-engineering  
✅ cleaner pull requests  
✅ easier debugging  

---

# Project-Specific Rules

You can extend with domain rules:

## Minecraft

- Prefer Paper API
- Never block main thread
- Database operations must be async

## Web

- Validate all inputs
- Never trust client-side data

## Automation

- No hardcoded screen coordinates
- Retry + logging required

---

# Core Philosophy

> Don't tell AI what to do.
>
> Tell AI what success looks like.

That is where LLMs become powerful.

---

# License

MIT
