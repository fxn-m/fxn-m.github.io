import { useEffect, useRef, useState } from "react"

import { cn } from "@/client/lib/utils"

import { useTheme } from "./theme-provider"

function DesktopThemeToggle() {
  const { resolvedTheme, theme, toggleTheme } = useTheme()
  const [showTooltip, setShowTooltip] = useState(false)
  const iconSrc =
    resolvedTheme === "dark" ? "/dark-mode.svg" : "/light-mode.svg"
  const iconId = resolvedTheme === "dark" ? "dark-mode-icon" : "light-mode-icon"

  return (
    <div className="relative flex size-10 items-center justify-start">
      <button
        className="flex h-full w-full cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-[5px] transition-colors duration-200"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={toggleTheme}
        title={theme}
        type="button"
      >
        <img
          alt={theme}
          className={cn(
            "size-[28px] transition-[filter,transform] duration-500",
            iconId === "dark-mode-icon"
              ? "scale-[1.3] [filter:invert(69%)_sepia(10%)_saturate(17%)_hue-rotate(318deg)_brightness(84%)_contrast(87%)] hover:[filter:invert(100%)_sepia(0%)_saturate(0%)_hue-rotate(0deg)_brightness(100%)_contrast(100%)]"
              : "[filter:invert(33%)_sepia(0%)_saturate(15%)_hue-rotate(279deg)_brightness(102%)_contrast(91%)] hover:[filter:invert(0%)_sepia(0%)_saturate(0%)_hue-rotate(0deg)_brightness(100%)_contrast(100%)]"
          )}
          src={iconSrc}
        />
        {showTooltip ? (
          <span className="pointer-events-none absolute z-[1000] translate-x-[40px] whitespace-nowrap rounded text-[12px] text-[#777] dark:text-[#aaa]">
            {theme}
          </span>
        ) : null}
      </button>
    </div>
  )
}

function MobileThemeToggle() {
  const { resolvedTheme, theme, toggleTheme } = useTheme()
  const [showLabel, setShowLabel] = useState(false)
  const labelTimerRef = useRef<number | null>(null)
  const iconSrc =
    resolvedTheme === "dark" ? "/dark-mode.svg" : "/light-mode.svg"
  const iconId = resolvedTheme === "dark" ? "dark-mode-icon" : "light-mode-icon"

  const handleClick = () => {
    toggleTheme()
    setShowLabel(true)

    if (labelTimerRef.current !== null) {
      window.clearTimeout(labelTimerRef.current)
    }

    labelTimerRef.current = window.setTimeout(() => {
      setShowLabel(false)
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (labelTimerRef.current !== null) {
        window.clearTimeout(labelTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="relative flex size-10 items-center justify-center">
      <button
        className="flex size-10 cursor-pointer items-center justify-center rounded-full border-0 bg-zinc-200/60 p-[5px] transition-colors duration-200 dark:bg-zinc-800/60"
        onClick={handleClick}
        title={theme}
        type="button"
      >
        <img
          alt={theme}
          className={cn(
            "size-[28px] transition-[filter,transform] duration-500",
            iconId === "dark-mode-icon"
              ? "scale-[1.3] [filter:invert(69%)_sepia(10%)_saturate(17%)_hue-rotate(318deg)_brightness(84%)_contrast(87%)] hover:[filter:invert(100%)_sepia(0%)_saturate(0%)_hue-rotate(0deg)_brightness(100%)_contrast(100%)]"
              : "[filter:invert(33%)_sepia(0%)_saturate(15%)_hue-rotate(279deg)_brightness(102%)_contrast(91%)] hover:[filter:invert(0%)_sepia(0%)_saturate(0%)_hue-rotate(0deg)_brightness(100%)_contrast(100%)]"
          )}
          src={iconSrc}
        />
      </button>
      <span
        className={cn(
          "pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap text-[12px] text-[#777] transition-opacity duration-300 dark:text-[#aaa]",
          showLabel ? "opacity-100" : "opacity-0"
        )}
      >
        {theme}
      </span>
    </div>
  )
}

export default function ThemeToggle({
  className,
  isMobileMenuOpen = false
}: {
  className?: string
  isMobileMenuOpen?: boolean
}) {
  if (isMobileMenuOpen) {
    return <MobileThemeToggle />
  }

  return <DesktopThemeToggle />
}
