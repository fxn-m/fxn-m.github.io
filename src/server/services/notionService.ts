import { Client } from "@notionhq/client"
import env from "../config/env"

export const getReadingList = async () => {
  const notion = new Client({
    auth: env.notionApiKey
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let readingList: any[] = []
  let hasNextPage = true
  let startCursor: string | undefined | null = undefined

  while (hasNextPage) {
    const response = await notion.databases.query({
      database_id: env.notionDatabaseId,
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
