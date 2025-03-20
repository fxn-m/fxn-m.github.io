import type { Request, Response } from "express"
import { getStravaAccessToken, getStravaActivities } from "../services/stravaService"

export const getStravaActivitiesController = async (_: Request, res: Response): Promise<void> => {
  console.log("Fetching Strava activities...")
  try {
    const accessToken = await getStravaAccessToken()
    const activities = await getStravaActivities(accessToken)

    if (!activities) {
      res.status(200).json({ message: "No activities found" })
      return
    }

    res.status(200).json(activities)
  } catch (error) {
    console.error("Strava API error:", error)
    res.status(500).json({ error: "Failed to fetch Strava activities" })
  }
}
