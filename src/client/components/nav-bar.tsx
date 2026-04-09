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
          <ThemeToggle />
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-background sm:hidden">
          <div className="mx-auto flex min-h-dvh w-11/12 flex-col">
            <div className="mt-4 flex items-center justify-between border-b border-zinc-200 py-2 transition-colors duration-500 dark:border-zinc-800">
              <Link
                className="text-lg font-semibold whitespace-nowrap border-none !no-underline"
                to="/"
              >
                fxn-m.com
              </Link>
              <button
                aria-label="close navigation"
                className="translate-y-px cursor-pointer border-0 bg-transparent p-0 text-muted-foreground transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
                type="button"
              >
                <X className="size-6" />
              </button>
            </div>

            <nav className="mt-12 flex flex-col gap-6">
              {routes.map((route) => (
                <Link
                  className={cn(
                    "w-fit border-none text-2xl font-semibold uppercase tracking-[0.3em] no-underline transition-colors duration-300",
                    location.pathname === route.path
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  key={route.path}
                  to={route.path}
                >
                  {route.name}
                </Link>
              ))}
            </nav>

            <div className="my-8 w-8 border-t border-zinc-300 dark:border-zinc-700" />

            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <a
                  className="flex w-fit items-center gap-2 border-none text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground no-underline transition-colors duration-300 hover:text-foreground"
                  href={link.href}
                  key={link.href}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {link.label}
                  <ArrowUpRight className="size-3" />
                </a>
              ))}
            </div>

            <div className="mt-auto flex flex-col items-center gap-6 pb-8">
              <CurrentTrack variant="sheet" />
              <ThemeToggle isMobileMenuOpen />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
