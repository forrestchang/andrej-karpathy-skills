# AGENT.md — Project Workflow & PR Standards

These instructions apply to this repository.

## Default Workflow

**Before editing:**
- Read the Linear issue, linked spec, and relevant existing files.
- Identify the acceptance criteria and non-goals.
- Check current implementation patterns.
- Inspect current git status.

**While editing:**
- Implement **only** the stated acceptance criteria.
- Do not change unrelated files.
- Do not refactor opportunistically.
- Preserve existing behavior unless the issue explicitly requires change.
- Follow existing code style, architecture, naming, and UI conventions.
- Add or update tests when the change affects logic, data flow, permissions, integrations, or user-visible behavior.

**Before opening a PR:**
- Run the relevant checks for the files touched.
- Review the diff for unrelated changes.
- Confirm the PR description follows `.github/pull_request_template.md`.

## PR Standards

Every PR should explain:
- What changed and why
- Linked Linear issue
- Acceptance criteria checked
- How to test
- Risks
- What was intentionally not done
- Screenshots, Loom, or preview URL when relevant
- Agent involvement
- Follow-up issues (if any)

## PR Review Standard

Review strictly against the linked Linear issue only. Look for:
- Acceptance criteria gaps
- Bugs or broken data flow
- Security issues
- Bad abstractions
- Missing loading/error states
- Code that will be hard for future agents to maintain

Categorize feedback in three groups:
1. **Must fix before merge**
2. **Should fix soon**
3. **Safe to merge**

---

Use the narrowest useful verification command for the task. If broad checks have unrelated failures, state it clearly in the PR and highlight the targeted checks that passed.
