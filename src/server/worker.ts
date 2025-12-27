import {
  fetchBlogPostMarkdownApi,
  fetchBlogPostsApi,
  triggerBlogBuildApi
} from "./api/blog"
import { enrichLinksApi } from "./api/links"
import { getCurrentTrackApi } from "./api/spotify"
import { getStravaActivitiesApi } from "./api/strava"
import { getTabOverflowApi } from "./api/tab-overflow"
import {
  type AppConfig,
  createConfigFromBindings,
  type WorkerBindings
} from "./config/app-config"
import {
  AnkiGenerationError,
  ensureValidOpenAIApiKey,
  generateAnkiCards,
  normalizeGenerateDeckRequest
} from "./services/ankipanki-service"
import {
  enrichAllTabOverflowItems,
  enrichLinkItem,
  enrichTabOverflowItem
} from "./services/notion"
import type { ExecutionContext, WorkerEntrypoint } from "./types/cloudflare"
import {
  errorResponse,
  jsonResponse,
  noContentResponse
} from "./utils/responses"

type NotionWebhookBody = {
  verification_token?: string
  entity?: { id?: string }
  data?: {
    parent?: { id?: string; data_source_id?: string; database_id?: string }
  }
}

const normalizeNotionWebhookBody = (
  body: unknown
): NotionWebhookBody | null => {
  if (!body || typeof body !== "object") {
    return null
  }
  return body as NotionWebhookBody
}

const parseNotionWebhookBody = async (
  request: Request
): Promise<{ body: NotionWebhookBody | null } | Response> => {
  const rawBody = await request.text()

  try {
    const parsed = rawBody.length > 0 ? JSON.parse(rawBody) : null
    return { body: normalizeNotionWebhookBody(parsed) }
  } catch (error) {
    console.error("Failed to parse Notion webhook body:", error)
    return errorResponse("Invalid webhook payload", 400)
  }
}

const normalizeIdFromPath = (
  pathname: string,
  prefix: string
): string | null => {
  if (!pathname.startsWith(prefix)) {
    return null
  }
  const id = pathname.slice(prefix.length)
  if (!id) {
    return null
  }
  return decodeURIComponent(id)
}

const handleRoot = () =>
  jsonResponse({
    message: "Hey... whatcha doin' there?"
  })

const handlePing = () => jsonResponse({ message: "pong" })

const handleTabOverflow = async (config: AppConfig, env: WorkerBindings) => {
  const tabOverflow = await getTabOverflowApi(config, env.TAB_OVERFLOW_KV)
  return jsonResponse(tabOverflow)
}

const enqueueLinksEnrichment = async (
  config: AppConfig,
  ctx: ExecutionContext
) => {
  ctx.waitUntil(enrichLinksApi(config))
  return jsonResponse({ message: "Links enrichment started" }, 202)
}

const enqueueTabOverflowEnrichment = async (
  config: AppConfig,
  env: WorkerBindings,
  ctx: ExecutionContext
) => {
  ctx.waitUntil(enrichAllTabOverflowItems(config, env.TAB_OVERFLOW_KV))
  return jsonResponse({ message: "Tab Overflow enrichment started" }, 202)
}

const handleBlogIndex = async (config: AppConfig, url: URL) => {
  const isDevelopment = url.searchParams.get("development") === "true"
  const blogs = await fetchBlogPostsApi(config, isDevelopment)
  return jsonResponse(blogs)
}

const handleBlogPost = async (config: AppConfig, pathname: string) => {
  const postId = normalizeIdFromPath(pathname, "/blog/")
  if (!postId) {
    return errorResponse("Blog post id is required", 400)
  }
  const markdown = await fetchBlogPostMarkdownApi(config, postId)
  return jsonResponse(markdown)
}

const handleBlogBuild = async (config: AppConfig) => {
  await triggerBlogBuildApi(config)
  return jsonResponse({ message: "Blog build triggered" })
}

const handleSpotifyCurrentTrack = async (config: AppConfig) => {
  const currentTrack = await getCurrentTrackApi(config)

  if (!currentTrack) {
    return jsonResponse({ message: "No song currently playing" })
  }

  return jsonResponse(currentTrack)
}

const handleStravaActivities = async (config: AppConfig) => {
  const activities = await getStravaActivitiesApi(config)
  if (!activities) {
    return jsonResponse({ message: "No activities found" })
  }
  return jsonResponse(activities)
}

const handleNotionTabOverflowWebhook = async (
  request: Request,
  env: WorkerBindings,
  config: AppConfig,
  ctx: ExecutionContext
) => {
  const parseResult = await parseNotionWebhookBody(request)
  if (parseResult instanceof Response) {
    return parseResult
  }
  const { body } = parseResult

  console.log("Notion webhook body:", body)

  const verificationToken = body?.verification_token as string | undefined

  if (verificationToken) {
    console.warn(
      "Notion verification token received. Store this value as the webhook secret to enable signature verification."
    )
    return jsonResponse(
      {
        message: "Webhook verification token received",
        verification_token: verificationToken
      },
      200
    )
  }

  const pageId = body?.entity?.id as string | undefined
  const parent = body?.data?.parent as
    | { id?: string; data_source_id?: string; database_id?: string }
    | undefined
  const dataSourceId =
    parent?.data_source_id ?? parent?.id ?? parent?.database_id

  if (!pageId || !dataSourceId) {
    return errorResponse("Invalid webhook payload", 400)
  }

  ctx.waitUntil(
    enrichTabOverflowItem(config, env.TAB_OVERFLOW_KV, pageId, dataSourceId)
  )

  return jsonResponse({ message: "Webhook received" }, 202)
}

