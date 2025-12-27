import dotenv from "dotenv"

dotenv.config()

export default {
  port: process.env.PORT || 3000,

  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  spotifyRefreshToken: process.env.SPOTIFY_REFRESH_TOKEN,

  notionTabOverflowDataSourceId: process.env.NOTION_TAB_OVERFLOW_DATA_SOURCE_ID,
  notionTabOverflowWebhookSecret:
    process.env.NOTION_TAB_OVERFLOW_WEBHOOK_SECRET,

  notionLinksDataSourceId: process.env.NOTION_LINKS_DATA_SOURCE_ID,
  notionLinksWebhookSecret: process.env.NOTION_LINKS_WEBHOOK_SECRET,

  notionBlogToken: process.env.NOTION_BLOG_TOKEN,
  notionBlogDataSourceId: process.env.NOTION_BLOG_DATA_SOURCE_ID,

  stravaClientSecret: process.env.STRAVA_CLIENT_SECRET,
  stravaRefreshToken: process.env.STRAVA_REFRESH_TOKEN,

  openaiApiKey: process.env.OPENAI_API_KEY,
  googleGenerativeAiApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,

  githubRepoDispatchToken: process.env.GITHUB_REPO_DISPATCH_TOKEN
} as const
