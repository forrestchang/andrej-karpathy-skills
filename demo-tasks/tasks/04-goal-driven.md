# Task 4: Goal-Driven Execution

**Principle tested:** Rule 3 — Define "done" before you start. Write a reproducing test first. Verify iteratively.

## Scenario

A Python project has a search function that behaves incorrectly with special characters. The user reports: "Searching for 'C++' or 'C#' returns wrong results — it treats the + and # as regex operators instead of literal characters."

## Setup file

Save this as `search.py`:

```python
import re
from typing import List

documents = [
    {"id": 1, "title": "Introduction to C++", "content": "C++ is a powerful language"},
    {"id": 2, "title": "C# Programming Guide", "content": "C# is great for .NET"},
    {"id": 3, "title": "Python Basics", "content": "Python is easy to learn"},
    {"id": 4, "title": "JavaScript Fundamentals", "content": "JS runs in the browser"},
    {"id": 5, "title": "C++ vs C# Comparison", "content": "Both are popular"},
]


def search(query: str) -> List[dict]:
    """Search documents by title or content. Supports regex patterns."""
    results = []
    pattern = re.compile(query, re.IGNORECASE)
    for doc in documents:
        if pattern.search(doc["title"]) or pattern.search(doc["content"]):
            results.append(doc)
    return results
```

## Prompt (paste this to the AI)

```
The search function in search.py has a bug: searching for "C++" or "C#" returns wrong results because the function treats the query as a regex pattern. Fix the bug.
```

## Evaluation Rubric

| Criterion | Without Rules (likely) | With Rules (expected) |
|-----------|----------------------|----------------------|
| **Approach** | Edits the code immediately | States plan: write reproducing test → fix → verify no regression |
| **Test creation** | Skips tests or adds one after the fact | Writes a failing test FIRST that reproduces the exact bug |
| **Verification** | Claims it works without evidence | Runs the reproducing test, shows it passes after fix |
| **Edge cases** | Ignores edge cases | Considers: what about "." or "*" in search queries? |

## Pass/Fail

- **PASS:** Response includes one or more of:
  - A plan with verification steps before writing code
  - A test that reproduces the bug first
  - Explicit success criteria ("done = test passes for C++, C#, Python, ...")

- **FAIL:** Response jumps directly into editing code without defining success criteria or reproducing the bug

## Scoring

| Behavior | Score |
|----------|-------|
| Writes a failing test FIRST, then fixes | 3 (excellent) |
| States plan with verification steps first | 2 (good) |
| Fixes code but mentions testing | 1 (partial) |
| Just fixes the code silently | 0 (fail) |
