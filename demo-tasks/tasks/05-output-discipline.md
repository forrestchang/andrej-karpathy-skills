# Task 5: Output Discipline

**Principle tested:** Rule 5 — Default to Full Mode: code first, minimal prose. No standalone plan, no long explanations.

## Scenario

A single Python file needs a well-known algorithm: binary search.

## Prompt (paste this to the AI)

```
Write a binary search function in Python that returns the index of a target value in a sorted list, or -1 if not found.
```

## Evaluation Rubric

| Criterion | Without Rules (likely) | With Rules (expected) |
|-----------|----------------------|----------------------|
| **Code-to-prose ratio** | Mostly prose — paragraphs explaining the algorithm, big-O, edge cases, usage examples | Code first, then ≤3 short lines of explanation |
| **Response structure** | "Here is a binary search implementation..." + long explanation + example + alternative versions | Just the function |
| **Verbosity** | 50+ lines of prose + 20 lines of code | ~10 lines of code + 1-2 lines of explanation |

## Pass/Fail

- **PASS:** The function is the first thing shown (or only thing shown). Total explanation ≤ 3 lines.
- **FAIL:** Long explanation precedes the code OR explanation exceeds 3 lines after the code block

## Token Measurement

This is the most direct test of token savings. Measure:

| Metric | Without Rules | With Rules | Savings |
|--------|--------------|------------|---------|
| Completion tokens | | | ___% |
| Response time | | | ___% |
| Lines of output | | | ___% |

## Expected Comparison

- **Baseline:** ~300-800 tokens, 30-80 lines, includes docstring, type hints, edge cases, Big-O, usage examples
- **Karpathy:** ~50-150 tokens, 8-15 lines, just the function (code block only, or code + ≤3 brief lines)
