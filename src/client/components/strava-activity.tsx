import { faStrava } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import polyline from "@mapbox/polyline"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Flag,
  LoaderCircle
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import type { StravaActivity as StravaActivityType } from "@/shared/types/strava"

const IS_GOAL = true
const GOAL_TITLE = "Spartan Beast | Hvar"
const GOAL_COUNTDOWN_TO = new Date("2025-10-12T09:00:00Z").getTime()
const EMPTY_ACTIVITIES: StravaActivityType[] = []

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

function formatDistance(meters: number) {
  return `${(meters / 1000).toFixed(2)} km`
}

function formatSpeed(mps: number) {
  const minutesPerKm = 60 / (mps * 3.6)
  const minutes = Math.floor(minutesPerKm)
  const seconds = Math.round((minutesPerKm - minutes) * 60)
  return `${minutes}m ${seconds}s / km`
}

export default function StravaActivity() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [countdown, setCountdown] = useState("")
  const [isDark, setIsDark] = useState(() =>
    typeof document === "undefined"
      ? false
      : document.body.classList.contains("dark")
  )

  const { data, error, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/strava/activities`
      )
      const allActivities = (await response.json()) as StravaActivityType[]
      return allActivities.filter((activity) => activity.map?.summary_polyline)
    },
    refetchOnWindowFocus: false
  })

  const activities = data ?? EMPTY_ACTIVITIES

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = GOAL_COUNTDOWN_TO - now
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const intervalId = window.setInterval(updateCountdown, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains("dark"))
    })

    observer.observe(document.body, {
      attributeFilter: ["class"],
      attributes: true
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !activities.length) {
      return
    }

    const activity = activities[currentIndex]
    if (!activity?.map.summary_polyline) {
      return
    }

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) {
      return
    }

    const drawPolyline = () => {
      if (!canvasRef.current) {
        return
      }

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const coordinates = polyline.decode(activity.map.summary_polyline)
      context.clearRect(0, 0, rect.width, rect.height)

      if (!coordinates.length) {
        return
      }

      const bounds = coordinates.reduce(
        (accumulator, [lat, lng]) => ({
          maxLat: Math.max(accumulator.maxLat, lat),
          maxLng: Math.max(accumulator.maxLng, lng),
          minLat: Math.min(accumulator.minLat, lat),
          minLng: Math.min(accumulator.minLng, lng)
        }),
        {
          maxLat: -Infinity,
          maxLng: -Infinity,
          minLat: Infinity,
          minLng: Infinity
        }
      )

      const padding = 15
      const latRange = bounds.maxLat - bounds.minLat || 0.0001
      const lngRange = bounds.maxLng - bounds.minLng || 0.0001
      const drawWidth = rect.width - padding * 2
      const drawHeight = rect.height - padding * 2
      const scale = Math.min(drawWidth / lngRange, drawHeight / latRange)
      const routeWidth = lngRange * scale
      const routeHeight = latRange * scale
      const offsetX = (rect.width - routeWidth) / 2
      const offsetY = (rect.height - routeHeight) / 2

      context.beginPath()
      context.strokeStyle = isDark ? "#bbb" : "#444"
      context.lineCap = "round"
      context.lineJoin = "round"
      context.lineWidth = 2

      coordinates.forEach(([lat, lng], index) => {
        const x = offsetX + (lng - bounds.minLng) * scale
        const y = offsetY + routeHeight - (lat - bounds.minLat) * scale

        if (index === 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }
      })

      context.stroke()
    }

    const handleResize = () => {
      drawPolyline()
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setCurrentIndex((value) => Math.max(value - 1, 0))
      }

      if (event.key === "ArrowRight") {
        setCurrentIndex((value) => Math.min(value + 1, activities.length - 1))
      }
    }

    drawPolyline()
    window.addEventListener("keydown", handleKeydown)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("keydown", handleKeydown)
      window.removeEventListener("resize", handleResize)
    }
  }, [activities, currentIndex, isDark])

  useEffect(() => {
    if (activities.length > 0) {
      setCurrentIndex(0)
    }
  }, [activities.length])

  if (isLoading) {
    return (
      <div className="mt-4 flex w-full flex-col">
        <div className="grid min-h-0 w-full grid-cols-1 md:min-h-[400px] md:grid-cols-[1fr_175px]">
          <div className="flex h-[300px] items-center justify-center rounded-2xl text-sm md:h-auto">
            <LoaderCircle className="size-8 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex flex-col justify-center gap-6 pt-4 md:pl-6 md:pt-0">
            <div className="h-3 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4 text-sm text-red-500">
        Failed to load Strava activities.
      </div>
    )
  }

  if (!activities.length) {
    return (
      <div className="mt-4 text-sm text-muted-foreground">
        No activities found
      </div>
    )
  }

  const activity = activities[currentIndex]

  return (
    <div className="w-full font-sans text-zinc-900 transition-all duration-1000 dark:text-zinc-100">
      <div className="mt-4 flex w-full flex-col">
        <div className="relative grid min-h-0 w-full grid-cols-1 md:min-h-[400px] md:grid-cols-[1fr_175px]">
          <div className="relative h-full w-full transition-all duration-1000">
            <canvas
              className="block h-[300px] w-full bg-transparent md:h-full"
              ref={canvasRef}
            />
          </div>

          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent to-15% ${
              isDark ? "from-[#17171a]" : "from-[#fafafa]"
            }`}
          />
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent to-15% transition-opacity duration-1000 sm:invisible ${
              isDark ? "from-[#17171a]" : "from-[#fafafa]"
            }`}
          />

          {IS_GOAL ? (
            <div className="absolute left-0 top-0 z-10 flex items-center gap-3 text-xs text-gray-400">
              <Flag className="size-3.5" />
              <div>
                <p className="my-0">{GOAL_TITLE}</p>
                <p>{countdown}</p>
              </div>
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-0 flex select-none flex-col justify-center bg-inherit md:pointer-events-auto md:relative md:pl-6">
            <div className="relative h-full transition-all duration-500 md:mb-8">
              <div className="pointer-events-auto absolute right-0 top-0 z-10 text-right md:static md:mb-6 md:text-left">
                <div className="text-[0.7rem] text-zinc-500 md:text-[0.85rem]">
                  {format(new Date(activity.start_date), "PPP")}
                </div>
                <a
                  className="group text-xs font-medium"
                  href={`https://strava.com/activities/${activity.id}`}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap border-b border-zinc-200 dark:border-zinc-800">
                    <FontAwesomeIcon
                      className="text-[#fc4c02] opacity-80 transition group-hover:opacity-100"
                      icon={faStrava}
                    />
                    <span>view activity on Strava</span>
                    <ArrowUpRight className="size-3" />
                  </span>
                </a>
              </div>

              <div className="absolute bottom-2 left-0 z-10 flex flex-row gap-4 md:static md:mt-6 md:grid md:grid-cols-1 md:gap-y-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs uppercase tracking-[0.5px] text-zinc-500">
                    Distance
                  </span>
                  <span className="text-[0.9rem] font-medium md:text-[1.1rem]">
                    {formatDistance(activity.distance)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs uppercase tracking-[0.5px] text-zinc-500">
                    Duration
                  </span>
                  <span className="text-[0.9rem] font-medium md:text-[1.1rem]">
                    {formatDuration(activity.moving_time)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs uppercase tracking-[0.5px] text-zinc-500">
                    Avg Speed
                  </span>
                  <span className="text-[0.9rem] font-medium md:text-[1.1rem]">
                    {formatSpeed(activity.average_speed)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs uppercase tracking-[0.5px] text-zinc-500">
                    Elevation
                  </span>
                  <span className="text-[0.9rem] font-medium md:text-[1.1rem]">
                    {activity.total_elevation_gain}m
                  </span>
                </div>
              </div>
            </div>

            <div className="pointer-events-auto absolute bottom-2 right-2 flex gap-4 md:bottom-0 md:right-0">
              <button
                className="cursor-pointer border-0 bg-transparent p-0 text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                disabled={currentIndex === 0}
                onClick={() =>
                  setCurrentIndex((value) => Math.max(value - 1, 0))
                }
                type="button"
              >
                <ChevronLeft className="size-4" />
              </button>

              <button
                className="cursor-pointer border-0 bg-transparent p-0 text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                disabled={currentIndex === activities.length - 1}
                onClick={() =>
                  setCurrentIndex((value) =>
                    Math.min(value + 1, activities.length - 1)
                  )
                }
                type="button"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
