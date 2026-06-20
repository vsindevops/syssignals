---
title: "Functions & Return Values"
day: 5
date: "2026-06-20"
excerpt: "Day 5 of Python for AI Engineering. Learn to package code into reusable functions: def, parameters and arguments, return values (and how they differ from print), default and keyword arguments, and multiple return values. You'll refactor the contact book so every menu action becomes a clean function."
tags: ["python","functions","def","return","parameters","arguments","scope","refactoring","beginners","ai-engineering"]
topics: ["Python"]
series: "Python for AI Engineering"
seriesSlug: "python-for-ai-engineering"
seriesTotal: 30
---

Your Day 4 contact book works — but look at it. It's one long block of code, and the logic for listing, adding, and looking up contacts is all tangled into the menu loop. Imagine it had twenty features instead of three. That's the wall every beginner hits: programs grow, and without structure they become impossible to read, change, or fix.

The answer — and one of the most important ideas in all of programming — is the **function**: a named, reusable block of code that does one job. You've been *calling* functions since Day 1 (`print()`, `input()`, `len()`, `range()`). Today you learn to **write your own**: how to define them, pass them data with **parameters**, and get answers back with **return**. Then you'll refactor the contact book so each action becomes its own clean function — the single biggest step toward code that scales.

> **Following from Day 4?** This is a turning point. Once functions click, you stop writing one long script and start *composing* small, named pieces — which is how all real software (and every AI application you'll build later) is structured. Type the examples as you go.

---

## Defining and calling a function

You create a function with the **`def`** keyword, a name, parentheses, and a colon — then the indented block beneath it is the function's **body** (the colon-then-indent rule from Day 4 applies here too):

```python
def greet():
    print("Hello!")
```

This *defines* the function but doesn't run it yet — defining is like writing down a recipe. To actually run the body, you **call** it by name with parentheses:

```python
def greet():
    print("Hello!")

greet()
greet()
```

**Output:**

```text
Hello!
Hello!
```

Define once, call as many times as you like. Already you can see the appeal: the instructions live in one place, and you trigger them by name. Notice you must define a function **before** you call it — Python reads top to bottom.

---

## Parameters: passing data in

A function is far more useful when you can hand it different data each time. The names inside the parentheses are **parameters** — placeholders the function fills with whatever you pass in (the values you pass are called **arguments**):

```python
def greet(name):           # `name` is a parameter
    print(f"Hello, {name}!")

greet("Ada")               # "Ada" is the argument
greet("Linus")
```

**Output:**

```text
Hello, Ada!
Hello, Linus!
```

Each call, `name` takes the value you pass. A function can take several parameters, separated by commas — you'll see `add_contact(contacts, name, phone)` (three parameters) in today's project.

---

## Return values: getting an answer back

So far our functions *do* something (print). Often you want one to *compute and hand back* a result so you can use it. That's what **`return`** does — it sends a value back to whoever called the function:

```python
def square(n):
    return n * n

result = square(5)         # square(5) hands back 25; we store it
print(result)
print(square(3) + square(4))   # use return values directly: 9 + 16
```

**Output:**

```text
25
25
```

The magic is that **a call to a function becomes its return value**. `square(5)` *is* `25` once it returns — so you can store it, print it, add it to another call, pass it onward. This is what lets you build big things out of small functions.

### `print` is not `return` — the distinction that trips everyone up

This is the most important subtlety of the day. **`print` shows a value on screen; `return` hands a value back to your code.** They look similar but do completely different things:

```python
def add_print(a, b):
    print(a + b)       # SHOWS the sum, but hands back nothing

def add_return(a, b):
    return a + b       # hands the sum back

x = add_return(2, 3)
print("x =", x)        # we captured the value

y = add_print(2, 3)    # this prints 5 as a side effect...
print("y =", y)        # ...but y captured nothing
```

**Output:**

```text
x = 5
5
y = None
```

See it? `add_return` gave us `5` to keep in `x`. `add_print` printed `5` to the screen but handed back **`None`** — Python's word for "no value." **A function with no `return` always returns `None`.** If you ever find a variable is mysteriously `None`, check whether the function you called actually *returns* something or just prints it. (We'll turn this exact mistake into a common error below.)

