import type { AppConfig } from "../config/app-config"
import {
  getStravaAccessToken,
  getStravaActivities
} from "../services/strava-service"

export const getStravaActivitiesApi = async (config: AppConfig) => {
  const accessToken = await getStravaAccessToken(config)
  const activities = await getStravaActivities(accessToken)
  return activities
}
