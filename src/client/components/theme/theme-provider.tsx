import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  resolvedTheme: ResolvedTheme;
  theme: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = "theme";

function getStoredTheme(): ThemeMode {
  const storedTheme = window.sessionStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
    return storedTheme;
  }

  return "system";
}

function resolveTheme(theme: ThemeMode): ResolvedTheme {
  if (theme !== "system") {
    return theme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ResolvedTheme) {
  document.body.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;

  const favicon = document.querySelector<HTMLLinkElement>("#theme-favicon");

  if (favicon) {
    favicon.href = theme === "dark" ? "/favicon-dark.png" : "/favicon-light.png";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(getStoredTheme()),
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      const nextResolvedTheme = resolveTheme(theme);
      setResolvedTheme(nextResolvedTheme);
      applyTheme(nextResolvedTheme);
      window.sessionStorage.setItem(THEME_STORAGE_KEY, theme);
    };

    syncTheme();

    const handleSystemThemeChange = () => {
      if (theme === "system") {
        syncTheme();
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      if (currentTheme === "system") {
        return "dark";
      }

      if (currentTheme === "dark") {
        return "light";
      }

      return "system";
    });
  };

  return (
    <ThemeContext.Provider value={{ resolvedTheme, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
