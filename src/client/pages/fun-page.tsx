import { ArrowRight, ArrowUpRight } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import StravaActivity from "@/client/components/strava-activity"
import { cn } from "@/client/lib/utils"

type ProjectVisual = {
  alt: string
  src: string
  variant: "icon" | "sticker"
}

type Project = {
  description: ReactNode
  href: string
  isExternal?: boolean
  meta: string
  tags: string[]
  title: string
  visual?: ProjectVisual
}

const projects: Project[] = [
  {
    description:
      "A phone-first pub-hunt game where one player hides as the chicken, teams hunt through a shrinking map, and the organiser runs the whole session without accounts.",
    href: "https://oelp.app",
    isExternal: true,
    meta: "Cloudflare Workers · Durable Objects · MapLibre",
    tags: ["PWA", "Realtime", "GPS"],
    title: "où est le poulet",
    visual: {
      alt: "Où est le poulet chicken mascot",
      src: "/projects/oelp-chicken.gif",
      variant: "sticker"
    }
  },
  {
    description:
      "A native iOS reading app for French learners: import something you already want to read, get a French-first version, then hold a sentence for temporary English help.",
    href: "https://pousse.page",
    isExternal: true,
    meta: "SwiftUI · Cloudflare Workers · D1/R2",
    tags: ["iOS", "Reading", "Language"],
    title: "Pousse",
    visual: {
      alt: "Pousse app icon",
      src: "/projects/pousse-logo.png",
      variant: "icon"
    }
  },
  {
    description:
      "Every Paul Graham essay translated across eight languages, with a static, fast browsing surface tuned for readers landing from search.",
    href: "https://paulgraham-translated.vercel.app",
    isExternal: true,
    meta: "Vercel · Static content · SEO",
    tags: ["Essays", "Translation", "Archive"],
    title: "PGT",
    visual: {
      alt: "PGT logo",
      src: "/projects/pgt-logo.png",
      variant: "sticker"
    }
  },
  {
    description: (
      <>
        A small antidote to saved-link overload: pull a random read from my
        Notion list, show a summary, tags, and time estimate. The hardest thing
        about the abundance of information today is deciding{" "}
        <CitationLink href="https://jeremy.zawodny.com/blog/archives/008581.html">
          what to ignore
        </CitationLink>
        .
      </>
    ),
    href: "/fun/tab-overflow",
    meta: "Notion · OpenAI · Cloudflare KV",
    tags: ["Reading list", "Notion", "AI"],
    title: "Tab Overflow"
  }
]

export default function FunPage() {
  return (
    <div className="mt-8 space-y-12 pb-16 sm:pb-0">
      <section className="grid border-t border-l border-zinc-200 dark:border-zinc-800 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </section>

      <StravaActivity />
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const content = (
    <>
      <header className="flex items-start justify-between gap-4">
        <h2 className="min-w-0 truncate text-lg font-medium lowercase leading-tight text-foreground">
          {project.title}
        </h2>

        <span className="mt-0.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground">
          {project.isExternal ? (
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          ) : (
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
            />
          )}
        </span>
      </header>

      <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>

      <div className="mt-auto space-y-3 pt-8 pr-24">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              className="border border-zinc-300 px-2.5 py-1 text-xs font-medium lowercase text-foreground dark:border-zinc-700"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{project.meta}</p>
      </div>

      {project.visual ? <ProjectMedia visual={project.visual} /> : null}
    </>
  )

  const className =
    "group relative flex min-h-[19rem] flex-col overflow-hidden border-r border-b border-zinc-200 p-6 no-underline transition-colors duration-300 hover:bg-secondary/50 hover:no-underline dark:border-zinc-800"

  if (project.isExternal) {
    return (
      <a
        className={className}
        href={project.href}
        rel="noreferrer"
        target="_blank"
      >
        {content}
      </a>
    )
  }

  return (
    <Link className={className} to={project.href}>
      {content}
    </Link>
  )
}

function ProjectMedia({ visual }: { visual: ProjectVisual }) {
  return (
    <img
      alt={visual.alt}
      className={cn(
        "pointer-events-none absolute object-contain",
        visual.variant === "icon"
          ? "bottom-6 right-6 size-16 rounded-2xl border border-zinc-200 object-cover shadow-sm dark:border-zinc-800"
          : "bottom-5 right-5 size-20"
      )}
      loading="lazy"
      src={visual.src}
    />
  )
}

function CitationLink({
  children,
  href
}: {
  children: ReactNode
  href: string
}) {
  return (
    <span
      className="cursor-pointer text-foreground underline decoration-muted-foreground/40 underline-offset-[3px] transition-colors hover:decoration-foreground"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        window.open(href, "_blank", "noopener")
      }}
      role="link"
      tabIndex={0}
    >
      {children}
    </span>
  )
}
