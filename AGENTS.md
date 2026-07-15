# AGENTS – Current Repo Notes

## Stack At A Glance

- The frontend is a React 19, React Router 8, Tailwind CSS 4, and Vite app. `src/main.tsx` mounts the hash router inside the TanStack Query and theme providers; `src/main.css` is limited to Tailwind and global theme tokens.
- The Cloudflare Worker in `src/server` uses Hono for HTTP routing, serves the blog and Tab Overflow reads, accepts signed Notion webhooks, and runs link/Tab Overflow enrichment through Cloudflare Queues.
- Shared TypeScript contracts live in `src/shared` and are consumed through the `@` alias configured in the TypeScript configs.
- Blog posts are sourced from Notion; `scripts/buildBlog.ts` materializes the index and HTML consumed by the client into `public/html`.

## Layout Highlights

- `src/client/router.tsx` owns the static-host-safe hash routes and route-aware PostHog pageviews. `src/client/app.tsx` owns the shared shell and homepage, `src/client/components/blog.tsx` loads the static blog snapshots, `src/client/components/tab-overflow.tsx` renders the cached live Tab Overflow view with Fuse-powered search, and `src/client/components/theme` contains the light/dark/system provider and toggle.
- TanStack Query configuration lives in `src/client/config/query.ts`; reusable query definitions live under `src/client/api`. Tab Overflow is prefetched from the homepage and on link intent.
- `src/server/app.ts` owns the Hono transport seam and `src/server/worker.ts` composes fetch, scheduled, and queue handlers. Feature modules live under `blog`, `links`, and `tab-overflow`; shared Notion infrastructure is intentionally limited to `src/server/notion`.
- `src/shared` exposes the browser-facing blog and Tab Overflow contracts. External Notion SDK response types stay inside the Worker adapters.
- `scripts/buildBlog.ts` fetches from the Worker using `BACKEND_URL`, clears `public/html`, and writes HTML snapshots plus `index.json`.
- Root configuration is intentionally small: Vite uses the React and Tailwind plugins, Oxlint and Oxfmt use their defaults, and Bun manages dependencies.

## Tooling & Commands

- Install with `bun install`; CI uses `bun ci` against the committed `bun.lock`.
- Run the client with `bun run dev` and the Worker with `bun run dev:server`.
- `bun run build` type-checks the app and Worker before building the client.
- `bun run build:markdown` refreshes the blog snapshots consumed by the client and remains separate from the normal Vite build.
- `bun run lint` and `bun run lint:fix` use Oxlint.
- `bun run format` and `bun run format:check` use Oxfmt.
- `bun run test:server` runs the Worker contract and feature-module tests inside the Cloudflare Vitest pool.
- `bun run typegen:worker` regenerates the committed Cloudflare runtime types after `wrangler.toml` or its compatibility settings change.
- `bun run check` verifies formatting, linting, and all TypeScript projects.
- `bun run preview` serves the production client bundle.

## Environment & Secrets

- Worker bindings are declared in `src/server/bindings.ts`. String secrets are validated lazily by the feature that consumes them, so health checks do not depend on unrelated integrations. Keep all secret values out of the repository.
- `VITE_BACKEND_URL` selects the Worker used by the live Tab Overflow view and defaults to the production Worker; blog content is served from the generated `/html` directory.
- Set `BACKEND_URL` before running `bun run build:markdown`.
- Wrangler injects `TAB_OVERFLOW_KV` and `ENRICHMENT_QUEUE`. Notion reads, Gemini enrichment, GitHub workflow dispatch, admin routes, and Notion webhook signatures require their corresponding secrets.

## Frontend Baseline

- The browser document stays minimal: it has the Vite root, standard metadata, and a theme-aware favicon. React Router, TanStack Query, PostHog, and Tailwind provide routing, server-state caching, analytics, and utility styling without a component library.
- Theme mode cycles through system, dark, and light, persists for the browser session, and uses the sun/moon and light/dark favicon assets in `public`.
- Keep the frontend dependency set minimal as the redesign grows. Add packages only when the new UI actually uses them.
- Keep `src/main.css` restrained to Tailwind setup and global light/dark tokens. Use Tailwind utilities in components; generated blog HTML typography is the scoped exception in `src/client/components/blog-content.module.css`.

## Worker & Content Notes

- Public HTTP routes are `GET /`, `GET /ping`, `GET /blog`, `GET /blog/:id`, and `GET /tab-overflow`. Mutating routes live under `/admin` and require `ADMIN_API_TOKEN`.
- The existing Notion webhook paths remain stable. Event payloads require their `X-Notion-Signature`; one-time subscription verification payloads are accepted before the verification secret is configured.
- Tab Overflow uses cache-aside KV reads plus the hourly scheduled refresh. AI enrichment is queued and idempotent so at-least-once delivery does not repeat completed work.
- The homepage writing list and in-place post view consume the blog snapshot pipeline; refresh `public/html` before testing blog content locally.

## After You Change Things

- After meaningful edits, run `bun run format`, `bun run lint:fix`, and `bun run type-check`; fix only issues introduced by your work.
- For release validation, run `bun run build`.
- When changing the blog snapshot pipeline, also run `BACKEND_URL=... bun run build:markdown`.
- When touching Worker logic, run `bun run test:server` and smoke-test with `bun run dev:server`. Provision the configured enrichment queue and dead-letter queue before deploying a new environment.
