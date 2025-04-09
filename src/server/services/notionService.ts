import { Client } from "@notionhq/client"
import { NotionConverter } from "notion-to-md"
import { DefaultExporter } from "notion-to-md/plugins/exporter"
import { MDXRenderer } from "notion-to-md/plugins/renderer"

import env from "../config/env"
import type { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints"
import type { NotionResponse } from "@/shared/types/notion"

export const getReadingList = async (): Promise<NotionResponse[]> => {
  const notion = new Client({
    auth: env.notionApiKey
  })

  let readingList: NotionResponse[] = []
  let hasNextPage = true
  let startCursor = undefined

  while (hasNextPage) {
    const response = await notion.databases.query({
      database_id: env.notionReadingListDatabaseId ?? "",
      filter: {
        or: [
          {
            property: "Type",
            select: {
              equals: "Essay"
            }
          },
          {
            property: "Type",
            select: {
              equals: "Article"
            }
          },
          {
            property: "Type",
            select: {
              equals: "Paper"
            }
          },
          {
            property: "Type",
            select: {
              equals: "Blog Post"
            }
          },
          {
            property: "Type",
            select: {
              equals: "Report"
            }
          },
          {
            property: "Status",
            select: {
              equals: "Shelved"
            }
          }
        ]
      },
      start_cursor: startCursor ?? undefined
    })

    readingList = [...readingList, ...response.results]
    startCursor = response.next_cursor
    hasNextPage = response.has_more
  }

  return readingList
}

/**
 *
 * @deprecated
 * This function is deprecated and will be removed in the future.
 */
export const legacyGetBlogPostById = async (blockId: string): Promise<ListBlockChildrenResponse> => {
  const notion = new Client({
    auth: env.notionApiKey
  })
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 50
  })

  return response
}

export const getBlogPostById = async (blockId: string) => {
  const notion = new Client({
    auth: env.notionApiKey
  })

  const buffer: Record<string, string> = {}
  const bufferExporter = new DefaultExporter({
    outputType: "buffer",
    buffer: buffer
  })

  const renderer = new MDXRenderer({
    frontmatter: {
      include: ["title", "date", "tags"]
    }
  })

  const n2m = new NotionConverter(notion)
    .configureFetcher({
      fetchPageProperties: true
    })
    .withExporter(bufferExporter)
    .withRenderer(renderer)
  await n2m.convert(blockId)
  const blogPost = buffer[blockId]

  return blogPost
}

export const getBlogPosts = async (): Promise<NotionResponse[]> => {
  const notion = new Client({
    auth: env.notionApiKey
  })

  let blogPosts: NotionResponse[] = []
  let hasNextPage = true
  let startCursor = undefined

  while (hasNextPage) {
    const response = await notion.databases.query({
      database_id: env.notionBlogDatabaseId ?? "",
      filter: {
        property: "status",
        status: {
          equals: "Published"
        }
      },
      start_cursor: startCursor ?? undefined
    })

    blogPosts = [...blogPosts, ...response.results]
    startCursor = response.next_cursor
    hasNextPage = response.has_more
  }

  return blogPosts
}
