# How Systems & Signals Works — A Human's Guide

> **Who this is for.** You (Vishwas), future collaborators, or anyone curious how a
> modern content website is actually built and run — start to finish. It's written
> to *teach*, not just to list facts. If you've never shipped a web app before, read
> top to bottom and you'll understand how the whole thing fits together.
>
> **Its machine twin.** There's a denser, fact-dump version of this for AI models:
> [`SYSTEM_CONTEXT.md`](./SYSTEM_CONTEXT.md). When you change the site, update both.
>
> **Last updated:** 2026-07-03 (launched a third series, **100 Days of MLOps** —
> written directly in the site like the Python series, published with
> `npm run publish:ml`, and free for its first **15** days. The "how many days are
> free" number is now set per-series, so MLOps can be more generous than Python
> without changing anything else. Day 1 is live. Earlier — SEO: the whole DevOps
> series is free/indexable; other series free for their first 4 days.)

---

## 1. What we built, in one breath

A fast, good-looking website at **syssignals.com** where people read your
project-based DevOps tutorials ("30 Days of DevOps"). Readers can make an account,
mark days complete, and pick up where they left off on any device. You write each
article once in Markdown; one command publishes it live. It costs roughly a coffee
a month to run.

That's it. Everything below is *how* that sentence is true.

---

## 2. The mental model (read this first)

Think of the whole system as **four jobs**, each handled by something different:

1. **Writing** — You author articles as plain text files (Markdown) in one Git repo.
2. **Building** — A program (Next.js) turns those text files into finished web pages.
3. **Hosting** — A rented computer on the internet (a VPS) runs the site 24/7.
4. **Helping** — A handful of outside services do the specialised bits: sending
   email, counting visitors, remembering who's logged in.

The clever part of the design is that **most pages are pre-built once** (like
printing a magazine) rather than assembled fresh for every visitor (like cooking
to order). Pre-built pages are fast, cheap, and hard to break. We only "cook to
order" for the few things that *must* be live: logging in, saving your progress,
and generating share images.

A useful analogy throughout: **the site is a printed magazine with a smart
front desk.** The magazine (articles) is printed in advance. The front desk
(a small server) handles the live stuff — checking your membership card, stamping
your reading progress, mailing you a login link.

---

## 3. The two repositories (and why there are two)

A "repository" (repo) is just a folder of files tracked by Git (version history).
We have two, on purpose:

| Repo | Plain-English role |
|---|---|
| **`30-days-devops`** (Jekyll) | Where the *writing* lives. Every article is a Markdown file here. This is the single source of truth for content. |
| **`syssignals`** (Next.js) | The *website itself* — all the code that turns articles into the live site. This is the repo this file lives in. |

Why split them? The writing has a long history in the first repo (and an older
version of the site used to be served straight from it). The new site is a separate
codebase. To connect them, a small script **copies** articles from the writing repo
into the website repo whenever you publish. You never hand-edit the copies — you
edit the original and re-run the copy. (The copies live in `content/` and are
treated as "generated", like a build output.)

**The later series do it more simply.** Starting with *Python for AI
Engineering* (2026-06-16), we learned the lesson from series 1: that two-repo
copy step caused most of the small bugs (template markers showing up as literal
text, a stray old site rebuilding and emailing failures). So the Python articles
are written **directly inside this website repo**, under
`content/python/python-for-ai-engineering/`. No second repo, no copy script —
you edit the file that ships. The website already knew how to read any article
in `content/`, so nothing else had to change. (The finished example programs for
each Python day are kept in a separate `~/syssignals/Python-for-AI-Engineering/`
folder, only so each one can be *run and checked* before it goes into the article.)

**The third series, *100 Days of MLOps* (2026-07-03), follows the exact same
recipe.** Articles live directly under `content/mlops/100-days-mlops/`, are
published with their own one-command script (`npm run publish:ml`), and their
runnable example code sits in the sibling `~/syssignals/100-days-mlops/` folder so
every command is actually run before it's written up. It's a beginner-first,
100%-local course (no cloud, no bills) that's free for its first 15 days — a
bigger free sample than Python, because it's our longest flagship and we want
newcomers (and Google) to see plenty before the paywall. That "15" is just a
setting we can dial per series.

---

## 4. The life of a page view (what happens when someone reads an article)

