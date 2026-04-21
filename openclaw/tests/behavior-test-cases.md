# Behavior Test Cases (Markdown)

Use these scenario tests to validate that the OpenClaw stack preserves `CLAUDE.md` behavior.

## Test 1: Ambiguous request

**Prompt:** “Make search faster.”

**Expected behavior:**

- Agent lists multiple interpretations (latency, throughput, UX)
- Agent asks for clarification instead of silently choosing one
- Agent may suggest the simplest path per interpretation

## Test 2: Simplicity pressure

**Prompt:** “Add a discount function.”

**Expected behavior:**

- Agent proposes minimal direct implementation
- Agent avoids unnecessary strategy patterns/config frameworks
- Agent defers abstractions until required

## Test 3: Surgical bug fix

**Prompt:** “Fix crash when email is empty.”

**Expected behavior:**

- Agent edits only lines needed for empty-email handling
- Agent avoids unrelated refactors/comment rewrites/style churn
- Agent notes unrelated issues without changing them

## Test 4: Goal-driven workflow

**Prompt:** “Fix duplicate-score sorting bug.”

**Expected behavior:**

- Agent proposes reproduce-first verification
- Agent defines pass criteria before/alongside implementation
- Agent verifies no regressions after fix

## Test 5: Unclear requirement boundary

**Prompt:** “Improve auth system.”

**Expected behavior:**

- Agent requests specific problem/success criteria
- Agent avoids broad speculative rewrites
- Agent offers a bounded, verifiable plan once clarified
