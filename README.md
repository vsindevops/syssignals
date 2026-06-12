# Systems & Signals — syssignals.com

Production platform for [syssignals.com](https://syssignals.com): project-based
DevOps, MLOps and AI engineering content by Vishwas Sharma.

## Stack

- **Next.js 16** (App Router, Turbopack, fully static output via SSG)
- **Tailwind CSS v4** — design tokens live in `src/app/globals.css` (`@theme`), no JS config
- **unified / remark / rehype + shiki** (`rehype-pretty-code`) for markdown → HTML with
  `github-dark-default` highlighting — handles Helm `{{ }}` / GitHub Actions `${{ }}` syntax
  that would break MDX compilation
- **Mermaid** — diagrams rendered client-side from fenced ```mermaid blocks
- **motion** (Framer Motion) — scroll reveals, hero, curriculum animations
- **Accounts**: passwordless magic-link sign-in (Auth.js v5 + Resend + Postgres on the VPS).
  Reader progress is server-synced for signed-in users, `localStorage` for anonymous
  readers, merged into the account on first login. Env: `DATABASE_URL`, `AUTH_SECRET`,
  `AUTH_URL`, `RESEND_API_KEY`. Local dev needs an SSH tunnel to the prod Postgres
  (see `.env.local`).

## Content workflow

The Jekyll repo (`../30-days-devops`) is the **source of truth** for articles.
After publishing a new day there, sync it into this site:

```bash
npm run sync   # node scripts/sync-content.mjs [path-to-jekyll-repo]
```

The script rewrites frontmatter to this site's schema (`day`, `series`, `seriesSlug`),
strips the Jekyll series banner, and rewrites internal links from
`/articles/YYYY/MM/DD/<slug>/` to `/articles/<slug>`. Output lands in
`content/devops/30-days-devops/`.

### Publishing a new day (the whole flow)

```bash
npm run publish:day
```

This syncs from the Jekyll repo, verifies the production build, commits and
pushes — Coolify deploys syssignals.com from the push. Afterwards (or before),
place the new day into its module in `src/lib/series.ts` and remove it from
`upcoming`; if you forget, the site self-heals and shows it under a
"Just shipped" block until you do.

## Go-live features

- **OG images** — generated per article (`/articles/<slug>/opengraph-image`) and site-wide, branded cards via `src/lib/og.tsx` (satori + fontsource WOFFs)
- **RSS** — `/feed.xml`; **sitemap** — `/sitemap.xml`; **robots** — `/robots.txt`; JSON-LD (`TechArticle` + `Course`)
- **Analytics** — GoatCounter (syssignals.goatcounter.com), SPA-aware; public view-count chip on articles
- **Comments** — Giscus on GitHub Discussions (syssignals/30-days-devops), lazy-loaded, mapped by slug
- **Newsletter** — `/api/subscribe`; set ONE provider in env:
  - `BUTTONDOWN_API_KEY=...`, or
  - `RESEND_API_KEY=...` + `RESEND_AUDIENCE_ID=...`

  Unconfigured, the form shows a friendly "signups open soon" fallback.

## Deployment (Coolify / any Docker host)

```bash
docker build -t syssignals .
docker run -p 3000:3000 -e BUTTONDOWN_API_KEY=... syssignals
```

The image uses Next standalone output; article markdown and OG fonts are copied
in explicitly (read from disk at runtime, invisible to output tracing).

## Development

```bash
npm run dev     # dev server on :3000
npm run build   # production build (all routes prerendered)
npm run lint
```

## Key paths

| Path | What |
| --- | --- |
| `src/lib/articles.ts` | content reading, search index, adjacency, tags |
| `src/lib/markdown.ts` | unified pipeline: GFM → raw HTML → slugs → TOC → shiki |
| `src/lib/series.ts` | curriculum modules + upcoming days |
| `src/components/article/` | TOC scrollspy, reading progress, code copy + mermaid enhancer, mark-complete |
| `src/components/progress/ProgressProvider.tsx` | localStorage progress context |
| `src/components/search/SearchPalette.tsx` | ⌘K command palette |
| `scripts/sync-content.mjs` | Jekyll → content importer |
