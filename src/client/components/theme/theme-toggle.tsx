import { MoonIcon, SunIcon } from "./theme-icons";
import { useTheme } from "./theme-provider";

export default function ThemeToggle() {
  const { resolvedTheme, theme, toggleTheme } = useTheme();
  const nextTheme = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
  const Icon = resolvedTheme === "dark" ? MoonIcon : SunIcon;

  return (
    <div className="group fixed top-4 right-4 z-10">
      <button
        aria-label={`Theme: ${theme}. Switch to ${nextTheme}.`}
        className="grid size-6 cursor-pointer place-items-center border-0 bg-transparent p-0 text-foreground"
        onClick={toggleTheme}
        title={theme}
        type="button"
      >
        <Icon className="size-5 opacity-60 transition-opacity duration-150 group-hover:opacity-90 group-focus-within:opacity-90" />
      </button>
      <span
        aria-live="polite"
        className="pointer-events-none absolute top-1/2 right-[calc(100%+0.5rem)] -translate-y-1/2 font-pixel text-xs text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      >
        {theme}
      </span>
    </div>
  );
}
