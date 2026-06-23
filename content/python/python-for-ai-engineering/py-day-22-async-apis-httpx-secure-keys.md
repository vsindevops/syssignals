---
title: "Async APIs with httpx & Secure Keys"
day: 22
date: "2026-06-23"
excerpt: "Day 22 of Python for AI Engineering. Meet httpx — a modern HTTP library that works like requests but supports async — and fire off many API calls concurrently with asyncio.gather. Plus the secure way to handle API keys: load them from a .env file and send them in headers. The exact setup for calling paid APIs and LLMs."
tags: ["python","httpx","async","api","api-keys","secrets","concurrency","ai-engineering","beginners"]
topics: ["Python"]
series: "Python for AI Engineering"
seriesSlug: "python-for-ai-engineering"
seriesTotal: 30
---

`requests` (Day 21) is excellent — but it's **synchronous**: one call at a time, blocking until each response comes back. When you need to call an API ten times, that's ten waits in a row — exactly the slow pattern async fixes (Days 19–20). Today you'll combine the two: real HTTP *and* concurrency.

The tool is **`httpx`** — a modern HTTP library with the same friendly API as `requests`, plus full **`async`** support. With `httpx` and `asyncio.gather`, you fire off many API calls at once. You'll also learn to handle **API keys securely** — loading them from a `.env` file (Day 15) and sending them in request headers — which is the precise setup you need before calling paid services and LLMs in the next module.

> **A member lesson.** This day is the direct prerequisite for calling LLMs: async HTTP + a key in a header *is* an LLM call. Run the project and watch many requests finish in the time of one.

---

## httpx: requests, but async-ready

Install `httpx` (in your venv). Used synchronously, it's a near drop-in for `requests` — if you know one, you know the other:

```bash
pip install httpx
```

```python
import httpx

r = httpx.get("https://jsonplaceholder.typicode.com/users/1", timeout=10)
print("status:", r.status_code, "| name:", r.json()["name"])
```

**Output:**

```text
status: 200 | name: Leanne Graham
```

Same `.status_code`, same `.json()`, same `raise_for_status()` — everything from Day 21 transfers. So why switch? Because `httpx` also does **async**, and that's where the speed is.

---

## Async requests with AsyncClient

For concurrency, you use **`httpx.AsyncClient`** inside `async`/`await`. You open it with `async with` (it cleans up connections for you), and `await` each call:

```python
import asyncio, httpx

async def main():
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get("https://jsonplaceholder.typicode.com/todos/4")
        print("todo 4:", r.json()["title"], "| done:", r.json()["completed"])

asyncio.run(main())
```

**Output:**

```text
todo 4: et porro tempora | done: True
```

`async with httpx.AsyncClient() as client:` creates a **reusable client** — one connection pool you use for *all* your requests, which is both faster (connections are reused) and where you put shared settings like headers. `await client.get(...)` is the async version of the call. On its own this is just one request — but because it's a coroutine, you can now run *many* concurrently.

---

## Many calls at once: AsyncClient + gather

Here's the payoff. Combine the **one reused client** with **`asyncio.gather`** (Day 20) to fetch many resources concurrently:

```python
import asyncio, httpx, time

BASE = "https://jsonplaceholder.typicode.com"

async def one(client, i):
    r = await client.get(f"{BASE}/posts/{i}")
    return r.status_code

async def main():
    async with httpx.AsyncClient(timeout=15) as client:
        t0 = time.perf_counter()
        results = await asyncio.gather(*(one(client, i) for i in range(1, 6)))
    print(f"{len(results)} requests in {time.perf_counter() - t0:.2f}s")

asyncio.run(main())
```

Run that five requests **sequentially** (a plain `for` loop with `await`) versus **concurrently** (`gather`), and the difference is real:

```text
sequential 5: 0.87s | concurrent 5: 0.33s
```

Same five requests, but concurrently they overlap their waits and finish in a fraction of the time. (Exact numbers vary with your network.) Scale to ten or fifty calls and the gap widens — which is exactly why async HTTP matters for AI, where you're often making many model and tool calls.

---

## Handling API keys securely

Most real APIs require an **API key** to authenticate — and there's an iron rule (Day 15): **never hard-code it.** A key in your `.py` file leaks the instant the code is shared or pushed. Instead, load it from a `.env` file and send it in a **header**.

Put the key in `.env` (and `.gitignore` that file):

> File: `.env`
> ```
> API_KEY=sk-demo-secret-12345
> ```

