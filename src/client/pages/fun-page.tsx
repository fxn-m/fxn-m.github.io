import { Link } from "react-router-dom"

import StravaActivity from "@/client/components/strava-activity"

const projects = [
  {
    date: "2024-11",
    description:
      "Hosts every Paul Graham essay in 8 languages, tuned for speed and SEO so readers can find a translation fast.",
    id: 2,
    link: "https://paulgraham-translated.vercel.app",
    mobileDescription:
      "Hosts every Paul Graham essay in 8 languages, tuned for speed and SEO so readers can find a translation fast.",
    title: "pgt"
  },
  {
    date: "2023-10 (updated 2025-11)",
    description: `Randomly surfaces one of my saved reads. The hardest thing about the abundance of information today is deciding <a href="https://jeremy.zawodny.com/blog/archives/008581.html" target="_blank">what to ignore</a>.`,
    id: 1,
    link: "/fun/tab-overflow",
    mobileDescription:
      "Surface a random summary from my 400+ saved reads, with tags and reading time so I actually pick one.",
    title: "tab-overflow"
  }
]

export default function FunPage() {
  return (
    <div className="mt-8 space-y-12 pb-16 sm:pb-0">
      <div className="flex flex-col">
        {projects.map((project, index) => (
          <div key={project.id}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-1 font-semibold">
                  {project.link.startsWith("https") ? (
                    <a
                      className="flex items-center gap-1"
                      href={project.link}
                      target="_blank"
                    >
                      {project.title}
                    </a>
                  ) : (
                    <Link className="flex items-center gap-1" to={project.link}>
                      {project.title}
                    </Link>
                  )}
                </h3>

                <p className="my-2 text-xs text-neutral-400">{project.date}</p>
              </div>

              {project.mobileDescription ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-500 sm:hidden">
                  {project.mobileDescription}
                </p>
              ) : null}

              <p
                className={
                  project.mobileDescription
                    ? "hidden text-sm text-neutral-600 dark:text-neutral-500 sm:block"
                    : "text-sm text-neutral-600 dark:text-neutral-500"
                }
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </div>

            <div className="my-8 border-b border-neutral-200 dark:border-neutral-800" />
          </div>
        ))}
      </div>

      <StravaActivity />
    </div>
  )
}
