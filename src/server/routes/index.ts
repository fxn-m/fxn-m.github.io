import type { Express } from "express"

import mailRoutes from "./mailRoutes"
import readingListRoutes from "./readingListRoutes"
import spotifyRoutes from "./spotifyRoutes"
import stravaRoutes from "./stravaRoutes"
import blogRoutes from "./blogRoutes"
import notionRoutes from "./notionRoutes"

export const configureRoutes = (app: Express): void => {
  app.use("/mail", mailRoutes)
  app.use("/readingList", readingListRoutes)
  app.use("/blog", blogRoutes)
  app.use("/spotify", spotifyRoutes)
  app.use("/strava", stravaRoutes)
  app.use("/notion", notionRoutes)
}
