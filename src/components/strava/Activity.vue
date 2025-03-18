<script setup lang="ts">
  import { ref, onMounted, watch } from "vue"
  import axios from "axios"
  import { format } from "date-fns"
  import polyline from "@mapbox/polyline"

  interface StravaActivity {
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

  const props = defineProps<{
    accessToken: string
    perPage?: number
  }>()

  const activities = ref<StravaActivity[]>([])
  const currentIndex = ref(0)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  const fetchActivities = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
        headers: {
          Authorization: `Bearer ${props.accessToken}`
        },
        params: {
          per_page: props.perPage || 10
        }
      })
      activities.value = response.data
    } catch (e) {
      error.value = "Failed to load activities. Please check your Strava access token."
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const drawPolyline = () => {
    if (!canvasRef.value || !activities.value.length) return

    const activity = activities.value[currentIndex.value]
    if (!activity.map.summary_polyline) return

    const canvas = canvasRef.value
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Enable high DPI rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Get the decoded coordinates
    const coordinates = polyline.decode(activity.map.summary_polyline)

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (coordinates.length === 0) return

    // Find the bounds of the coordinates
    const bounds = coordinates.reduce(
      (acc, [lat, lng]) => ({
        minLat: Math.min(acc.minLat, lat),
        maxLat: Math.max(acc.maxLat, lat),
        minLng: Math.min(acc.minLng, lng),
        maxLng: Math.max(acc.maxLng, lng)
      }),
      { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity }
    )

    // Calculate the scale and offset to fit the canvas with padding
    const padding = 20 * dpr
    const width = rect.width * dpr - padding * 2
    const height = rect.height * dpr - padding * 2
    const latRange = bounds.maxLat - bounds.minLat || 0.01 // Prevent division by zero
    const lngRange = bounds.maxLng - bounds.minLng || 0.01 // Prevent division by zero
    const scale = Math.min(width / lngRange, height / latRange)

    // Start drawing
    ctx.beginPath()
    ctx.strokeStyle = "#222222"
    ctx.lineWidth = 2 * dpr
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    coordinates.forEach(([lat, lng], index) => {
      const x = padding + (lng - bounds.minLng) * scale
      const y = rect.height * dpr - (padding + (lat - bounds.minLat) * scale)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDistance = (meters: number): string => {
    return `${(meters / 1000).toFixed(2)} km`
  }

  const formatSpeed = (mps: number): string => {
    const kph = mps * 3.6
    return `${kph.toFixed(1)} km/h`
  }

  const nextActivity = () => {
    if (currentIndex.value < activities.value.length - 1) {
      currentIndex.value++
    }
  }

  const previousActivity = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  const updateCanvasSize = () => {
    if (!canvasRef.value) return
    drawPolyline()
  }

  watch(currentIndex, () => {
    drawPolyline()
  })

  onMounted(() => {
    fetchActivities()
    window.addEventListener("resize", updateCanvasSize)
    updateCanvasSize()
  })

  watch(
    activities,
    () => {
      if (activities.value.length > 0) {
        drawPolyline()
      }
    },
    { immediate: true }
  )
</script>

<template>
  <div class="strava-activity-viewer">
    <div v-if="loading" class="loading">Loading activities...</div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="activities.length > 0" class="activity-card">
      <div class="activity-content">
        <div class="polyline-container">
          <canvas ref="canvasRef"></canvas>
        </div>
        <div class="activity-info">
          <div class="activity-header">
            <button @click="previousActivity" :disabled="currentIndex === 0" class="nav-button">←</button>
            <div class="activity-title">
              <h2>{{ activities[currentIndex].name }}</h2>
              <div class="activity-date">
                {{ format(new Date(activities[currentIndex].start_date), "PPP") }}
              </div>
            </div>
            <button @click="nextActivity" :disabled="currentIndex === activities.length - 1" class="nav-button">→</button>
          </div>
          <div class="stats">
            <div class="stat">
              <span class="label">Distance</span>
              <span class="value">{{ formatDistance(activities[currentIndex].distance) }}</span>
            </div>
            <div class="stat">
              <span class="label">Duration</span>
              <span class="value">{{ formatDuration(activities[currentIndex].moving_time) }}</span>
            </div>
            <div class="stat">
              <span class="label">Avg Speed</span>
              <span class="value">{{ formatSpeed(activities[currentIndex].average_speed) }}</span>
            </div>
            <div class="stat">
              <span class="label">Elevation</span>
              <span class="value">{{ activities[currentIndex].total_elevation_gain }}m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-activities">No activities found</div>
  </div>
</template>

<style scoped>
  .strava-activity-viewer {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.activity-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.activity-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 400px;
}

.activity-info {
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.activity-title {
  flex: 1;
  text-align: center;
}

h2 {
  margin: 0;
  font-size: 1.5em;
  color: #222;
  font-weight: 500;
}

.activity-date {
  font-size: 0.9em;
  color: #666;
  margin-top: 4px;
}

.nav-button {
  background: none;
  border: none;
  color: #222;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  transition: opacity 0.2s;
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-button:not(:disabled):hover {
  opacity: 0.7;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 0.85em;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 1.2em;
  color: #222;
  font-weight: 500;
}

.polyline-container {
  height: 100%;
  width: 100%;
  position: relative;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
  padding: 10px;
  box-sizing: border-box;
}

.loading, .error, .no-activities {
  text-align: center;
  padding: 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  color: #222;
}

.error {
  color: #dc2626;
}

@media (max-width: 768px) {
  .activity-content {
    grid-template-columns: 1fr;
  }

  .polyline-container {
    height: 300px;
  }
}
</style>
