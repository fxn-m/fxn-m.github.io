import { NotionConverter } from "notion-to-md"
import { DefaultExporter } from "notion-to-md/plugins/exporter"
import { MDXRenderer } from "notion-to-md/plugins/renderer"

import type { NotionResponse } from "@/shared/types/notion"

import type { AppConfig } from "../../config/app-config"
import { createNotionClient, resolveDataSourceId } from "./utils/notion-client"

const withSuppressedNotionToMdLogs = async <T>(
  action: () => Promise<T>
): Promise<T> => {
  const originalDebug = console.debug
  console.debug = () => {}
  try {
    return await action()
  } finally {
    console.debug = originalDebug
  }
}

const resolveBlogDataSourceId = async (config: AppConfig) => {
  const notion = createNotionClient(config.notionBlogSecret)
  return resolveDataSourceId(notion, config.notionBlogDataSourceId, {
    label: "Blog",
    envKey: "NOTION_BLOG_DATA_SOURCE_ID"
  })
}

export const getBlogPostById = async (config: AppConfig, blockId: string) => {
  const notion = createNotionClient(config.notionBlogSecret)

  return withSuppressedNotionToMdLogs(async () => {
    const buffer: Record<string, string> = {}
    const bufferExporter = new DefaultExporter({
      outputType: "buffer",
      buffer: buffer
    })

    const renderer = new MDXRenderer({
      frontmatter: {
        include: ["Title", "Date", "Tags"]
      }
    })

    const n2m = new NotionConverter(notion)
      .configureFetcher({
        fetchPageProperties: true
      })
      .withExporter(bufferExporter)
      .withRenderer(renderer)
    await n2m.convert(blockId)
    return buffer[blockId]
  })
}

export const getBlogPosts = async (
  config: AppConfig,
  isDevelopment: boolean
): Promise<NotionResponse[]> => {
  const notion = createNotionClient(config.notionBlogSecret)
  const notionBlogDataSourceId = await resolveBlogDataSourceId(config)

  let blogPosts: NotionResponse[] = []
  let hasNextPage = true
  let startCursor = undefined

  while (hasNextPage) {
    const response = await notion.dataSources.query({
      data_source_id: notionBlogDataSourceId,
      filter: isDevelopment
        ? {
            or: [
              {
                property: "Status",
                status: {
                  equals: "Published"
                }
              },
              {
                property: "Status",
                status: {
                  equals: "Draft"
                }
              }
            ]
          }
        : {
            property: "Status",
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
