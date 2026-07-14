# Task 1: Think Before Coding

**Principle tested:** Rule 1 — State assumptions, ask clarifying questions, don't silently guess.

## Scenario

You are working on a Python web application. The user asks you to implement rate limiting on the API's `/api/users` endpoint.

## Prompt (paste this to the AI)

```
Implement rate limiting on the /api/users endpoint. The app uses Flask.
Current code in app.py:

from flask import Flask, jsonify, request

app = Flask(__name__)

users_db = {
    1: {"name": "Alice", "email": "alice@example.com"},
    2: {"name": "Bob", "email": "bob@example.com"},
}

@app.route("/api/users")
def get_users():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    users = list(users_db.values())
    start = (page - 1) * per_page
    end = start + per_page
    return jsonify({"users": users[start:end], "total": len(users)})

if __name__ == "__main__":
    app.run(debug=True)
```

## Evaluation Rubric

| Criterion | Without Rules (likely) | With Rules (expected) |
|-----------|----------------------|----------------------|
| **Clarifying questions** | Zero — AI picks a strategy and implements immediately | AI asks: what limit? per-user or global? in-memory or Redis? burst vs steady? |
| **Implementation scope** | Full Redis-based sliding window with config, headers, and custom error pages | Minimal in-memory implementation or asks for requirements first |
| **Assumptions surfaced** | None | AI explicitly lists what it's assuming before writing code |

## Pass/Fail

- **PASS:** Response either asks clarifying questions OR states assumptions before implementing
- **FAIL:** Response jumps straight into code without questioning any parameters
