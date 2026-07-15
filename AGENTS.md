# AGENTS – Current Repo Notes

## Stack At A Glance

- The frontend is a clean React 19 and Vite app. `src/main.tsx` mounts `src/client/app.tsx` inside the theme provider; `src/main.css` holds the homepage, blog typography, Tab Overflow layout, and light/dark theme baseline.
- The Cloudflare Worker in `src/server` serves the existing Notion, Spotify, Strava, and link-enrichment APIs and stores Tab Overflow data in KV.
- Shared TypeScript contracts live in `src/shared` and are consumed through the `@` alias configured in the TypeScript configs.
- Blog posts are sourced from Notion; `scripts/buildBlog.ts` materializes the index and HTML consumed by the client into `public/html`.

## Layout Highlights

- `src/client/app.tsx` owns the homepage/view switch, `src/client/components/blog.tsx` loads the static blog snapshots, `src/client/components/tab-overflow.tsx` renders the live Tab Overflow view with Fuse-powered search, and `src/client/components/theme` contains the light/dark/system provider and toggle.
- `src/server` is organized by concern: `api`, `services`, `config`, `utils`, and the Worker entry at `worker.ts`.
- `src/shared` exposes domain models for blogs, Strava, Notion, and Tab Overflow.
- `scripts/buildBlog.ts` fetches from the Worker using `BACKEND_URL`, clears `public/html`, and writes HTML snapshots plus `index.json`.
- Root configuration is intentionally small: Vite uses only the React plugin, Oxlint and Oxfmt use their defaults, and Bun manages dependencies.

## Tooling & Commands

- Install with `bun install`; CI uses `bun ci` against the committed `bun.lock`.
- Run the client with `bun run dev` and the Worker with `bun run dev:server`.
- `bun run build` type-checks the app and Worker before building the client.
- `bun run build:markdown` refreshes the blog snapshots consumed by the client and remains separate from the normal Vite build.
- `bun run lint` and `bun run lint:fix` use Oxlint.
- `bun run format` and `bun run format:check` use Oxfmt.
- `bun run check` verifies formatting, linting, and all TypeScript projects.
- `bun run preview` serves the production client bundle.

## Environment & Secrets

- Worker bindings are defined by `src/server/config/env.ts` and validated by `src/server/config/app-config.ts`. Keep all secrets out of the repository.
- `VITE_BACKEND_URL` selects the Worker used by the live Tab Overflow view and defaults to the production Worker; blog content is served from the generated `/html` directory.
- Set `BACKEND_URL` before running `bun run build:markdown`.
- Wrangler injects `TAB_OVERFLOW_KV`; the remaining integrations require their corresponding Notion, Spotify, Strava, Google AI, and GitHub credentials.

## Frontend Baseline

- The browser document stays minimal: it has the Vite root, standard metadata, and a theme-aware favicon. There are no remote fonts, analytics scripts, routers, query clients, or UI libraries.
- Theme mode cycles through system, dark, and light, persists for the browser session, and uses the sun/moon and light/dark favicon assets in `public`.
- Keep the frontend dependency set minimal as the redesign grows. Add packages only when the new UI actually uses them.
- Keep `src/main.css` restrained: the current baseline is the narrow homepage and blog layout, readable article typography, the Tab Overflow suggestion/search/table surface, and the small set of light/dark color tokens needed by the theme toggle.

## Worker & Content Notes

- `src/server/worker.ts` routes the handshake, health check, Tab Overflow, blog, Spotify, Strava, and Notion webhook endpoints.
- `createConfigFromBindings` fails fast when required Worker bindings are missing.
- Notion services enrich and cache data; Spotify and Strava services handle OAuth refresh flows; response helpers apply CORS consistently.
- The homepage writing list and in-place post view consume the blog snapshot pipeline; refresh `public/html` before testing blog content locally.

## After You Change Things

- After meaningful edits, run `bun run format`, `bun run lint:fix`, and `bun run type-check`; fix only issues introduced by your work.
- For release validation, run `bun run build`.
- When changing the blog snapshot pipeline, also run `BACKEND_URL=... bun run build:markdown`.
- When touching Worker logic, smoke-test with `bun run dev:server` so missing bindings fail locally.
