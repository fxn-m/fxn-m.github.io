import type { Request, Response } from "express"
import { getSpotifyAccessToken, getCurrentPlayingTrack } from "../services/spotifyService"

export const getCurrentTrackController = async (_: Request, res: Response): Promise<void> => {
  console.log("Fetching current song...")
  try {
    const accessToken = await getSpotifyAccessToken()
    const currentTrack = await getCurrentPlayingTrack(accessToken)

    if (!currentTrack) {
      res.status(200).json({ message: "No song currently playing" })
      return
    }

    res.status(200).json({
      externalUrl: currentTrack.external_urls.spotify,
      name: currentTrack.name,
      artist: currentTrack.artists.map((a: any) => a.name).join(", "),
      album: currentTrack.album.name,
      cover: currentTrack.album.images[0]?.url
    })
  } catch (error: unknown) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch current song" })
  }
}
