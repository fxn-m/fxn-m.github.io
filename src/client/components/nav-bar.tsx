import {
  faGithub,
  faStrava,
  faXTwitter
} from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Bars3Icon } from "@heroicons/react/24/outline"
import { ArrowUpRight, ChevronLeft, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import CurrentTrack from "@/client/components/spotify/current-track"
import ThemeToggle from "@/client/components/theme/theme-toggle"
import { cn } from "@/client/lib/utils"

const routes = [
  { path: "/", name: "/" },
  { path: "/writing", name: "writing" },
  { path: "/fun", name: "fun" }
]

const links = [
  {
    className: "hover:text-[#000001] dark:hover:text-white",
    href: "https://github.com/fxn-m",
    icon: faGithub,
    label: "github"
  },
  {
    className: "hover:text-white dark:hover:text-white",
    href: "https://x.com/fxn__m",
    icon: faXTwitter,
    label: "x"
  },
  {
    className: "hover:text-[#fc4c02]",
    href: "https://www.strava.com/athletes/29743058",
    icon: faStrava,
    label: "strava"
  }
]

const drawerTileClasses =
  "flex items-center justify-between border border-zinc-200 bg-background/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-foreground transition-all duration-500 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900/80"

function getPageTitle(pathname: string) {
  const currentRoute = pathname !== "/" ? pathname : ""

  if (currentRoute.endsWith("-")) {
    return currentRoute.slice(0, -1).replace(":", "")
  }

  const firstSegment = currentRoute.split("/")[1]
  if (firstSegment === "writing" || firstSegment === "blog") {
    return `/${firstSegment.replace(":", "")}`
  }

  return currentRoute.replace(":", "")
}

export default function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isHovering, setIsHovering] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const navigateToParent = () => {
    const pathSegments = location.pathname.split("/")
    pathSegments.pop()
    const parentPath = pathSegments.join("/") || "/"
    navigate(parentPath)
  }

  return (
    <header className="mt-4 flex items-center justify-between border-b border-zinc-200 py-2 transition-colors duration-500 dark:border-zinc-800">
      <h2 className="flex text-lg font-semibold">
        <Link
          className="absolute self-center whitespace-nowrap border-none !no-underline"
          onClick={(event) => {
            if (location.pathname === "/") {
              return
            }

            event.preventDefault()
            navigateToParent()
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          to="/"
        >
          fxn-m.com
          <span className="hidden sm:inline-block">
            {getPageTitle(location.pathname)}
          </span>
          <ChevronLeft
            className="absolute -top-1.5 size-4 text-black transition-[visibility] duration-200 dark:text-zinc-300"
            style={{
              left: "-12px",
              transform: "rotate(45deg)",
              visibility:
                isHovering && location.pathname !== "/" ? "visible" : "hidden"
            }}
          />
        </Link>
      </h2>

      <div className="flex items-center justify-end gap-5">
        <ul className="hidden gap-5 pt-[2px] sm:flex">
          {routes.map((route) => (
            <li className="list-none" key={route.path}>
              <Link
                className={cn(
                  "border-none text-[0.9em] text-zinc-500 no-underline transition-colors duration-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-200",
                  location.pathname === route.path
                    ? "text-black dark:text-zinc-100"
                    : ""
                )}
                to={route.path}
              >
                {route.name}
              </Link>
            </li>
          ))}
        </ul>

        <button
          aria-label="open navigation drawer"
          className="translate-y-px cursor-pointer rounded-none border-0 bg-transparent p-0 text-muted-foreground transition-all duration-300 sm:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
          type="button"
        >
          <Bars3Icon className="size-6" />
        </button>

        <div className="hidden flex-row justify-between gap-[5px] sm:flex">
          {links.map((link) => (
            <a
              aria-label={link.label}
              className={cn(
                "flex h-10 w-10 items-center justify-center border-none p-[10px] text-[0.7em] lowercase no-underline text-[#5a5a5a] transition-colors duration-500 dark:text-[#949494]",
                link.className
              )}
              href={link.href}
              key={link.href}
              rel="noreferrer noopener"
              target="_blank"
              title={link.label}
            >
              <FontAwesomeIcon
                className={cn(
                  "transition-colors duration-500 max-h-[20px]",
                  link.label === "github"
                    ? "hover:text-[#000001] dark:hover:text-white"
                    : "",
                  link.label === "x"
                    ? "hover:text-black dark:hover:text-white"
                    : "",
                  link.label === "strava" ? "hover:text-[#fc4c02]" : ""
                )}
                icon={link.icon}
                size="2xl"
              />
            </a>
          ))}
          <ThemeToggle isMobileMenuOpen={isMobileMenuOpen} />
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm sm:hidden">
          <div className="ml-auto flex h-full w-full max-w-[90vw] flex-col gap-6 bg-background px-6 py-12 text-foreground shadow-2xl dark:bg-zinc-950">
            <div className="flex items-start justify-end">
              <button
                className="cursor-pointer border-0 bg-transparent p-0 text-muted-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="grid gap-2">
              {routes.map((route) => (
                <Link
                  className={drawerTileClasses}
                  key={route.path}
                  to={route.path}
                >
                  <span className="truncate">{route.name}</span>
                  <span className="text-[10px] font-medium text-muted-foreground/80">
                    open
                  </span>
                </Link>
              ))}
            </nav>

            <div className="grid gap-2">
              {links.map((link) => (
                <a
                  className={drawerTileClasses}
                  href={link.href}
                  key={link.href}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <span className="truncate">{link.label}</span>
                  <ArrowUpRight className="size-4 text-muted-foreground/70" />
                </a>
              ))}
            </div>

            <div className="mt-auto grid gap-3">
              <CurrentTrack
                sheetTileClass={drawerTileClasses}
                variant="sheet"
              />
              <div className="flex justify-center">
                <ThemeToggle className="size-20" isMobileMenuOpen />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
