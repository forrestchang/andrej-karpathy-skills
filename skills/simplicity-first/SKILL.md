---
name: simplicity-first
description: Use only when about to introduce abstraction or flexibility that wasn't explicitly requested — class hierarchies, design patterns (Strategy/Factory/Builder/Repository), config objects/dataclasses, optional parameters with defaults the user didn't ask for (validate=True, merge=True, notify=False), generic interfaces (ABC, Protocol), plugin systems, dependency injection, or "just in case" try/except wrappers. Forces minimum code over speculative design. Skip for straightforward implementations of clearly-scoped requests where no extra abstraction is being considered.
license: MIT
---

# Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

Combat the LLM tendency toward overengineering — strategy patterns for one calculation, config flags nobody asked for, abstractions for single-use code.

## Rules

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

**The senior-engineer test:** Would a senior engineer say this is overcomplicated? If yes, simplify.

## When this fires

- About to introduce: `ABC`, `Protocol`, `interface`, `class HandlerFactory`, `class XStrategy`
- About to add a parameter the user didn't ask for (`merge=True`, `validate=True`, `notify=False`)
- About to write a config object / dataclass for something with one caller
- About to wrap a 3-line function in a class with `__init__`
- About to add try/except for an exception that can't happen at this layer

## Worked example

**Request:** "Add a function to calculate discount"

**❌ Overengineered**

```python
class DiscountStrategy(ABC):
    @abstractmethod
    def calculate(self, amount: float) -> float: ...

class PercentageDiscount(DiscountStrategy):
    def __init__(self, percentage: float): self.percentage = percentage
    def calculate(self, amount): return amount * (self.percentage / 100)

class FixedDiscount(DiscountStrategy): ...

@dataclass
class DiscountConfig:
    strategy: DiscountStrategy
    min_purchase: float = 0.0
    max_discount: float = float('inf')

class DiscountCalculator:
    def __init__(self, config: DiscountConfig): self.config = config
    def apply_discount(self, amount): ...
# 30+ lines of setup for a single calculation
```

**✅ What was actually asked**

```python
def calculate_discount(amount: float, percent: float) -> float:
    """percent is 0-100."""
    return amount * (percent / 100)
```

**When to add complexity:** Only when a second discount type actually appears. Refactor *then*.

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| Strategy pattern for one thing | Plain function |
| `merge`, `validate`, `notify` flags nobody requested | Drop them; add when needed |
| `try/except Exception` around code that can't fail here | Let it propagate |
| Wrapping `requests.get` in a `Client` class with one method | Just call `requests.get` |
| Generic `Repository[T]` for one model | Direct queries |

## Tradeoff

Less upfront flexibility. But premature abstraction is harder to remove than to add — if the second use case never comes, you've paid for nothing.
