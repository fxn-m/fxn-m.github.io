<script setup lang="ts">
  import {
    ref,
    onMounted,
    watch,
    nextTick,
    onUnmounted,
    computed
  } from "vue"
  import { format } from "date-fns"
  import polyline from "@mapbox/polyline"
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
  import { Loader2 } from "lucide-vue-next"
  import type { StravaActivity } from "@/shared/types/strava"
  import { useQuery } from "@tanstack/vue-query"

  const IS_GOAL = true // Set to true if you want to show the goal countdown
  const GOAL_TITLE = "Spartan Beast | Hvar" // Title for the goal countdown

  const currentIndex = ref(0)
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const isDark = ref(false)
  const observer = ref<MutationObserver | null>(null)

  const fetchActivities = async () => {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/strava/activities`
    )
    // Filter out activities that have no summary_polyline
    const allActivities =
      (await response.json()) as StravaActivity[]
    const validActivities = allActivities.filter(
      (act) => act.map && act.map.summary_polyline
    )

    return validActivities
  }

  // --- TanStack Query -------------------------------------------------------
  const { data, isLoading, error } = useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
    // Disable refetches you don’t want; tweak as needed
    refetchOnWindowFocus: false
  })

  // Keep a computed wrapper so the rest of the component can stay the same
  const activities = computed(() => data.value ?? [])
  // -------------------------------------------------------------------------

  // a countdown timer for the days remaining until the 14th of June 2025 09:00:00
  // displays days, hours seconds, counts down every second
  const countdown = ref<string>("")

  const countdownTo = new Date(
    "2025-10-12T09:00:00Z"
  ).getTime()

  const updateCountdown = () => {
    const now = new Date().getTime()
    const distance = countdownTo - now

    const days = Math.floor(
      distance / (1000 * 60 * 60 * 24)
    )
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    )
    const minutes = Math.floor(
      (distance % (1000 * 60 * 60)) / (1000 * 60)
    )
    const seconds = Math.floor(
      (distance % (1000 * 60)) / 1000
    )

    countdown.value = `${days}d ${hours}h ${minutes}m ${seconds}s`
  }

  const drawPolyline = () => {
    if (!canvasRef.value || !activities.value.length) {
      return
    }

    const activity = activities.value[currentIndex.value]
    if (!activity.map.summary_polyline) {
      return
    }

    const canvas = canvasRef.value
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }

    // High DPI rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Decode the polyline
    const coordinates = polyline.decode(
      activity.map.summary_polyline
    )
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (coordinates.length === 0) {
      return
    }

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
    const padding = 15
    const canvasWidth = rect.width
    const canvasHeight = rect.height

    const latRange = bounds.maxLat - bounds.minLat || 0.0001
    const lngRange = bounds.maxLng - bounds.minLng || 0.0001

    const drawWidth = canvasWidth - padding * 2
    const drawHeight = canvasHeight - padding * 2
    const scale = Math.min(
      drawWidth / lngRange,
      drawHeight / latRange
    )

    const routeWidth = lngRange * scale
    const routeHeight = latRange * scale

    const offsetX = (canvasWidth - routeWidth) / 2
    const offsetY = (canvasHeight - routeHeight) / 2

    ctx.beginPath()
    // Switch stroke color depending on dark mode
    ctx.strokeStyle = isDark.value ? "#bbb" : "#444"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    coordinates.forEach(([lat, lng], index) => {
      const x = offsetX + (lng - bounds.minLng) * scale
      const y =
        offsetY +
        routeHeight -
        (lat - bounds.minLat) * scale

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

  const formatSpeed = (
    mps: number,
    unit: "kmh" | "mkm" = "mkm"
  ): string => {
    const minutesPerKm = 60 / (mps * 3.6)
    const minutes = Math.floor(minutesPerKm)
    const seconds = Math.round(
      (minutesPerKm - minutes) * 60
    )

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
    if (!canvasRef.value) {
      return
    }
    drawPolyline()
  }

  // Watch index changes
  watch(currentIndex, () => {
    drawPolyline()
  })

  let countdownInterval:
    | ReturnType<typeof setInterval>
    | undefined

  onMounted(async () => {
    updateCountdown()
    // Initialize isDark based on current body class
    isDark.value = document.body.classList.contains("dark")

    // Create a mutation observer that checks for attribute changes (i.e., class changes)
    observer.value = new MutationObserver(
      (mutationsList) => {
        for (const mutation of mutationsList) {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            // Update our isDark ref whenever the body class changes
            isDark.value =
              document.body.classList.contains("dark")
          }
        }
      }
    )

    // Observe the body element for class attribute changes
    observer.value.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"] // Only watch the 'class' attribute
    })

    countdownInterval = setInterval(updateCountdown, 1000)

    window.addEventListener("resize", updateCanvasSize)
    window.addEventListener("keydown", handleKeydown)
    updateCanvasSize()
  })

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      previousActivity()
    } else if (e.key === "ArrowRight") {
      nextActivity()
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }

    if (observer.value) {
      observer.value.disconnect()
    }

    window.removeEventListener("resize", updateCanvasSize)
    window.removeEventListener("keydown", handleKeydown)
  })

  // Re-draw whenever we get new activities
  watch(activities, async (newActivities) => {
    if (newActivities.length > 0) {
      currentIndex.value = 0
      await nextTick()
      drawPolyline()
    }
  })
</script>

<template>
  <div
    class="strava-activity-viewer transition-all duration-1000"
  >
    <!-- Loading / Error states -->
    <div
      v-if="isLoading"
      class="activity-card loading-skeleton"
    >
      <div class="activity-content">
        <!-- Left skeleton: spinner for map area -->
        <div
          class="polyline-container skeleton-canvas flex justify-center items-center rounded-2xl text-sm flex-col gap-2"
        >
          <!-- Fetching latest activities from Strava... -->
          <Loader2
            class="animate-spin text-gray-500 dark:text-gray-400 size-8"
          />
        </div>
        <!-- Right skeleton: greyed-out lines for stats -->

        <div class="activity-info skeleton-info">
          <div class="skeleton-line short"></div>

          <div class="skeleton-line"></div>

          <div class="skeleton-line short"></div>

          <div class="skeleton-line"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error">{{ error }}</div>
    <!-- Main Content: Only show if we have valid activities -->

    <div
      v-else-if="activities.length > 0"
      class="activity-card"
    >
      <div class="activity-content relative">
        <!-- Left Panel: Route Canvas -->
        <div
          class="polyline-container transition-all duration-1000"
        >
          <canvas ref="canvasRef"></canvas>
        </div>
        <!-- Canvas gradient -->
        <!-- Top -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-white to-transparent to-25%"
          :class="{ 'opacity-0': isDark }"
        ></div>

        <div
          class="absolute inset-0 bg-gradient-to-b from-[#101017] to-transparent to-25%"
          :class="{ 'opacity-0': !isDark }"
        ></div>
        <!-- Bottom -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-white to-25% to-transparent transition-opacity duration-1000 sm:invisible"
          :class="{ 'opacity-0': isDark }"
        ></div>

        <div
          class="absolute inset-0 bg-gradient-to-t from-[#101017] to-25% to-transparent transition-opacity duration-1000 sm:invisible"
          :class="{ 'opacity-0': !isDark }"
        ></div>
        <!-- Countdown Timer: Only show if IS_GOAL is true -->

        <div
          v-if="IS_GOAL"
          class="countdown flex gap-3 items-center text-xs absolute top-0 left-0 text-gray-400 z-10"
        >
          <FontAwesomeIcon
            icon="fa-solid fa-flag-checkered"
          />
          <div>
            <p class="my-0!">{{ GOAL_TITLE }}</p>

            <p>{{ countdown }}</p>
          </div>
        </div>
        <!-- Right Panel: Stats -->
        <div class="activity-info select-none">
          <div
            class="activity-stats relative w-full h-full"
          >
            <div
              class="activity-metadata sm:mb-6 z-10 top-0 right-0"
            >
              <div class="activity-date">
                {{
                  format(
                    new Date(
                      activities[currentIndex].start_date
                    ),
                    "PPP"
                  )
                }}
              </div>

              <div class="activity-link">
                <a
                  :href="`https://strava.com/activities/${activities[currentIndex].id}`"
                  target="_blank"
                  class="group text-xs font-bold"
                >
                  <span>
                    <FontAwesomeIcon
                      icon="fa-brands fa-strava"
                      class="strava-icon opacity-80 text-[#fc4c02] group-hover:opacity-100 transition"
                    />
                    view activity on Strava
                    <FontAwesomeIcon
                      icon="fa-solid fa-arrow-left"
                      class="-scale-x-100 size-2 -rotate-45"
                    />
                  </span>
                </a>
              </div>
            </div>

            <div class="stats z-10 flex">
              <div class="stat">
                <span class="label">Distance</span>
                <span class="value">{{
                  formatDistance(
                    activities[currentIndex].distance
                  )
                }}</span>
              </div>

              <div class="stat">
                <span class="label">Duration</span>
                <span class="value">{{
                  formatDuration(
                    activities[currentIndex].moving_time
                  )
                }}</span>
              </div>

              <div class="stat">
                <span class="label">Avg Speed</span>
                <span class="value">{{
                  formatSpeed(
                    activities[currentIndex].average_speed
                  )
                }}</span>
              </div>

              <div class="stat">
                <span class="label">Elevation</span>
                <span class="value"
                  >{{
                    activities[currentIndex]
                      .total_elevation_gain
                  }}m</span
                >
              </div>
            </div>
          </div>
          <!-- Navigation arrows at bottom-right -->
          <div class="navigation flex gap-4">
            <button
              @click="previousActivity"
              :disabled="currentIndex === 0"
              class="nav-button"
            >
              <FontAwesomeIcon
                icon="fa-solid fa-arrow-left"
                class="size-4"
              />
            </button>
            <button
              @click="nextActivity"
              :disabled="
                currentIndex === activities.length - 1
              "
              class="nav-button"
            >
              <FontAwesomeIcon
                icon="fa-solid fa-arrow-left"
                class="-scale-x-100 size-4"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- If we have no valid activities left -->
    <div v-else class="no-activities">
      No activities found
    </div>
  </div>
</template>

<style>
  /* Base (light mode) styles */
  .strava-activity-viewer {
    width: 100%;
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
  }

  /* Fill canvas container */
  canvas {
    width: 100%;
    height: 100%;
    display: block;
    background-color: transparent;
  }

  /* Right panel for stats */
  .activity-info {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #222;
    background-color: inherit;
  }

  .activity-stats {
    margin-bottom: 2rem;
    transition: all 0.5s ease-in-out;
  }

  .activity-date {
    font-size: 0.85rem;
    color: #666;
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
    bottom: 0;
    right: 0;
    display: flex;
  }

  .nav-button {
    background: none;
    border: none;
    color: #222;
    font-size: 1rem;
    cursor: pointer;
    padding: 0;
    margin: 0;
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
    .activity-metadata {
      position: absolute;
      text-align: right;
    }
    .activity-stats {
      position: static;
    }
    .navigation {
      bottom: 0.5rem;
      right: 0.5rem;
    }
    .activity-date {
      font-size: 0.7rem;
      margin-bottom: 0;
    }
    .stats {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      position: absolute;
      bottom: 0;
      left: 0;
      gap: 1rem; /* Adjust spacing as needed */
      margin: 0.5rem; /* Optional for extra padding from the edge */
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
    .skeleton-info {
      padding: 1rem 0rem;
    }
  }

  /* ------------------ DARK MODE OVERRIDES ------------------ */
  body.dark .strava-activity-viewer {
    color: #ddd;
  }

  body.dark .activity-card {
    background-color: #101017;
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

  body.dark .skeleton-line {
    background-color: #333;
  }

  body.dark .skeleton-canvas {
    background-color: #333;
  }
</style>
