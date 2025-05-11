import type { Express } from "express"

import pingRoutes from "./ping"
import readingListRoutes from "./readingList"
import blogRoutes from "./blog"
import spotifyRoutes from "./spotify"
import stravaRoutes from "./strava"
import notionRoutes from "./notion"

export const configureRoutes = (app: Express): void => {
  app.use("/ping", pingRoutes)
  app.use("/readingList", readingListRoutes)
  app.use("/blog", blogRoutes)
  app.use("/spotify", spotifyRoutes)
  app.use("/strava", stravaRoutes)
  app.use("/notion", notionRoutes)
}