Then load it and attach it to your client as an **`Authorization`** header — the standard way APIs expect credentials:

```python
import os, httpx
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("API_KEY")

headers = {"Authorization": f"Bearer {api_key}"}    # the standard auth header
async with httpx.AsyncClient(headers=headers, timeout=10) as client:
    ...    # every request through this client now carries the key
```

Setting `headers=` on the `AsyncClient` means **every** request it makes includes the key — set it once, used everywhere. The `Bearer <key>` format is what most APIs (including LLM providers) expect; a few use a custom header like `x-api-key` instead — the docs tell you which. The key itself stays safely in `.env`, out of your code and out of Git.

---

## The secure, concurrent request flow

```mermaid
flowchart LR
    Env[".env\nAPI_KEY=secret"] -->|"load_dotenv()\nos.getenv()"| Key["Authorization:\nBearer <key>"]
    Key --> Client["httpx.AsyncClient\nheaders set once, reused"]
    Client -->|"asyncio.gather\nmany calls at once"| API["API server"]

    classDef env fill:#9a3412,stroke:#fb923c,color:#ffedd5
    classDef key fill:#5b21b6,stroke:#a78bfa,color:#f3e8ff
    classDef client fill:#0e7490,stroke:#22d3ee,color:#e8feff
    classDef api fill:#065f46,stroke:#34d399,color:#d1fae5
    class Env env
    class Key key
    class Client client
    class API api
```

**Reading this diagram:**

Follow the key from left to right — it's the journey of a credential from a safe file to an authenticated, concurrent request.

The **orange box** is your `.env` file, where the secret lives — never in code, never in Git. `load_dotenv()` and `os.getenv()` read it *into* your program at startup (the same Day 15 pattern).

The **purple box** turns that raw key into an **`Authorization: Bearer <key>`** header — the format APIs recognise as "here are my credentials."

The **cyan box** is the `httpx.AsyncClient`, created with `headers=` set **once**. This single, reused client now stamps that auth header onto *every* request it makes — you never repeat the key per call.

Finally, the arrow into the green **API server** is labelled `asyncio.gather`: the client fires off **many** authenticated requests **concurrently**, and they all overlap. 

The takeaway: **secret stays in `.env` → becomes a header → set once on a reused async client → fans out into many concurrent, authenticated calls.** That's the complete, production-shaped pattern — and it's exactly how you'll call an LLM API tomorrow's-tomorrow.

---

## Build it: a concurrent, authenticated fetcher

Let's put it together — a client that loads a key from `.env`, sends it as an auth header, and fetches several resources concurrently. Set up the venv and `.env`, then create **`async_fetch.py`** in a `day-22` folder:

```bash
python3 -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\Activate.ps1
pip install httpx python-dotenv
```

> File: `.env`
> ```
> API_KEY=sk-demo-secret-12345
> ```

```python
# async_fetch.py — concurrent API calls with httpx + secure keys (Day 22)
import asyncio
import os
import time
import httpx
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY", "demo-key")   # loaded from .env, never hard-coded

BASE = "https://jsonplaceholder.typicode.com"

async def fetch_todo(client: httpx.AsyncClient, todo_id: int) -> dict:
    resp = await client.get(f"{BASE}/todos/{todo_id}")
    resp.raise_for_status()
    return resp.json()

async def main():
    headers = {"Authorization": f"Bearer {API_KEY}"}   # how real APIs authenticate
    ids = [1, 2, 3, 4, 5]

    # one reused client (connection pooling) carrying the auth header
    async with httpx.AsyncClient(headers=headers, timeout=10) as client:
        t0 = time.perf_counter()
        todos = await asyncio.gather(*(fetch_todo(client, i) for i in ids))
        elapsed = time.perf_counter() - t0

    print(f"Fetched {len(todos)} todos concurrently in {elapsed:.2f}s:")
    for todo in todos:
        status = "done" if todo["completed"] else "open"
        print(f"  #{todo['id']}: {todo['title'][:35]} [{status}]")

asyncio.run(main())
```

**Run it** (`python async_fetch.py`):

```text
Fetched 5 todos concurrently in 1.08s:
  #1: delectus aut autem [open]
  #2: quis ut nam facilis et officia qui [open]
  #3: fugiat veniam minus [open]
  #4: et porro tempora [done]
  #5: laboriosam mollitia et enim quasi a [open]
```

