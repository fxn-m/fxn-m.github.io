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
    notionDatabaseId: process.env.NOTIONDATABASEID || "",
    readmeSecret: process.env.README_SECRET
}
