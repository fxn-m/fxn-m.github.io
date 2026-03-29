import { useState } from "react"

import { cn } from "@/client/lib/utils"

import { useTheme } from "./theme-provider"

export default function ThemeToggle({
  className,
  isMobileMenuOpen = false
}: {
  className?: string
  isMobileMenuOpen?: boolean
}) {
  const { resolvedTheme, theme, toggleTheme } = useTheme()
  const [showTooltip, setShowTooltip] = useState(false)
  const iconSrc =
    resolvedTheme === "dark" ? "/dark-mode.svg" : "/light-mode.svg"
  const iconId = resolvedTheme === "dark" ? "dark-mode-icon" : "light-mode-icon"

  return (
    <div className="relative flex size-10 items-center justify-start">
      <button
        className={cn(
          "flex h-full w-full cursor-pointer items-center justify-center rounded-full border-0 p-[5px] transition-colors duration-200",
          isMobileMenuOpen
            ? "bg-zinc-200/60 dark:bg-zinc-800/60"
            : "bg-transparent",
          className
        )}
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
          <span
            className={cn(
              "pointer-events-none absolute z-[1000] whitespace-nowrap rounded text-[12px] text-[#777] dark:text-[#aaa]",
              isMobileMenuOpen ? "-translate-y-[35px]" : "translate-x-[40px]"
            )}
          >
            {theme}
          </span>
        ) : null}
      </button>
    </div>
  )
}
