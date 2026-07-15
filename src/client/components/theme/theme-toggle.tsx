import { useTheme } from "./theme-provider";

export default function ThemeToggle() {
  const { resolvedTheme, theme, toggleTheme } = useTheme();
  const nextTheme = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
  const icon = resolvedTheme === "dark" ? "/dark-mode.svg" : "/light-mode.svg";

  return (
    <div className="theme-control">
      <button
        aria-label={`Theme: ${theme}. Switch to ${nextTheme}.`}
        className="theme-toggle"
        onClick={toggleTheme}
        title={theme}
        type="button"
      >
        <img alt="" src={icon} />
      </button>
      <span aria-live="polite" className="theme-label">
        {theme}
      </span>
    </div>
  );
}