You can also use **`return` to exit a function early** — the moment Python hits a `return`, the function stops. Today's `list_contacts` uses this to bail out cleanly when there are no contacts.

---

## Default and keyword arguments

You can give a parameter a **default value**, used when the caller doesn't supply one — which makes arguments optional:

```python
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Ada")                  # uses the default greeting
greet("Ada", "Welcome")       # overrides it (by position)
greet("Ada", greeting="Hi")   # overrides it by NAME (keyword argument)
```

**Output:**

```text
Hello, Ada!
Welcome, Ada!
Hi, Ada!
```

Passing `greeting="Hi"` is a **keyword argument** — you name the parameter explicitly. Keyword arguments make calls easier to read and let you skip over optional parameters. You've used these already: `dict.get(name, "default")` and `print("a", "b", end=" ")`.

---

## Returning more than one value

A function can hand back several values at once — Python bundles them into a tuple (Day 3!), which you can unpack straight into variables:

```python
def min_max(numbers):
    return min(numbers), max(numbers)   # returns two values

low, high = min_max([3, 7, 1, 9, 4])    # unpack them
print(low, high)
```

**Output:**

```text
1 9
```

(`min()` and `max()` are built-in functions that find the smallest and largest items — handy ones to know.)

---

## A quick word on scope

Variables created **inside** a function are *local* to it — they exist only while the function runs and can't be seen from outside:

```python
def f():
    inside = 10        # local to f
    print("inside the function:", inside)

f()
# print(inside)   # this would fail — `inside` doesn't exist out here
```

**Output:**

```text
inside the function: 10
```

This is a *feature*: each function gets its own private workspace, so its variables can't accidentally clash with another's. That's part of why functions make big programs manageable. (Scope gets its own full treatment on Day 6.)

---

## Why bother? What functions buy you

Four concrete wins, and they're the reason all real code is built this way:

