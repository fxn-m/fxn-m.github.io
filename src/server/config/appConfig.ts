import type { KVNamespace, Queue } from "../types/cloudflare"

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
  mailgunApiKey?: string
  mailgunDomain?: string
  notionApiKey: string
  notionReadingListDataSourceId: string
  notionBlogDataSourceId: string
  readmeSecret?: string
  stravaClientSecret: string
  stravaRefreshToken: string
  openaiApiKey: string
  githubRepoDispatchToken: string
}

export type WorkerBindings = {
  READING_LIST_KV: KVNamespace
  READING_LIST_QUEUE: Queue
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
  mailgunApiKey: firstDefined(source, ["MAILGUN_API_KEY"]),
  mailgunDomain: firstDefined(source, ["MAILGUN_DOMAIN"]),
  notionApiKey: requireValue(source, "NOTION_API_KEY", [
    "NOTION_API_KEY",
    "NOTIONAPIKEY"
  ]),
  notionReadingListDataSourceId: requireValue(
    source,
    "NOTION_READING_LIST_DATA_SOURCE_ID",
    ["NOTION_READING_LIST_DATA_SOURCE_ID", "NOTIONREADINGLISTDATASOURCEID"]
  ),
  notionBlogDataSourceId: requireValue(source, "NOTION_BLOG_DATA_SOURCE_ID", [
    "NOTION_BLOG_DATA_SOURCE_ID",
    "NOTIONBLOGDATASOURCEID"
  ]),
  readmeSecret: firstDefined(source, ["README_SECRET"]),
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
  const {
    READING_LIST_KV: _kv,
    READING_LIST_QUEUE: _queue,
    ...stringBindings
  } = env
  return createAppConfig(stringBindings)
}
