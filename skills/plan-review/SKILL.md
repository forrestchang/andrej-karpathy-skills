---
name: plan-review
description: Use when reviewing or executing plans, complex multi-step tasks, code or handoff reviews, plan mode, multi-file changes, ID/reference changes, or tasks that need plan review before execution.
---

# Plan Review — Five-Agent Objective-Aligned Loop

Core principle: **the task total goal is the single source of truth**. Every agent receives the same task goal, success criteria, scope boundaries, and permission boundaries before doing any work. The skill runs a five-agent loop: Task Recognition Agent / 任务识别 Agent, Supervisor Agent / 监督 Agent, Plan Agent / 方案 Agent, Review Agent / 审查 Agent, and Execution Agent / 执行 Agent.

The agents share the same capability base, but not the same responsibilities. Every agent may call relevant superpower skills, must understand `karpathy-guidelines`, must apply Karpathy thinking, and must understand this skill's P0/P1/P2, convergence, grep verification, reread, and failure-recovery rules.

## 1. Trigger Cases

Use this skill when any of these are true:

- The system is in plan mode, the user writes a plan, or the user asks for `Karpathy review`.
- The task is multi-step, multi-file, or changes IDs, schemas, paths, references, handoff contracts, or control rules.
- A plan, implementation route, code review, handoff, or execution sequence needs risk review before execution.
- The task has implicit requirements, unclear success criteria, permission boundaries, or high risk of drifting from the user's real goal.

Simple tasks still pass through the task goal and review gates, but the plan can be compact.

## 2. Shared Task Envelope / 共享任务信封

Before starting any agent, the Supervisor Agent must pass a shared task envelope. If any agent does not receive it, that agent stops and asks the Supervisor Agent to resend it.

Required fields:

```text
Task total goal:
Success criteria:
Scope boundaries:
Permission and capability boundaries:
Source context and evidence:
Current round state:
Previous review findings:
```

Every agent output must start with a short `Goal alignment` statement explaining how its work relates to the task total goal. Missing goal alignment is at least P1; if it could cause wrong execution, it is P0.

## 3. All-Agent Capability Base / 全员能力底座

Every agent has these capabilities and obligations:

1. **Superpower skill access** — Each agent may call the most relevant superpower skill for its own responsibility, such as `brainstorming`, `systematic-debugging`, `test-driven-development`, `source-quality-review`, `closure-knowledge-distillation`, or another matching skill.
2. **Karpathy guidelines access** — Each agent must apply `karpathy-guidelines`: Think Before Coding, Simplicity First, Surgical Changes, and Goal-Driven Execution.
3. **Plan review access** — Each agent must understand this skill's role boundaries, P0/P1/P2 taxonomy, convergence gates, grep-able verification, reread-before-edit rule, and failure-recovery loop.
4. **Task total goal awareness** — Each agent must know and reference the task total goal. Any output that cannot be traced to the task total goal is invalid.
5. **Role discipline** — Shared capability does not erase role boundaries. An agent may use skills to improve its own job, but must not perform another agent's job.

## 4. Core Flow

```text
User input
  ↓
Task Recognition Agent / 任务识别 Agent
  - reads all received information
  - converts it into the task total goal
  - defines success, scope, and permission boundaries
  ↓
Shared Task Envelope
  - passed to every later agent
  ↓
Supervisor Agent / 监督 Agent
  - dispatches Plan Agent / 方案 Agent and Review Agent / 审查 Agent
  - verifies both are truly following the rules
  ↓
Plan/Review Ping-Pong
  - Plan Agent / 方案 Agent proposes the best plan
  - Review Agent / 审查 Agent finds P0/P1/P2 risks only
  - repeat until convergence
  ↓
Execution Agent / 执行 Agent
  - reviews final plan against the task total goal
  - returns misaligned plans to Supervisor Agent
  - executes only aligned and converged plans
  ↓
Stop or close
  - stop at human authorization, permission, compliance, missing data, or capability boundaries
  - otherwise close with verification and knowledge distillation
```

No execution is allowed before the Execution Agent confirms that the final plan is aligned with the Task Recognition Agent's task total goal.

## 5. Task Recognition Agent / 任务识别 Agent

The Task Recognition Agent does exactly one job: deeply understand all received information and convert it into the task total goal.

Responsibilities:

- Read the user request, local rules, referenced files, prior plan text, relevant logs, and available context needed to identify the true task.
- Distinguish explicit requirements, implicit requirements, assumptions, constraints, and permission boundaries.
- Produce the shared task envelope.
- Treat the task total goal as the authority for all later planning, review, and execution.

Output format:

```text
Goal alignment: Identifying the task total goal from the received information.
Task total goal:
Success criteria:
Scope boundaries:
Permission and capability boundaries:
Source context and evidence:
Assumptions:
```

Boundaries:

