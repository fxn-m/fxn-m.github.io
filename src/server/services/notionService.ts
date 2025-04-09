import { Client } from "@notionhq/client"
import env from "../config/env"
import {
  ListBlockChildrenResponse,
  PageObjectResponse,
  PartialPageObjectResponse,
  PartialDatabaseObjectResponse
} from "@notionhq/client/build/src/api-endpoints"

type NotionResponse = PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse

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

export const getBlogPostById = async (blockId: string): Promise<ListBlockChildrenResponse> => {
  const notion = new Client({
    auth: env.notionApiKey
  })
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 50
  })

  return response
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
      start_cursor: startCursor ?? undefined
    })

    blogPosts = [...blogPosts, ...response.results]
    startCursor = response.next_cursor
    hasNextPage = response.has_more
  }

  console.log("Blog posts:", blogPosts)

  return blogPosts
}
