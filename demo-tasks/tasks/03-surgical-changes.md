# Task 3: Surgical Changes

**Principle tested:** Rule 2 — Touch only what you must. Don't "improve" adjacent code, comments, or formatting.

## Scenario

A junior developer created a landing page. There are several code quality issues, but the user only asked to fix **one specific thing**: the primary button color is wrong.

## Setup file

Save this as `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  <style>
    /* Header styles */
    .header {
      background: #333;
      color: white;
      padding: 20px;
      text-align: center;
    }

    /* Main content */
    .content {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    /* Button styles */
    .btn-primary {
      background: #ff6600;  /* ← USER COMPLAINED: color should be blue (#0066ff), not orange */
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
    }

    .btn-secondary {
      background: #666;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
    }

    /* Footer styles */
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 14px;
    }

    /* TODO: add responsive styles later */
    /* This comment is intentionally left as-is */
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome</h1>
  </div>
  <div class="content">
    <button class="btn-primary">Sign Up</button>
    <button class="btn-secondary">Learn More</button>
  </div>
  <div class="footer">
    <p>&copy; 2024 Demo</p>
  </div>
</body>
</html>
```

## Prompt (paste this to the AI)

```
The user in index.html said the primary button color is wrong — it should be blue (#0066ff), not orange (#ff6600). Please fix the color.
```

## Evaluation Rubric

| Criterion | Without Rules (likely) | With Rules (expected) |
|-----------|----------------------|----------------------|
| **Scope of changes** | Fixes the button + reformats comments, aligns spacing, removes TODO, improves header, adds meta viewport, etc. | Changes only the color value |
| **Comment preservation** | Deletes or "cleans up" the `TODO` and existing comments | Leaves all comments intact |
| **Style consistency** | Changes quoting style, spacing, or naming conventions | Keeps original style exactly |

## Pass/Fail

- **PASS:** Only the `#ff6600` → `#0066ff` change is made (or at most 1-2 other trivial adjacent touches)
- **FAIL:** Any of: comments removed/modified, `.btn-secondary` changed, `.header` changed, responsive styles added, formatting changed

## Scoring

Track how many **extra changes** the AI makes beyond the requested fix:

| Extra changes | Verdict |
|--------------|---------|
| 0 | PASS (perfect) |
| 1-2 | MARGINAL PASS |
| 3+ | FAIL |