- **Don't Repeat Yourself (DRY).** Write the logic once, call it everywhere. Fix a bug in one place, not ten.
- **Readability.** `list_contacts(contacts)` says *what* happens; the *how* is tucked away. A program reads like a summary.
- **Reuse.** A good function works in any program — you'll build a personal toolbox of them.
- **Testability.** A small function with clear inputs and a return value is easy to check in isolation (we'll lean on this hard from Day 13 onward).

> **Good habit — docstrings.** A short string on the first line of a function documents what it does. It's optional but professional:
> ```python
> def find_contact(contacts, name):
>     """Return the phone number for `name`, or None if not found."""
>     return contacts.get(name)
> ```

---

## How a function call actually works

Before the project, here's the mental model for a single call — what happens when you write `result = square(5)`:

```mermaid
flowchart TD
    A["Call it:\nresult = square(5)"] --> B["Argument fills the parameter:\nn = 5"]
    B --> C["Run the body:\nreturn n * n  →  25"]
    C --> D["The call square(5)\nbecomes its return value: 25"]
    D --> E["Back in the caller:\nresult = 25"]

    classDef call fill:#0e7490,stroke:#22d3ee,color:#e8feff
    classDef bind fill:#5b21b6,stroke:#a78bfa,color:#f3e8ff
    classDef run fill:#1e293b,stroke:#64748b,color:#e2e8f0
    classDef ret fill:#9a3412,stroke:#fb923c,color:#ffedd5
    classDef done fill:#065f46,stroke:#34d399,color:#d1fae5
    class A call
    class B bind
    class C run
    class D ret
    class E done
```

**Reading this diagram:**

Read it top to bottom — it's the life of one function call, frozen frame by frame.

The **cyan box** at the top is the call. You write `square(5)` — the name of the function followed by an argument, `5`, in parentheses. At this instant Python pauses the current line and jumps into the function.

The **purple box** is the key step beginners miss: the argument **fills the parameter**. The `5` you passed becomes `n` inside the function — that's how data gets *in*. If the function had three parameters, the three arguments would fill them in order.

The **grey box** is the function body running with `n` now equal to `5`: `return n * n` computes `25`. The moment Python reaches `return`, the function is done and `25` is the value it sends back.

The **orange box** is the return *substitution* — the single most important idea about functions. The expression `square(5)` is now **replaced by** its return value, `25`, right where it was written. It's as if you'd typed `25` there yourself.

The **green box** is the result back in the caller: `result = 25`. Control resumes on that line with the value in hand.

The takeaway: **arguments flow in to fill parameters, the body runs, and the return value flows back out to take the call's place.** Every function you ever write follows this in-run-out rhythm.

---

## Build it: refactor the contact book into functions

Now let's apply it. We'll take Day 4's menu-driven contact book and pull each action into its own function. The behaviour is identical — but the code becomes dramatically clearer, and each piece is now reusable and testable on its own. Create **`contact_book.py`** in a `day-05` folder:

```python
# contact_book.py — organized into functions (Day 5: functions & return values)

def show_menu():
    print("\nMenu:")
    print("  1. List all contacts")
    print("  2. Add a contact")
    print("  3. Look up a contact")
    print("  4. Quit")

def list_contacts(contacts):
    if len(contacts) == 0:
        print("No contacts yet.")
        return                      # early exit — nothing to list
    print(f"\nYou have {len(contacts)} contacts:")
    for name, phone in contacts.items():
        print(f"  - {name}: {phone}")

def add_contact(contacts, name, phone):
    contacts[name] = phone
    return len(contacts)            # hand back the new total

def find_contact(contacts, name):
    return contacts.get(name)       # the phone, or None if missing

# --- main program ---
contacts = {
    "Ada": "555-0100",
    "Linus": "555-0142",
    "Grace": "555-0199",
}

print("=== Contact Book ===")

while True:
    show_menu()
    choice = input("Choose an option (1-4): ")

    if choice == "1":
        list_contacts(contacts)
    elif choice == "2":
        name = input("Name: ")
        phone = input("Phone: ")
        total = add_contact(contacts, name, phone)
        print(f"Saved {name}. You now have {total} contacts.")
    elif choice == "3":
        name = input("Name to look up: ")
        phone = find_contact(contacts, name)
        if phone is None:
            print(f"{name} not found.")
        else:
            print(f"{name}: {phone}")
    elif choice == "4":
        print("Goodbye!")
        break
    else:
        print("Please enter a number from 1 to 4.")
```

**Run it** (`python3 contact_book.py` / `python contact_book.py`). It behaves exactly like Day 4 — here's the same session (menu abbreviated as `Menu: …` after the first):

```text
=== Contact Book ===

Menu:
  1. List all contacts
  2. Add a contact
  3. Look up a contact
  4. Quit
Choose an option (1-4): 1

You have 3 contacts:
  - Ada: 555-0100
  - Linus: 555-0142
  - Grace: 555-0199

Menu: …
Choose an option (1-4): 2
Name: Margaret
Phone: 555-0125
Saved Margaret. You now have 4 contacts.

Menu: …
Choose an option (1-4): 3
Name to look up: Margaret
Margaret: 555-0125

Menu: …
Choose an option (1-4): 3
Name to look up: Bob
Bob not found.

Menu: …
Choose an option (1-4): 9
Please enter a number from 1 to 4.

Menu: …
Choose an option (1-4): 4
Goodbye!
```

Same behaviour — but now read the `while` loop at the bottom. It's almost plain English: *show the menu, get a choice, list or add or find or quit.* The messy details live in named functions above. That's the payoff.

### Understanding the code

- **`show_menu()`** takes no parameters and returns nothing — it just prints. A function doesn't *have* to take input or return a value; sometimes its whole job is a side effect.
- **`list_contacts(contacts)`** takes the dictionary as a parameter and uses an **early `return`** to bail out when it's empty — everything below the `return` is skipped.
- **`add_contact(contacts, name, phone)`** takes three parameters and **returns** the new contact count, which the caller captures in `total` and prints. (Notice it changes the `contacts` dictionary that was passed in — because dicts are mutable, the function works on the *same* dictionary, not a copy. More on that nuance Day 6.)
- **`find_contact(contacts, name)`** **returns** the phone number or `None`. The caller checks `if phone is None:` — the clean way to test for "not found." This is exactly the print-vs-return distinction put to work: `find_contact` *returns* so the caller can decide what to do.

Each function does one job, has a clear name, and (where it makes sense) hands back a value. That's the whole craft.

---

## Common errors and how to fix them

**1. `TypeError: greet() missing 1 required positional argument: 'name'`**
You called a function without an argument it needs — `greet()` when it's defined as `def greet(name):`. Pass the expected argument: `greet("Ada")`. The message even names the missing parameter (`'name'`).

**2. `TypeError: greet() takes 1 positional argument but 2 were given`**
The opposite — you passed *more* arguments than the function accepts. Count the parameters in the `def` line and match them. (If you genuinely need to vary the count, default values help.)

**3. `TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'`**
The classic "forgot to `return`" bug. You used a function's result in maths, but the function only `print`ed and returned `None` — so you're really doing `None + 1`. Fix the function to `return` its value instead of (or as well as) printing it. Whenever you see `NoneType` in an error, suspect a missing `return`.

**4. `NameError: name 'inside' is not defined`**
You tried to use a variable outside the function that created it. Local variables vanish when the function ends. If you need the value outside, **`return` it** and capture it: `result = my_function()`.

**5. `NameError: name 'greet' is not defined` (when calling a function)**
You called a function before defining it — Python reads top to bottom, so the `def` must appear **above** the call. Move the definition up. (In bigger programs the common pattern is: all `def`s first, then the main code that calls them — exactly how the project is laid out.)

**6. Nothing happens when I "call" my function**
You wrote `square` instead of `square(5)` — referencing a function *without parentheses* doesn't run it; it just refers to the function object (printing it shows something like `<function square at 0x...>`). **To call a function, you need the parentheses** — even when it takes no arguments: `show_menu()`, not `show_menu`.

> **Reading tip:** function errors are friendly — a `TypeError` about arguments tells you exactly how many were expected vs given, and even names the missing one. Read it literally and match your call to the `def` line.

---

## Recap — what you can do now

You can now structure programs the way professionals do:

- ✅ **Define** functions with `def`, and **call** them with `()`.
- ✅ **Parameters & arguments** — pass data in, including multiple values.
- ✅ **`return`** — hand a value back, and the crucial **`return` vs `print`** distinction (and that no `return` means `None`).
- ✅ **Default & keyword arguments** — optional, readable parameters.
- ✅ **Multiple return values** via tuple unpacking.
- ✅ **Local scope** basics — every function gets its own workspace.
- ✅ A **refactored contact book** where each action is a clean, named function.

### Day 5 cheat sheet

| Want to… | Write |
|---|---|
| Define a function | `def name(params):` |
| Call it | `name(args)` |
| Take input | `def f(a, b):` |
| Give an answer back | `return value` |
| Optional parameter | `def f(x, y=10):` |
| Call by name | `f(x, y=20)` |
| Return several values | `return a, b` → `x, y = f()` |
| Exit early | `return` (on its own) |
| Document it | `"""docstring"""` as first line |

---

## Coming up on Day 6

Your contact book is now a set of tidy functions — but they all still live in one file. As projects grow, you split code across multiple files (**modules**) and pull in code others have written. Tomorrow is **scope, imports, and modules**: how Python decides which variables are visible where, how to move your contact functions into their own `contacts.py` module and `import` them into a main program, and how to use Python's vast **standard library**. It's the last piece of the foundations — and it's what makes your code organisable at any size.

You've learned to package logic. Next, we learn to organise and share it. See the full roadmap on the [Python for AI Engineering series page](/series/python-for-ai-engineering).

**See you on Day 6.** 🐍
