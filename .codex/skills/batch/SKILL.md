---
name: batch
description: Use when Codex needs to handle many similar edits, inspect repeated structures, or coordinate a multi-file change without losing track of scope.
---

# Batch

Use this skill for repetitive or multi-file work where sequencing matters.

## Workflow

1. Inventory the full target set before editing.
2. Group files by the kind of change they need.
3. Make one coherent batch of related edits at a time.
4. After each batch, inspect the diff for unintended churn.
5. Verify representative examples and any high-risk file individually.
6. Record remaining unchecked files or assumptions.

## Batch Boundaries

Good batches:
- Same instruction copied across tool-specific docs.
- Same schema field added to multiple examples.
- Same typo or link pattern fixed in several files.

Poor batches:
- Unrelated refactors.
- Formatting mixed with behavior changes.
- Documentation rewrites mixed with schema changes unless the schema drives the docs.

## Stop Conditions

Pause and re-scope when the repeated pattern has exceptions, the diff starts touching unrelated lines, or a file needs a different decision than the rest.
