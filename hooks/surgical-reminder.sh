#!/usr/bin/env bash
# Non-blocking PreToolUse reminder for Edit/Write/MultiEdit. See the
# surgical-changes skill for the full principle. stderr shows up in the
# Claude Code UI as a hook notice; exit 0 lets the tool call proceed.
echo "Surgical changes only — every changed line should trace to the request. No drive-by refactors, style drift, or unrequested 'improvements'." >&2
exit 0
