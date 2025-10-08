# Repository Guidelines

## Project Structure & Module Organization
Source lives under `src/`: route-level Vue SFCs in `src/pages`, shared UI in `src/components`, router setup in `src/router`, utilities in `src/shared`, and markdown inputs in `src/markdown`. The Express + tRPC server sits in `src/server` across `controllers/`, `services/`, `routes/`, and `utils/`. Static assets stay in `public/`, build output in `dist/`, and blog tooling lives in `scripts/buildBlog.ts`.

TypeScript setup is split: `tsconfig.base.json` holds shared options, `tsconfig.app.json` targets the Vite client (DOM libs, Vue SFCs), and `tsconfig.server.json` covers the Express API plus scripts (Node libs, shared utilities). Keep shared types under `src/shared/` so both configs can reference them.

## Build, Test, and Development Commands
Run `pnpm install` after cloning. Use `pnpm dev` for the Vite client and `pnpm dev:server` for the API watcher; `pnpm start` boots the compiled server. Ship-ready bundles come from `pnpm build` (markdown sync, type-check, Vite build) or `pnpm build-only` if content already exists. `pnpm preview` serves the production bundle locally. Lint with `pnpm lint` and enforce types via `pnpm type-check`.

## Coding Style & Naming Conventions
Stick to the Vue 3 + TypeScript defaults: 2-space indentation, single quotes in scripts, and script setup SFCs when possible. Name Vue components in PascalCase (`MyWidget.vue`), route components in kebab-case, and functions/constants in camelCase unless they map to environment tokens (UPPER_SNAKE). ESLint (`eslint.config.js`) and the Vue-aware Prettier plugin run through `pnpm lint`; resolve diagnostics before committing. Tailwind utilities live in `main.css`; prefer composable classes over inline styles.

## Testing Guidelines
Automated tests are not wired in yet. When adding critical logic, introduce Vitest specs beside the code (e.g., `feature/__tests__/feature.test.ts`) and run them manually. Always execute `pnpm build` before opening a PR to catch type regressions and markdown generation failures. Document any manual QA steps or API checks in the PR body.

## Commit & Pull Request Guidelines
Keep commits short, imperative, and scoped (history already shows "update x.com link"). Avoid grab-bag commits. PRs should explain the change, list verification commands, and link Notion or GitHub issues when relevant. Provide screenshots or GIFs for UI work and mention any new env vars. Request review from a maintainer and wait for green checks before merging.

## Security & Configuration Tips
Secrets load from `.env`; see `src/server/config/env.ts` for required keys (Spotify, Mailgun, Notion, Strava, OpenAI, GitHub). Never commit `.env` or plaintext tokens. Prefer sandbox credentials for third-party tests and rotate live keys after local experiments. Coordinate DNS updates (CNAME, Netlify) with the project owner before deploying.
