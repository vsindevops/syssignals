---
title: "Async in Practice: LLM, RAG & Agents"
day: 20
date: "2026-06-23"
excerpt: "Day 20 of Python for AI Engineering, completing Module 7. Put async to work on real AI patterns: fan out many LLM-style calls concurrently, handle failures among them with return_exceptions, and respect rate limits with a Semaphore. Understand why async is the backbone of fast agents, RAG, and batch LLM processing."
tags: ["python","async","asyncio","llm","rag","agents","concurrency","semaphore","ai-engineering","beginners"]
topics: ["Python"]
series: "Python for AI Engineering"
seriesSlug: "python-for-ai-engineering"
seriesTotal: 30
---

Yesterday you learned the mechanics of async with fake `asyncio.sleep` waits. Today we make it real and point it straight at AI — because async isn't just *a* tool for AI engineering, it's *the* one that makes AI applications fast. This day closes **Module 7** by showing the patterns you'll actually use.

Three of the most common AI workloads are almost entirely *waiting on the network*:

- An **agent** decides to call five tools — it can call them all at once instead of in turn.
- A **RAG** system retrieves from several sources before answering — fetch them concurrently.
- A **batch** job summarises or classifies a thousand documents — process many in parallel.

Every one of these spends its time waiting on LLM and API responses, which is exactly what async excels at. Today you'll fan out concurrent calls, **handle failures** among them (real APIs fail), and **respect rate limits** with a `Semaphore` — the production-grade version of yesterday's demo.

> **A member lesson — Module 7 finale.** This is where async pays off for AI. The patterns here (fan-out, gather-with-failures, semaphore) are exactly what production LLM code uses. Run the project and watch a batch with a failure complete cleanly.

---

## Fan out: many calls at once

The core move is yesterday's `asyncio.gather`, now framed for AI: you have a list of inputs, you want to call a model (or tool, or API) on each, and you want them to run **concurrently**. A comprehension builds the coroutines; `gather` runs them together:

```python
results = await asyncio.gather(*(call_llm(p) for p in prompts))
```

If each call waits ~1 second and you have ten of them, this finishes in ~1 second instead of ten. That single line is why a well-written agent feels instant while a naive one crawls. But real calls aren't perfectly reliable, and real APIs won't let you make unlimited calls at once — so we need two more pieces.

---

## Handling failures among many calls

By default, if *any* coroutine in a `gather` raises, the whole `gather` fails and you lose the other results:

```python
async def task(n):
    if n == 2:
        raise ValueError("boom")
    return n

# await asyncio.gather(task(1), task(2), task(3))  → raises ValueError("boom")
```

When you're calling an external service, *some calls will fail* — a timeout, a refusal, a rate-limit error — and you don't want one bad call to throw away nine good ones. Pass **`return_exceptions=True`**, and `gather` returns each exception *as a result* instead of raising:

```python
import asyncio

async def task(n):
    if n == 2:
        raise ValueError("boom")
    await asyncio.sleep(0.1)
    return n

async def main():
    results = await asyncio.gather(task(1), task(2), task(3), return_exceptions=True)
    print(results)

asyncio.run(main())
```

**Output:**

```text
[1, ValueError('boom'), 3]
```

Now you have all three results — two values and one exception — and you sort them out with **`isinstance(result, Exception)`**. This is essential for batch AI work: process what succeeded, log or retry what failed, and never let one bad response sink the batch.

---

## Respecting rate limits with a Semaphore

Firing off a thousand LLM calls at once will get you **rate-limited** (or billed into oblivion) — APIs allow only so many concurrent requests. An **`asyncio.Semaphore`** caps how many coroutines run at a time: it hands out a fixed number of "permits," and a coroutine waits for one before proceeding. You acquire it with `async with`:

```python
import asyncio, time

async def worker(n, sem):
    async with sem:              # wait for a free permit, then run
        await asyncio.sleep(0.5)
        return n

async def main():
    sem = asyncio.Semaphore(2)   # at most 2 at a time
    t0 = time.perf_counter()
    results = await asyncio.gather(*(worker(i, sem) for i in range(4)))
    print(results, f"in {time.perf_counter() - t0:.1f}s")

asyncio.run(main())
```

**Output:**

```text
[0, 1, 2, 3] in 1.0s
```

Four tasks, but only two run at once, so they go in two waves — `1.0s` instead of `0.5s` (all at once) or `2.0s` (one at a time). The `Semaphore` is the dial between "as fast as possible" and "within the API's limits." Every production batch-LLM script has one.

