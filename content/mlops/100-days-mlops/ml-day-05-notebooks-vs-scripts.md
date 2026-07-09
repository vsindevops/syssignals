---
title: "Notebooks vs Scripts: Explore Fast, Ship Reliably"
day: 5
date: "2026-07-09"
excerpt: "Day 5 of 100 Days of MLOps. Jupyter notebooks are where ML ideas are born; clean .py scripts are what actually ships. Learn both, understand the notebook 'hidden state' trap, and master the real MLOps workflow: prototype in a notebook, convert it with nbconvert, then clean it into a script a pipeline can trust. Works on macOS, Windows and Linux."
tags: ["mlops","jupyter","notebooks","scripts","nbconvert","pandas","reproducibility","beginners","macos","windows","linux"]
topics: ["MLOps"]
series: "100 Days of MLOps"
seriesSlug: "100-days-mlops"
seriesTotal: 100
---

Welcome to **Day 5 of 100 Days of MLOps**. So far you've written code in `.py` files. But if you watch a data scientist work, you'll usually see something different on their screen: a **Jupyter notebook** — an interactive scratchpad where you run code one chunk at a time and see results instantly, right below each chunk.

Notebooks are wonderful for *exploring*. They're also, if you're not careful, a trap that produces results nobody can reproduce. Today you'll learn both notebooks and scripts, understand exactly when each one belongs, and — most importantly — master the workflow that bridges them: **prototype in a notebook, then promote it to a clean script that a pipeline can run reliably.** That bridge is one of the most practical everyday skills in all of MLOps.

> **Haven't seen a notebook before? No problem.** We install Jupyter together, run a real exploration, and then turn it into a proper script step by step. Everything runs locally.

By the end of today you will:

- Understand what a **Jupyter notebook** is and why it's great for exploration.
- Understand the notebook **"hidden state" trap** — and why production ML runs on scripts.
- Install and launch **Jupyter**, and explore the house-prices data in a notebook.
- Convert that notebook to a script with **`nbconvert`**, then **clean it into a real, reliable `.py`**.

---

## Two tools, two jobs

A **script** is a plain `.py` file. It runs **top to bottom**, every time, the same way. That predictability is exactly what you want for anything important — a training job, a data pipeline, a deployed service. This is what most of MLOps is made of.

A **Jupyter notebook** (a `.ipynb` file) is different. It's split into **cells** — little blocks of code you run individually, in any order you like, with the output (numbers, tables, charts) appearing inline right under each cell. That makes it a fantastic *exploration* tool: load some data, poke at it, plot it, try an idea, tweak, re-run — all without restarting anything.

Here's the honest tension between them, and the workflow that resolves it:

```mermaid
flowchart LR
    EXPLORE["Notebook (.ipynb)<br/>explore · try ideas · see results inline"] -->|"jupyter nbconvert --to script"| RAW["Raw .py<br/>a starting point, not done"]
    RAW -->|"clean up: real print/save + a main()"| SCRIPT["Production script (.py)<br/>runs top-to-bottom, reliably"]
    SCRIPT --> PIPE["Pipelines · training jobs · deployment"]

    classDef explore fill:#3b1d0e,stroke:#f59e0b,color:#fde3c3;
    classDef mid fill:#1a1030,stroke:#a78bfa,color:#ece7fb;
    classDef prod fill:#052e1a,stroke:#34d399,color:#d1fae5;
    class EXPLORE explore;
    class RAW mid;
    class SCRIPT prod;
    class PIPE prod;
```

**Reading this diagram:**

Start on the left with the **amber node** — the **notebook**. Amber is our "messy, interactive, hands-on" colour, and that's exactly what exploration is: you're trying things, seeing results inline, changing your mind. This is where an ML idea is born.

