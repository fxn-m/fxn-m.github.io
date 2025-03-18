<script setup lang="ts">
  import { ref, onMounted, watch, defineProps } from "vue"
  // import axios from "axios"
  import { format } from "date-fns"
  import polyline from "@mapbox/polyline"
  import axios from "axios"

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

  // Dummy data to replace the fetching logic, as requested:
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
      error.value = "Failed to load activities."
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

    // Decode polyline
    const coordinates = polyline.decode(activity.map.summary_polyline)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (coordinates.length === 0) return

    // Find bounds
    const bounds = coordinates.reduce(
      (acc, [lat, lng]) => ({
        minLat: Math.min(acc.minLat, lat),
        maxLat: Math.max(acc.maxLat, lat),
        minLng: Math.min(acc.minLng, lng),
        maxLng: Math.max(acc.maxLng, lng)
      }),
      {
        minLat: Infinity,
        maxLat: -Infinity,
        minLng: Infinity,
        maxLng: -Infinity
      }
    )

    // Calculate scale and center offsets
    const padding = 20
    const canvasWidth = rect.width
    const canvasHeight = rect.height

    const latRange = bounds.maxLat - bounds.minLat || 0.0001
    const lngRange = bounds.maxLng - bounds.minLng || 0.0001

    // The available drawing area
    const drawWidth = canvasWidth - padding * 2
    const drawHeight = canvasHeight - padding * 2
    const scale = Math.min(drawWidth / lngRange, drawHeight / latRange)

    // Route's actual width/height in pixels after scaling
    const routeWidth = lngRange * scale
    const routeHeight = latRange * scale

    // Offsets to center the route
    const offsetX = (canvasWidth - routeWidth) / 2
    const offsetY = (canvasHeight - routeHeight) / 2

    ctx.beginPath()
    ctx.strokeStyle = "#444"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    coordinates.forEach(([lat, lng], index) => {
      // Convert lat, lng to x, y
      const x = offsetX + (lng - bounds.minLng) * scale
      // invert lat so up is positive y on the canvas
      const y = offsetY + routeHeight - (lat - bounds.minLat) * scale

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

  // Re-draw whenever the index changes
  watch(currentIndex, () => {
    drawPolyline()
  })

  onMounted(() => {
    fetchActivities()
    window.addEventListener("resize", updateCanvasSize)
    updateCanvasSize()
  })

  // Re-draw whenever we get new activities
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
    <!-- Loading / Error states -->
    <div v-if="loading" class="loading">Loading activities...</div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="activities.length > 0" class="activity-card">
      <!-- Route / Stats Split -->
      <div class="activity-content">
        <!-- Left Panel: Route Canvas -->
        <div class="polyline-container">
          <canvas ref="canvasRef"></canvas>
        </div>

        <!-- Right Panel: Stats -->
        <div class="activity-info">
          <div class="activity-stats">
            <!-- Muted/smaller date -->
            <div class="activity-date">
              {{ format(new Date(activities[currentIndex].start_date), "PPP") }}
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

          <!-- Small navigation arrows at bottom-right -->
          <div class="navigation">
            <button @click="previousActivity" :disabled="currentIndex === 0" class="nav-button">←</button>
            <button @click="nextActivity" :disabled="currentIndex === activities.length - 1" class="nav-button">→</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-activities">No activities found</div>
  </div>
</template>

<style scoped>
  /* Container around the entire component */
.strava-activity-viewer {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
  color: #222;
}

/* Card-like wrapper for the route/stats */
.activity-card {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Split the layout into two columns on larger screens:
   Left: route, Right: stats */
.activity-content {
  display: grid;
  grid-template-columns: 1fr 175px;
  min-height: 400px;
}

/* Canvas container on the left */
.polyline-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #ffffff; /* subtle neutral background */
}

/* Make the canvas fill its container */
canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* Right panel for stats */
.activity-info {
  padding: 1rem;
  position: relative; /* needed for absolutely positioned nav buttons */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Stats group */
.activity-stats {
  margin-bottom: 2rem;
}

/* Muted date, smaller font */
.activity-date {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1.5rem;
}

/* Stats and labels */
.stats {
  display: grid;
  grid-template-columns: 1fr ;
  row-gap: 1rem;
  column-gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #555;
  letter-spacing: 0.5px;
}

.value {
  font-size: 1.1rem;
  font-weight: 500;
}

/* Nav buttons at bottom right */
.navigation {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.nav-button {
  background: none;
  border: none;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  transition: opacity 0.2s;
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-button:not(:disabled):hover {
  opacity: 0.7;
}

/* Loading, error, no-activities states */
.loading,
.error,
.no-activities {
  text-align: center;
  padding: 2rem;
  background: #fefefe;
  border: 1px solid #ddd;
  margin-top: 1rem;
  border-radius: 8px;
}

.error {
  color: #dc2626;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .activity-content {
    grid-template-columns: 1fr;
  }
  .polyline-container {
    height: 300px;
  }
  .activity-stats {
    margin-bottom: 4rem;
  }
  .navigation {
    bottom: 0.5rem;
    right: 0.5rem;
  }
}
</style>
