import { z } from "zod"

import type { AppConfig } from "../config/app-config"
import {
  SPOTIFY_CURRENT_TRACK_ENDPOINT,
  SPOTIFY_TOKEN_ENDPOINT
} from "../config/constants"

const currentTrackSchema = z.object({
  item: z.object({
    name: z.string(),
    external_urls: z.object({
      spotify: z.string()
    }),
    artists: z.array(
      z.object({
        name: z.string()
      })
    ),
    album: z.object({
      name: z.string(),
      images: z.array(
        z.object({
          url: z.string()
        })
      )
    })
  })
})

const encodeBasicAuth = (clientId: string, clientSecret: string): string => {
  const credentials = `${clientId}:${clientSecret}`
  if (typeof btoa === "function") {
    return btoa(credentials)
  }

  return Buffer.from(credentials).toString("base64")
}

export async function getSpotifyAccessToken(
  config: AppConfig
): Promise<string> {
  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${encodeBasicAuth(
        config.spotifyClientId,
        config.spotifyClientSecret
      )}`
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: config.spotifyRefreshToken
    })
  })

  if (!response.ok) {
    console.error(
      "Error refreshing Spotify access token:",
      await response.text()
    )
    throw new Error("Failed to refresh Spotify access token")
  }

  const data = await response.json()

  if (
    !data ||
    typeof data !== "object" ||
    !("access_token" in data) ||
    typeof data.access_token !== "string"
  ) {
    throw new Error("Invalid response from Spotify token endpoint")
  }

  return data.access_token // Access token
}

export async function getCurrentPlayingTrack(
  token: string
): Promise<z.infer<typeof currentTrackSchema>["item"] | null> {
  try {
    const response = await fetch(SPOTIFY_CURRENT_TRACK_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.status === 204 || response.status === 202) {
      return null
    }

    if (!response.ok) {
      throw new Error(
        `Spotify returned ${response.status}: ${await response.text()}`
      )
    }

    const data = await response.json()
    const parsedData = currentTrackSchema.parse(data)
    return parsedData.item
  } catch (err) {
    console.error("Error in getCurrentPlayingTrack:", err)
    throw err
  }
}
