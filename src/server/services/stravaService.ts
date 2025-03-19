import env from "../config/env"
import { STRAVA_CLIENT_ID, STRAVA_TOKEN_ENDPOINT, STRAVA_ACTIVITIES_ENDPOINT } from "../config/constants"
import { StravaActivity } from "@/shared"

/**
 * Fetches a new access token for the Strava API
 *
 * @returns {Promise<string>} - The access token for the Strava API
 */
export async function getStravaAccessToken(): Promise<string> {
  const response = await fetch(STRAVA_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: STRAVA_CLIENT_ID,
      client_secret: env.stravaClientSecret!,
      refresh_token: env.stravaRefreshToken!,
      grant_type: "refresh_token"
    })
  })

  if (!response.ok) {
    throw new Error("Failed to refresh Strava access token")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await response.json()) as any
  return data.access_token
}

export async function getStravaActivities(accessToken: string): Promise<StravaActivity[]> {
  const url = new URL(STRAVA_ACTIVITIES_ENDPOINT)
  url.searchParams.append("per_page", "50")

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error("Failed to fetch Strava activities")
  }

  const data = (await response.json()) as StravaActivity[]
  return data
}