Follow a single click. Someone opens `https://syssignals.com/articles/day-24-...`:

1. **Cloudflare** answers first. It's the internet "phone book" (DNS) that turns
   `syssignals.com` into the address of our server, and it sits in front as a shield/
   speed layer. It points the visitor at our rented computer.
2. The request lands on the **VPS** (our rented Linux computer). A traffic cop
   program called **Traefik** (managed by Coolify) terminates HTTPS (the padlock)
   and forwards the request inward.
3. The request reaches our **Next.js app** running in a container. The article page
   itself decides who gets to read:
   - **The entire 30-day DevOps series is free** — fully public, no login. It's the
     finished flagship and our strongest pull for Google searches, so every day is
     open. **Every other series is free for its first 4 days** — a generous on-ramp
     for newcomers (and crawlers) before the deeper days become members-only.
   - For the gated days, the server checks: *does this person have an active
     membership?* If yes → the full article. If no → a **paywall** with the
     membership options. The article text is never even sent to non-members.
     (Before paid launch — while there are no payment keys — gated days simply ask
     you to sign in, exactly as before.)
4. The page arrives in the browser and then **enhances itself**: code blocks get a
   copy button, diagrams get drawn, the table-of-contents starts tracking your
   scroll, images become click-to-zoom.
5. A few **outside helpers** load quietly: GoatCounter records the page view, and
   if you mark the day complete, that fact is saved to our database.

The key insight: steps 1–3 are mostly serving a **file that was printed in advance**.
That's why it's fast. The "live" work is tiny — a cookie check.

---

## 5. The life of an article (what happens when you publish)

Now the other direction — content going *out*:

