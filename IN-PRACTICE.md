# In Practice

What the four principles turned into after being adopted as mandatory rules in a
real codebase — a multi-tenant TypeScript service with a web client, worked on by
two agents at once.

Nothing here replaces the four principles. Three of them were kept close to
verbatim. What follows is the delta: one dimension that was missing entirely, and
three places where the wording was not sharp enough to change behaviour under
pressure.

Each item is followed by the incident that put it there. They are small and
unglamorous, which is the point — these are not exotic failures.

---

## The missing dimension: Verification Is Not Optional

> A claim of done is only valid if the check was really executed and its output
> seen. If a test, build or deploy was skipped, say which and why. Failing output
> gets reported as failing — never summarized as progress.

Principle 4 says to define success criteria and loop until verified. It does not
say what to do at the moment you *report*. That gap is where "should be fine",
"tests pass" and "this is now done" come from — sentences that describe an
intention rather than an observation.

**The incident.** A verification command was run as part of a chain:

```bash
npm run lint && npx tsc --noEmit | head -5 && git commit ...
```

`tsc` ran from the repository root, where there is no `tsconfig.json`. It printed
its own help text, exited **0**, and the chain continued to the commit. Every
signal said success. The typecheck had not run at all.

The rule is what caught it: "output seen" is not "exit code was zero". Re-running
it properly, per workspace, is a ten-second cost. Trusting the green would have
put an unverified claim into a report.

**A second shape of the same thing.** A full suite came back with 10 failures in
files that a concurrent agent was actively editing. The tempting sentence is
"those aren't mine". The rule does not allow it: proving it took a throwaway
`git worktree` at `HEAD`, where the same tests passed. Two minutes to turn an
assertion into evidence.

---

## Sharpening 1 — say what you did *not* check

> Report what you actually checked, and say plainly what you did not check.
> "I looked at 6 of 20 and the rest are probably similar" must be written as
> exactly that, never as a conclusion about all 20.

Principle 1 covers assumptions about the *task*. This covers assumptions about
your own *coverage*, which are easier to make and harder to notice. An LLM that
has read 6 files of 20 will summarise as though it read 20, not from dishonesty
but because the summary reads better.

**The incident.** A security audit of the same codebase read every backend route
file, and only sampled the frontend. The finding list was strong on the backend
and thin on the client — not because the client was clean, but because it had
barely been looked at. The report had to say so in those words, with the file
names that were read and the ones that were not. Without that sentence the reader
would reasonably conclude the client had been cleared.

An unstated assumption presented as a finding is a defect, even when it happens
to be right.

---

## Sharpening 2 — the reproduction test must fail *first*

Principle 4 already says:

> "Fix the bug" → "Write a test that reproduces it, then make it pass"

In practice that is read as "write a test, then fix, then see green" — and green
at the end proves nothing on its own. The rule needs one more clause:

> "fix the bug" → write a test that reproduces it **and fails on current code**,
> then fix

**Why it matters.** An authorization hole sat in a continuously-green CI: any
account could remove members from an organisation it had no part in. The tests
for that endpoint asserted `200` for the happy path and `401` without a token —
and never `403`. Adding the missing check would have left the suite exactly as
green as before, proving nothing and guarding nothing. Only a test written to
fail first shows that the hole was real and that it is now closed.

**The part that is easy to miss.** The red step does not only validate the fix.
It validates the *test*. A rule was added that the server must refuse to start in
production without a signing secret. The test for it passed immediately — before
any change. The reason: it set the variable to an empty string, while the real
accident is the variable being *absent*. Both look identical in a test body and
behave differently in the code. Without insisting on red first, that test would
have shipped as coverage of a case that was already handled, while the real one
stayed open.

If your new test passes before you write the fix, you have not found a bug —
you have found a bad test.

---

## Sharpening 3 — pre-existing dead code, and how it reconciles

Principle 3 says: *"If you notice unrelated dead code, mention it — don't delete
it."* Correct, but it collides with the standard many repositories set for
themselves ("zero dead code, no unused exports, ever"). Faced with two rules that
appear to contradict, an agent will pick one, usually the one that lets it act.

The reconciliation is worth writing down, because it is not obvious:

> Pre-existing dead code: **do not** delete it inside an unrelated change —
> record it and clean it in a dedicated task. The zero-dead-code rule sets the
> standard for the *repository*; this one keeps an unrelated diff from growing a
> second, unreviewed change inside it.

Two rules, two scopes. One is about the state the codebase should reach; the
other is about what a single diff is allowed to contain.

**Where it bites.** While fixing an authorization check, three route files were
found carrying near-identical copies of an audit-log helper. Extracting them into
one shared helper was tempting, obviously an improvement, and entirely unrelated
to the fix under review. What went in was a fourth call site using a new shared
helper — introduced because the change needed it — with the three older copies
left alone and recorded as their own task. The reviewer of a security fix should
be reading a security fix.

---

## The adapted rule file

The version in use, as one file. It omits "Simplicity First" only because that
codebase covers it in a separate style guide — not because it stopped applying.
Two project-specific references (a code-graph tool and a sibling rules file) are
generalised here.

```markdown
# Working discipline (mandatory)

How to approach a task, as opposed to how to write the code.

## 1. Think before coding — never assume silently

- State assumptions out loud. An unstated assumption presented as a finding is a
  defect, even when it happens to be right.
- If a request has several readings, name them. Do not pick one quietly.
- Say when a simpler approach exists, and push back when the ask looks wrong.
- Report what you actually checked, and say plainly what you did not check.
  "I looked at 6 of 20 and the rest are probably similar" must be written as
  exactly that, never as a conclusion about all 20.

## 2. Surgical changes — every changed line traces to the request

- Do not "improve" adjacent code, comments or formatting while passing through.
- Do not refactor what is not broken; match the surrounding style even where you
  disagree.
- Remove the imports, variables and functions that **your own change** orphaned.
- Pre-existing dead code: **do not** delete it inside an unrelated change —
  record it and clean it in a dedicated task. The zero-dead-code standard applies
  to the repository; this rule keeps an unrelated diff from growing a second,
  unreviewed change inside it.

## 3. Goal-driven execution — define the check before starting

Turn the task into something verifiable, then loop until the check passes:

- "add validation" → write tests for the invalid inputs, then make them pass
- "fix the bug" → write a test that reproduces it **and fails on current code**,
  then fix
- "refactor X" → tests green before and after, and the dependency check for your
  codebase run first

For anything multi-step, state the plan as steps with their checks:

    1. <step> → verify: <the command or observation that proves it>
    2. <step> → verify: <...>

Weak criteria ("make it work") force constant clarification. Strong ones let the
work run to completion unattended.

## 4. Verification is not optional

A claim of done is only valid if the check was really executed and its output
seen. If a test, build or deploy was skipped, say which and why. Failing output
gets reported as failing — never summarized as progress.
```

---

## How to know these are working

The four principles have their own test ("fewer unnecessary changes in diffs,
fewer rewrites, questions before implementation"). These additions have theirs:

- Reports distinguish what was checked from what was assumed, without being asked.
- Bug fixes arrive with a test whose failure was observed before the fix existed.
- A green result is stated together with the command that produced it.
- Diffs under review contain one change, and the improvements noticed along the
  way arrive as their own tasks.
