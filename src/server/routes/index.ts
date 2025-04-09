import type { Express } from "express"

import mailRoutes from "./mailRoutes"
import readingListRoutes from "./readingListRoutes"
import spotifyRoutes from "./spotifyRoutes"
import stravaRoutes from "./stravaRoutes"
import blogRoutes from "./blogRoutes"

export const configureRoutes = (app: Express): void => {
  app.use("/", mailRoutes)
  app.use("/", readingListRoutes)
  app.use("/spotify", spotifyRoutes)
  app.use("/strava", stravaRoutes)
  app.use("/", blogRoutes)
}
