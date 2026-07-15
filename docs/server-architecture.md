# Server architecture

The Cloudflare Worker exposes a small Hono HTTP interface and three feature modules: Blog, Links, and Tab Overflow. Hono is the transport adapter; feature behavior does not depend on Hono or Cloudflare request context.

## Runtime composition

- `src/server/app.ts` registers public, admin, and Notion webhook routes plus scoped CORS and error handling.
- `src/server/worker.ts` exports the Hono fetch handler, the hourly Tab Overflow refresh, and the enrichment queue consumer.
- `src/server/factories.ts` is the composition root for production feature modules and test replacements.
- `src/server/bindings.ts` names Worker bindings. String values are required only when the operation that needs them runs.
- `worker-configuration.d.ts` is generated with `bun run typegen:worker` and tracks the configured Workerd runtime.

The Blog, Links, and Tab Overflow directories each contain their module interface and external adapters. Only the Notion client setup and property-schema parsing are shared under `src/server/notion`.

## HTTP interface

Public reads:

- `GET /`
- `GET /ping`
- `GET /blog`
- `GET /blog/:id`
- `GET /tab-overflow`

Authenticated operations require `Authorization: Bearer <ADMIN_API_TOKEN>`:

- `POST /admin/blog/build`
- `POST /admin/links/enrich`
- `POST /admin/tab-overflow/enrich`
- `POST /admin/tab-overflow/refresh`

Notion subscription URLs remain unchanged:

- `POST /notion/webhooks/enrich/link`
- `POST /notion/webhooks/enrich/tab-overflow`

Notion event requests are verified against the raw body using `X-Notion-Signature`. Store the one-time verification tokens as `NOTION_LINKS_WEBHOOK_SECRET` and `NOTION_TAB_OVERFLOW_WEBHOOK_SECRET` before enabling event delivery.

## Bindings

Resources:

- `TAB_OVERFLOW_KV`
- `ENRICHMENT_QUEUE`

Secrets and string configuration:

- `ADMIN_API_TOKEN`
- `GITHUB_REPO_DISPATCH_TOKEN`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `NOTION_BLOG_SECRET`
- `NOTION_BLOG_DATA_SOURCE_ID`
- `NOTION_LINKS_SECRET`
- `NOTION_LINKS_DATA_SOURCE_ID`
- `NOTION_LINKS_WEBHOOK_SECRET`
- `NOTION_TAB_OVERFLOW_SECRET`
- `NOTION_TAB_OVERFLOW_DATA_SOURCE_ID`
- `NOTION_TAB_OVERFLOW_WEBHOOK_SECRET`

Before deploying the queue configuration for the first time, create both resources in the target Cloudflare account:

```sh
bunx wrangler queues create fxn-m-enrichment
bunx wrangler queues create fxn-m-enrichment-dlq
```

The consumer starts at one message and one concurrent invocation. Failed jobs retry with a delay and move to the dead-letter queue after the configured retry limit. Enrichment re-reads the Notion page and skips completed work, making duplicate delivery safe.

## Verification

```sh
bun run typegen:worker
bun run test:server
bun run type-check
bun run build
```

When the blog pipeline changes, also run `BACKEND_URL=... bun run build:markdown` against an appropriate Worker environment.
