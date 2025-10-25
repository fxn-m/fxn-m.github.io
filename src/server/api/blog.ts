import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import slugify from "slugify"

import type { BlogPost } from "@/shared/types"

import type { AppConfig } from "../config/appConfig"
import { triggerRebuild } from "../services/githubService"
import {
  getBlogPostById,
  getBlogPosts
} from "../services/notionService"

const parseBlogsFromNotionResponse = (
  response: PageObjectResponse[]
): BlogPost[] =>
  response.map((page) => {
    const id = page.id
    const titleProp = page.properties["Title"]
    const title =
      titleProp?.type === "title" && titleProp.title.length > 0
        ? (titleProp.title[0].plain_text ?? "Untitled")
        : "Untitled"
    const dateProp = page.properties["Date"]
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

export const fetchBlogPostsApi = async (
  config: AppConfig,
  isDevelopment: boolean
) => {
  const notionBlogsResponse = await getBlogPosts(config, isDevelopment)
  return parseBlogsFromNotionResponse(
    notionBlogsResponse as PageObjectResponse[]
  )
}

export const fetchBlogPostMarkdownApi = async (
  config: AppConfig,
  id: string
) => {
  const blogPost = await getBlogPostById(config, id)
  return blogPost
}

export const triggerBlogBuildApi = async (config: AppConfig) => {
  await triggerRebuild(config)
}
