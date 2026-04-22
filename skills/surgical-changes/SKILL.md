---
name: surgical-changes
description: Use when editing existing files — bug fixes, adding logging, small modifications, applying review feedback. Trigger BEFORE Edit/Write on existing code to prevent drive-by refactors, style drift (quote changes, type-hint additions, reformatting), unrequested "improvements", changes to adjacent comments, or deletion of unrelated code. Every changed line should trace directly to the user's request.
license: MIT
---

# Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code, the failure mode is "drive-by improvements" — fixing the bug *and* renaming variables, adding type hints, switching quote style, or rewriting an adjacent helper "while you're there".

## Rules

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, *mention* it — don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that **your** changes made unused.
- Don't remove pre-existing dead code unless asked.

**The test:** Every changed line should trace directly to the user's request. If a line in your diff doesn't, revert it.

## When this fires

- Any `Edit` / `Write` on a file that already exists
- Bug fixes (especially tempting to "clean up while here")
- Adding logging, metrics, instrumentation
- Applying a single review-comment change
- Renames

## Worked example

**Request:** "Fix the bug where empty emails crash the validator"

**❌ Drive-by changes**

```diff
  def validate_user(user_data):
-     # Check email format
-     if not user_data.get('email'):
+     """Validate user data."""
+     email = user_data.get('email', '').strip()
+     if not email:
          raise ValueError("Email required")
-     if '@' not in user_data['email']:
+     if '@' not in email or '.' not in email.split('@')[1]:
          raise ValueError("Invalid email")
-     if not user_data.get('username'):
+     username = user_data.get('username', '').strip()
+     if not username:
          raise ValueError("Username required")
+     if len(username) < 3:
+         raise ValueError("Username too short")
+     if not username.isalnum():
+         raise ValueError("Username must be alphanumeric")
      return True
```

Beyond the bug: added docstring, "improved" email regex, added username rules nobody asked for.

**✅ Surgical**

```diff
  def validate_user(user_data):
      # Check email format
-     if not user_data.get('email'):
+     email = user_data.get('email', '')
+     if not email or not email.strip():
          raise ValueError("Email required")

      # Basic email validation
-     if '@' not in user_data['email']:
+     if '@' not in email:
          raise ValueError("Invalid email")

      # Check username
      if not user_data.get('username'):
          raise ValueError("Username required")
      return True
```

Only the lines that fix empty-email handling.

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| Switch `'foo'` → `"foo"` while editing | Match existing quote style |
| Add type hints to a function you're touching | Leave them out unless asked |
| Add a docstring to a function you're touching | Leave it alone |
| Reformat whitespace / reorder imports | Don't |
| Delete a commented-out block "while here" | Mention it, don't delete |
| Rename a variable for clarity along the way | Separate PR |

## Tradeoff

The codebase keeps small inconsistencies you'd love to fix. That's the cost — diffs stay small, reviewable, and revert-safe. Batch cleanups into their own explicit task.
