# Changelog

All notable changes to this plugin are documented here. Format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-04-22

### Added

- Two bundled, non-blocking hooks that reinforce the skills at the moments
  they matter:
  - `hooks/surgical-reminder.sh` — `PreToolUse` hook matching `Edit`,
    `Write`, and `MultiEdit`. Prints a one-line stderr reminder that every
    changed line should trace to the user's request.
  - `hooks/vague-verb-check.py` — `UserPromptSubmit` hook. Pattern-matches
    `fix` / `improve` / `refactor` / `optimize` / `clean up` / `tidy` /
    `polish` in the user's prompt and injects a reminder into Claude's
    context to surface ambiguity and define a verifiable success criterion
    before coding. Pure Python 3, no `jq` dependency.
- `scripts/validate.py` now also parses `hooks/hooks.json` when present and
  verifies referenced scripts exist and are executable.
- README gained a "Bundled hooks" section documenting what each hook does
  and the three disable paths Claude Code currently supports
  (`disableAllHooks`, `/plugin disable`, or fork + edit).

### Notes

- Both hooks exit `0` and never block a tool call or prompt submission.

## [1.1.0] - 2026-04-22

### Changed

- Split the single `karpathy-guidelines` skill into four focused,
  auto-triggered skills — one per principle:
  - `think-before-coding` — fires on specific ambiguity signals
    (vague verbs without scope, missing fields / format / location,
    unstated constraints).
  - `simplicity-first` — fires when about to introduce abstraction or
    flexibility the user didn't ask for.
  - `surgical-changes` — fires on any Edit / Write on existing code.
  - `goal-driven-execution` — fires on multi-step work where the goal
    is clear and execution needs test-first or benchmark-gated
    verification.
- Tightened trigger descriptions so skills hand off cleanly instead of
  all four co-loading on every coding request. Vague-verb cases now route
  to `think-before-coding` first; `goal-driven-execution` takes over once
  the goal is clear.

### Added

- `scripts/validate.py` — zero-dependency Python validator that catches
  silent install-breakers: invalid JSON in `plugin.json` /
  `marketplace.json`, missing or malformed YAML frontmatter in any
  `SKILL.md`, `name` / directory mismatches, missing required fields,
  duplicate skill names, and skill paths in `plugin.json` that don't
  exist on disk.
- `.github/workflows/validate.yml` — minimal GitHub Actions workflow that
  runs the validator on push to `main` and on every pull request.

### Removed

- `skills/karpathy-guidelines/` — replaced by the four split skills above.

## [1.0.0]

### Added

- Initial release: single `karpathy-guidelines` skill capturing the four
  Karpathy-inspired principles (Think Before Coding, Simplicity First,
  Surgical Changes, Goal-Driven Execution) and `CLAUDE.md` drop-in.
- Claude Code plugin structure with `.claude-plugin/plugin.json` and
  `.claude-plugin/marketplace.json`.

[1.2.0]: https://github.com/Tomsana/andrej-karpathy-skills/releases/tag/v1.2.0
[1.1.0]: https://github.com/Tomsana/andrej-karpathy-skills/releases/tag/v1.1.0