- Do not generate an implementation plan.
- Do not review plan quality.
- Do not execute.
- If the received information is insufficient to form a safe task total goal, stop and mark the missing information.

## 6. Supervisor Agent / 监督 Agent

The Supervisor Agent does exactly one job: supervise the loop from task total goal to final best plan.

Responsibilities:

- Pass the shared task envelope to every agent.
- Dispatch the task total goal to the Plan Agent and Review Agent.
- Ensure the Plan Agent and Review Agent are both using the all-agent capability base.
- Ensure every Plan Agent revision responds to every open P0/P1/P2.
- Ensure every Review Agent report checks against the task total goal.
- Maintain the round ledger.
- Detect deadlock, repeated ignored findings, or role violations.

Supervisor Agent must not:

- Generate the plan.
- Rewrite the plan.
- Produce review findings.
- Execute.

Round ledger format:

```text
Round N:
Task total goal:
Plan version:
P0 count:
P1 count:
P2 count:
Open unchanged findings:
Plan response completeness:
Review goal-alignment completeness:
Decision: continue / converged / stop for human judgment
```

If any agent output lacks the task total goal, violates its role, or skips required skill/Karpathy reasoning, the Supervisor Agent rejects that output and reruns the round.

## 7. Plan Agent / 方案 Agent

The Plan Agent does exactly one job: produce the best plan aligned to the task total goal.

Responsibilities:

- Use the shared task envelope as the plan authority.
- Call relevant superpower skills when they materially improve the plan.
- Apply Karpathy four-principle reasoning to each key decision.
- Produce a plan with fix/change list, execution steps, verification checks, and explicit non-changes.
- Respond to every P0/P1/P2 from the Review Agent in the next plan version.

Minimum plan format:

```text
Goal alignment:
Plan version:
Task total goal:
Fix/change list:
Execution steps:
Verification checks:
Non-changes with reasons:
Assumptions:
Response to prior P0/P1/P2:
```

Three-step selection method:

1. Brainstorm alternatives: first plan has at least 3 alternatives; improvement rounds have at least 2.
2. Review each alternative with Think Before Coding, Simplicity First, Surgical Changes, and Goal-Driven Execution.
3. Choose the best alternative and briefly record why the rejected alternatives lost.

Boundaries:

- Do not mark the plan converged.
- Do not review your own plan as the final review.
- Do not execute.

## 8. Review Agent / 审查 Agent

The Review Agent does exactly one job: find risks in the plan. It does not generate replacement plans.

Responsibilities:

- Review the plan against the task total goal and success criteria.
- Apply `karpathy-guidelines` and relevant superpower skills for risk discovery.
- Classify every issue as P0, P1, or P2.
- Attach evidence strength to every finding.
- Check normal paths, edge cases, failure paths, implicit requirements, and permission boundaries.
- Decide whether another review round is required.

Output format:

```text
Goal alignment:
Reviewed plan version:
P0 list:
P1 list:
P2 list:
Current assumptions:
Non-change review:
Evidence strength notes:
Decision: next round required / convergence candidate / stop for human judgment
```

Role boundary:

- Find problems.
- Do not generate alternative plans.
- Do not rewrite the plan.
- Do not execute.

## 9. Execution Agent / 执行 Agent

The Execution Agent does exactly one job: align the final plan with the task total goal, then execute only if aligned and permitted.

Pre-execution gate:

```text
Goal alignment:
Task total goal:
Final plan version:
Convergence evidence:
Alignment verdict: aligned / misaligned
Permission verdict: permitted / stop
Capability verdict: capable / stop
```

Rules:

- If the final plan is misaligned with the task total goal, return it to the Supervisor Agent and do not execute.
- If convergence evidence is missing or any P0/P1/P2 remains open without valid closure, return it to the Supervisor Agent.
- If execution requires human authorization, production access, irreversible action, money, contracts, compliance judgment, missing data, or capability outside the agent's ability, stop and state the exact authorization or assistance needed.
- If permitted, execute atomically: reread before edits, make surgical changes, verify after each step, and run all final checks.

The Execution Agent may call superpower skills for execution quality, debugging, testing, verification, or closure, but must keep execution scoped to the converged plan.

## 10. P0/P1/P2 Severity

| Level | Meaning | Action |
|---|---|---|
| P0 | Blocks execution: wrong task goal, data loss, unreadable file, destructive action, unresolved permission boundary, invalid plan structure | Must fix before execution |
| P1 | Risk or confusion: ambiguous scope, missing evidence, incomplete response to review, unclear audit path, goal drift risk | Must fix before convergence |
| P2 | Quality or clarity issue: naming inconsistency, incomplete machine-readable fields, weak wording, minor traceability gap | Must close before convergence |

P2 is still a convergence risk. A P2 can close only by being fixed or by entering an evidence-backed non-change list that proves it does not affect the task total goal, execution safety, verification, or traceability.

