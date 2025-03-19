<script setup lang="ts">
  import { ref, onMounted, watch, defineProps, nextTick } from "vue"
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

      // Filter out activities that have no summary_polyline
      const allActivities = response.data as StravaActivity[]
      const validActivities = allActivities.filter((act) => act.map && act.map.summary_polyline)

      activities.value = validActivities
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

    // High DPI rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Decode the polyline
    const coordinates = polyline.decode(activity.map.summary_polyline)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (coordinates.length === 0) return

    // Determine if dark mode is active
    const isDark = document.body.classList.contains("dark")

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

    const drawWidth = canvasWidth - padding * 2
    const drawHeight = canvasHeight - padding * 2
    const scale = Math.min(drawWidth / lngRange, drawHeight / latRange)

    const routeWidth = lngRange * scale
    const routeHeight = latRange * scale

    const offsetX = (canvasWidth - routeWidth) / 2
    const offsetY = (canvasHeight - routeHeight) / 2

    ctx.beginPath()
    // Switch stroke color depending on dark mode
    ctx.strokeStyle = isDark ? "#bbb" : "#444"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    coordinates.forEach(([lat, lng], index) => {
      const x = offsetX + (lng - bounds.minLng) * scale
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

  const formatSpeed = (mps: number, unit: "kmh" | "mkm" = "mkm"): string => {
    const minutesPerKm = 60 / (mps * 3.6)
    const minutes = Math.floor(minutesPerKm)
    const seconds = Math.round((minutesPerKm - minutes) * 60)

    switch (unit) {
      case "kmh":
        return `${(mps * 3.6).toFixed(1)} km/h`
      case "mkm":
        return `${minutes}m ${seconds}s / km`
      default:
        return `${(mps * 3.6).toFixed(1)} km/h`
    }
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

  // Watch index changes
  watch(currentIndex, () => {
    drawPolyline()
  })

  // Fetch data on mount, handle resizing
  onMounted(async () => {
    await fetchActivities()

    if (activities.value.length > 0) {
      currentIndex.value = 0
      await nextTick()
      drawPolyline()
    }

    window.addEventListener("resize", updateCanvasSize)
    updateCanvasSize()
  })

  // Re-draw whenever we get new activities
  watch(
    activities,
    async () => {
      if (activities.value.length > 0) {
        currentIndex.value = 0
        await nextTick()
        drawPolyline()
      }
    },
    { immediate: true }
  )
</script>

<template>
  <div class="strava-activity-viewer">
    <!-- Loading / Error states -->
    <div v-if="loading" class="activity-card loading-skeleton">
      <div class="activity-content">
        <!-- Left skeleton: spinner for map area -->
        <div class="polyline-container skeleton-canvas"></div>
        <!-- Right skeleton: greyed-out lines for stats -->
        <div class="activity-info skeleton-info">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <!-- Main Content: Only show if we have valid activities -->
    <div v-else-if="activities.length > 0" class="activity-card">
      <div class="activity-content">
        <!-- Left Panel: Route Canvas -->
        <div class="polyline-container">
          <canvas ref="canvasRef"></canvas>
        </div>

        <!-- Right Panel: Stats -->
        <div class="activity-info">
          <div class="activity-stats bg-gradient-to-r w-full from-white to-transparent to-50%">
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

          <!-- Navigation arrows at bottom-right -->
          <div class="navigation">
            <button @click="previousActivity" :disabled="currentIndex === 0" class="nav-button">←</button>
            <button @click="nextActivity" :disabled="currentIndex === activities.length - 1" class="nav-button">→</button>
          </div>
        </div>
      </div>
    </div>

    <!-- If we have no valid activities left -->
    <div v-else class="no-activities">No activities found</div>
  </div>
</template>

<style>
  /* Base (light mode) styles */
.strava-activity-viewer {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
  color: #222;
}

.activity-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 1rem;
}

.activity-content {
  display: grid;
  grid-template-columns: 1fr 175px;
  min-height: 400px;
}


/* Light mode canvas background */
.polyline-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: inherit;
}

/* Fill canvas container */
canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* Right panel for stats */
.activity-info {
  padding: 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #222;
  background-color: inherit;
}

.activity-stats {
  margin-bottom: 2rem;
}

.activity-date {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.stats {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 1rem;
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
  color: #222;
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

/* No activities or error states */
.no-activities,
.error {
  text-align: center;
  padding: 2rem;
  background: #fefefe;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 1rem;
}

.error {
  color: #dc2626;
}

/* Skeleton loading */
.loading-skeleton {
  margin-top: 1rem;
}

.skeleton-canvas {
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-info {
  padding: 1rem;
}

.skeleton-line {
  width: 100%;
  height: 16px;
  background-color: #eee;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-line.short {
  width: 60%;
}

/* Responsive */
@media (max-width: 768px) {
  .activity-content {
    grid-template-columns: 1fr;
    min-height: 0px;
    width: 100%;
    position: relative;
  }
  .polyline-container {
    height: 300px;
  }
  .activity-info {
    position: static;
  }
  .activity-stats {
    position: absolute;
    top: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
  }
  .navigation {
    bottom: 0.5rem;
    right: 0.5rem;
  }
  .stats {
    row-gap: 10px;
  }
  .stat {
    gap: 0px;
  }
  .value {
    font-size: 0.9rem;
  }
  .label {
    font-size: 0.5rem;
  }
}

/* ------------------ DARK MODE OVERRIDES ------------------ */
body.dark .strava-activity-viewer {
  color: #ddd;
}

body.dark .activity-info {
  background-color: inherit;
  color: #ddd;
}

body.dark .activity-date {
  color: #aaa;
}

body.dark .label {
  color: #bbb;
}

body.dark .nav-button {
  color: #ddd;
}

body.dark .no-activities,
body.dark .error {
  background: #2c2c2c;
  color: #ddd;
  border: 1px solid #444;
}
</style>