---

## The fan-out / fan-in pattern

```mermaid
flowchart TD
    Start["one AI task\nagent · RAG · batch"] --> Fan["fan out\nasyncio.gather"]
    Fan --> C1["LLM / tool call 1"]
    Fan --> C2["LLM / tool call 2"]
    Fan --> C3["LLM / tool call 3"]
    C1 --> Join["fan in\ncollect results +\nhandle failures"]
    C2 --> Join
    C3 --> Join
    Join --> Done["combined answer"]

    classDef start fill:#0e7490,stroke:#22d3ee,color:#e8feff
    classDef fan fill:#5b21b6,stroke:#a78bfa,color:#f3e8ff
    classDef call fill:#1e293b,stroke:#64748b,color:#e2e8f0
    classDef done fill:#065f46,stroke:#34d399,color:#d1fae5
    class Start,Done start
    class Fan,Join fan
    class C1,C2,C3 call
```

**Reading this diagram:**

This is the shape of nearly every concurrent AI workload, top to bottom.

It begins with the **cyan box** — one high-level task: an agent that needs several tools, a RAG query that needs several sources, a batch that needs to process many items. The **purple "fan out" box** is `asyncio.gather`: it takes that one task and splits it into **many concurrent calls** — the three grey **call boxes** (LLM requests, tool invocations, retrievals). Crucially, these all run *at the same time*, overlapping their waits, rather than one after another.

When they finish, the flow narrows back to the second **purple box — "fan in"**: you collect every result, and this is where `return_exceptions=True` and your `isinstance` check matter — some calls succeeded, some may have failed, and you sort them out here. Finally, the **cyan "combined answer" box** is the merged result: the agent's tool outputs assembled, the RAG context gathered for one final LLM call, the batch's summaries collected.

The takeaway: **fan out into concurrent calls, then fan in to collect and reconcile results.** The "fan out" is where async buys you speed (N waits become one); the "fan in" is where robustness lives (handle the failures). Master this one pattern and you can build responsive agents, RAG pipelines, and batch processors.

---

## Build it: a concurrent AI batch processor

Let's combine all three — fan-out, failure handling, and a rate limit — into a realistic batch processor. It calls a (simulated) LLM on five prompts, at most two at a time, where one prompt fails. No installs needed. Create **`ai_batch.py`** in a `day-20` folder:

```python
# ai_batch.py — async for LLM/RAG/agent-style workloads (Day 20)
import asyncio
import time

async def call_llm(prompt: str, semaphore: asyncio.Semaphore) -> str:
    """Simulate an LLM API call: it WAITS (network), and can fail."""
    async with semaphore:                  # cap how many run at the same time
        await asyncio.sleep(1.0)           # the model thinking / network wait
        if prompt == "bad prompt":
            raise RuntimeError("model refused the request")
        return f"summary of '{prompt}'"

async def main():
    prompts = ["doc 1", "doc 2", "bad prompt", "doc 4", "doc 5"]
    semaphore = asyncio.Semaphore(2)       # at most 2 calls at once (rate limit)

    print(f"Processing {len(prompts)} prompts (max 2 concurrent)...")
    t0 = time.perf_counter()
    results = await asyncio.gather(
        *(call_llm(p, semaphore) for p in prompts),
        return_exceptions=True,            # one failure won't kill the others
    )
    elapsed = time.perf_counter() - t0

    ok = 0
    for prompt, result in zip(prompts, results):
        if isinstance(result, Exception):
            print(f"  [FAIL] {prompt}: {result}")
        else:
            print(f"  [ok]   {result}")
            ok += 1

    print(f"\nDone: {ok}/{len(prompts)} succeeded in {elapsed:.1f}s")

asyncio.run(main())
```

**Run it** (`python3 ai_batch.py` / `python ai_batch.py`):

```text
Processing 5 prompts (max 2 concurrent)...
  [ok]   summary of 'doc 1'
  [ok]   summary of 'doc 2'
  [FAIL] bad prompt: model refused the request
  [ok]   summary of 'doc 4'
  [ok]   summary of 'doc 5'

Done: 4/5 succeeded in 3.0s
```

