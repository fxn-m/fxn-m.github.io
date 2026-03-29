import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useEffectEvent,
  useRef,
  useState
} from "react"

import { cn } from "@/client/lib/utils"

import WaveForm from "./wave-form"

type Track = {
  artist: string
  cover: string
  externalUrl: string
  name: string
}

function calculateDuration(distance: number) {
  if (distance <= 0) {
    return 0
  }

  const seconds = distance / 15
  return Math.min(Math.max(seconds, 6), 18)
}

export default function CurrentTrack({
  sheetTileClass = "",
  variant = "floating"
}: {
  sheetTileClass?: string
  variant?: "floating" | "sheet"
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [delayedExpanded, setDelayedExpanded] = useState(false)
  const [shouldScrollTrack, setShouldScrollTrack] = useState(false)
  const [shouldScrollArtist, setShouldScrollArtist] = useState(false)
  const [trackScrollDistance, setTrackScrollDistance] = useState(0)
  const [artistScrollDistance, setArtistScrollDistance] = useState(0)
  const [track, setTrack] = useState<Track | null>(null)
  const timerRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)
  const trackNameWrapperRef = useRef<HTMLSpanElement | null>(null)
  const trackNameTextRef = useRef<HTMLSpanElement | null>(null)
  const artistNameWrapperRef = useRef<HTMLSpanElement | null>(null)
  const artistNameTextRef = useRef<HTMLSpanElement | null>(null)

  const isSheetVariant = variant === "sheet"

  const updateMarqueeFor = (
    wrapper: HTMLElement | null,
    textElement: HTMLElement | null,
    setShouldScroll: Dispatch<SetStateAction<boolean>>,
    setDistance: Dispatch<SetStateAction<number>>
  ) => {
    if (!wrapper || !textElement) {
      setShouldScroll(false)
      setDistance(0)
      return
    }

    const overflow = textElement.scrollWidth - wrapper.clientWidth
    setShouldScroll(overflow > 4)
    setDistance(Math.max(overflow, 0))
  }

  const scheduleMarqueeMeasurement = useEffectEvent(() => {
    if (!track || (!isSheetVariant && !delayedExpanded)) {
      return
    }

    window.requestAnimationFrame(() => {
      updateMarqueeFor(
        trackNameWrapperRef.current,
        trackNameTextRef.current,
        setShouldScrollTrack,
        setTrackScrollDistance
      )
      updateMarqueeFor(
        artistNameWrapperRef.current,
        artistNameTextRef.current,
        setShouldScrollArtist,
        setArtistScrollDistance
      )
    })
  })

  useEffect(() => {
    scheduleMarqueeMeasurement()
  }, [delayedExpanded, isSheetVariant, scheduleMarqueeMeasurement, track])

  useEffect(() => {
    const handleResize = () => {
      scheduleMarqueeMeasurement()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [delayedExpanded, isSheetVariant, scheduleMarqueeMeasurement, track])

  useEffect(() => {
    if (isSheetVariant) {
      return
    }

    if (isExpanded) {
      timerRef.current = window.setTimeout(() => {
        setDelayedExpanded(true)
      }, 1000)
      scheduleMarqueeMeasurement()
      return
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
    }

    setDelayedExpanded(false)
    setShouldScrollTrack(false)
    setShouldScrollArtist(false)
  }, [isExpanded, isSheetVariant, scheduleMarqueeMeasurement, track])

  useEffect(() => {
    const fetchCurrentTrack = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/spotify/current-track`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch current track")
        }

        const data = (await response.json()) as Track

        if (!data.name) {
          throw new Error("No current track")
        }

        setTrack(data)
      } catch {
        setTrack(null)
      }
    }

    void fetchCurrentTrack()
    intervalRef.current = window.setInterval(fetchCurrentTrack, 30000)

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
      }

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  if (!track) {
    return null
  }

  const trackStyle = shouldScrollTrack
    ? {
        ["--scroll-distance" as string]: `${trackScrollDistance}px`,
        ["--scroll-duration" as string]: `${calculateDuration(trackScrollDistance)}s`
      }
    : undefined

  const artistStyle = shouldScrollArtist
    ? {
        ["--scroll-distance" as string]: `${artistScrollDistance}px`,
        ["--scroll-duration" as string]: `${calculateDuration(artistScrollDistance)}s`
      }
    : undefined

  if (isSheetVariant) {
    return (
      <a
        aria-label={`Listen to ${track.name} by ${track.artist} on Spotify`}
        className={cn(
          sheetTileClass,
          "group mb-6 max-w-full items-center gap-3 overflow-clip border-none bg-transparent px-0 py-0 normal-case tracking-normal no-underline hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
        )}
        href={track.externalUrl}
        rel="noreferrer noopener"
        target="_blank"
      >
        <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-muted dark:border-zinc-800">
          <img
            alt={track.name}
            className="animate-spin-slow h-full w-full object-cover"
            src={track.cover}
          />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden text-left">
          <span className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground/70">
            Now listening to
            <span className="flex shrink-0 items-center pl-1 text-muted-foreground/80">
              <WaveForm />
            </span>
          </span>

          <span className="block w-full min-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold text-foreground" ref={trackNameWrapperRef}>
            <span
              className={cn(
                "inline-flex items-center will-change-transform",
                shouldScrollTrack ? "animate-marquee" : ""
              )}
              ref={trackNameTextRef}
              style={trackStyle}
            >
              {track.name}
            </span>
          </span>

          <span className="block w-full min-w-0 overflow-hidden whitespace-nowrap text-[11px] font-medium text-muted-foreground" ref={artistNameWrapperRef}>
            <span
              className={cn(
                "inline-flex items-center will-change-transform",
                shouldScrollArtist ? "animate-marquee" : ""
              )}
              ref={artistNameTextRef}
              style={artistStyle}
            >
              {track.artist}
            </span>
          </span>
        </span>
      </a>
    )
  }

  return (
    <div
      className={cn(
        "fixed right-4 top-4 z-[2] hidden max-w-[calc(100%-2rem)] cursor-pointer rounded-full border border-zinc-200 bg-background/90 p-1 backdrop-blur-sm transition-[border-radius] duration-700 lg:flex dark:border-zinc-800 dark:bg-zinc-950/80",
        isExpanded ? "rounded-r-none" : ""
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <a
        className="flex items-center border-none text-inherit no-underline"
        href={track.externalUrl}
        rel="noreferrer noopener"
        target="_blank"
      >
        <div className="h-[30px] w-[30px] shrink-0 overflow-hidden rounded-full bg-white/10">
          <img
            alt={track.name}
            className="animate-spin-slow h-full w-full object-cover"
            src={track.cover}
          />
        </div>

        <div
          className={cn(
            "overflow-hidden whitespace-nowrap text-xs transition-all duration-700",
            isExpanded ? "ml-2 w-[100px]" : "w-0"
          )}
        >
          <p className="m-0 flex flex-col leading-[1.2] text-foreground no-underline">
            <span className="block w-full min-w-0 overflow-hidden whitespace-nowrap" ref={trackNameWrapperRef}>
              <span
                className={cn(
                  "inline-flex items-center will-change-transform",
                  shouldScrollTrack ? "animate-marquee" : ""
                )}
                ref={trackNameTextRef}
                style={trackStyle}
              >
                {track.name}
              </span>
            </span>
            <span className="mt-px block w-full min-w-0 overflow-hidden whitespace-nowrap text-[0.65rem] opacity-70" ref={artistNameWrapperRef}>
              <span
                className={cn(
                  "inline-flex items-center will-change-transform",
                  shouldScrollArtist ? "animate-marquee" : ""
                )}
                ref={artistNameTextRef}
                style={artistStyle}
              >
                {track.artist}
              </span>
            </span>
          </p>
        </div>
      </a>

      <div className="absolute right-0 top-full mt-2 w-auto max-w-none whitespace-nowrap">
        <div
          className={cn(
            "flex translate-y-[-10px] items-center gap-1 text-xs text-gray-400 opacity-0 transition-all duration-500",
            delayedExpanded ? "translate-y-0 opacity-100" : ""
          )}
        >
          <p>Now playing on Spotify</p>
          <WaveForm />
        </div>
      </div>
    </div>
  )
}
