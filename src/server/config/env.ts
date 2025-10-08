import dotenv from "dotenv"

dotenv.config()

export default {
  port: process.env.PORT || 3000,
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  spotifyRefreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
  mailgunApiKey: process.env.MAILGUN_API_KEY,
  mailgunDomain: process.env.MAILGUN_DOMAIN,
  notionApiKey: process.env.NOTIONAPIKEY,
  notionReadingListDatabaseId: process.env.NOTIONREADINGLISTDATABASEID,
  notionBlogDatabaseId: process.env.NOTIONBLOGDATABASEID,
  readmeSecret: process.env.README_SECRET,
  stravaClientSecret: process.env.STRAVA_CLIENT_SECRET,
  stravaRefreshToken: process.env.STRAVA_REFRESH_TOKEN,
  openaiApiKey: process.env.OPENAI_API_KEY,
  githubRepoDispatchToken: process.env.GITHUB_REPO_DISPATCH_TOKEN
} as const
