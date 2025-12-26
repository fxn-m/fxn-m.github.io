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
  spotifyClientId: string
  spotifyClientSecret: string
  spotifyRefreshToken: string
  notionTabOverflowToken: string
  notionTabOverflowDataSourceId: string
  notionBlogToken: string
  notionBlogDataSourceId: string
  stravaClientSecret: string
  stravaRefreshToken: string
  openaiApiKey: string
  githubRepoDispatchToken: string
}

export type WorkerBindings = {
  TAB_OVERFLOW_KV: KVNamespace
} & Record<string, string | undefined>

export const createAppConfig = (source: ConfigSource): AppConfig => ({
  spotifyClientId: requireValue(source, "SPOTIFY_CLIENT_ID", [
    "SPOTIFY_CLIENT_ID"
  ]),
  spotifyClientSecret: requireValue(source, "SPOTIFY_CLIENT_SECRET", [
    "SPOTIFY_CLIENT_SECRET"
  ]),
  spotifyRefreshToken: requireValue(source, "SPOTIFY_REFRESH_TOKEN", [
    "SPOTIFY_REFRESH_TOKEN"
  ]),
  notionTabOverflowToken: requireValue(source, "NOTION_TAB_OVERFLOW_TOKEN", [
    "NOTION_TAB_OVERFLOW_TOKEN"
  ]),
  notionTabOverflowDataSourceId: requireValue(
    source,
    "NOTION_TAB_OVERFLOW_DATA_SOURCE_ID",
    ["NOTION_TAB_OVERFLOW_DATA_SOURCE_ID"]
  ),
  notionBlogToken: requireValue(source, "NOTION_BLOG_TOKEN", [
    "NOTION_BLOG_TOKEN"
  ]),
  notionBlogDataSourceId: requireValue(source, "NOTION_BLOG_DATA_SOURCE_ID", [
    "NOTION_BLOG_DATA_SOURCE_ID"
  ]),
  stravaClientSecret: requireValue(source, "STRAVA_CLIENT_SECRET", [
    "STRAVA_CLIENT_SECRET"
  ]),
  stravaRefreshToken: requireValue(source, "STRAVA_REFRESH_TOKEN", [
    "STRAVA_REFRESH_TOKEN"
  ]),
  openaiApiKey: requireValue(source, "OPENAI_API_KEY", ["OPENAI_API_KEY"]),
  githubRepoDispatchToken: requireValue(source, "GITHUB_REPO_DISPATCH_TOKEN", [
    "GITHUB_REPO_DISPATCH_TOKEN"
  ])
})

export const createConfigFromBindings = (env: WorkerBindings): AppConfig => {
  const { TAB_OVERFLOW_KV: _kv, ...stringBindings } = env
  return createAppConfig(stringBindings)
}
