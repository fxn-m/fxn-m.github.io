import type { AppConfig } from "../config/appConfig"
import {
  getStravaAccessToken,
  getStravaActivities
} from "../services/stravaService"

export const getStravaActivitiesApi = async (config: AppConfig) => {
  const accessToken = await getStravaAccessToken(config)
  const activities = await getStravaActivities(accessToken)
  return activities
}
