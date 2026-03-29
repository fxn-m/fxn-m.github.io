import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

type ThemeMode = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
  resolvedTheme: ResolvedTheme
  theme: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const THEME_STORAGE_KEY = "theme"

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "system"
  }

  const storedTheme = window.sessionStorage.getItem(THEME_STORAGE_KEY)

  if (
    storedTheme === "light" ||
    storedTheme === "dark" ||
    storedTheme === "system"
  ) {
    return storedTheme
  }

  return "system"
}

function getResolvedTheme(theme: ThemeMode): ResolvedTheme {
  if (theme === "dark") {
    return "dark"
  }

  if (theme === "light") {
    return "light"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyTheme(resolvedTheme: ResolvedTheme) {
  document.body.classList.toggle("dark", resolvedTheme === "dark")

  const favicon = document.querySelector("link[rel='icon']")
  if (favicon instanceof HTMLLinkElement) {
    favicon.href =
      resolvedTheme === "dark" ? "/favicon.ico" : "/favicon-inverted.ico"
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme())
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    typeof window === "undefined" ? "light" : getResolvedTheme(getStoredTheme())
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const syncTheme = (nextTheme: ThemeMode) => {
      const nextResolvedTheme = getResolvedTheme(nextTheme)
      setResolvedTheme(nextResolvedTheme)
      applyTheme(nextResolvedTheme)
      window.sessionStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    }

    syncTheme(theme)

    const handleSystemThemeChange = () => {
      if (theme === "system") {
        syncTheme("system")
      }
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange)
    }
  }, [theme])

  const value: ThemeContextValue = {
    resolvedTheme,
    theme,
    toggleTheme: () => {
      setTheme((currentTheme) => {
        if (currentTheme === "system") {
          return "dark"
        }

        if (currentTheme === "dark") {
          return "light"
        }

        return "system"
      })
    }
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
