import { useTheme } from "./theme-provider";

export default function ThemeToggle() {
  const { resolvedTheme, theme, toggleTheme } = useTheme();
  const nextTheme = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
  const icon = resolvedTheme === "dark" ? "/dark-mode.svg" : "/light-mode.svg";

  return (
    <div className="group fixed top-4 right-4 z-10">
      <button
        aria-label={`Theme: ${theme}. Switch to ${nextTheme}.`}
        className="grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-[0.4rem] hover:bg-surface focus-visible:bg-surface"
        onClick={toggleTheme}
        title={theme}
        type="button"
      >
        <img alt="" className="size-7 opacity-70 dark:invert" src={icon} />
      </button>
      <span
        aria-live="polite"
        className="pointer-events-none absolute top-1/2 right-[calc(100%+0.5rem)] -translate-y-1/2 text-xs text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {theme}
      </span>
    </div>
  );
}
