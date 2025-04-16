import env from "../config/env"
import { SPOTIFY_TOKEN_ENDPOINT, SPOTIFY_CURRENT_TRACK_ENDPOINT } from "../config/constants"
import { z } from "zod"

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
    console.error("Error refreshing Spotify access token:", await response.text())
    throw new Error("Failed to refresh Spotify access token")
  }

  const data = await response.json()
  return data.access_token
}

export async function getCurrentPlayingTrack(token: string): Promise<z.infer<typeof currentTrackSchema>["item"] | null> {
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
      throw new Error(`Spotify returned ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    const parsedData = currentTrackSchema.parse(data)
    return parsedData.item
  } catch (err) {
    console.error("Error in getCurrentPlayingTrack:", err)
    throw err
  }
}
