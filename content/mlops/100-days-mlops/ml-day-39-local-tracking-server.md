---
title: "A Local MLflow Tracking Server"
day: 39
date: "2026-07-11"
excerpt: "Day 39 of 100 Days of MLOps. Logging into a local mlruns/ folder means only you can see your experiments. Stand up a real MLflow tracking server — backed by a database and an artifact store — that multiple people and scripts log to and view in one shared place. Point your training at it and watch runs land centrally. The step from tracking on your laptop to tracking the team shares. Runs 100% locally on any OS."
tags: ["mlops","mlflow","tracking-server","experiment-tracking","collaboration","database","beginners","macos","windows","linux"]
topics: ["MLOps"]
series: "100 Days of MLOps"
seriesSlug: "100-days-mlops"
seriesTotal: 100
---

Welcome to **Day 39 of 100 Days of MLOps**. Everything you've logged so far went into a local `mlruns/` folder on *your* machine — which means only *you* can see it. That's fine solo, but real teams need one **shared** place where everyone's runs live together: a central record you, your teammates, and your CI jobs all log to and view in the same UI. Today you'll stand up a proper **MLflow tracking server** and point your training at it.

This is the same leap you made for data on Day 23 (a DVC remote), now for experiment metadata. The mechanics are simple, and understanding them demystifies how production MLflow setups work — the only difference between your local server today and a company-wide one is *where* its two stores live.

> **From "tracked on my laptop" to "tracked where the team can see."** One server, one shared history.

By the end of today you will:

- Understand a tracking server's two stores: **backend** (metadata) and **artifact** (files).
- **Start** a local MLflow server backed by SQLite.
- Point training at it with **`set_tracking_uri`** and log runs centrally.
- Know how the same setup scales to a whole team.

---

## A server has two stores

A tracking server keeps two different kinds of data in two places. The **backend store** holds the *metadata* — params, metrics, tags, run info — in a database (SQLite locally; Postgres/MySQL in production). The **artifact store** holds the *files* — models, plots, reports — in a folder locally (S3/GCS/Azure in production). Your local `mlruns/` folder quietly combined both; a server makes them explicit and shareable.

```mermaid
flowchart TD
    C1["your training"] -->|"log"| SERVER{"MLflow Tracking Server<br/>http://host:5000"}
    C2["teammate's training"] -->|"log"| SERVER
    C3["a CI job"] -->|"log"| SERVER
    SERVER --> DB[("backend store<br/>metadata: params/metrics/tags<br/>SQLite → Postgres")]
    SERVER --> ART[("artifact store<br/>models · plots<br/>folder → S3")]
    SERVER --> UI["one shared UI"]

    classDef client fill:#0b1220,stroke:#22d3ee,color:#e2f6fb;
    classDef server fill:#1a1030,stroke:#a78bfa,color:#ece7fb;
    classDef store fill:#3b1d0e,stroke:#f59e0b,color:#fde3c3;
    classDef ui fill:#052e1a,stroke:#34d399,color:#d1fae5;
    class C1 client;
    class C2 client;
    class C3 client;
    class SERVER server;
    class DB store;
    class ART store;
    class UI ui;
```

**Reading this diagram:**

On the left, in **cyan**, are the **clients** — your training, a teammate's training, a CI job — and the key point is that there are *several* of them, all logging to the **same** place. They point at the **purple tracking server** in the middle (a real HTTP service at some host and port). The server writes to its two **amber stores**: the **backend** database for metadata (params, metrics, tags) and the **artifact** store for files (models, plots). And it serves **one shared UI** (green) where everyone sees the same runs.

The two-store split is the whole design, and it's what makes MLflow scale: locally the backend is a SQLite file and the artifact store is a folder, but swap those for **Postgres** and **S3** and the exact same server becomes a company-wide tracker — many clients, one shared history. The takeaway: **a tracking server centralises experiments** so a team logs to and views one place, and "local vs production" is just which database and file store you plug in.

---

## Start the server

