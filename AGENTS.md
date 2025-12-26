# AGENTS – Current Repo Notes

## Stack At A Glance

- Vue 3 + Vite 6 front end lives in `src/client`, bootstrapped from `src/main.ts` and `src/client/App.vue` with TanStack Query and Font Awesome wired in.
- Cloudflare Worker (Wrangler 4 with `nodejs_compat`) in `src/server` serves all API traffic, talks to Notion/Spotify/Strava/OpenAI, and stores Tab Overflow data in KV.
- Shared TypeScript contracts remain in `src/shared` and are consumed by both builds through the `@` alias defined in Vite and the tsconfigs.
- Tailwind CSS 4 (via `@tailwindcss/vite`) and utility helpers in `src/main.css` drive styling; shadcn-vue components are scaffolded under `src/client/components/ui`.
- Blog posts are sourced from Notion; `scripts/buildBlog.ts` materializes static HTML into `public/html` prior to production builds.

## Layout Highlights

- `src/client/` holds `pages/` (router targets like `HomePage`, `WritingPage`, `TabOverflow`, `AnkiPankiPage`), shared UI (`components/`), analytics (`analytics/posthog.ts`), and local helpers (`lib/ankiBlueprints.ts`, `lib/utils.ts`).
- `src/server/` is organized by concern: `api/` (per-endpoint orchestration), `services/` (Notion enrichment, Spotify, Strava, GitHub dispatch), `config/` (env + constants), `utils/` (blog transforms, KV cache, response helpers), and the Worker entry at `worker.ts`.
- `src/shared/` exposes domain models for blogs, Strava, Notion, and Anki flashcards so the client, worker, and scripts stay in sync.
- `scripts/buildBlog.ts` fetches from the worker using `process.env.BACKEND_URL` and regenerates `public/html` (clearing the folder first) plus `index.json` used by the writing routes.
- `public/` keeps favicons and theme icons; compiled assets land in `dist/`; `components.json` tracks the shadcn registry; `frm.json` is large reference data for the Anki feature.
- Root configs: `vite.config.ts` sets `@` to `./src`, `tsconfig.*.json` split app/server targets, `wrangler.toml` binds `TAB_OVERFLOW_KV` and sets `compatibility_date` to 2025-10-25.

## Tooling & Commands

- Install with `pnpm install` (repo pins `packageManager` to `pnpm@10.26.2`).
- Run the client with `pnpm dev` (Vite at `localhost:5173`, host-access enabled for ngrok domains).
- Run the worker locally with `pnpm dev:server` (Wrangler dev server on `localhost:8787`, exposing the Cloudflare Worker routes).
- `pnpm build` chains `build:markdown`, `pnpm type-check`, and `vite build`; use `pnpm build-only` if `public/html` is already fresh.
- Validation: `pnpm type-check` runs both `vue-tsc` and `tsc`; `pnpm lint` (or `pnpm lint --fix`) lint Vue + TS; `pnpm preview` serves the built site; `pnpm tunnel:*` scripts open curated ngrok tunnels.

## Environment & Secrets

- **Worker bindings (`wrangler`):** required `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`, `NOTION_TAB_OVERFLOW_TOKEN`, `NOTION_TAB_OVERFLOW_DATA_SOURCE_ID`, `NOTION_BLOG_TOKEN`, `NOTION_BLOG_DATA_SOURCE_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN`, `OPENAI_API_KEY`, `GITHUB_REPO_DISPATCH_TOKEN`. Wrangler injects `TAB_OVERFLOW_KV`.
- **Client `.env` (Vite):** `VITE_BACKEND_URL` (point at the worker, e.g., `http://localhost:8787`), `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` (defaults to EU cluster), `VITE_POSTHOG_CAPTURE_DEV` toggles analytics during local dev.
- **Blog build script:** set `BACKEND_URL` to the worker base before running `pnpm build:markdown`; the script wipes and rewrites `public/html`.
- **Third-party expectations:** Spotify and Strava secrets must correspond to the configured accounts; Notion entries rely on data source IDs (not classic database IDs) and the OpenAI key powers Tab Overflow enrichment.
- **Local storage keys:** the Anki generator stores the user-provided OpenAI key under `ankipanki:openai-api-key`; Tab Overflow persists slug maps in `localStorage.slugMap`.

