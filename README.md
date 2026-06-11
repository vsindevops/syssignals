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
- Reader progress (completed days, last-read, continue-learning) in `localStorage` — no backend

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

When a new day ships, also update the curriculum metadata in `src/lib/series.ts`
(move the day from `upcoming` into the right module).

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
