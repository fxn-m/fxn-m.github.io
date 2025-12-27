import env from "@/server/config/env"
import {
  createNotionClient,
  resolveDataSourceId
} from "@/server/utils/notion-client"

export const getTabOverflow = async () => {
  console.log("Getting tab overflow...")

  const NOTION_TOKEN = env.notionTabOverflowSecret
  const NOTION_TAB_OVERFLOW_DATA_SOURCE_ID = env.notionTabOverflowDataSourceId

  const notion = createNotionClient(NOTION_TOKEN ?? "")
  const dataSourceId = await resolveDataSourceId(
    notion,
    NOTION_TAB_OVERFLOW_DATA_SOURCE_ID ?? "",
    {
      label: "Tab Overflow",
      envKey: "NOTION_TAB_OVERFLOW_DATA_SOURCE_ID"
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tabOverflow: any[] = []
  let hasNextPage = true
  let startCursor = undefined

  while (hasNextPage) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await notion.dataSources.query({
      data_source_id: dataSourceId,
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
