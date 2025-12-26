import type { AppConfig } from "../config/app-config"
import {
  getCurrentPlayingTrack,
  getSpotifyAccessToken
} from "../services/spotify-service"

export const getCurrentTrackApi = async (config: AppConfig) => {
  const accessToken = await getSpotifyAccessToken(config)
  const currentTrack = await getCurrentPlayingTrack(accessToken)

  if (!currentTrack) {
    return null
  }

  return {
    externalUrl: currentTrack.external_urls.spotify,
    name: currentTrack.name,
    artist: currentTrack.artists.map((a) => a.name).join(", "),
    album: currentTrack.album.name,
    cover: currentTrack.album.images[0]?.url ?? null
  }
}
