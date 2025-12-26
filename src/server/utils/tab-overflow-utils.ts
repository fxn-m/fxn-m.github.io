import { Client } from "@notionhq/client"

import env from "@/server/config/env"

export const getTabOverflow = async () => {
  console.log("Getting tab overflow...")

  const NOTION_TAB_OVERFLOW_TOKEN = env.notionTabOverflowToken
  const NOTION_TAB_OVERFLOW_DATA_SOURCE_ID = env.notionTabOverflowDataSourceId

  const notion = new Client({
    auth: NOTION_TAB_OVERFLOW_TOKEN
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tabOverflow: any[] = []
  let hasNextPage = true
  let startCursor = undefined

  while (hasNextPage) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await notion.dataSources.query({
      data_source_id: NOTION_TAB_OVERFLOW_DATA_SOURCE_ID ?? "",
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
      start_cursor: startCursor
    })

    tabOverflow = [...tabOverflow, ...response.results]
    startCursor = response.next_cursor
    hasNextPage = response.has_more
  }

  return tabOverflow
}
