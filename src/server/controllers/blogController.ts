import type { Request, Response } from "express"
import {
  getBlogPosts,
  getBlogPostById
} from "../services/notionService"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { BlogPost } from "@/shared/types"
import slugify from "slugify"

const parseBlogsFromNotionResponse = (
  response: PageObjectResponse[]
): BlogPost[] =>
  response.map((page) => {
    const id = page.id
    const titleProp = page.properties["title"]
    const title =
      titleProp?.type === "title" &&
      titleProp.title.length > 0
        ? (titleProp.title[0].plain_text ?? "Untitled")
        : "Untitled"
    const dateProp = page.properties["date"]
    const date =
      dateProp?.type === "date" && dateProp.date?.start
        ? dateProp.date.start
        : "Unknown"
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

export const fetchBlogController = async (
  _: Request,
  res: Response
): Promise<void> => {
  try {
    const notionBlogsResponse = await getBlogPosts()
    // ! dangerously cast to PageObjectResponse[]
    const blogs = parseBlogsFromNotionResponse(
      notionBlogsResponse as PageObjectResponse[]
    )
    res.status(200).json(blogs)
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    res
      .status(500)
      .json({ message: "Failed to fetch blog posts" })
  }
}

export const fetchBlogPostController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params
  try {
    const blogPost = await getBlogPostById(id)
    res.status(200).json(blogPost)
  } catch (error) {
    console.error("Error fetching blog post:", error)
    res
      .status(500)
      .json({ message: "Failed to fetch blog post" })
  }
}
