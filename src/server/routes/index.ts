import type { Express } from "express"
import blogRoutes from "./blog"
import notionRoutes from "./notion"
import pingRoutes from "./ping"
import readingListRoutes from "./readingList"
import spotifyRoutes from "./spotify"
import stravaRoutes from "./strava"

export const configureRoutes = (app: Express): void => {
  app.use("/ping", pingRoutes)
  app.use("/readingList", readingListRoutes)
  app.use("/blog", blogRoutes)
  app.use("/spotify", spotifyRoutes)
  app.use("/strava", stravaRoutes)
  app.use("/notion", notionRoutes)
}
