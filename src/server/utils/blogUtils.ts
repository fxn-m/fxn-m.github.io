import type { SlugMap, BlogPost } from "@/shared/types"
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import slugify from "slugify"

export const parseBlogsFromNotionResponse = (response: PageObjectResponse[]): BlogPost[] =>
  response.map((page) => {
    const id = page.id
    const titleProp = page.properties["title"]
    const title = titleProp?.type === "title" && titleProp.title.length > 0 ? titleProp.title[0].plain_text ?? "Untitled" : "Untitled"
    const dateProp = page.properties["date"]
    const date = dateProp?.type === "date" && dateProp.date?.start ? dateProp.date.start : "Unknown"
    const slug = slugify(title, {
      lower: true,
      strict: true,
      locale: "en",
      replacement: "-"
    })
    return {
      id,
      title,
      date,
      slug
    }
  })

export async function getSlugMap(blogPosts: BlogPost[]): Promise<SlugMap> {
  const map: SlugMap = {}
  for (const blog of blogPosts) {
    const slug = blog.slug
    map[slug] = blog.id
  }

  return map
}
