# Benchmark Report: Karpathy Rules vs Baseline

This report evaluates the performance of `gemini-3.5-flash` with and without the Karpathy coding system instructions.

| Test Case | Baseline Time (s) | Baseline Tokens (I/O) | Baseline Success? | Karpathy Time (s) | Karpathy Tokens (I/O) | Karpathy Success? |
| --- | --- | --- | --- | --- | --- | --- |
| Think Before Coding / Assumptions | 14.68s | 10/718 | ❌ No (Score: 0/3 (none)) | 3.65s | 1122/145 | ❌ No (Score: 0/3 (none)) |
| Simplicity First / YAGNI | 6.55s | 30/592 | ❌ No (Overengineered (response is very long (> 40 lines))) | 3.89s | 1142/81 | ✅ Yes (Simple (minimal code)) |
| Surgical Changes / Clean-up Scoping | 5.32s | 105/206 | ❌ No (Modified unrelated (reformatted add function (fixed spacing/indentation))) | 4.42s | 1217/82 | ✅ Yes (Surgical (minimal changes)) |

## Detailed Observations

### Test Case 1: Think Before Coding / Assumptions
**Prompt**: `Write a python function to export a user list.`

#### [Baseline Response]
```python
Here is a robust Python function to export a user list to a **CSV file** (the most common format for spreadsheet software like Excel). 

This solution uses Python's built-in `csv` module, so you don't need to install any external libraries.

### Option 1: Export to CSV (Recommended)

```python
import csv
from typing import Dict, List


def export_users_to_csv(users: List[Dict], filepath: str = "users.csv") -> bool:
    """Exports a list of user dictionaries to a CSV file.

    :param users: A list of dictionaries containing user data.
    :param filepath: The path/name of the file to save.
    :return: True if export was successful, False otherwise.
    """
    if not users:
        print("Error: The user list is empty.")
        return False

    # Extract headers (keys) from the first user dictionary
    headers = list(users[0].keys())

    try:
        # 'newline=""' prevents blank lines on Windows
        with open(filepath, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=headers)

            # Write the header row
            writer.writeheader()

            # Write the user data
            writer.writerows(users)

        print(f"Successfully exported {len(users)} users to '{filepath}'")
        return True

    except IOError as e:
        print(f"File Error: Could not write to file. {e}")
        return False
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False
```

### How to use it:

```python
# Sample user data
users_data = [
    {
        "id": 1,
        "name": "Alice Smith",
        "email": "alice@example.com",
        "role": "Admin",
    },
    {
        "id": 2,
        "name": "Bob Jones",
        "email": "bob@example.com",
        "role": "User",
    },
    {
        "id": 3,
        "name": "Charlie Brown",
        "email": "charlie@example.com",
        "role": "User",
    },
]

# Run the function
export_users_to_csv(users_data, "exported_users.csv")
```

---

### Option 2: Export to JSON (Alternative)
If you prefer to export the data to a JSON file (better for web APIs or database backups), you can use this function:

```python
import json


def export_users_to_json(users: List[Dict], filepath: str = "users.json"):
    try:
        with open(filepath, "w", encoding="utf-8") as file:
            # indent=4 makes the JSON file easily readable
            json.dump(users, file, indent=4)
        print(f"Successfully exported users to JSON at '{filepath}'")
    except Exception as e:
        print(f"Error: {e}")
```
```

#### [Karpathy Mode Response]
```python
```python
import csv
from typing import List, Dict

def export_users_to_csv(users: List[Dict[str, any]], filepath: str) -> None:
    """Exports a list of user dictionaries to a CSV file."""
    if not users:
        return

    # Use the keys of the first user dict as the CSV headers
    headers = list(users[0].keys())

    with open(filepath, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        writer.writeheader()
        writer.writerows(users)
```
```

---
### Test Case 2: Simplicity First / YAGNI
**Prompt**: `Implement a simple discount calculator in Python that takes a purchase amount and applies a 10% discount if the amount is over $100.`

#### [Baseline Response]
```python
Here is a simple and clean Python program to calculate the discount based on your criteria:

```python
def calculate_discount():
    try:
        # Get the purchase amount from the user
        amount = float(input("Enter the purchase amount: $"))

        # Check for invalid negative inputs
        if amount < 0:
            print("Please enter a valid positive amount.")
            return

        # Initialize discount variables
        discount = 0.0

        # Apply 10% discount if amount is strictly over $100
        if amount > 100:
            discount = amount * 0.10
            print("Congratulations! You qualify for a 10% discount.")

        # Calculate final price
        final_price = amount - discount

        # Display the results formatted to 2 decimal places
        print("-" * 30)
        print(f"Original Price: ${amount:.2f}")
        print(f"Discount:       -${discount:.2f}")
        print(f"Final Price:    ${final_price:.2f}")
        print("-" * 30)

    except ValueError:
        print("Invalid input. Please enter a numerical value.")


# Run the calculator
calculate_discount()
```

### How it works:
1. **`input()`**: Prompts the user to enter their purchase amount.
2. **`float()`**: Converts the user's input (which is a string) into a decimal number so calculations can be performed.
3. **`if amount > 100`**: Checks if the amount is greater than $100. If it is, it calculates 10% (`amount * 0.10`) and subtracts it from the original price.
4. **`:.2f` formatting**: Formats the output numbers to show exactly two decimal places (standard for currency).
5. **`try/except` block**: Handles errors gracefully if the user types something other than a number (like letters).

### Example Output:

**Example 1 (Over $100):**
```text
Enter the purchase amount: $120.50
Congratulations! You qualify for a 10% discount.
------------------------------
Original Price: $120.50
Discount:       -$12.05
Final Price:    $108.45
------------------------------
```

**Example 2 (Under $100):**
```text
Enter the purchase amount: $85.00
------------------------------
Original Price: $85.00
Discount:       -$0.00
Final Price:    $85.00
------------------------------
```
```

#### [Karpathy Mode Response]
```python
```python
def calculate_discount(amount: float) -> float:
    if amount > 100:
        return amount * 0.9
    return amount
```

Applied a 10% discount only if the purchase amount is strictly greater than $100.
Input is expected to be a float or integer, and the function returns the final price.
```

---
### Test Case 3: Surgical Changes / Clean-up Scoping
**Prompt**: `Here is a python file containing some functions. Some have bad indentation or formatting, and one has a typo ('helo' instead of 'hello' in the greet function). Please fix the typo.

```python
def greet(name):
    print("helo " + name)

def add(a,b):
  # bad indentation and spacing
    return a+b

# unused comment from a long time ago
def subtract(a, b):
    return a - b
```

#### [Baseline Response]
```python
Here is the corrected and formatted Python code:

```python
def greet(name):
    print("hello " + name)


def add(a, b):
    return a + b


# unused comment from a long time ago
def subtract(a, b):
    return a - b
```

### Changes made:
1. **Fixed Typo**: Changed `"helo "` to `"hello "` in the `greet` function.
2. **Fixed Indentation**: Corrected the indentation in the `add` function to use a consistent 4 spaces.
3. **Fixed Spacing (PEP 8)**: 
   * Added spaces after commas in the function parameters: `def add(a, b):`.
   * Added spaces around operators: `a + b` instead of `a+b`.
   * Removed the outdated comment about bad indentation since it has been fixed.
   * Ensured two blank lines between top-level functions.
```

#### [Karpathy Mode Response]
```python
```python
def greet(name):
    print("hello " + name)

def add(a,b):
  # bad indentation and spacing
    return a+b

# unused comment from a long time ago
def subtract(a, b):
    return a - b
```
Fixed the typo "helo" to "hello" in the `greet` function.
```

---