## Frontend Notes

- Router (hash history) lives in `src/client/router/index.ts`; routes cover `/`, `/writing`, `/writing/:slug`, `/fun`, `/fun/ankipanki`, `/fun/:name`, `/contact`, with a catch-all redirect.
- `WritingPage` and `WritingPost` use TanStack Query against the worker in development and fall back to `public/html/index.json` + HTML files in production, caching a slug/id map in `localStorage`.
- `TabOverflow.vue` fetches from `/tab-overflow`, randomizes suggestions with keyboard navigation, and displays KV-backed enrichment (summary, tags, reading time) returned by the worker.
- `FunPage` aggregates projects; `StravaActivity.vue` pulls `/strava/activities`, renders decoded GPS routes on a `<canvas>`, and shows a countdown to the Spartan Beast on 2025-10-12.
- `AnkiPankiPage.vue` orchestrates flashcard generation using predefined FRM blueprints (`src/client/lib/ankiBlueprints.ts`), TanStack Form + Zod validation, motion-v transitions, and user-owned OpenAI keys captured via `AnkiApiKeyControl`.
- `ThemeToggle` flips between light/dark/system, rewrites the favicon, and `main.css` constrains the page to a centered column with Tailwind tokens; note that `App.vue` still imports `<ServerStatus />`, which has not been committed yet.

## Worker & API Notes

- `src/server/worker.ts` routes: `/` handshake, `/ping`, `/tab-overflow` (GET cached list), `/tab-overflow/enrich` (POST background enrichment), `/blog` + `/blog/:id`, `/blog/build`, `/spotify/current-track`, `/strava/activities`, and `/notion/webhooks` (POST fires enrichment on new Notion items).
- `createConfigFromBindings` in `config/appConfig.ts` enforces environment presence at runtime; missing keys throw descriptive errors during worker startup.
- `services/notionService.ts` fetches from Notion Data Sources, enriches Tab Overflow items using `@ai-sdk/openai` with web-search tool calls, deduplicates links, updates Notion properties, and refreshes the Cloudflare KV cache.
- KV helpers in `utils/tabOverflowStore.ts` back the `/tab-overflow` response; cache is automatically refreshed when enrichment runs or no cache exists.
- `services/spotifyService.ts` and `services/stravaService.ts` handle OAuth refresh flows; responses are normalized by the API layer before returning to the client.
- `services/githubService.ts` triggers the `build-blog.yml` GitHub Actions workflow when `/blog/build` is invoked; CORS headers are consistently set via `utils/responses.ts`.

## Content Pipeline

- `scripts/buildBlog.ts` pulls the blog index and per-post markdown from the worker, converts content via `convertMarkdownToHTML`, and serializes HTML snapshots plus a JSON index; it deletes the previous output directory before writing.
- The client consumes `public/html/index.json` in production to avoid runtime Notion calls; ensure this directory is committed when publishing static content.
- Highlight.js themes are swapped dynamically in `WritingPost.vue` based on the document’s dark mode class, and captions are auto-generated from image alt text.
- GitHub workflow dispatch keeps Netlify/GitHub Pages in sync by rebuilding markdown when triggered from the worker endpoint or manually.

## Shared Tooling & Conventions

- Type safety is split: `tsconfig.app.json` targets DOM + Vue SFCs, `tsconfig.server.json` targets Node/WebWorker for the Cloudflare worker and scripts.
- ESLint 9 + `eslint-plugin-vue` + `@eslint/css` govern linting; Prettier is available via `pnpm format` but lint rules are the source of truth.
- Tailwind definitions live directly in `src/main.css`; `class-variance-authority` and `tailwind-merge` power the `cn` helper in `src/client/lib/utils.ts`.
- Iconography mixes Font Awesome (registered in `src/main.ts`) and Lucide (for in-app controls).

## After You Change Things

- After meaningful edits, run `pnpm type-check` and `pnpm lint --fix`; fix only issues introduced by your changes.
- For release validation, run `pnpm build` to regenerate markdown, type-check, and produce the production bundle.
- Keep secrets out of the repo—see `src/server/config/env.ts` for the current list, and rotate tokens after local testing when possible.
- When touching worker logic, smoke-test with `pnpm dev:server` so missing bindings or env vars fail locally instead of in production.