const handleNotionLinksWebhook = async (
  request: Request,
  config: AppConfig,
  ctx: ExecutionContext
) => {
  const parseResult = await parseNotionWebhookBody(request)
  if (parseResult instanceof Response) {
    return parseResult
  }
  const { body } = parseResult

  console.log("Notion links webhook body:", body)

  const verificationToken = body?.verification_token as string | undefined

  if (verificationToken) {
    console.warn(
      "Notion verification token received. Store this value as the webhook secret to enable signature verification."
    )
    return jsonResponse(
      {
        message: "Webhook verification token received",
        verification_token: verificationToken
      },
      200
    )
  }

  const pageId = body?.entity?.id as string | undefined
  const parent = body?.data?.parent as
    | { id?: string; data_source_id?: string; database_id?: string }
    | undefined
  const dataSourceId =
    parent?.data_source_id ?? config.notionLinksDataSourceId ?? parent?.id

  if (!pageId || !dataSourceId) {
    return errorResponse("Invalid webhook payload", 400)
  }

  ctx.waitUntil(enrichLinkItem(config, pageId, dataSourceId))

  return jsonResponse({ message: "Links webhook received" }, 202)
}

const handleAnkiGenerate = async (request: Request) => {
  const body = await request.json().catch(() => null)

  const result = normalizeGenerateDeckRequest(body)

  if (!result.success) {
    return jsonResponse(
      {
        message: "Invalid generation request",
        issues: result.issues
      },
      400
    )
  }

  let apiKey: string

  try {
    const rawHeader =
      request.headers.get("x-anki-openai-key") ??
      request.headers.get("X-Anki-OpenAI-Key") ??
      request.headers.get("authorization") ??
      request.headers.get("Authorization")

    const normalizedHeader =
      rawHeader && rawHeader.startsWith("Bearer ")
        ? rawHeader.slice("Bearer ".length)
        : rawHeader

    apiKey = ensureValidOpenAIApiKey(normalizedHeader)
  } catch (error) {
    if (error instanceof AnkiGenerationError) {
      return errorResponse(error.message, error.status)
    }

    console.error("Failed to read OpenAI API key header:", error)
    return errorResponse("Failed to read OpenAI API key header", 400)
  }

  try {
    const cards = await generateAnkiCards(apiKey, result.payload)

    return jsonResponse({
      message: "Anki cards generated",
      request: result.payload,
      cards
    })
  } catch (error) {
    if (error instanceof AnkiGenerationError) {
      console.warn("Anki card generation failed:", error)
      return errorResponse(error.message, error.status)
    }

    console.error("Anki card generation failed:", error)
    return errorResponse("Failed to generate Anki cards", 500)
  }
}

const routeRequest = async (
  request: Request,
  env: WorkerBindings,
  config: AppConfig,
  ctx: ExecutionContext
): Promise<Response> => {
  const url = new URL(request.url)
  const { pathname } = url
  const method = request.method.toUpperCase()

  if (method === "OPTIONS") {
    return noContentResponse()
  }

  if (method === "GET" && pathname === "/") {
    return handleRoot()
  }

  if (method === "GET" && pathname === "/ping") {
    return handlePing()
  }

  if (pathname === "/tab-overflow" && method === "GET") {
    return handleTabOverflow(config, env)
  }

  if (pathname === "/tab-overflow/enrich" && method === "POST") {
    return enqueueTabOverflowEnrichment(config, env, ctx)
  }

  if (pathname === "/links/enrich" && method === "POST") {
    return enqueueLinksEnrichment(config, ctx)
  }

  if (pathname === "/ankipanki/generate" && method === "POST") {
    return handleAnkiGenerate(request)
  }

  if (pathname === "/blog" && method === "GET") {
    return handleBlogIndex(config, url)
  }

  if (pathname === "/blog/build" && method === "GET") {
    return handleBlogBuild(config)
  }

  if (pathname.startsWith("/blog/") && method === "GET") {
    return handleBlogPost(config, pathname)
  }

  if (pathname === "/spotify/current-track" && method === "GET") {
    return handleSpotifyCurrentTrack(config)
  }

  if (pathname === "/strava/activities" && method === "GET") {
    return handleStravaActivities(config)
  }

  if (pathname === "/notion/webhooks/enrich/link" && method === "POST") {
    return handleNotionLinksWebhook(request, config, ctx)
  }

  if (
    pathname === "/notion/webhooks/enrich/tab-overflow" &&
    method === "POST"
  ) {
    return handleNotionTabOverflowWebhook(request, env, config, ctx)
  }

  return errorResponse("Not Found", 404)
}

const worker: WorkerEntrypoint<WorkerBindings> = {
  async fetch(request, env, ctx) {
    try {
      const config = createConfigFromBindings(env)
      return await routeRequest(request, env, config, ctx)
    } catch (error) {
      console.error("Fetch handler error:", error)
      return errorResponse("Internal Server Error", 500)
    }
  }
}

export default worker
