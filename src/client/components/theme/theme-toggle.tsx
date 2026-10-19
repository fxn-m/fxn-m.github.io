import { MoonIcon, SunIcon } from "./theme-icons";
import { useTheme } from "./theme-provider";

export default function ThemeToggle() {
  const { resolvedTheme, theme, toggleTheme } = useTheme();
  const nextTheme = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
  const Icon = resolvedTheme === "dark" ? MoonIcon : SunIcon;

  return (
    <div className="group relative">
      <button
        aria-label={`Theme: ${theme}. Switch to ${nextTheme}.`}
        className="grid size-8 cursor-pointer place-items-center border-0 bg-transparent p-0 text-muted hover:text-foreground focus-visible:text-foreground"
        onClick={toggleTheme}
        title={theme}
        type="button"
      >
        <Icon className="size-4" />
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-9 -translate-y-1/2 whitespace-nowrap font-pixel text-xs text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {theme}
      </span>
    </div>
  );
}