1. You write `2026-06-13-day-24-configmaps.md` in the **Jekyll repo**, in Markdown.
2. You run **one command**: `npm run publish:day`. Behind the scenes it:
   - **Copies** the article into the website repo, reshaping its metadata,
     fixing up links, and stripping the `{% raw %}` markers the Jekyll source
     uses to protect template braces (the website doesn't need them, and left in
     they'd show up as literal text) — all in the `sync-content.mjs` script.
   - Runs a **full build** to make sure nothing is broken. *If the build fails, the
     publish stops here* — a broken site can't go live. The build is the safety gate.
   - **Commits and pushes** to GitHub.
3. GitHub pings our server (a "webhook"). **Coolify** sees the new code, **rebuilds**
   the site into a fresh container, and swaps it in with no downtime.
4. A minute or two later, the new article is live.

One manual touch-up: you slot the new day into its "module" in `src/lib/series.ts`
so the curriculum page groups it nicely. If you forget, the site notices and shows
it under a "Just shipped" section automatically — so nothing ever looks broken.

**Publishing a Python day is the same idea, one step shorter.** Because those
articles already live in this repo (no copy step), you just run
`npm run publish:py`. It build-gates, commits and pushes exactly like the DevOps
flow — there's simply no "copy from the other repo" stage. The same `series.ts`
module touch-up and "Just shipped" safety net apply.

---

## 6. The tech stack, explained like a human

Every tool, what it actually does, and *why* we chose it.

**The framework — Next.js (v16) + React (v19).**
React is the standard way to build interactive interfaces out of reusable
"components". Next.js is the framework around React that adds routing (which URL
shows which page), pre-building pages for speed, and a place to put server code
(like our login and progress APIs). We chose it because it does both the "printed
magazine" (static pages) and the "front desk" (server APIs) in one codebase.
*Caveat:* this is a very new version of Next.js, so some details differ from older
tutorials — there's a note in `AGENTS.md` reminding us to check the bundled docs.

**The language — TypeScript.**
JavaScript with a type-checker bolted on. It catches whole classes of mistakes
(passing the wrong kind of value) before the code ever runs. Industry default now.

**Styling — Tailwind CSS (v4).**
Instead of writing separate stylesheets, you style elements with small utility
classes right in the markup (`flex`, `text-lg`, etc.). Our colours, fonts, and
spacing "design tokens" are defined once in `globals.css` and reused everywhere,
which is why the whole site feels consistent. The look is dark, with a cyan→violet
"signal" accent.

**Turning Markdown into web pages — the "unified" pipeline.**
Your articles are Markdown. A chain of small tools (`remark`/`rehype`, with `shiki`
for code colouring) converts Markdown → HTML, adds syntax highlighting, builds the
table of contents, and slugs the headings. We deliberately did **not** use "MDX"
(a fancier Markdown) because your articles contain `{{ }}` and `${{ }}` (Helm and
GitHub Actions syntax) that MDX would try to execute and choke on.

**Diagrams — Mermaid.**
You write diagrams as text in code blocks; Mermaid draws them as SVG in the
browser. Combined with the click-to-zoom lightbox, readers can study a complex
diagram comfortably.

**Accounts & login — Auth.js with "magic links".**
No passwords. You type your email, we email you a one-time link, you click it,
you're in. Passwords are a security liability and a support headache; magic links
avoid both. The login emails are sent through Resend (below).

**Database — PostgreSQL.**
A rock-solid relational database, running in its own container on the same VPS.
It stores accounts, login sessions, and which days each person has completed.
(This replaced the original plan to use a hosted database service — self-hosting it
on the box we already pay for is simpler and cheaper.)

**Email — Resend.**
Sends two kinds of mail from `hello@syssignals.com`: the magic-link login emails,
and newsletters. We verified the domain (added DNS records so inbox providers trust
us), which is why the mail lands in Inbox, not Spam.

**Analytics — GoatCounter.**
A lightweight, privacy-friendly visitor counter. Also powers the little "N views"
chip on each article. Free.

**Hosting glue — Coolify on a Hetzner VPS, fronted by Cloudflare.**
A **VPS** is a rented Linux computer. **Coolify** is a self-hosted control panel
that turns "git push" into "rebuild and redeploy" automatically — like having your
own mini-Vercel. **Cloudflare** handles the domain name and sits in front as a
free CDN/shield. Everything ships as a **Docker** container, which is just a
sealed box containing the app and everything it needs to run, so it behaves
identically on any machine.

---

## 7. What it costs to run

The architecture is deliberately cheap. Almost everything rides a free tier; the
only guaranteed bills are the server and the domain name.

| What | Provider | Cost |
|---|---|---|
| The server (runs the site + database) | Hetzner VPS | **~€4–8 / month** |
| The domain `syssignals.com` | Cloudflare | **~$10 / year** |
| DNS + CDN | Cloudflare | Free |
| Login + newsletter email | Resend | Free tier |
| Visitor analytics | GoatCounter | Free |
| Code hosting | GitHub | Free |

**Bottom line: roughly a VPS bill (~€4–8/mo) plus ~$10/year for the domain.**
Costs would only grow if you outgrow the free email tier, your newsletter list gets
large, or traffic demands a bigger server. (Exact VPS figure: check the Hetzner
invoice — confirm against the live account.)

---

## 8. Every feature, in plain language

**For readers**
- Read tutorials with proper code syntax highlighting
- Diagrams drawn from text (Mermaid), with click-to-zoom on any image or diagram
- A table of contents that follows your scroll, plus a reading-progress bar
- "Mark as complete" on each day, and a "continue where you left off" card at home
- Your progress follows you across devices once you sign in (and your guest progress
  is merged in automatically the first time you log in)
- Live view counts per article
- ⌘K instant search across all articles
- A curriculum view grouping the 30 days into modules, with "upcoming" days shown
- Newsletter signup
- Passwordless accounts (magic-link)
- **Membership** — one plan unlocks every series (Monthly ₹399 / Annual ₹2,999 /
  Lifetime ₹6,999), paid via Razorpay; all of DevOps is free and every other series
  is free for its first 4 days.
  Clicking a plan while logged out sends you to sign in (magic-link **or Google**),
  then drops you straight back into checkout — no second click needed
- **Account settings** (`/settings`) — edit your profile (name, current role, bio,
  LinkedIn, X, GitHub) and manage your membership: see your plan and renewal date,
  switch plans, or cancel (a recurring plan stays active until the period you paid
  for ends — no surprise cut-off). Lifetime members just see "yours forever."

**For you / operations**
- Write in Markdown, publish with one command (`npm run publish:day`)
- A build "gate" that refuses to publish a broken site
- Auto-redeploy on git push (no manual server work)
- Nice share images (OG cards), RSS feed, sitemap, and search-engine metadata
  generated automatically
- Old article URLs from the previous site redirect to the new ones, so no links break

---

## 9. How the whole thing got built, in order

This is the part to read if you want to understand *the process* of building a site
from nothing. We did it in roughly this sequence:

1. **Get the content in.** Wrote a script to import all the existing Markdown
   articles from the Jekyll repo into the new project, reshaping their metadata.
2. **Make Markdown render.** Built the conversion pipeline (Markdown → highlighted
   HTML + table of contents + diagram placeholders).
3. **Build the look.** Set up the design system (colours, fonts, dark theme) and the
   shared furniture: navbar, footer, page shells.
4. **Build the pages.** Homepage (with animation), the article page, the article
   index, and the series/curriculum pages.
5. **Add reading features.** Table-of-contents scrollspy, progress bar, code-copy
   buttons, client-rendered diagrams, mark-complete, ⌘K search.
6. **Verify it actually works** by running it in a real browser and screenshotting.
7. **Make it findable & shareable.** Generated OG share images, RSS, sitemap,
   structured data; wired analytics; added a newsletter signup. Later did a
   dedicated **technical-SEO pass** (see the box below).
8. **Ship it.** Containerised with Docker, rented the VPS, installed Coolify,
   deployed, pointed the domain via Cloudflare, got HTTPS certificates.
9. **Automate publishing.** One-command publish with a build gate, plus auto-deploy
   on push.
10. **Add accounts.** Stood up Postgres, added magic-link login, and made reading
    progress sync to the account (merging in any guest progress on first login).
11. **Gate the articles.** Required sign-in to read, returning readers to the exact
    article after login.
12. **Polish.** Sitewide click-to-zoom for images and diagrams.

Each step was verified before moving on, and each shippable chunk was committed to
Git with a clear message — so the history itself is a record of how it was built.

### Technical SEO, in plain English

"SEO" (search engine optimisation) is just making it easy for Google to find,
understand, and trust your pages. We don't chase tricks — we make the site honest
and legible to crawlers:

- **A sitemap that tells the truth.** `sitemap.xml` lists only the pages a visitor
  can actually read without logging in (the free days). We deliberately *leave out*
  the gated days, because pointing Google at pages that bounce it to a login wastes
  its time and looks shady.
- **Canonical links.** Each page declares its one "official" URL, so Google doesn't
  treat `syssignals.com/x`, `/x?ref=...`, and `www.` versions as different pages
  competing with each other.
- **"Don't index this" labels.** Gated articles and the login page carry a polite
  `noindex` tag, so they never show up in search results half-broken.
- **Structured data (JSON-LD).** Invisible machine-readable tags that tell Google
  "this is a technical article, here's its title/author/image/date", "this is a
  course", "here's the breadcrumb trail". This is what can earn richer-looking
  search results.
- **One source of truth.** A single helper (`src/lib/access.ts`) decides what's free
  vs. gated, and the gate, the sitemap, and the page tags all read from it — so they
  can never disagree and accidentally leak or hide the wrong thing.

What code *can't* do alone: search engines still have to be *told* the site exists.
That's the off-site half — submitting the sitemap in **Google Search Console** and
**Bing Webmaster Tools** (one-time, needs the owner's accounts) — after which Google
crawls the sitemap on its own schedule.

---

## 10. Doing common things (quick how-to)

**Run the site on your own machine**
```bash
cd /Users/vishwas/syssignals
npm install
npm run dev          # opens on http://localhost:3000
```
Note: login/progress features need a connection to the live database via an SSH
tunnel (see `.env.local`). Reading a gated article locally needs a session cookie.

**Publish a new day**
```bash
# 1. write the article in ../30-days-devops/_posts/
npm run publish:day  # syncs, builds, commits, pushes → auto-deploys
# 2. add the new day to its module in src/lib/series.ts
```

**Add a brand-new feature** — the rule of thumb:
- A new page → add a folder under `src/app/`.
- A new piece of UI → add a component under `src/components/`.
- A new server action (something that saves/sends data) → add a route under
  `src/app/api/`.
- New colours/spacing → edit the tokens in `src/app/globals.css`.
- Whatever you add, **write it down** in `SYSTEM_CONTEXT.md` (facts) and here (story).

---

## 11. Mini-glossary

- **Repo / Git** — a folder whose every change is tracked and reversible.
- **Markdown** — plain text with simple formatting (`# heading`, `**bold**`).
- **Build** — turning source code/content into the finished, optimised website.
- **SSG (static generation)** — pre-building pages in advance ("printing the
  magazine") so visitors get them instantly.
- **Server / API route** — code that runs live per-request (the "front desk").
- **VPS** — a rented Linux computer on the internet.
- **Container / Docker** — a sealed box with the app + everything it needs, so it
  runs the same everywhere.
- **Coolify** — a self-hosted dashboard that auto-builds and deploys on git push.
- **Cloudflare** — our domain registrar + DNS + CDN/shield in front of the site.
- **DNS** — the internet's phone book (name → server address).
- **CDN** — a network that caches/serves content from near the visitor for speed.
- **Reverse proxy (Traefik)** — the traffic cop that handles HTTPS and routes
  requests to the right container.
- **Magic link** — passwordless login via a one-time emailed link.
- **OG image** — the preview card that appears when a link is shared on social media.
- **Webhook** — an automatic "ping" from one service to another when something
  happens (here: GitHub → Coolify on push).

---

## 11b. How the money side works (membership)

One membership unlocks **everything** — every day of every series, current and
future. Three ways to pay: **Monthly (₹399)**, **Annual (₹2,999)**, or a one-time
**Lifetime (₹6,999)**. All 30 days of DevOps stay free forever, and every other
series stays free for its first 4 days, so people can try before they buy.

- **Payments run through Razorpay** (India-native: UPI, cards, netbanking). Monthly
  and Annual are *subscriptions* (auto-renew until cancelled); Lifetime is a single
  payment. The site never sees card details — Razorpay handles all of that.
- **How access is remembered:** a small `subscriptions` record is tied to your
  account. When you open a paid lesson, the server quietly checks "does this person
  have an active plan?" and only then sends the article. Because it's tied to the
  account, your access works on every device you sign in on.
- **The safety net:** Razorpay sends us a "webhook" (an automatic ping) whenever a
  payment succeeds, renews, or is cancelled — that's the real source of truth, so
  access turns on and off correctly even if a browser tab closes mid-payment.
- **The safety switch (now flipped on):** everything stays dormant until the
  Razorpay keys are set on the server. They're now set (live keys), so the paywall,
  the Pricing page, and checkout are **live** — Monthly, Annual and Lifetime all
  verified working end-to-end. (Before keys were added, the site simply behaved as
  before, so the code shipped safely ahead of go-live.)

To change prices, edit one file: `src/lib/pricing.ts`.

---

## 12. The honest trade-offs (so future-you isn't surprised)

- **All of DevOps is free; every other series is free for its first few days, then
  members-only.** This is the balance between SEO/reach and earning: the finished
  DevOps series is fully public so Google can index all 30 days and it acts as the
  top-of-funnel magnet, while newer series give a free sample before the deeper
  days become the paid product. Two knobs in `src/lib/access.ts`:
  `FULLY_OPEN_PREFIXES` (series that are entirely free — currently just DevOps) and
  `FREE_PREVIEW_DAYS_BY_PREFIX` (how many opening days are free, **set per series** —
  Python `py-` = 4, MLOps `ml-` = 15, with a default of 4). Free days get indexed;
  gated ones deliberately don't.
- **Validation lockdown is ON right now.** While the content is being reviewed, an
  allowlist (`ACCESS_ALLOWLIST` env = the owner's email) means *only that account*
  can open gated articles — even a paying customer would be blocked. Free articles
  are unaffected. To open paid access to everyone at real launch, clear that one env
  var in Coolify and redeploy; the gate falls back to normal "active membership."
- **The database schema isn't scripted in the repo.** The tables were created by
  hand on the server. If the database ever needs rebuilding, that schema has to be
  recreated (it's documented in `SYSTEM_CONTEXT.md` §8).
- **Two secrets passed through chat during setup** (the Resend and Cloudflare keys).
  Rotating them in their dashboards at some point is cheap insurance.
- **It's a new version of Next.js.** Some online tutorials won't match; trust the
  bundled docs (noted in `AGENTS.md`).

---

*Keep this file alive: when the site gains a feature, add a short paragraph here in
plain English, and the precise facts in `SYSTEM_CONTEXT.md`. Future-you — and any AI
you hand these files to — will thank you.*
