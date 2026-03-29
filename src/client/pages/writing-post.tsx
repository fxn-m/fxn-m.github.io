import { useQuery } from "@tanstack/react-query"
import hljs from "highlight.js/lib/core"
import css from "highlight.js/lib/languages/css"
import javascript from "highlight.js/lib/languages/javascript"
import html from "highlight.js/lib/languages/xml"
import { LoaderCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"

import { convertMarkdownToHTML } from "@/server/utils/blog-utils"
import type { BlogMetadata, BlogPost } from "@/shared"

hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("css", css)
hljs.registerLanguage("html", html)

const darkThemeUrl = new URL("highlight.js/styles/atom-one-dark.min.css", import.meta.url).href
const lightThemeUrl = new URL("highlight.js/styles/atom-one-light.min.css", import.meta.url).href

function setHighlightTheme(currentThemeLink: HTMLLinkElement | null, isDark: boolean) {
  currentThemeLink?.parentNode?.removeChild(currentThemeLink)

  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = isDark ? darkThemeUrl : lightThemeUrl
  document.head.appendChild(link)
  return link
}

export default function WritingPost() {
  const { slug = "" } = useParams()
  const [blogContent, setBlogContent] = useState("")
  const [metadata, setMetadata] = useState<BlogMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const themeLinkRef = useRef<HTMLLinkElement | null>(null)
  const slugMap = JSON.parse(window.localStorage.getItem("slugMap") ?? "{}") as Record<string, string>

  const postQuery = useQuery({
    enabled: import.meta.env.DEV && Boolean(slugMap[slug]),
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/blog/${slugMap[slug]}`)
      const markdown = await response.json()
      return convertMarkdownToHTML(markdown)
    },
    queryKey: ["blog-post", slug, slugMap[slug]]
  })

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return
    }

    if (!postQuery.data) {
      return
    }

    setBlogContent(postQuery.data.content)
    setMetadata(postQuery.data.meta)
    setIsLoading(false)
  }, [postQuery.data])

  useEffect(() => {
    if (import.meta.env.DEV) {
      return
    }

    const loadBlog = async () => {
      try {
        const response = await fetch(`/html/${slug}.html`)
        const htmlContent = await response.text()
        const indexResponse = await fetch("/html/index.json")
        const indexData = (await indexResponse.json()) as BlogPost[]
        const meta = indexData.find((item) => item.slug === slug) ?? null

        setBlogContent(htmlContent)
        setMetadata(meta ? { date: meta.date, title: meta.title } : null)
      } catch (error) {
        console.error("Failed to load blog content:", error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadBlog()
  }, [slug])

  useEffect(() => {
    themeLinkRef.current = setHighlightTheme(
      themeLinkRef.current,
      document.body.classList.contains("dark")
    )

    const observer = new MutationObserver(() => {
      themeLinkRef.current = setHighlightTheme(
        themeLinkRef.current,
        document.body.classList.contains("dark")
      )
    })

    observer.observe(document.body, {
      attributeFilter: ["class"],
      attributes: true
    })

    return () => {
      observer.disconnect()
      themeLinkRef.current?.parentNode?.removeChild(themeLinkRef.current)
    }
  }, [])

  useEffect(() => {
    if (!blogContent) {
      return
    }

    window.requestAnimationFrame(() => {
      document.querySelectorAll("pre code").forEach((element) => {
        hljs.highlightElement(element as HTMLElement)
      })

      document
        .querySelectorAll<HTMLAnchorElement>("a[href^='http://'], a[href^='https://']")
        .forEach((anchor) => {
          anchor.setAttribute("target", "_blank")
          anchor.setAttribute("rel", "noopener noreferrer")
        })

      document.querySelectorAll<HTMLImageElement>(".blog-content img").forEach((image) => {
        const altText = image.getAttribute("alt")

        if (!altText || altText === "Image") {
          return
        }

        if (image.nextElementSibling?.classList.contains("img-caption")) {
          return
        }

        const caption = document.createElement("div")
        caption.setAttribute("class", "img-caption")
        caption.textContent = altText
        image.parentNode?.insertBefore(caption, image.nextSibling)
      })
    })
  }, [blogContent])

  if (isLoading) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center sm:mt-16">
        <LoaderCircle className="size-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="mt-4 w-full sm:mt-16">
      <article>
        <header className="mb-8 flex flex-row flex-wrap items-baseline justify-between gap-3">
          <h1 className="m-0 text-wrap text-4xl font-semibold text-black dark:text-white">
            {metadata?.title}
          </h1>
          <p className="grow text-right text-[0.95em] text-zinc-400">{metadata?.date}</p>
        </header>

        <main
          className="blog-content mt-4"
          dangerouslySetInnerHTML={{ __html: blogContent }}
        />
      </article>
    </div>
  )
}
