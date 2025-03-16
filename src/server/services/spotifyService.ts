import env from "../config/env"
import { SPOTIFY_TOKEN_ENDPOINT, SPOTIFY_CURRENT_TRACK_ENDPOINT } from "../config/constants"

export async function getSpotifyAccessToken(): Promise<string> {
  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${env.spotifyClientId}:${env.spotifyClientSecret}`).toString("base64")}`
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.spotifyRefreshToken!
    })
  })

  if (!response.ok) {
    throw new Error("Failed to refresh Spotify access token")
  }

  const data = (await response.json()) as any
  return data.access_token
}

export async function getCurrentPlayingTrack(token: string): Promise<any> {
  const response = await fetch(SPOTIFY_CURRENT_TRACK_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error("Failed to fetch current track")
  }

  const data = (await response.json()) as any
  return data.item // Currently playing track
}
