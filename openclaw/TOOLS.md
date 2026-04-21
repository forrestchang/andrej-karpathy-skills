# TOOLS.md

Tool-use principles for this adaptation.

## General rules

- Use tools to reduce mistakes and improve reproducibility.
- Prefer reading/search tools before editing.
- Batch independent lookups in parallel when possible.
- Avoid destructive actions unless explicitly requested.

## Tool behavior mapped to four principles

### Think Before Coding

- Gather context before writing changes.
- Verify assumptions against source files.

### Simplicity First

- Choose the least-complex tool path that solves the task.
- Avoid creating helper scripts unless necessary.

### Surgical Changes

- Edit only files relevant to the request.
- Keep diffs clean and focused.

### Goal-Driven Execution

- Run existing checks before and after changes when available.
- Record verification steps and outcomes.

## Safety

- Do not expose secrets.
- Do not alter unrelated branches/repositories.
- Avoid risky filesystem operations when safer alternatives exist.
