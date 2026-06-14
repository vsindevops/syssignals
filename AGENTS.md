<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Keep the documentation in sync (REQUIRED)

This repo has two living docs that must stay accurate:

- `SYSTEM_CONTEXT.md` — machine-facing fact dump (stack, routes, architecture diagram §1b, env vars, schema, costs, gotchas, changelog).
- `HOW_IT_WORKS.md` — human-facing narrative twin.

**At the end of any change that touches architecture, infrastructure, scaling, dependencies, routes, env vars, the database schema, external services, or running costs, you MUST update BOTH files before finishing:** add the precise facts to `SYSTEM_CONTEXT.md` (and bump its "Last updated" date + prepend a `## 16. Change log` entry), and add/adjust the plain-English explanation in `HOW_IT_WORKS.md`. Small UI tweaks that change none of the above don't require a doc update. When unsure, update them.
