import type { Express } from "express"

import readingListRoutes from "./readingListRoutes"
import spotifyRoutes from "./spotifyRoutes"
import stravaRoutes from "./stravaRoutes"
import blogRoutes from "./blogRoutes"
import notionRoutes from "./notionRoutes"
import pingRoutes from "./pingRoutes"

export const configureRoutes = (app: Express): void => {
  app.use("/ping", pingRoutes)
  app.use("/readingList", readingListRoutes)
  app.use("/blog", blogRoutes)
  app.use("/spotify", spotifyRoutes)
  app.use("/strava", stravaRoutes)
  app.use("/notion", notionRoutes)
}
