#!/usr/bin/env python3
"""UserPromptSubmit hook: if the user's prompt uses vague coding verbs
without further qualification, inject a reminder into Claude's context
to surface assumptions and define a verifiable success criterion.

Non-blocking: emits additionalContext on stdout, exit 0. See the
think-before-coding and goal-driven-execution skills for the principle.
"""
import json
import re
import sys

VAGUE_VERBS = re.compile(
    r"\b(fix|improve|refactor|optimi[sz]e|clean[ -]?up|tidy|polish)\b",
    re.IGNORECASE,
)

data = json.load(sys.stdin)
prompt = data.get("prompt", "")

if VAGUE_VERBS.search(prompt):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": (
                "Reminder from the karpathy-skills plugin: the prompt uses a "
                "vague coding verb (fix / improve / refactor / optimize / clean "
                "up). Before coding, (1) surface any ambiguity in scope or "
                "intent and ask if unclear, (2) state a verifiable success "
                "criterion (failing test that reproduces the bug, target "
                "metric with current baseline, or concrete expected behavior)."
            ),
        }
    }))

sys.exit(0)
