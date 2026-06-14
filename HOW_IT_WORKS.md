# How Systems & Signals Works — A Human's Guide

> **Who this is for.** You (Vishwas), future collaborators, or anyone curious how a
> modern content website is actually built and run — start to finish. It's written
> to *teach*, not just to list facts. If you've never shipped a web app before, read
> top to bottom and you'll understand how the whole thing fits together.
>
> **Its machine twin.** There's a denser, fact-dump version of this for AI models:
> [`SYSTEM_CONTEXT.md`](./SYSTEM_CONTEXT.md). When you change the site, update both.
>
> **Last updated:** 2026-06-14.

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

---

## 4. The life of a page view (what happens when someone reads an article)

Follow a single click. Someone opens `https://syssignals.com/articles/day-24-...`:

1. **Cloudflare** answers first. It's the internet "phone book" (DNS) that turns
   `syssignals.com` into the address of our server, and it sits in front as a shield/
   speed layer. It points the visitor at our rented computer.
2. The request lands on the **VPS** (our rented Linux computer). A traffic cop
   program called **Traefik** (managed by Coolify) terminates HTTPS (the padlock)
   and forwards the request inward.
3. The request reaches our **Next.js app** running in a container. Before the page
   renders, a gatekeeper (`proxy.ts`) checks: *does this person have a login cookie?*
   - **No cookie** → they're bounced to `/login` (and we remember which article they
     wanted, so after signing in they land right back on it).
   - **Has cookie** → the pre-built article HTML is served instantly.
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
   - **Copies** the article into the website repo, reshaping its metadata and
     fixing up links (the `sync-content.mjs` script).
   - Runs a **full build** to make sure nothing is broken. *If the build fails, the
     publish stops here* — a broken site can't go live. The build is the safety gate.
   - **Commits and pushes** to GitHub.
3. GitHub pings our server (a "webhook"). **Coolify** sees the new code, **rebuilds**
   the site into a fresh container, and swaps it in with no downtime.
4. A minute or two later, the new article is live.

One manual touch-up: you slot the new day into its "module" in `src/lib/series.ts`
so the curriculum page groups it nicely. If you forget, the site notices and shows
it under a "Just shipped" section automatically — so nothing ever looks broken.

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
   structured data; wired analytics; added a newsletter signup.
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

## 12. The honest trade-offs (so future-you isn't surprised)

- **Articles are behind a login.** Great for building an audience and email list —
  but it also means search engines can't read the article bodies, so you won't rank
  for them on Google. If growth ever stalls, the usual fix is "first few days free,
  rest gated" (a one-line change). This was a deliberate choice, not an accident.
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