Five authenticated requests, fired concurrently through one reused client, all done in about a second (your exact time varies with the network). The auth header rode along on every call, and the key never appeared in the code. (jsonplaceholder ignores the header since it's open, but real APIs would check it — the *pattern* is identical.)

### Understanding the code

- **`load_dotenv()` + `os.getenv("API_KEY")`** read the secret from `.env` — it's never written in the source.
- **`headers={"Authorization": f"Bearer {API_KEY}"}`** is the standard auth header, set **on the client** so every request carries it.
- **`async with httpx.AsyncClient(...) as client:`** opens one reused, pooled client — created once, used for all five calls.
- **`fetch_todo`** is an `async` coroutine doing one `await client.get(...)` and `raise_for_status()` (Day 21 error handling, async).
- **`asyncio.gather(*(fetch_todo(client, i) for i in ids))`** fans out all five concurrently (Day 20) — they overlap instead of queueing.

This is the exact skeleton of an LLM client: a key from `.env`, an auth header, an `AsyncClient`, and `gather` for concurrency.

---

## Common errors and how to fix them

**1. `ModuleNotFoundError: No module named 'httpx'`**
Not installed in the active environment. Activate your venv and `pip install httpx` (and `python-dotenv`), then add them to `requirements.txt`.

**2. My async client code is slow / not concurrent**
You either awaited calls one at a time in a loop (sequential) instead of `gather`-ing them, or created a **new** `AsyncClient` per request. Use one `async with httpx.AsyncClient() as client:` and `asyncio.gather` the calls through it.

**3. `RuntimeError: Cannot send a request, as the client has been closed.`**
You used the `client` outside its `async with` block, after it was cleaned up. Keep all requests *inside* the `async with` — or, if you must, manage the client's lifecycle explicitly.

**4. `401 Unauthorized` / `403 Forbidden`**
The API rejected your credentials — a missing, wrong, or malformed key. Check the key is loaded (`print(bool(api_key))` — not the key itself!), that the header name and format match the API's docs (`Bearer <key>` vs `x-api-key`), and that the key is still valid.

**5. My API key leaked / is in my Git history**
You hard-coded it or committed `.env`. Move the key to `.env`, add `.env` to `.gitignore`, and **rotate the key** (revoke and regenerate) — once a secret hits a repo, treat it as compromised.

**6. `httpx.ConnectTimeout` / `httpx.ReadTimeout`**
A request took longer than your `timeout`. Increase it for slow endpoints, and catch `httpx.TimeoutException` to retry or fall back. (LLM calls can be slow — give them generous timeouts.)

> **Reading tip:** auth problems are almost always the header. Print whether the key *loaded* (a boolean, never the value), and compare your header name and format against the API's documentation exactly.

---

## Recap — what you can do now

You can call APIs concurrently and securely:

- ✅ **`httpx`** — a `requests`-like API with full async support.
- ✅ **`AsyncClient`** — one reused, pooled client inside `async with`.
- ✅ **Concurrency** — `AsyncClient` + `asyncio.gather` for many calls at once.
- ✅ **Secure keys** — load from `.env`, send as an `Authorization: Bearer` header, never hard-code.
- ✅ **Set headers once** on the client; they apply to every request.
- ✅ A **concurrent, authenticated fetcher** — the LLM-client skeleton.

### Day 22 cheat sheet

| Want to… | Write |
|---|---|
| Install | `pip install httpx python-dotenv` |
| Sync call | `httpx.get(url, timeout=10)` |
| Async client | `async with httpx.AsyncClient() as client:` |
| Async call | `await client.get(url)` |
| Many at once | `await asyncio.gather(*(f(client, x) for x in xs))` |
| Load a key | `os.getenv("API_KEY")` (after `load_dotenv()`) |
| Send the key | `headers={"Authorization": f"Bearer {key}"}` |
| Keep it safe | key in `.env`, `.env` in `.gitignore` |

---

## Coming up on Day 23

You can fetch JSON from any API now — but raw JSON is untrusted and easy to misread (a missing key, a wrong type, an unexpected shape). Tomorrow closes Module 8 by combining everything: **parsing and validating API responses** with **Pydantic** (Day 18). You'll turn raw API JSON straight into validated, typed model objects — catching bad data at the boundary and giving the rest of your code something it can fully trust. It's the professional way to consume any API, and the final prep before calling LLMs.

You've learned to call APIs fast and securely. Next, we make their responses trustworthy. See the full roadmap on the [Python for AI Engineering series page](/series/python-for-ai-engineering).

**See you on Day 23.** 🐍