One command starts a local server. We back it with a SQLite database and a local artifact folder, on port `5055` (avoiding macOS's port-5000 AirPlay clash):

```bash
mlflow server \
  --backend-store-uri sqlite:///mlflow.db \
  --default-artifact-root ./mlartifacts \
  --host 127.0.0.1 --port 5055
```

That's a running web service — leave it in its own terminal. It creates a `mlflow.db` (the backend) and will use `./mlartifacts` (the artifact store), and serves the UI at **http://127.0.0.1:5055**.

---

## Point your training at it

Now tell your training code to log to the server instead of a local folder — one line, `mlflow.set_tracking_uri(...)`:

```python
"""train.py — log to a central tracking SERVER, not local mlruns/."""
import mlflow, pandas as pd
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split

mlflow.set_tracking_uri("http://127.0.0.1:5055")   # <-- point at the server
mlflow.set_experiment("team-house-prices")

df = pd.read_csv("houses.csv")
feats = ["size_sqft", "bedrooms", "age_years", "location_score"]
Xtr, Xte, ytr, yte = train_test_split(df[feats], df["price"], test_size=0.2, random_state=42)
with mlflow.start_run(run_name="server-run"):
    m = DecisionTreeRegressor(max_depth=8, random_state=42).fit(Xtr, ytr)
    mlflow.log_param("max_depth", 8)
    mlflow.log_metric("r2", r2_score(yte, m.predict(Xte)))
print("logged a run to the tracking server")
```

```bash
python train.py
```

```text
logged a run to the tracking server
```

Confirm it landed on the *server* (query with the same tracking URI):

```python
import mlflow
mlflow.set_tracking_uri("http://127.0.0.1:5055")
runs = mlflow.search_runs(experiment_names=["team-house-prices"])
print(runs[["tags.mlflow.runName", "params.max_depth", "metrics.r2"]].to_string(index=False))
```

```text
tags.mlflow.runName params.max_depth  metrics.r2
         server-run                8    0.914317
```

And notice where the data went — into the server's SQLite backend, **not** a local `mlruns/`:

```text
mlflow.db
  (no local mlruns/ — everything went to the server)
```

The run now lives in the server's database, viewable by anyone who opens **http://127.0.0.1:5055**. (Instead of the `set_tracking_uri` line in code, you can set the environment variable `MLFLOW_TRACKING_URI=http://127.0.0.1:5055` once, and every script logs to the server automatically.)

---

## From local to team

You just built the exact architecture a company uses — only the *stores* differ:

- **Backend:** `sqlite:///mlflow.db` locally → `postgresql://...` on a shared database in production.
- **Artifacts:** `./mlartifacts` locally → `s3://my-bucket/mlflow` (or GCS/Azure) in production.
- **Host:** `127.0.0.1` (just you) → a shared server address everyone on the team can reach.

Swap those three and the same `mlflow server` command serves your whole team: everyone sets `MLFLOW_TRACKING_URI` to the shared address, and all experiments — from laptops and CI alike — flow into one searchable history with one UI. That's how organisations avoid the "everyone's runs trapped on their own machine" problem.

---

## Common errors (and how to fix them)

**1. `ConnectionError` / "Failed to connect" / the call hangs when logging**

Your code points at a server that isn't running (or the wrong address). Make sure `mlflow server` is up, and that `set_tracking_uri` matches its host and port exactly (`http://127.0.0.1:5055`). MLflow retries before failing, so a wrong URI can appear to hang.

**2. `Port 5055 is already in use`**

Another process (or a previous server) holds the port. Pick a different one (`--port 5056`) or stop the old server. On macOS, avoid `5000` (AirPlay Receiver uses it).

**3. Runs still go to a local `mlruns/`**

You didn't set the tracking URI, or set it *after* starting a run. Call `mlflow.set_tracking_uri(...)` (or set `MLFLOW_TRACKING_URI`) **before** any `start_run`, so every run targets the server.

**4. `Invalid backend store URI`**

The `--backend-store-uri` must be a valid database URL: `sqlite:///mlflow.db` (three slashes + filename) locally, or a full `postgresql://user:pass@host/db` for a shared DB. A typo here stops the server from starting.

**5. Artifacts don't show up / can't be downloaded**

The artifact store must be reachable by both the server and the clients. Locally a folder is fine; with cloud storage, both sides need credentials for the bucket. Check `--default-artifact-root` points somewhere writable and accessible.

**6. The UI is empty even though runs "succeeded"**

You're viewing a *different* store than you logged to — e.g. running `mlflow ui` on the local `mlruns/` while your code logged to the server. Open the server's URL (`http://127.0.0.1:5055`), not a separate `mlflow ui`.

---

## Recap — what you now have

Your experiment tracking is now centralisable:

- You understand a server's two stores: **backend** (metadata DB) and **artifact** (files).
- You **started** a local MLflow server backed by SQLite.
- You pointed training at it with **`set_tracking_uri`** and logged runs centrally.
- You know how to scale it to a team (Postgres + S3 + a shared host).

**Your cheat sheet:**

| Task | How |
|------|-----|
| Start a server | `mlflow server --backend-store-uri sqlite:///mlflow.db --default-artifact-root ./mlartifacts --port 5055` |
| Point code at it | `mlflow.set_tracking_uri("http://127.0.0.1:5055")` |
| …or via env | `export MLFLOW_TRACKING_URI=http://127.0.0.1:5055` |
| View | open the server's URL in a browser |
| Scale up | SQLite → Postgres, folder → S3, localhost → shared host |

Golden rule: **a tracking server centralises experiments** — point every client at one URI, and your whole team logs to and sees the same history.

---

## Coming up on Day 40 — Module 4 finale

Time to bring experiment tracking together. **Day 40 — "An Experimentation Workflow"** ties Days 31–39 into one clean, end-to-end loop: run a set of tracked experiments, compare them properly, and programmatically **select the champion** — the single best model, with its exact params and saved artifact — ready to hand off. It's the complete "explore many, choose one, keep the record" workflow that turns tracking into decisions, and it closes out Module 4.

See the full roadmap on the [100 Days of MLOps series page](/series/100-days-mlops). See you tomorrow.
