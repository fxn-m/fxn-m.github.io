import type { KVNamespace } from "../types/cloudflare"

type ConfigSource = Record<string, string | undefined>

const firstDefined = (
  source: ConfigSource,
  keys: string[]
): string | undefined => {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "string" && value.length > 0) {
      return value
    }
  }
  return undefined
}

const requireValue = (
  source: ConfigSource,
  label: string,
  keys: string[]
): string => {
  const value = firstDefined(source, keys)
  if (!value) {
    throw new Error(
      `Missing required environment variable for ${label}. Expected one of: ${keys.join(
        ", "
      )}`
    )
  }
  return value
}

export type AppConfig = {
  port: string
  spotifyClientId: string
  spotifyClientSecret: string
  spotifyRefreshToken: string
  notionTabOverflowSecret: string
  notionTabOverflowDataSourceId: string
  notionLinksSecret: string
  notionLinksDataSourceId: string
  notionBlogSecret: string
  notionBlogDataSourceId: string
  notionTabOverflowWebhookSecret?: string
  notionLinksWebhookSecret?: string
  stravaClientSecret: string
  stravaRefreshToken: string
  openaiApiKey: string
  googleGenerativeAiApiKey: string
  githubRepoDispatchToken: string
}

export type WorkerBindings = {
  TAB_OVERFLOW_KV: KVNamespace
} & Record<string, string | undefined>

export const createAppConfig = (source: ConfigSource): AppConfig => ({
  port: firstDefined(source, ["PORT"]) ?? "3000",
  spotifyClientId: requireValue(source, "SPOTIFY_CLIENT_ID", [
    "SPOTIFY_CLIENT_ID"
  ]),
  spotifyClientSecret: requireValue(source, "SPOTIFY_CLIENT_SECRET", [
    "SPOTIFY_CLIENT_SECRET"
  ]),
  spotifyRefreshToken: requireValue(source, "SPOTIFY_REFRESH_TOKEN", [
    "SPOTIFY_REFRESH_TOKEN"
  ]),
  notionTabOverflowSecret: requireValue(source, "NOTION_TAB_OVERFLOW_SECRET", [
    "NOTION_TAB_OVERFLOW_SECRET"
  ]),
  notionTabOverflowDataSourceId: requireValue(
    source,
    "NOTION_TAB_OVERFLOW_DATA_SOURCE_ID",
    ["NOTION_TAB_OVERFLOW_DATA_SOURCE_ID"]
  ),
  notionLinksSecret: requireValue(source, "NOTION_LINKS_SECRET", [
    "NOTION_LINKS_SECRET"
  ]),
  notionLinksDataSourceId: requireValue(source, "NOTION_LINKS_DATA_SOURCE_ID", [
    "NOTION_LINKS_DATA_SOURCE_ID"
  ]),
  notionBlogSecret: requireValue(source, "NOTION_BLOG_SECRET", [
    "NOTION_BLOG_SECRET"
  ]),
  notionBlogDataSourceId: requireValue(source, "NOTION_BLOG_DATA_SOURCE_ID", [
    "NOTION_BLOG_DATA_SOURCE_ID"
  ]),
  notionTabOverflowWebhookSecret: firstDefined(source, [
    "NOTION_TAB_OVERFLOW_SECRET"
  ]),
  notionLinksWebhookSecret: firstDefined(source, [
    "NOTION_LINKS_WEBHOOK_SECRET"
  ]),
  stravaClientSecret: requireValue(source, "STRAVA_CLIENT_SECRET", [
    "STRAVA_CLIENT_SECRET"
  ]),
  stravaRefreshToken: requireValue(source, "STRAVA_REFRESH_TOKEN", [
    "STRAVA_REFRESH_TOKEN"
  ]),
  openaiApiKey: requireValue(source, "OPENAI_API_KEY", ["OPENAI_API_KEY"]),
  googleGenerativeAiApiKey: requireValue(
    source,
    "GOOGLE_GENERATIVE_AI_API_KEY",
    ["GOOGLE_GENERATIVE_AI_API_KEY"]
  ),
  githubRepoDispatchToken: requireValue(source, "GITHUB_REPO_DISPATCH_TOKEN", [
    "GITHUB_REPO_DISPATCH_TOKEN"
  ])
})

export const createConfigFromBindings = (env: WorkerBindings): AppConfig => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { TAB_OVERFLOW_KV: _kv, ...stringBindings } = env
  return createAppConfig(stringBindings)
}
