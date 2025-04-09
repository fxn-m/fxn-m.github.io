import type { Request, Response } from "express"
import { getBlogPosts, getBlogPostById } from "../services/notionService"
import { parseBlogsFromNotionResponse } from "../utils/blogUtils"
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

export const fetchBlogController = async (_: Request, res: Response): Promise<void> => {
  try {
    const notionBlogsResponse = await getBlogPosts()

    // ! dangerously cast to PageObjectResponse[]
    const blogs = parseBlogsFromNotionResponse(notionBlogsResponse as PageObjectResponse[])

    res.status(200).json(blogs)
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    res.status(500).json({ message: "Failed to fetch blog posts" })
  }
}

export const fetchBlogPostController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  try {
    const blogPost = await getBlogPostById(id)
    console.log("Fetched blog post:", blogPost)
    res.status(200).json(blogPost)
  } catch (error) {
    console.error("Error fetching blog post:", error)
    res.status(500).json({ message: "Failed to fetch blog post" })
  }
}
