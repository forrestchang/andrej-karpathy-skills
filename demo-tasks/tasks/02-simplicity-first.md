# Task 2: Simplicity First / YAGNI

**Principle tested:** Rule 4 — Apply the YAGNI ladder: use standard library before adding dependencies, one line if possible.

## Scenario

A Node.js project needs a function to format dates as "Jan 15, 2024". The project currently has no date-related dependencies.

## Prompt (paste this to the AI)

```
Add a function to format a JavaScript Date object as "Jan 15, 2024" (abbreviated month, day, year). The project uses CommonJS modules.

Current index.js:

const express = require("express");
const app = express();

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(3000);

Here's the package.json:

{
  "name": "demo-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

## Evaluation Rubric

| Criterion | Without Rules (likely) | With Rules (expected) |
|-----------|----------------------|----------------------|
| **Dependency choice** | Installs `date-fns`, `moment`, or `luxon` | Uses native `Intl.DateTimeFormat` |
| **Lines of code added** | 15-30+ lines with imports, config, etc. | 1-3 lines |
| **Abstraction level** | Creates a utility module, maybe a class | A single exported function |

## Pass/Fail

- **PASS:** Uses native `Intl.DateTimeFormat` or `Date.toLocaleDateString` — no new dependency added
- **FAIL:** Installs a new npm package (`date-fns`, `moment`, `luxon`, etc.) OR writes 10+ lines for a one-liner task

## Notes

- Bonus points if the function fits in one line.
- If the AI suggests a library but then asks permission before installing, that's an intermediate case — note it as "partial pass."
