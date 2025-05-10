import type { SlugMap, BlogPost } from "@/shared/types"

import * as cheerio from "cheerio"
import showdown from "showdown"
import he from "he"

export async function getSlugMap(blogPosts: BlogPost[]): Promise<SlugMap> {
  const map: SlugMap = {}
  for (const blog of blogPosts) {
    const slug = blog.slug
    map[slug] = blog.id
  }
  return map
}

const replaceVideoLinksWithIframes = (html: string): string => {
  const $ = cheerio.load(html)

  $("a").each((_, el) => {
    const anchor = $(el)
    const text = anchor.text().trim()
    const href = anchor.attr("href") || ""
    const parent = anchor.closest("p")

    if (
      parent.length &&
      parent.contents().length === 1 &&
      parent.children().length === 1 &&
      parent.children("a").length === 1 &&
      text &&
      href.includes("youtube.com/watch")
    ) {
      const videoIdMatch = href.match(/v=([a-zA-Z0-9_-]{11})/)
      if (!videoIdMatch) return

      const videoId = videoIdMatch[1]
      const iframe = `
      <div class='YTContainer' title="${text}">
        <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
      </div>`

      parent.replaceWith(iframe)
    }
  })

  return $.html()
}

type Metadata = {
  date: string
  title: string
}

export const convertMarkdownToHTML = (
  markdown: string
): {
  content: string
  meta: Metadata
} => {
  const converter = new showdown.Converter({ metadata: true })
  const html = converter.makeHtml(markdown)

  const rawMetadata = converter.getMetadata()
  if (typeof rawMetadata !== "object") {
    throw new Error("Invalid metadata format")
  }

  return {
    content: replaceVideoLinksWithIframes(html),
    meta: {
      date: he.decode(rawMetadata.date).replace(/^"|"$/g, ""),
      title: he.decode(rawMetadata.title).replace(/^"|"$/g, "")
    }
  }
}
