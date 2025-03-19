export interface StravaActivity {
  id: number
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  start_date: string
  map: {
    summary_polyline: string
  }
  average_speed: number
  max_speed: number
  type: string
}
