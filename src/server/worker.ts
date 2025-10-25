import { fetchBlogPostMarkdownApi, fetchBlogPostsApi, triggerBlogBuildApi } from "./api/blog"
import { getReadingListApi } from "./api/readingList"
import { getCurrentTrackApi } from "./api/spotify"
import { getStravaActivitiesApi } from "./api/strava"
import {
  type AppConfig,
  createConfigFromBindings,
  type WorkerBindings
} from "./config/appConfig"
import {
  parseReadingListQueueMessage,
  type ReadingListQueueMessage,
  serializeReadingListQueueMessage} from "./queues/readingListQueue"
import {
  enrichAllReadingListItems,
  enrichReadingListItem
} from "./services/notionService"
import type { WorkerEntrypoint } from "./types/cloudflare"
import {
  errorResponse,
  jsonResponse,
  noContentResponse
} from "./utils/responses"

const normalizeIdFromPath = (pathname: string, prefix: string): string | null => {
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

const handleReadingList = async (config: AppConfig, env: WorkerBindings) => {
  const readingList = await getReadingListApi(config, env.READING_LIST_KV)
  return jsonResponse(readingList)
}

const enqueueReadingListEnrichment = async (env: WorkerBindings) => {
  await env.READING_LIST_QUEUE.send(
    serializeReadingListQueueMessage({
      type: "enrich-all"
    })
  )
  return jsonResponse(
    { message: "Reading list enrichment enqueued" },
    202
  )
}

const handleBlogIndex = async (
  config: AppConfig,
  url: URL
) => {
  const isDevelopment = url.searchParams.get("development") === "true"
  const blogs = await fetchBlogPostsApi(config, isDevelopment)
  return jsonResponse(blogs)
}

const handleBlogPost = async (
  config: AppConfig,
  pathname: string
) => {
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

const handleNotionWebhook = async (
  request: Request,
  env: WorkerBindings
) => {
  const body = await request.json().catch(() => null)

  const pageId = body?.entity?.id as string | undefined
  const databaseId = body?.data?.parent?.id as string | undefined

  if (!pageId || !databaseId) {
    return errorResponse("Invalid webhook payload", 400)
  }

  await env.READING_LIST_QUEUE.send(
    serializeReadingListQueueMessage({
      type: "enrich-item",
      pageId,
      databaseId
    })
  )

  return jsonResponse({ message: "Webhook received" }, 202)
}

const routeRequest = async (
  request: Request,
  env: WorkerBindings,
  config: AppConfig
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

  if (pathname === "/readingList" && method === "GET") {
    return handleReadingList(config, env)
  }

  if (pathname === "/readingList/enrich" && method === "POST") {
    return enqueueReadingListEnrichment(env)
  }

  if (pathname === "/blog" && method === "GET") {
    return handleBlogIndex(config, url)
  }

  if (pathname.startsWith("/blog/") && method === "GET") {
    return handleBlogPost(config, pathname)
  }

  if (pathname === "/blog/build" && method === "GET") {
    return handleBlogBuild(config)
  }

  if (pathname === "/spotify/current-track" && method === "GET") {
    return handleSpotifyCurrentTrack(config)
  }

  if (pathname === "/strava/activities" && method === "GET") {
    return handleStravaActivities(config)
  }

  if (pathname === "/notion/webhooks" && method === "POST") {
    return handleNotionWebhook(request, env)
  }

  return errorResponse("Not Found", 404)
}

const handleQueueMessage = async (
  message: ReadingListQueueMessage,
  env: WorkerBindings,
  config: AppConfig
) => {
  switch (message.type) {
    case "enrich-all": {
      await enrichAllReadingListItems(config, env.READING_LIST_KV)
      return
    }
    case "enrich-item": {
      await enrichReadingListItem(
        config,
        env.READING_LIST_KV,
        message.pageId,
        message.databaseId
      )
      return
    }
  }
}

const worker: WorkerEntrypoint<WorkerBindings, ReadingListQueueMessage> = {
  async fetch(request, env, ctx) {
    try {
      const config = createConfigFromBindings(env)
      return await routeRequest(request, env, config)
    } catch (error) {
      console.error("Fetch handler error:", error)
      return errorResponse("Internal Server Error", 500)
    }
  },

  async scheduled(controller, env, ctx) {
    const config = createConfigFromBindings(env)
    ctx.waitUntil(enrichAllReadingListItems(config, env.READING_LIST_KV))
  },

  async queue(batch, env, ctx) {
    const config = createConfigFromBindings(env)
    await Promise.all(
      batch.messages.map(async (message) => {
        try {
          const parsed = parseReadingListQueueMessage(message.body)
          await handleQueueMessage(parsed, env, config)
          message.ack()
        } catch (error) {
          console.error("Queue processing error:", error)
          message.retry()
        }
      })
    )
  }
}

export default worker