## 11. Convergence Rules

Convergence requires all of these:

- The shared task envelope is present in every agent output.
- Every agent output includes goal alignment.
- The Plan Agent has responded to every P0/P1/P2.
- The Review Agent reports zero new P0/P1/P2 for two consecutive rounds (`连续 2 轮零新 P0/P1/P2`).
- Any remaining non-change item has evidence and does not affect the task total goal, execution safety, verification, or traceability.
- The Supervisor Agent confirms the Plan Agent and Review Agent followed their roles.

Hard stops:

- After round 5 without convergence, stop and mark `needs human judgment`.
- If the same P0 appears in two consecutive rounds without a real Plan Agent response, stop and mark `deadlock`.
- If the task total goal changes materially, return to the Task Recognition Agent and create a new shared task envelope.

Simple tasks may use compact outputs, but may not skip task recognition, at least one review, or execution goal-alignment review.

## 12. Non-Change Management

Every plan and review must track non-changes. Non-change means "known and intentionally not changed", not "forgotten".

Each non-change item must include:

```text
Item:
Location:
Reason:
Evidence:
Impact on task total goal:
Impact on verification:
```

If a P2 is closed as a non-change, the evidence must show why it does not affect the task total goal, execution safety, verification, or traceability.

## 13. Assumptions and Evidence Strength

Every round must list current assumptions. Assumptions are handled this way:

- Verified assumptions are removed.
- Unverified assumptions become P1 or P2 depending on impact.
- Disproved assumptions update the shared task envelope or force a new Task Recognition Agent pass.

Evidence strength:

| Strength | Meaning | Example |
|---|---|---|
| High | Direct file read, grep output, command output, user-provided text | `grep -c 'ID' file` returned `1` |
| Medium | Logical inference from observed patterns | A term likely causes ambiguity |
| Low | Hypothesis or unverified possibility | A path may be referenced elsewhere |

Do not invent evidence. Mark uncertain claims as `needs confirmation`.

## 14. Grep and Reference Integrity

Before changing any ID, term, path, schema, or cross-file reference:

- Run grep/rg to find the impact radius.
- Record expected changes and intentional non-changes.
- Do not change what you have not inspected.

After changes:

- Run grep/rg to confirm no dangling references.
- Preserve historical logs and ledgers unless the task total goal explicitly requires changing them.

Verification pattern library:

| Check type | Command pattern | Expected result |
|---|---|---|
| Unique ID | `grep -c 'ID' file` | `1` |
| Removed term | `grep -c 'old term' file` | `0` |
| Required term | `grep -c 'new term' file` | `>=1` |
| Cross-reference | `grep -rl 'ID' --exclude='source' .` | Matches intended files |
| Markdown table columns | `awk -F'|' '{print NF-1}' file` | Consistent target rows |

## 15. Execution Discipline

Execution is atomic and surgical:

- Reread the exact target lines immediately before editing.
- Do not trust cached line numbers.
- Prefer the smallest edit that accomplishes the plan.
- Do not refactor adjacent material unless it is part of the converged plan.
- Verify each step before moving to the next.

Editing strategy:

```text
Same file with many changes?
  Whole table or every row changes -> rewrite the smallest complete table/block.
  Distant blocks change -> multiple targeted edits.
  One continuous block changes -> one block edit.
  One line changes -> one line edit.
```

## 16. Failure Recovery

If verification fails:

1. Locate the root cause by reading current files and command output.
2. Fix only the failed item, keeping the task total goal and converged plan in scope.
3. Rerun all verification checks.

Do not automatically revert partial success. Do not expand scope to "clean up" unrelated issues.

If the failure reveals the plan was wrong, return to the Supervisor Agent. If it reveals the task total goal was wrong or incomplete, return to the Task Recognition Agent.

## 17. Anti-Patterns

| Anti-pattern | Correct behavior |
|---|---|
| "The task is clear, skip task recognition" | Always create the task total goal first |
| "Only Plan Agent needs skills" | Every agent has superpower and Karpathy capability |
| "Supervisor can fix the plan directly" | Supervisor rejects and reruns; Plan Agent fixes |
| "Review Agent should suggest the better plan" | Review Agent finds risks only |
| "P2 is cosmetic, let it pass" | P2 must be fixed or evidence-closed |
| "One clean review is enough" | Need two consecutive zero-new P0/P1/P2 rounds |
| "Execute and adjust as needed" | Execution only follows the converged, aligned plan |
| "Permission is probably fine" | Stop at authorization, compliance, production, money, contract, or capability boundaries |

## 18. Closure

After successful review and execution, call `closure-knowledge-distillation` when the result has reusable value.

Closure artifact should include:

- Task total goal.
- Final plan version.
- P0/P1/P2 closure summary.
- Non-change list.
- Verification results.
- Permission or capability boundaries encountered.
- Lessons that should affect future plans.