Everything important happened: five calls ran concurrently but **never more than two at once** (so 5 calls × 1s, two at a time, took ~3s — not 5s sequential, not 1s unlimited), the one bad prompt **failed without sinking the batch**, and you got a clean tally of what succeeded. Swap `call_llm` for a real API call (tomorrow's `httpx`) and this is production-shaped batch code.

### Understanding the code

- **`async with semaphore:`** wraps each call so at most 2 run concurrently — the rate-limit guard. Change `Semaphore(2)` to tune throughput vs limits.
- **`asyncio.gather(*(call_llm(p, semaphore) for p in prompts), return_exceptions=True)`** fans out all five calls and collects every outcome — values *and* exceptions.
- **`zip(prompts, results)`** pairs each prompt with its result; `gather` preserves input order, so they line up.
- **`isinstance(result, Exception)`** sorts successes from failures — the fan-in step. Failures are reported, successes counted.
- **The timing** shows the semaphore's effect: concurrency capped at 2 means ~3s for 5 one-second calls.

This is the async pattern you'll reuse constantly once you're calling real models — batch summarisation, multi-source RAG retrieval, an agent's parallel tool calls.

---

## Common errors and how to fix them

**1. One failed call threw away all my results**
You used `asyncio.gather(...)` without `return_exceptions=True`, so the first exception propagated and you lost the successful results too. Add `return_exceptions=True` and check each result with `isinstance(r, Exception)`.

**2. I forgot to check `isinstance` and treated an exception as data**
With `return_exceptions=True`, some entries in the results list are *exception objects*, not values. Always branch on `isinstance(result, Exception)` before using a result, or you'll hit an `AttributeError` trying to use an exception like a string.

**3. The API rate-limited me / I got throttled**
You ran too many calls concurrently. Add an `asyncio.Semaphore(n)` and wrap each call in `async with semaphore:` to cap concurrency to what the API allows (and to control cost).

**4. `Semaphore` made everything serial / had no effect**
A limit of `1` runs calls one at a time (no concurrency); a limit larger than your number of tasks has no effect. Pick a value between — e.g. 5–10 for most APIs — to overlap waits while staying within limits.

**5. My "concurrent" batch is slow as a sequential one**
A blocking call sneaked into the async path (`time.sleep`, or a synchronous HTTP library). Use async all the way down — `await asyncio.sleep`, and async HTTP (`httpx`, tomorrow). One blocking call freezes the whole event loop.

**6. Results came back in the wrong order**
They didn't — `asyncio.gather` returns results in the **order you passed the coroutines**, regardless of which finished first. If you need results as they *complete* instead, that's `asyncio.as_completed(...)`; but for matching inputs to outputs, `gather` + `zip` is exactly right.

> **Reading tip:** for concurrent AI calls, remember the trio — `gather` (fan out), `return_exceptions=True` (survive failures), `Semaphore` (respect limits). Missing any one is the cause of most "it works in the demo but breaks in production" async bugs.

---

## Recap — Module 7 complete 🎉

You can now write concurrent code for real AI workloads:

- ✅ **Fan out** — `asyncio.gather(*(call(x) for x in items))` to run many calls at once.
- ✅ **Survive failures** — `return_exceptions=True` + `isinstance` to handle mixed results.
- ✅ **Respect limits** — `asyncio.Semaphore(n)` with `async with` to cap concurrency.
- ✅ **The fan-out/fan-in pattern** — the shape of agents, RAG, and batch jobs.
- ✅ **Why async is the AI backbone** — these workloads are all I/O-bound waiting.
- ✅ A **concurrent batch processor** that's rate-limited and failure-tolerant.

Module 7 took you from the mechanics of async (Day 19) to the production patterns that make AI applications fast and robust (Day 20).

### Day 20 cheat sheet

| Want to… | Write |
|---|---|
| Fan out calls | `await asyncio.gather(*(f(x) for x in xs))` |
| Survive failures | `gather(..., return_exceptions=True)` |
| Tell errors from results | `if isinstance(r, Exception):` |
| Cap concurrency | `sem = asyncio.Semaphore(n)` |
| Use the cap | `async with sem:` |
| Pair inputs ↔ outputs | `zip(items, results)` |
| Process as they finish | `asyncio.as_completed(...)` |

---

## Coming up on Day 21 — a new module begins

You've been *simulating* network calls with `asyncio.sleep` — time to make them real. **Module 8 is Python for APIs**, and Day 21 starts with **HTTP and the `requests` library**: how the web actually talks (requests, responses, status codes, JSON), and how to call a real API from Python, parse what comes back, and handle errors. It's the bridge to talking to actual services — and, in Module 9, to LLMs.

You've mastered concurrency. Next, we make real calls to the outside world. See the full roadmap on the [Python for AI Engineering series page](/series/python-for-ai-engineering).

**See you on Day 21.** 🐍
