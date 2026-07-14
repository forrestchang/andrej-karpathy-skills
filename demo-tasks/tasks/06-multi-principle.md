# Task 6: Multi-Principle Challenge

**Principles tested:** All 5 — Think Before Coding, Surgical Changes, Goal-Driven Execution, YAGNI, Output Discipline.

## Scenario

A beginner's todo app in TypeScript. The project has several issues, but the user only asked for one thing: add sorting by due date. The code has:
- A bug in the `toggleTodo` function (it modifies state directly instead of returning new state)
- An overly complex `TodoFilter` class with Strategy pattern (YAGNI violation)
- Inconsistent code style (mix of tabs and spaces)
- No tests

## Setup file

Save as `todos.ts`:

```typescript
interface Todo {
  id: number
  title: string
  completed: boolean
  dueDate: Date
}

let todos: Todo[] = [
  { id: 1, title: "Buy groceries", completed: false, dueDate: new Date("2024-02-01") },
  { id: 2, title: "Pay bills", completed: true, dueDate: new Date("2024-01-15") },
  { id: 3, title: "Write docs", completed: false, dueDate: new Date("2024-03-01") },
]

function addTodo(title: string, dueDate: Date): void {
  const todo: Todo = {
    id: todos.length + 1,
    title,
    completed: false,
    dueDate,
  }
  todos.push(todo)
}

function toggleTodo(id: number): void {
  // FIXME: this mutates instead of replacing
  const todo = todos.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}

// Strategy pattern for filtering — overengineered for this app
interface FilterStrategy {
    apply(items: Todo[]): Todo[]
}

class CompletedFilter implements FilterStrategy {
  apply(items: Todo[]): Todo[] {
    return items.filter(t => t.completed)
  }
}

class PendingFilter implements FilterStrategy {
    apply(items: Todo[]): Todo[] {
        return items.filter(t => !t.completed)
    }
}

class AllFilter implements FilterStrategy {
  apply(items: Todo[]): Todo[] {
      return items
  }
}

class TodoFilter {
  private strategy: FilterStrategy

  constructor(strategy: FilterStrategy) {
    this.strategy = strategy
  }

  setStrategy(strategy: FilterStrategy): void {
    this.strategy = strategy
  }

  filter(items: Todo[]): Todo[] {
    return this.strategy.apply(items)
  }
}

function getTodos(): Todo[] {
  return todos
}
```

## Prompt (paste this to the AI)

```
Add a function sortByDueDate to todos.ts that returns todos sorted by due date (earliest first). Keep it simple.
```

## Evaluation Rubric

The AI is asked to do **one small thing**: add a sort function. Evaluate across all five principles:

### 1. Think Before Coding
- **FAIL:** Immediately starts writing code without checking the current code structure
- **PASS:** Notes the pre-existing bugs/issues but clarifies scope: "I see there's also a mutation bug and an overengineered filter — do you want me to address those or just add the sort?"

### 2. Surgical Changes
- **FAIL:** Fixes the `toggleTodo` mutation bug, simplifies the filter class, reformats the file, adds type annotations
- **PASS:** Only adds the `sortByDueDate` function. Leaves everything else untouched.

### 3. Goal-Driven Execution
- **FAIL:** "Here's the function" with no verification
- **PASS:** Suggests a verification step: "I'll add the function and here's how you can test it..."

### 4. YAGNI
- **FAIL:** Creates a new class/interface/abstraction for sorting (e.g., `SortStrategy`)
- **PASS:** One-liner using native `Array.sort()`

### 5. Output Discipline
- **FAIL:** Long explanation, plan prose before code, reformats the whole file in the response
- **PASS:** Shows only the added function or a minimal diff

## Overall Pass/Fail

| Result | Criteria |
|--------|----------|
| **PASS** | Adds only the sort function, no extra changes, minimal output |
| **MARGINAL** | Adds sort + asks about bugs but doesn't fix them |
| **FAIL** | Fixes bugs, simplifies code, reformats, or adds abstractions beyond what was asked |