The first arrow, labelled `jupyter nbconvert --to script`, takes that notebook and turns it into a **raw `.py` file** — the **purple** node in the middle. Purple marks it as an *in-between* stage: it's real Python now, but it is **not finished**. A straight conversion carries over notebook quirks that don't work the same in a script (we'll see exactly what breaks in a moment).

The second arrow is the step beginners skip and professionals never do: **clean it up.** You turn notebook "display" lines into explicit `print()` or file-saving code, wrap logic in a `main()`, and remove dead experiments. That gives you the **green node** — a **production script** — and green, as always in this series, means "ready to rely on." From there it flows into **pipelines, training jobs and deployment**: the parts of the loop that must run unattended.

The takeaway: **notebooks are for exploring; scripts are for shipping; `nbconvert` plus a cleanup pass is the bridge.** MLOps lives mostly on the green side.

---

## The notebook "hidden state" trap

Before we use notebooks, understand their one big danger — because it explains *why* we don't ship them.

In a notebook you can run cells **in any order**, and re-run them as often as you like. Each run quietly updates the notebook's memory (its "state"). So you might:

1. Run a cell that creates `df`.
2. Edit that cell and run a later one.
3. Delete the first cell.

…and the notebook *still works*, because `df` is lingering in memory — even though the code you can see would no longer produce it. Send that notebook to a colleague who runs it top-to-bottom and it **crashes**, because your saved result secretly depended on a cell that no longer exists. This is called **hidden state**, and it's the number-one reason notebook "results" so often can't be reproduced.

Rule of thumb: a notebook result you can't reproduce by choosing **"Restart Kernel and Run All"** isn't a real result yet. And anything that must run *without a human clicking cells* — every training job, every pipeline — belongs in a **script**, which by nature runs top-to-bottom every time.

---

## Step 1 — Install and launch Jupyter

Jupyter is just another Python library, so it goes in your virtual environment (Day 3). Activate your project's environment and install it alongside pandas:

```bash
pip install jupyter pandas
```

Then re-freeze so your recipe stays current (Day 3's golden rule):

```bash
pip freeze > requirements.txt
```

Now launch the notebook interface:

```bash
jupyter notebook
```

This starts a small local web server and opens your browser to the Jupyter interface (all on your own machine — nothing goes online). You'll see your project's files; click **New → Python 3** to create a notebook, or open an existing `.ipynb`. When you're done, close the browser tab and press **`Ctrl+C`** in the terminal to stop the server.

> **VS Code can open notebooks too.** If you installed the Microsoft Python extension on Day 1, you can just create a file ending in `.ipynb` and VS Code gives you the same cell-based notebook experience without launching a browser. Either way works — pick whichever you prefer.

---

## Step 2 — Explore the data in a notebook

Let's do a genuine little exploration of our house-prices data. First, create a small dataset. Make a file called **`houses.csv`** with this content:

```text
size_sqft,bedrooms,price
1200,3,240000
1800,4,310000
900,2,180000
1500,3,275000
2400,5,410000
```

Now, in a new notebook (call it `explore.ipynb`), type each of these into its **own cell** and run them one at a time with `Shift+Enter`. Watch the output appear under each cell.

Cell 1 — load the data and look at it:

```python
import pandas as pd

df = pd.read_csv("houses.csv")
df
```

In a notebook, that bare `df` on the last line **displays the whole table**, nicely formatted — one of the things notebooks are great at.

Cell 2 — a couple of quick numbers:

```python
print(f"Houses in dataset: {len(df)}")
print(f"Average price: {df['price'].mean():,.0f}")
```

Cell 3 — add a computed column and view it:

```python
df["price_per_sqft"] = (df["price"] / df["size_sqft"]).round(1)
df[["size_sqft", "price", "price_per_sqft"]]
```

This is exploration at its best: instant feedback, see the table, try another idea. Perfect for *figuring out* what your analysis should be. Now let's turn it into something a pipeline can run.

---

## Step 3 — Convert the notebook to a script

Jupyter ships a command-line tool, **`nbconvert`**, that turns a notebook into a plain `.py`. From your terminal (environment active), run:

```bash
jupyter nbconvert --to script explore.ipynb
```

```text
[NbConvertApp] Converting notebook explore.ipynb to script
[NbConvertApp] Writing 410 bytes to explore.py
```

That created `explore.py`. Open it — it contains your cells, one after another, with comments marking where each cell was:

```python
#!/usr/bin/env python
# coding: utf-8

# # House Prices — Quick Exploration
# A scratchpad look at our tiny dataset.

# In[1]:


import pandas as pd

df = pd.read_csv("houses.csv")
df


# In[2]:


print(f"Houses in dataset: {len(df)}")
print(f"Average price: {df['price'].mean():,.0f}")


# In[3]:


df["price_per_sqft"] = (df["price"] / df["size_sqft"]).round(1)
df[["size_sqft", "price", "price_per_sqft"]]
```

Now run it and watch carefully:

```bash
python explore.py
```

```text
Houses in dataset: 5
Average price: 283,000
```

**Notice what's missing.** In the notebook, cells 1 and 3 displayed tables. In the script, those same lines — the bare `df` and `df[[...]]` — printed **nothing at all**. Only the `print()` statements produced output. This is the single most important thing to understand about the notebook-to-script bridge:

> A notebook **auto-displays** the last expression in each cell. A script does **not**. So a raw conversion silently loses every result you were "displaying" instead of printing.

That's why the raw `.py` is a *starting point, not the finished job.*

---

## Step 4 — Clean it into a real script

Let's promote the raw conversion into a proper script: explicit `print()` for every result, a `main()` function, and the standard `if __name__ == "__main__":` guard so it can be run directly or imported into a pipeline later. Save this as **`analyze.py`**:

```python
"""
analyze.py — Day 5 of 100 Days of MLOps.

The house-prices exploration, promoted from a notebook into a proper script:
top-to-bottom, every result printed explicitly, and a main() guard so it can be
imported or run as part of a pipeline. This is the shape MLOps code ships in.

Run it:  python analyze.py
"""

import pandas as pd


def main():
    df = pd.read_csv("houses.csv")

    print(f"Houses in dataset: {len(df)}")
    print(f"Average price:     {df['price'].mean():,.0f}")

    # A computed column, printed explicitly (a notebook would auto-display it;
    # a script must say so).
    df["price_per_sqft"] = (df["price"] / df["size_sqft"]).round(1)
    print("\nPrice per square foot:")
    print(df[["size_sqft", "price", "price_per_sqft"]].to_string(index=False))


if __name__ == "__main__":
    main()
```

Run it:

```bash
python analyze.py
```

```text
Houses in dataset: 5
Average price:     283,000

Price per square foot:
 size_sqft  price  price_per_sqft
      1200 240000           200.0
      1800 310000           172.2
       900 180000           200.0
      1500 275000           183.3
      2400 410000           170.8
```

Now *every* result is printed explicitly, the file runs top-to-bottom with no hidden state, and it's structured so a pipeline can call `main()` later. **That** is the shape ML code ships in. You just performed the exact journey every experiment takes on its way to production: born in a notebook, promoted to a script.

---

## When to use which

You don't have to choose sides — you use both, for different jobs. A simple rule:

| Use a **notebook** when… | Use a **script** when… |
|--------------------------|------------------------|
| Exploring a new dataset (EDA) | Training a model in a pipeline |
| Trying an idea quickly | Anything scheduled or automated |
| Making charts to understand data | Anything deployed to a server |
| Teaching / sharing a narrative | Anything that needs tests |
| You want instant, inline feedback | You need it to run the same way every time |

The pattern to internalise: **explore in a notebook, then move anything that must run reliably into a script.** As we go deeper into the series — pipelines, serving, CI/CD — you'll notice we live almost entirely in scripts. Notebooks are the sketchpad; scripts are the blueprint you build from.

---

## Common errors (and how to fix them)

**1. `jupyter: command not found` (or `'jupyter' is not recognized`)**

Jupyter isn't installed, or your virtual environment isn't active. Activate the environment (you should see `(.venv)` in your prompt), then `pip install jupyter`. If it's active and still missing, you installed it into a different environment.

**2. `FileNotFoundError: [Errno 2] No such file or directory: 'houses.csv'`**

Your script or notebook is looking for `houses.csv` in the folder your terminal is *currently in*, not where the file lives:

```text
FileNotFoundError: [Errno 2] No such file or directory: 'houses.csv'
```

Run the command from the same folder as `houses.csv` (in VS Code, **Terminal → New Terminal** opens there), or `cd` into it first.

**3. Your notebook works, but a colleague's "Restart & Run All" crashes with a `NameError`**

The hidden-state trap. A variable you rely on was created by a cell you later edited or deleted, so it only exists in *your* notebook's memory. Always test a notebook with **Kernel → Restart Kernel and Run All** before trusting its results — if it fails, your notebook depends on hidden state.

**4. The converted script runs but prints nothing (or less than the notebook showed)**

Expected! A script doesn't auto-display the last line of a "cell" the way a notebook does. Turn every result you care about into an explicit `print(...)` (or save it to a file), exactly as we did in `analyze.py`.

**5. You committed `explore.ipynb` and the Git diff is a wall of unreadable JSON**

Notebooks are stored as JSON with their outputs embedded, so they diff badly in Git and can leak data through saved outputs. For version control, prefer the cleaned **`.py`** script. If you must commit notebooks, at least clear their outputs first (**Kernel → Restart & Clear Output**) — and remember your Day 4 `.gitignore` already excludes `.ipynb_checkpoints/`.

**6. `ModuleNotFoundError: No module named 'pandas'` inside the notebook**

The notebook is running on a different Python than the one where you installed pandas. Make sure you launched `jupyter` from your activated environment, or in VS Code pick the `.venv` interpreter as the notebook's kernel (top-right kernel picker).

---

## Recap — what you now have

You can now move fluently between exploring and shipping:

- You know what **Jupyter notebooks** are and why they're ideal for **exploration**.
- You understand the **hidden-state trap** and why reproducible, automated ML runs on **scripts**.
- You installed and launched **Jupyter**, and explored the house-prices data in a notebook.
- You converted the notebook with **`nbconvert`**, saw why the raw output is incomplete, and **cleaned it into a proper `analyze.py`**.

**Your cheat sheet:**

| Task | Command |
|------|---------|
| Install Jupyter | `pip install jupyter` |
| Launch the notebook UI | `jupyter notebook` |
| Convert a notebook to a script | `jupyter nbconvert --to script explore.ipynb` |
| Run a script | `python analyze.py` |
| Sanity-check a notebook | **Kernel → Restart Kernel and Run All** |

Golden rule: **explore in a notebook, ship a script.** If it has to run without you clicking, it's a script.

---

## Coming up on Day 6

You've now got the environment, version control, and both ways of writing code. Time to do the thing this whole series is about: **train a model.** **Day 6 — "Your First ML Model, End to End"** walks you through the complete arc on a real dataset with scikit-learn — load the data, split it, train a model, and measure how well it predicts — all in one clean script. It's the "Train" stage of the lifecycle, and the moment MLOps stops being setup and starts being machine learning.

See the full roadmap on the [100 Days of MLOps series page](/series/100-days-mlops). See you tomorrow.
