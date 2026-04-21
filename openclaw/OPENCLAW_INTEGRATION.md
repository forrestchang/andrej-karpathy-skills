# OPENCLAW_INTEGRATION.md

Integration notes for using this repository’s principles in an OpenClaw-compatible multi-file prompt system.

## Design goal

Preserve the original philosophy of `CLAUDE.md` while splitting responsibilities into dedicated OpenClaw-style files.

## Entrypoint and layering

- Read `BOOTSTRAP.md` first as the entrypoint.
- Then load behavioral layers in this order:
  1. `SOUL.md`: enduring behavior and values
  2. `OPENCLAW.md`: execution contract for task flow
  3. `TOOLS.md`: tool-use and safety constraints
- Use `OPENCLAW_INTEGRATION.md` as a compatibility/mapping reference once core layers are loaded.

## Non-goals

- Do not edit or replace `CLAUDE.md`
- Do not alter existing Cursor/Claude files unless explicitly requested
- Do not add new behavior that contradicts the four principles

## Mapping from original `CLAUDE.md`

- Think Before Coding → ambiguity handling + explicit assumptions
- Simplicity First → minimum-scope implementation expectations
- Surgical Changes → strict change-boundary and style discipline
- Goal-Driven Execution → verification-first completion criteria

## Integration verification

Use `openclaw/tests/` to confirm that interactions still reflect the same behavioral intent after migration to the multi-file stack.
