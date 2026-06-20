# SYSTEM_CONTEXT.md — Systems & Signals (syssignals.com)

> **Purpose of this file.** A single, self-contained, machine-readable context dump
> of the entire syssignals.com platform: what it is, every technology used, the
> full architecture, data flow, configuration, infrastructure, and running costs.
> Hand this file to an AI model and it should have everything it needs to reason
> about, extend, or debug the system without re-reading the codebase.
>
> **Keep it current.** When you add a feature, dependency, route, env var, table,
> or external service, update the relevant section here (and its human-facing twin
> `HOW_IT_WORKS.md`). Sections are labelled so edits are easy to locate.
>
> **Last updated:** 2026-06-19 (**validation lockdown**: `ACCESS_ALLOWLIST` restricts
> all gated articles to the owner email while content is reviewed — see §12/§16.
> Earlier same day: SEO access change: **entire DevOps series is now
> free/indexable** — `FULLY_OPEN_PREFIXES = { '' }` — and gated series drop to a
> 4-day free preview (`FREE_PREVIEW_DAYS` 7→4); see §9/§15/§16. Earlier same day:
> account **/settings**: editable profile —
> name/role/bio/LinkedIn/X/GitHub on `users` — and a **Manage Membership** panel
> with cancel-at-cycle-end via Razorpay; see §5/§8. (Re-landed cleanly after an
> accidental revert.) Earlier: checkout-resume flow for logged-out users + Google
> SSO provider added — see §8/§12. Earlier same day: PAYMENTS LIVE — Razorpay live keys + plans set in
> Coolify; all 3 tiers verified creating real orders/subscriptions on prod; article
> route now `force-dynamic` to fix a gated-page 500; annual cycles capped at 100.
> Earlier same day: paid membership: Razorpay subscriptions + lifetime,
> `subscriptions` table, entitlement-gated article pages with a `Paywall`, `/pricing`,
> checkout + webhook routes, `paymentsLive` flag; `proxy.ts` removed — see §5/§8/§12/§13/§15.
> Earlier: technical-SEO pass: canonical URLs on every page,
> sitemap lists only free/indexable URLs, richer JSON-LD (Article image +
> Breadcrumb + WebSite/Organization), noindex on gated articles + /login, robots
> disallows /api & /login; shared `src/lib/access.ts` is the single free/gated
> source of truth. Earlier same date — free-preview gate: days 1–7 of every series +
> the DevOps Day 30 capstone are public, day 8+ login-gated — see §5/§9/§15. Earlier:
> added the second series, **Python for AI
> Engineering** — a new live `seriesSlug` in `src/lib/series.ts`, content authored
> directly under `content/python/python-for-ai-engineering/` with NO Jekyll/sync
> layer, a dedicated `npm run publish:py` script, and the `/series` index +
> showcase now iterating all live series. Earlier: removed the Giscus comments
> feature; added the architecture diagram §1b and the human-facing twin
> `HOW_IT_WORKS.md`; DevOps content through Day 30 + the image lightbox; sync
> strips Liquid `{% raw %}` guards so they don't render as literals — see §6).
> **Confidence labels:** facts marked `[code]` are read directly from the repo;
> `[infra]` are deployment/runtime facts not visible in source (verify against the
> live VPS/Coolify before relying on exact numbers).

---

## 1. One-paragraph summary

Systems & Signals is a project-based technical-education website. The flagship
content is **"30 Days of DevOps"** — one hands-on Kubernetes/DevOps article per
curriculum "day". Articles are authored as Markdown in a **Jekyll repo** (source
of truth), synced into a **Next.js 16 App Router** site that renders them as
mostly-static pages with syntax highlighting, Mermaid diagrams, a click-to-zoom
image lightbox, a table of contents, and reading-progress tracking.
Readers create accounts via **passwordless magic-link** auth; their completion
progress syncs cross-device through **Postgres**. The site is containerised
(Docker, Next standalone output) and deployed via **Coolify** on a **VPS**, with
**Cloudflare** in front. SEO/distribution is handled with generated OG images,
JSON-LD, RSS, and a sitemap. Analytics is **GoatCounter**.

---

## 1b. Architecture diagram `[code+infra]`

Two flows: the **publish/build path** (author → live site, left-to-right) and the
**runtime request path** (reader → rendered page, top-to-bottom).

```
╔══════════════════════════════════════ PUBLISH / BUILD PATH ══════════════════════════════════════╗
                                                                                                     
  Author writes Markdown                                                                             
  /Users/vishwas/30-days-devops/_posts/YYYY-MM-DD-day-NN-slug.md                                     
        │                                                                                            
        │  npm run publish:day  (scripts/publish-day.sh)                                             
        ▼                                                                                            
  sync-content.mjs ──► content/devops/30-days-devops/*.md   (generated; in the Next.js repo)         
        │              (frontmatter rewrite · banner strip · link rewrite)                           
        ▼                                                                                            
  next build  ──►  if it fails, push is BLOCKED (build = the gate)                                   
        │                                                                                            
        ▼                                                                                            
  git push  ──►  GitHub: github.com/vsindevops/syssignals (main)                                     
        │                                                                                            
        │  push webhook                                                                              
        ▼                                                                                            
  Coolify (on the VPS) ──► docker build (multi-stage) ──► swap running container ──► live            
                                                                                                     
╚═════════════════════════════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════ RUNTIME REQUEST PATH ═════════════════════════════════════╗

   Reader's browser
        │   https://syssignals.com
        ▼
   ┌─────────────────────────────┐     DNS only (grey-cloud) or proxied; registrar + DNS = Cloudflare
   │        CLOUDFLARE           │
   └─────────────┬───────────────┘
                 │  :443 (TLS)
                 ▼
   ┌──────────────────────────────────────────── VPS (Hetzner, Ubuntu, UFW 22/80/443/8000) ───────┐
   │                                                                                                │
   │   ┌──────────────────────────┐                                                                 │
   │   │  Coolify proxy (Traefik) │  Let's Encrypt certs · www→apex · :443→:3000                    │
   │   └────────────┬─────────────┘                                                                 │
   │                ▼                                                                                │
   │   ┌─────────────────────────────────────────────┐      ┌──────────────────────────────┐       │
   │   │   Next.js standalone container  (node :3000) │      │  Postgres container (:5432)  │       │
   │   │                                              │      │  users · accounts · sessions │       │
   │   │   article page entitlement gate ───────────┼─────►│  verification_token          │       │
   │   │     free? open · gated? need paid plan       │ pg   │  progress · users.last_read  │       │
   │   │   /api/checkout · /api/webhooks/razorpay ────┼─────►│  subscriptions               │       │
   │   │                                              │ pool └──────────────────────────────┘       │
   │   │   SSG article HTML + RSC                     │                                              │
   │   │   /api/auth  /api/progress  /api/subscribe   │                                              │
   │   │   /api/checkout  /api/checkout/verify        │                                              │
   │   │   /opengraph-image (satori, runtime)         │                                              │
   │   └───────┬─────────────┬───────────┬───────────┘                                              │
   │           │             │           │                                                          │
   └───────────┼─────────────┼───────────┼──────────────────────────────────────────────────────────┘
               │             │           │
               ▼             ▼           ▼
        ┌────────────┐ ┌────────────────────────────┐ ┌──────────────────────────┐
        │   Resend   │ │  GoatCounter               │ │  Razorpay                │
        │ magic-link │ │  pageviews + view counts   │ │  subscriptions + orders  │
        │ + newsletter│ │  (count.js in the browser) │ │  checkout.js + webhook   │
        └────────────┘ └────────────────────────────┘ └──────────────────────────┘

   Rendering modes: most routes are prerendered Static/SSG (served from the container's
   filesystem); only /api/*, /login, and the OG-image routes run per-request (ƒ). See §5.

╚═════════════════════════════════════════════════════════════════════════════════════════════════╝
```

**Trust boundaries:** the browser holds only a session-token cookie (httpOnly,
set by Auth.js). All secrets (`DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`)
live as Coolify env vars on the VPS and are read only server-side. Postgres is not
exposed publicly (same Docker network; local dev reaches it via SSH tunnel).

---

## 2. Two repositories (the most important structural fact)

There are **two separate Git repos** with two different GitHub orgs/owners:

| Repo | GitHub | Local path | Role |
|---|---|---|---|
| Jekyll content repo | `github.com/syssignals/30-days-devops` | `/Users/vishwas/30-days-devops` | **Source of truth for article Markdown.** (Historically also served the old GitHub-Pages site.) |
| Next.js site repo | `github.com/vsindevops/syssignals` | `/Users/vishwas/syssignals` | **The production website** (this repo). Deploys to syssignals.com. |

Articles live in the Jekyll repo as `_posts/YYYY-MM-DD-day-NN-<slug>.md`. A sync
script imports them into the Next.js repo under `content/devops/30-days-devops/`.
The Next.js repo's `content/` directory is **generated** — do not hand-edit it;
edit the Jekyll post and re-sync. `[code]`

**Article date convention (hard rule):** the frontmatter `date:` must be the real
IST (Asia/Kolkata) calendar day of publication, never a future date, even when
several "days" ship on the same real date. Compute with `TZ=Asia/Kolkata date +%F`
before stamping. The "Day N" in the title is a curriculum index, not a publish
date. `[infra/process]`

---

## 3. Tech stack (exact, from `package.json`) `[code]`

**Runtime / framework**
- `next` **16.2.6** — App Router, Turbopack, `output: "standalone"`, mostly SSG.
  ⚠️ This is a newer Next than common training data; APIs differ. `AGENTS.md`
  instructs reading `node_modules/next/dist/docs/` before writing framework code.
- `react` **19.2.4**, `react-dom` **19.2.4**
- `typescript` **^5** (target ES2017, `strict: true`, `moduleResolution: bundler`,
  path alias `@/* → ./src/*`)

**Styling / design**
- `tailwindcss` **^4** — **no JS config file**; design tokens live in
  `src/app/globals.css` via `@theme`. PostCSS plugin `@tailwindcss/postcss`.
- `@tailwindcss/typography` **0.5.19** (the `prose` base; the site uses a custom
  `.prose-ss` class for article bodies)
- Fonts: `next/font/google` loads **Inter** (sans), **Space Grotesk** (display),
  **JetBrains Mono** (mono), exposed as CSS vars `--font-inter/-grotesk/-jbmono`.
  `@fontsource/space-grotesk` + `@fontsource/jetbrains-mono` WOFFs are used by the
  OG image generator (satori needs raw font bytes).
- `lucide-react` **1.16.0** (icons), `clsx` **2.1.1** (class composition)
- `motion` **12.40.0** (the Framer Motion successor) — scroll reveals, hero,
  curriculum animations

**Markdown → HTML pipeline** (`src/lib/markdown.ts`)
- `unified` **11**, `remark-parse` **11**, `remark-gfm` **4**, `remark-rehype`
  **11**, `rehype-raw` **7**, `rehype-slug` **6**, `rehype-pretty-code` **0.14**
  (backed by `shiki` **4**, theme `github-dark-default`), `rehype-stringify` **10**
- `hast-util-to-string`, `unist-util-visit` (custom remark/rehype passes)
- `gray-matter` **4** (frontmatter), `reading-time` **1.5** (word count / minutes)
- **Why not MDX:** article content contains Helm `{{ }}` and GitHub Actions
  `${{ }}` syntax that would break MDX compilation. A plain remark/rehype pipeline
  treats them as text.

**Diagrams**
- `mermaid` **11.15.0** — rendered **client-side** from fenced ```mermaid blocks.
  The markdown pass replaces each mermaid fence with a placeholder `<div>`; a
  client component (`ArticleEnhancer`) dynamically imports mermaid and renders SVG.

**Auth / database**
- `next-auth` **5.0.0-beta.31** (Auth.js v5), `@auth/pg-adapter` **1.11**,
  provider **Resend** (magic-link email). Database session strategy.
- `pg` **8.21** — Postgres connection pool (singleton, `max: 5`)
- `@types/pg`, `@types/node`, `@types/react`, `@types/react-dom` (dev)

**OG images**
- `next/og` (satori under the hood) → `src/lib/og.tsx` renders a branded 1200×630
  card from JSX + the fontsource WOFFs.

**Lint:** `eslint` **9** + `eslint-config-next` **16.2.6** (`eslint.config.mjs`,
flat config; core-web-vitals + typescript rulesets).

---

## 4. Repository layout (`src/`) `[code]`

```
src/
├── app/                          # App Router
│   ├── layout.tsx                # root layout: fonts, Navbar, Footer,
│   │                             #   ProgressProvider, ImageLightbox, Analytics
│   ├── page.tsx                  # home (Hero, Terminal, SeriesShowcase, ContinueCard)
│   ├── globals.css               # Tailwind v4 @theme tokens + all custom CSS
│   ├── not-found.tsx
│   ├── robots.ts                 # /robots.txt
│   ├── sitemap.ts                # /sitemap.xml
│   ├── opengraph-image.tsx       # site default OG card
│   ├── icon.svg, favicon.ico
│   ├── about/page.tsx
│   ├── articles/
│   │   ├── page.tsx              # /articles index (ArticlesExplorer)
│   │   └── [slug]/
│   │       ├── page.tsx          # article detail (SSG via generateStaticParams)
│   │       └── opengraph-image.tsx  # per-article OG (PUBLIC, bypasses gate)
│   ├── series/
│   │   ├── page.tsx              # /series listing
│   │   └── [slug]/page.tsx       # /series/<slug> curriculum
│   ├── login/
│   │   ├── page.tsx
│   │   └── LoginForm.tsx
│   ├── feed.xml/route.ts         # RSS
│   └── api/
│       ├── auth/[...nextauth]/route.ts   # Auth.js handlers
│       ├── progress/route.ts             # GET/POST reading progress
│       └── subscribe/route.ts            # newsletter signup
│   (no middleware — gating is done in the article page server component)
├── auth.ts                       # Auth.js config (Resend magic-link, pg adapter)
├── lib/
│   ├── articles.ts               # read content/, parse frontmatter, search index,
│   │                             #   adjacency (prev/next), tags
│   ├── markdown.ts               # the unified pipeline (see §3)
│   ├── series.ts                 # curriculum modules + "upcoming" days
│   ├── db.ts                     # pg Pool singleton
│   └── og.tsx                    # shared branded OG card renderer
└── components/
    ├── layout/    Navbar, Footer, AccountMenu
    ├── home/      Hero, Terminal, SeriesShowcase, ContinueCard
    ├── article/   ArticleEnhancer, ImageLightbox, Toc, ReadingProgress,
    │              MarkComplete, ViewCount
    ├── series/    Curriculum
    ├── search/    SearchPalette (⌘K)
    ├── progress/  ProgressProvider (localStorage + server sync context)
    ├── motion/    Reveal
    ├── ui/        (shared primitives)
    ├── Analytics.tsx (GoatCounter), JsonLd.tsx, Logo.tsx, NewsletterForm.tsx,
    └── ArticleCard.tsx, ArticlesExplorer.tsx
```

---

## 5. Routes & rendering modes `[code]`

| Route | Type | Notes |
|---|---|---|
| `/` | Static | home |
| `/about` | Static | |
| `/articles` | Static | index + client-side explorer/filter |
| `/articles/[slug]` | **Dynamic (ƒ)** — `export const dynamic = 'force-dynamic'` | every article SSR per-request (free still fully indexable: canonical + JSON-LD). Gated days read the session for a server-side entitlement check → full body or `Paywall`. NOT static, because on-demand static generation forbids reading the session cookie (`DYNAMIC_SERVER_USAGE`) |
| `/pricing` | Static | membership tiers + Razorpay Checkout (client) |
| `/pricing/success` | Static (noindex) | post-purchase confirmation |
| `/api/checkout`, `/api/checkout/verify` | Dynamic | start checkout (order/subscription) + verify signature |
| `/api/webhooks/razorpay` | Dynamic | entitlement source of truth (HMAC-verified) |
| `/settings` | Dynamic (auth-gated; redirects to `/login`) | profile form + Manage Membership panel |
| `/api/profile` | Dynamic | save name/role/bio/socials (auth) |
| `/api/membership/cancel` | Dynamic | cancel recurring sub at cycle end (auth) |
| `/articles/[slug]/opengraph-image` | Dynamic (ƒ) | per-article OG card; **PUBLIC** (gate exempts it) |
| `/series`, `/series/[slug]` | Static | curriculum |
| `/login` | Dynamic | magic-link form |
| `/feed.xml` | Static route | RSS |
| `/sitemap.xml`, `/robots.txt` | Static | from `sitemap.ts` / `robots.ts` |
| `/opengraph-image` | Dynamic (ƒ) | site default card |
| `/api/auth/[...nextauth]` | Dynamic | Auth.js |
| `/api/progress` | Dynamic | GET/POST progress (auth required) |
| `/api/subscribe` | Dynamic | newsletter |

**Access model (no middleware — gating lives in the article page).** `src/lib/access.ts`
decides free vs gated: `isFreeSlug(slug)` is true when the slug's prefix is in
`FULLY_OPEN_PREFIXES` (currently `{ '' }` → the **entire DevOps series is free**,
all 30 days), OR for a gated series, days 1–`FREE_PREVIEW_DAYS` (currently **4**,
e.g. Python `py-` days 1–4 free, gated from day 5). Slug parsed into `{prefix, day}`
(`''`=DevOps, `'py-'`=Python). Used by the sitemap, article metadata, and the page.

The **article page** (`src/app/articles/[slug]/page.tsx`) enforces access server-side:
- **Free slug** → prerendered (SSG), full body, indexed. (`generateStaticParams` returns only free slugs.)
- **Gated slug** → rendered on demand (dynamic). It reads the session (`auth()`) and:
  - **Payments live** (`razorpayConfigured()` true): full body only if `userHasAccess(userId)` (active sub or lifetime); otherwise the `Paywall` (membership pricing). Body markdown is never rendered/sent to non-entitled users.
  - **Payments not live** (no Razorpay keys — pre-launch): preserves prior behaviour — any signed-in account unlocks; anonymous sees a "sign in to continue" prompt.

This `paymentsLive` flag (= `razorpayConfigured()`) also controls the **Pricing** nav link (shown only when live), so deploying the paywall code with no keys is a zero-regression no-op until keys are added in Coolify.

---

## 6. Content pipeline (end to end) `[code]`

```
Jekyll repo  _posts/2026-06-13-day-24-configmaps-configuration-patterns.md
   │  (author writes Markdown; frontmatter: title, date, categories, tags, excerpt)
   ▼  scripts/sync-content.mjs   [npm run sync  |  invoked by publish:day]
content/devops/30-days-devops/day-24-configmaps-configuration-patterns.md
   │  rewrites frontmatter → site schema: title (Day-prefix stripped), day,
   │  date, excerpt, tags, topics(=categories), series, seriesSlug, seriesTotal
   │  strips the Jekyll "> **30 Days of DevOps** …" banner blockquote
   │  rewrites links /articles/YYYY/MM/DD/<slug>/ → /articles/<slug>
   │  strips Liquid {% raw %}/{% endraw %} guards (Jekyll-only; the Next
   │    renderer isn't Liquid, so they'd otherwise render as visible literals)
   ▼  src/lib/articles.ts   (gray-matter + reading-time; sorts by day desc)
ArticleMeta { slug, title, day, date, excerpt, tags, topics, series,
              seriesSlug, seriesTotal, readTime, readMinutes, words }
   ▼  src/lib/markdown.ts   (unified pipeline, build time)
{ html, toc: [{id,text,depth}], hasMermaid }
   ▼  src/app/articles/[slug]/page.tsx  (SSG)
<article class="prose-ss" dangerouslySetInnerHTML={html}/>  + client enhancers
```

**`markdown.ts` pass order (matters):**
`remarkParse → remarkGfm → remarkMermaid (fence→placeholder div) →
remarkRehype(allowDangerousHtml) → rehypeRaw → rehypeSlug →
rehypeCollectToc (custom, gathers h2/h3) → rehypePrettyCode(shiki) →
rehypeStringify`. Mermaid replacement runs **before** the syntax highlighter so
shiki never sees diagram source.

**Slug = filename** (sans `.md`). Article ordering: `day` descending, then date.
Series adjacency (`getAdjacent`) walks the series sorted by `day` ascending.

---

## 7. Client-side article enhancement `[code]`

Server sends static HTML; these client components progressively enhance it:

- **`ArticleEnhancer`** — (a) adds a header bar (language label + copy button) to
  every `figure[data-rehype-pretty-code-figure]`; (b) lazily imports `mermaid` and
  renders each `[data-mermaid]` placeholder into an SVG (dark theme via
  `themeVariables`); (c) records the article as "last read" (`ProgressProvider`).
- **`ImageLightbox`** — sitewide click-to-zoom (mounted once in root layout).
  Event-delegated click handler opens any `.prose-ss img`, `.mermaid-target svg`,
  or `[data-zoomable]` in a full-screen portal viewer with wheel/button/pinch zoom
  (1×–8×), drag/touch pan, double-click toggle. Mermaid SVGs are **normalised on
  clone** (explicit pixel width/height stamped from the `viewBox`, inline
  max-width stripped) because mermaid emits `width="100%"` + no height, which
  collapses to 0×0 once cloned out of its sized container. Closes on Esc / ✕ /
  backdrop click (drag-suppressed). Body scroll-lock + focus restore; `role=dialog`.
  Dependency-free (React + `createPortal` + Pointer/Wheel events).
- **`Toc`** — table-of-contents rail with scrollspy.
- **`ReadingProgress`** — top progress bar.
- **`MarkComplete`** — toggle completion (writes through `ProgressProvider`).
- **`ViewCount`** — fetches the GoatCounter counter API for the slug.

---

## 8. Authentication & reading progress `[code]`

**Auth (`src/auth.ts`):** Auth.js v5, **passwordless magic-link**.
- Providers: **Resend** magic-link — `sendVerificationRequest` POSTs a hand-built
  HTML email to `https://api.resend.com/emails` (from `Systems & Signals
  <hello@syssignals.com>`); **Google OAuth** (`next-auth/providers/google`) enabled
  only when `AUTH_GOOGLE_ID`+`AUTH_GOOGLE_SECRET` are set (`googleEnabled` export),
  with `allowDangerousEmailAccountLinking:true` so a Google sign-in links to an
  existing same-email account. Login page shows the Google button conditionally.
- **Checkout resume:** logged-out plan click → `/api/checkout` 401 → redirect to
  `/login?callbackUrl=/pricing?checkout=<plan>`; after auth, `PricingTiers` reads
  `?checkout=` and auto-opens Razorpay (standard SaaS flow).
- Adapter: `@auth/pg-adapter` over the `pg` pool → **database** session strategy
  (`maxAge` 30 days, `updateAge` 1 day rolling).
- `trustHost: true`. Custom pages: `signIn:/login`, `verifyRequest:/login?sent=1`,
  `error:/login`. Session callback copies `user.id` onto `session.user.id`.

**Database tables `[code+infra]`** (schema applied to the VPS Postgres manually —
**no migration/SQL file exists in the repo**):
- Auth.js standard: `users`, `accounts`, `sessions`, `verification_token`.
- Custom additions: table `progress(user_id, slug)`; column `users.last_read`.
- **Profile columns on `users`**: `role`, `bio`, `linkedin`, `twitter`, `github` (plus existing `name`, `image`, `email`). Read/written via `src/lib/profile.ts` (`getProfile`/`updateProfile`/`sanitizeProfile` — trims, length-caps, strips leading `@` from socials).
- **`subscriptions`** (paid access): `(id, user_id, plan, status, razorpay_subscription_id, razorpay_order_id, razorpay_payment_id, current_end, cancel_scheduled, created_at, updated_at)`. `plan` ∈ monthly|annual|lifetime; `status` ∈ created|active|cancelled|halted|completed|paused; `cancel_scheduled` = recurring plan set to end at period close. Read by `src/lib/entitlement.ts` (`userHasAccess` / `getEntitlement`): access = a lifetime row with status active, OR a recurring row active with `current_end` in the future. Webhook keeps it current.
- Queried in `src/app/api/progress/route.ts` and `src/lib/db.ts`.

**Progress model (`ProgressProvider` + `/api/progress`):**
- Anonymous readers: completion stored in `localStorage` (`ss:completed`,
  `ss:last-read`).
- Signed-in readers: synced to Postgres. On first login a **one-time merge**
  imports any local progress into the account (guarded by `ss:merged`).
- `/api/progress` `GET` → `{authenticated, email?, completed[], lastRead}`;
  `POST` handles three shapes: `{slug,done}` toggle, `{slugs:[]}` bulk-merge,
  `{lastRead}` pointer. Slugs validated against `/^[a-z0-9-]{1,120}$/`.

---

## 9. SEO, distribution & social `[code]`

- **OG images:** `src/lib/og.tsx` (`ogCard`) renders a branded 1200×630 card
  (grid + glow + wordmark + day chip + title) via `next/og`/satori, loading the
  fontsource WOFFs from `node_modules`. Used by `/opengraph-image` and per-article
  `/articles/[slug]/opengraph-image`. The latter is **public** (gate-exempt).
- **JSON-LD (`JsonLd.tsx`):** free articles emit `TechArticle` (with `image` =
  the OG route, `datePublished`/`dateModified`, `mainEntityOfPage`, `wordCount`,
  `inLanguage`, `isAccessibleForFree`) **+** a `BreadcrumbList` (Home › Series ›
  Article). Series pages emit `Course`. The homepage emits a `WebSite` +
  `Organization` `@graph` (`siteJsonLd`). Gated articles emit **no** structured data.
- **Canonical URLs:** every page sets `alternates.canonical` (home, /about,
  /articles, /series, /series/[slug], /articles/[slug]) so Cloudflare/trailing-slash/
  query variants don't dilute ranking.
- **Indexing control:** `src/lib/access.ts#isFreeSlug` is the single source of truth
  shared by the gate, the sitemap, and article metadata. Gated articles set
  `robots: noindex,nofollow` (belt-and-braces atop the login redirect); `/login` is
  `noindex,follow`.
- **RSS:** `/feed.xml` route. **Sitemap (`sitemap.ts`):** lists ONLY publicly-
  readable URLs — home, /articles, /series + each `/series/[slug]`, /about, and only
  **free** articles (gated ones are excluded so crawlers don't chase login redirects).
  **robots (`robots.ts`):** allows `/`, disallows `/api/` and `/login`, declares
  `host` + `sitemap`.
- **Redirects (`next.config.ts`):** legacy Jekyll permalinks
  `/articles/YYYY/MM/DD/:slug` → `/articles/:slug` (permanent/308);
  `www.syssignals.com/*` → `https://syssignals.com/*` (permanent).
- **Analytics:** **GoatCounter** (`syssignals.goatcounter.com`), SPA-aware
  (`Analytics.tsx`, `no_onload`, per-navigation count). Public per-article
  view-count chip via the counter JSON API.
- **Newsletter:** `/api/subscribe`; provider chosen by env — **Buttondown**
  (`BUTTONDOWN_API_KEY`) **or** **Resend audience** (`RESEND_API_KEY` +
  `RESEND_AUDIENCE_ID`). Honeypot field (`website`). Unconfigured → 503 + UI
  fallback ("signups open soon").

---

## 10. Design system `[code]`

Tailwind v4 with tokens in `globals.css` `@theme inline`:
- Palette (dark-first): `--color-bg #07090e`, surfaces `#0c1016 / #111722 / #161e2b`,
  lines `#1c2533 / #2a3850`, ink `#e8edf4 / #94a3b8 / #5d6b7e`, accents
  `#22d3ee` (cyan) + `#a78bfa` (violet), semantic `green #4ade80 / amber #fbbf24 /
  red #f87171`.
- Fonts: `--font-sans` (Inter), `--font-display` (Space Grotesk), `--font-mono`
  (JetBrains Mono).
- Notable custom CSS: `.prose-ss` (article body), code-figure header + copy button,
  `.mermaid-block/.mermaid-target`, and the `.ss-lb*` image-lightbox overlay.

---

## 11. Build & deployment `[code+infra]`

**Build:** `next build` → standalone server (`output: "standalone"`). All article
routes prerendered via `generateStaticParams`.

**Docker (`Dockerfile`):** multi-stage `node:22-alpine` — `deps` (`npm ci`) →
`builder` (`npm run build`) → `runner`. Runner runs as non-root user `nextjs`,
serves `node server.js` on `:3000`. **Critically copies things output-tracing
can't see:** `content/` (article Markdown read from disk at runtime) and the two
`@fontsource` packages (OG fonts). `.dockerignore` excludes `.git`, `.next`,
`node_modules`, `.claude`, docs, `.env*`.

**Hosting `[infra]`:** **Coolify** (self-hosted PaaS) on a **VPS** (project notes:
Hetzner). Push to `vsindevops/syssignals` `main` → Coolify rebuilds the image and
redeploys syssignals.com. **Postgres** runs on the same VPS. **Cloudflare** sits in
front for DNS/CDN (domain registrar: Cloudflare). Local dev connecting to the prod
DB requires an SSH tunnel (see `.env.local`).

**Publish flow (`scripts/publish-day.sh`, `npm run publish:day`):**
1. `node scripts/sync-content.mjs` (Jekyll → `content/`).
2. Detect newest day; warn if it isn't yet placed in a `series.ts` module.
3. If nothing changed → exit. Else `npm run build` (the **gate** — a broken build
   blocks the push).
4. `git add -A` → commit `"Publish Day N"` → `git push` → Coolify deploys.

**Post-publish manual step:** add the new day to its module in `src/lib/series.ts`
and remove it from `upcoming` (the curriculum self-heals with a "Just shipped"
block if forgotten).

---

## 12. Environment variables `[code]`

| Var | Required | Used by | Notes |
|---|---|---|---|
| `DATABASE_URL` | yes (for auth/progress) | `src/lib/db.ts` | Postgres on the VPS |
| `AUTH_SECRET` | yes | Auth.js | session/JWT signing |
| `AUTH_URL` / `trustHost` | yes (prod) | Auth.js | `trustHost:true` set in code |
| `RESEND_API_KEY` | yes (magic-link) | `auth.ts`, `subscribe` | transactional email |
| `AUTH_GOOGLE_ID` | optional | `auth.ts` | enables Google SSO button when present |
| `AUTH_GOOGLE_SECRET` | optional | `auth.ts` | Google OAuth secret; redirect URI `/api/auth/callback/google` |
| `RESEND_AUDIENCE_ID` | optional | `subscribe` | enables Resend-audience newsletter |
| `BUTTONDOWN_API_KEY` | optional | `subscribe` | alternative newsletter provider |
| `RAZORPAY_KEY_ID` | for payments | `razorpay.ts`, checkout | presence flips `paymentsLive` → paywall + Pricing nav on |
| `RAZORPAY_KEY_SECRET` | for payments | `razorpay.ts` | server-only; Basic-auth + signature verify |
| `RAZORPAY_WEBHOOK_SECRET` | for payments | webhook route | HMAC-verifies `/api/webhooks/razorpay` |
| `RAZORPAY_PLAN_MONTHLY` | for monthly plan | checkout | Razorpay Plan ID (recurring) |
| `RAZORPAY_PLAN_ANNUAL` | for annual plan | checkout | Razorpay Plan ID (recurring) |
| `ACCESS_ALLOWLIST` | optional | `access.ts`, article page | **Validation lockdown.** Comma-separated emails; when set, ONLY these users can read gated articles (paid entitlement ignored for everyone else). Unset = normal paid access. Currently: `systemsandsignals.tech@gmail.com`. |
| `NEXT_TELEMETRY_DISABLED` | infra | Dockerfile | set to 1 |

`.env.local` (gitignored) currently sets `DATABASE_URL`, `AUTH_SECRET`,
`RESEND_API_KEY`. Razorpay vars are set in Coolify when payments go live
(test keys for verification, live keys after KYC). **`paymentsLive` = `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` both present** — with them unset the site keeps the pre-launch model (sign-in unlocks Day 8+) and hides Pricing.

---

## 13. Running costs `[infra — verify exact amounts on the live accounts]`

The architecture is deliberately cheap; **the only guaranteed recurring costs are
the VPS and the domain.** Everything else runs on free tiers at current scale.

| Item | Provider | Cost (approx) | Notes |
|---|---|---|---|
| VPS (compute: Coolify + Next container + Postgres) | Hetzner (per project notes) | **~€4–€8 / month** | the main recurring cost; exact = chosen instance size |
| Domain `syssignals.com` | Cloudflare Registrar | **~$10 / year** | at-cost registration |
| DNS / CDN | Cloudflare | **$0** | free plan |
| Transactional + magic-link email | Resend | **$0** | free tier (~3k emails/mo, 100/day) — sufficient at current volume |
| Analytics | GoatCounter (hosted) | **$0** | free / donation-ware |
| Newsletter | Buttondown **or** Resend audience | **$0** | free tier |
| Source hosting / CI of content | GitHub | **$0** | free |
| Payments | Razorpay | **~2% domestic / ~3% intl per sale** | variable, only on actual revenue; no fixed fee |

**Net:** roughly **a VPS bill (~€4–€8/mo) + ~$10/yr domain**, plus Razorpay's
per-transaction % once revenue starts (a *variable* cost paid only on sales).
Pricing tiers (in `src/lib/pricing.ts`): **Monthly ₹399 · Annual ₹2,999 · Lifetime
₹6,999** (all-access; the first 7 days of each series stay free). Scaling triggers
that would add fixed cost: outgrowing the Resend free email tier, a large
newsletter list, or a bigger VPS for traffic/Postgres.

---

## 14. Feature inventory `[code]`

**Reader-facing**
- Article reading with shiki syntax highlighting (`github-dark-default`)
- Client-rendered **Mermaid** diagrams (dark theme)
- **Sitewide click-to-zoom image lightbox** (wheel/pinch/drag, mobile-first)
- Table-of-contents rail with scrollspy
- Top reading-progress bar
- **Mark-as-complete** per article + **continue where you left off** (home card)
- Cross-device progress sync for signed-in users; localStorage for anonymous
- Public per-article **view counts** (GoatCounter)
- **⌘K command-palette search** over titles/excerpts/tags
- Series / **curriculum** view with modules and "upcoming" days
- Newsletter signup (honeypot-protected)
- **Passwordless magic-link accounts**
- Generated **OG cards**, **RSS**, dark responsive design system

- **Paid membership** (all-access): Monthly/Annual subscriptions + Lifetime one-time
  via **Razorpay**; `/pricing` + per-article `Paywall`; entitlement synced to the
  account. Gated behind `paymentsLive` so it's dormant until keys are set.

**Author / ops-facing**
- Jekyll → `sync` → `publish:day` pipeline with a **build gate**
- Curriculum management via `src/lib/series.ts`
- Legacy-permalink + www→apex redirects

---

## 15. Known constraints / gotchas for future work `[code]`

1. **Next 16 is non-standard vs. training data.** Read `node_modules/next/dist/docs/`
   before writing framework-level code (`AGENTS.md`).
2. **`content/` is generated** — never hand-edit; edit the Jekyll post + re-sync.
3. **No SQL migrations in-repo** — the DB schema (Auth.js tables + `progress` +
   `users.last_read` + `subscriptions`) was applied to the VPS Postgres by hand.
   Recreating the DB requires re-deriving that schema.
4. **Article access is enforced in the page server component, not middleware**
   (`proxy.ts` was removed). The whole `/articles/[slug]` route is
   `force-dynamic` (SSR per request) because the gated path reads the session
   cookie — doing that under on-demand static generation throws
   `DYNAMIC_SERVER_USAGE` (this caused a prod 500 before the fix; do NOT
   reintroduce `generateStaticParams` here without also re-solving that). Free
   days render their body unconditionally and stay indexable; gated days render
   the body only after `userHasAccess`. When `paymentsLive` is false the gate
   falls back to "signed-in unlocks". OG images stay public.
   **Razorpay note:** Subscriptions is a separately-activated product; yearly
   plans cap `total_count` at 100 (monthly uses 120) — see `Tier.cycles`.
5. **Razorpay = source of truth via webhook.** `/api/checkout/verify` activates
   optimistically on the success callback, but `/api/webhooks/razorpay` (HMAC-verified)
   is authoritative — especially for recurring renewals/cancellations. Webhook must be
   configured in the Razorpay dashboard with `RAZORPAY_WEBHOOK_SECRET` and the events
   listed in the route file. Recurring `current_end` comes from the webhook.
5. **OG fonts + `content/`** are copied explicitly in the Dockerfile because Next
   output-tracing can't see `process.cwd()` disk reads — if either is removed, OG
   generation or article reads break at runtime only (not at build).
6. **No MDX** — content may contain `{{ }}` / `${{ }}`; keep the plain
   remark/rehype pipeline.
7. **IST publish-date rule** (see §2) — future-dating articles is a recurring bug.

---

## 16. Change log (append new entries at top)

- **2026-06-19** — **Validation lockdown allowlist.** `ACCESS_ALLOWLIST` env (now
  `systemsandsignals.tech@gmail.com`) restricts ALL gated-article access to the
  listed emails — paid entitlement is ignored for everyone else (`access.ts`
  `allowlistActive`/`emailAllowlisted`; checked first in the article-page gate).
  Free articles (DevOps all + first 4 of other series) are unaffected. The owner
  account also has a `lifetime/active` subscriptions row (so `/settings` shows
  Lifetime). **To open paid access to everyone at real launch: clear/remove the
  `ACCESS_ALLOWLIST` env var in Coolify and redeploy** — code path reverts to
  normal `userHasAccess`.

- **2026-06-19** — **SEO access model change (open all of DevOps; tighten the rest).**
  `src/lib/access.ts` reworked: new `FULLY_OPEN_PREFIXES = Set{''}` makes the **entire
  30-day DevOps series public + indexable** (previously only days 1–7 + Day 30);
  `FREE_PREVIEW_DAYS` 7→4 so every *other* series (Python `py-`, future MLOps/AI Eng)
  is free for days 1–4 and login/membership-gated from day 5. `EXTRA_FREE_DAYS`
  removed (the DevOps Day 30 exception is subsumed by the fully-open rule). Because
  `isFreeSlug` is the single source of truth, this cascades automatically: all 30
  DevOps articles now enter the sitemap, drop their `noindex`, and emit Article +
  Breadcrumb JSON-LD; their bodies render publicly. Updated user-facing "first 7 days"
  copy in `Paywall.tsx`, `pricing/page.tsx`, `MembershipPanel.tsx`. Build verified
  green. Rationale: DevOps is the finished flagship series and the strongest long-tail
  search asset — opening it fully maximizes organic reach; newer series keep a 4-day
  on-ramp to protect membership value. (Decision by Vishwas, SEO push week 1.)
- **2026-06-19** — **Account settings + membership management.** `/settings`
  (auth-gated): editable **profile** (name, current role, bio, LinkedIn, X, GitHub —
  columns on `users`; `src/lib/profile.ts`) and a **Manage Membership** panel (plan,
  status, renewal/expiry; cancel recurring at cycle end → `cancelSubscription` +
  `cancel_scheduled`; change-plan link; lifetime/free states). Routes `/api/profile`,
  `/api/membership/cancel`. Account menu → "Settings & membership". NOTE: this feature
  was briefly auto-shipped via a `git add -A` in the Python publish script and reverted
  (commit `c81685e`); re-landed here intentionally. Publish script since hardened to
  stage only Python content + `series.ts`.

- **2026-06-17** — **Checkout resume + Google SSO.** Logged-out plan clicks now go
  to `/login?callbackUrl=/pricing?checkout=<plan>` (server 401-driven, not a flaky
  client check) and auto-open Razorpay after sign-in. Added **Google OAuth** provider
  (dormant until `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` set; `allowDangerousEmailAccountLinking`
  for same-email linking) + a "Continue with Google" button on `/login`. User must
  create a Google OAuth app (redirect URI `https://syssignals.com/api/auth/callback/google`)
  and set the two env vars in Coolify to activate it.

- **2026-06-17** — **PAYMENTS WENT LIVE.** Razorpay **live** keys + two live Plans
  (monthly `plan_T2lkUIOXouKK1V`, annual `plan_T2lkUcUptDGDs4`) + webhook secret set
  as Coolify env vars on the app; `paymentsLive` now true in prod → paywall, Pricing
  nav, and checkout are active on syssignals.com. All 3 tiers verified creating real
  Razorpay orders/subscriptions on prod (no charge). Two fixes during cutover:
  (1) `/articles/[slug]` → `force-dynamic` (gated pages 500'd with
  `DYNAMIC_SERVER_USAGE` because the entitlement check reads the session cookie under
  on-demand static gen); `generateStaticParams` removed. (2) annual subscription
  failed (Razorpay caps yearly `total_count` at 100, code used 120) → added
  `Tier.cycles` (monthly 120 / annual 100). **User still to do:** create the Razorpay
  webhook in the dashboard (URL `/api/webhooks/razorpay`, secret already in Coolify)
  so recurring renewals/cancellations sync; initial purchases already work via the
  verify callback.

- **2026-06-17** — **Paid membership (Razorpay).** All-access model: Monthly ₹399 /
  Annual ₹2,999 (Razorpay Subscriptions) + Lifetime ₹6,999 (one-time Order). New
  `subscriptions` table; `src/lib/entitlement.ts`, `pricing.ts`, `razorpay.ts`;
  routes `/api/checkout`, `/api/checkout/verify`, `/api/webhooks/razorpay`; pages
  `/pricing` + `/pricing/success`; `Paywall` component. **Removed `proxy.ts`** —
  gating moved into the article page server component (free = static/public, gated =
  dynamic + server entitlement check). Guarded by `paymentsLive` (= Razorpay keys
  present) so it deployed as a no-op; flips fully on when keys land in Coolify.
  Pending: Razorpay test-mode E2E verification, then KYC → live keys/plans/webhook.

- **2026-06-16** — **Technical-SEO acceleration pass.** New `src/lib/access.ts`
  (`isFreeSlug`) is now the single source of truth for free-vs-gated, imported by
  `proxy.ts`, `sitemap.ts`, and article metadata. Sitemap now lists **only** free/
  indexable URLs (was: all articles). Added `alternates.canonical` to every page;
  `noindex` on gated articles and `/login`; `robots.ts` disallows `/api/` + `/login`
  and declares `host`. Richer JSON-LD: Article gains `image`/`dateModified`/
  `mainEntityOfPage`/`inLanguage`/`isAccessibleForFree`, plus a `BreadcrumbList` per
  article and a `WebSite`+`Organization` graph on the homepage; gated articles emit
  none. Verified locally (sitemap 9 free URLs, gated absent; canonical + noindex
  present). **Still requires off-site action: submit sitemap in Google/Bing
  webmaster tools (needs the user's accounts).**
- **2026-06-16** — **Ungated the DevOps Day 30 capstone** as a free finale teaser.
  Added per-series `EXTRA_FREE_DAYS = { '': [30] }` to `src/proxy.ts`; slug parsing
  now returns `{prefix, day}` so the extra is DevOps-only (a future Python Day 30
  stays gated unless added). Verified: DevOps Day 30 → 200, Days 8–29 → 307.
- **2026-06-16** — **Free-preview gate for SEO.** `src/proxy.ts` now lets the first
  `FREE_PREVIEW_DAYS` (=7) days of **every** series through publicly (day number
  parsed from the slug, so both `day-NN-` and `py-day-NN-` resolve). Day 8+ stays
  login-gated by cookie presence; OG images still public. Goal: let search engines
  index the on-ramp. Verified locally for both series.
- **2026-06-16** — **Launched a second series: "Python for AI Engineering"**
  (30 days, beginner-first, project-per-day; covers Python basics → OOP →
  errors/logging/files → envs → type hints/Pydantic → async → APIs → LLM
  workflows (Claude/OpenAI/Gemini side-by-side) → NumPy/Pandas). Wiring:
  (1) new `'python-for-ai-engineering'` entry in `src/lib/series.ts` SERIES
  (full 10-module curriculum + 30 `upcoming` titles); (2) **content authored
  directly** in `content/python/python-for-ai-engineering/py-day-NN-slug.md`
  with correct frontmatter — **NO Jekyll source repo and NO sync step** (the
  `articles.ts` loader already walks `content/**` and groups by frontmatter, so
  the DevOps two-repo+`sync-content.mjs` indirection is deliberately dropped for
  this series — it caused most of series 1's incidental bugs); (3) `py-day-NN`
  slug prefix to avoid collision with DevOps `day-NN`; (4) new
  `scripts/publish-python-day.sh` + `npm run publish:py` (build-gate → commit →
  push → Coolify; no sync); (5) `/series` index and `SeriesShowcase` now iterate
  `Object.values(SERIES)` so every live series shows (was hardcoded to DevOps);
  `/series/[slug]`, `sitemap.ts`, and the article loader were already
  series-agnostic. Project solution code for validation lives outside the site
  repo at `~/syssignals/Python-for-AI-Engineering/day-NN/`. Day 1 published
  locally; **homepage flagship still hardcodes `30-days-devops`** (a future
  decision — see §… / docs). Authoring convention for this series: complete
  files are shown as one editor-paste code block (NOT bash `cat > … EOF`
  heredocs, which break for Windows beginners); per-OS shell variants given for
  install/venv/run.
- **2026-06-14** — **Removed the Giscus comments feature** (deleted
  `src/components/article/Comments.tsx` and its use in the article page). No
  external comment service remains; GitHub Discussions on the content repo are no
  longer used by the site.
- **2026-06-14** — Added **architecture diagram** (§1b: publish/build path +
  runtime request path + trust boundaries). Created human-facing twin
  **`HOW_IT_WORKS.md`** (narrative walkthrough for learning how the site is built).
- **2026-06-13** — Sitewide click-to-zoom **ImageLightbox** added (mounted in root
  layout; normalises mermaid SVG clones; verified desktop+mobile). Day 24 content
  (ConfigMaps) published. This documentation file created.
- **(earlier)** — Days 1–24 of "30 Days of DevOps" authored in the Jekyll repo and
  synced; site stood up with auth, progress sync, OG/RSS/sitemap, GoatCounter,
  Giscus, newsletter, search palette, curriculum.
