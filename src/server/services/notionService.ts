import { createOpenAI } from "@ai-sdk/openai"
import { Client } from "@notionhq/client"
import { generateObject, generateText } from "ai"
import { NotionConverter } from "notion-to-md"
import { DefaultExporter } from "notion-to-md/plugins/exporter"
import { MDXRenderer } from "notion-to-md/plugins/renderer"
import pLimit from "p-limit"
import { z } from "zod"

import {
  isPageObjectResponse,
  type NotionResponse
} from "@/shared/types/notion"

import type { AppConfig } from "../config/appConfig"
import type { KVNamespace } from "../types/cloudflare"
import { writeTabOverflowToCache } from "../utils/tabOverflowStore"

const boundFetch: typeof fetch = (...args) => {
  return globalThis.fetch(...args)
}

const createNotionClient = (config: AppConfig) =>
  new Client({
    auth: config.notionApiKey,
    fetch: boundFetch
  })

const createOpenAIProvider = (config: AppConfig) =>
  createOpenAI({
    apiKey: config.openaiApiKey,
    fetch: boundFetch
  })

const DatabaseResponseSchema = z.object({
  id: z.string(),
  properties: z.object({
    Categories: z.object({
      multi_select: z.object({
        options: z.array(
          z.object({
            name: z.string()
          })
        )
      })
    })
  })
})

export const getTabOverflowItems = async (
  config: AppConfig
): Promise<NotionResponse[]> => {
  console.log("Fetching tab overflow from Notion...")
  const notion = createNotionClient(config)

  let tabOverflowItems: NotionResponse[] = []
  let hasNextPage = true
  let startCursor: string | undefined | null = undefined

  while (hasNextPage) {
    const response = await notion.dataSources.query({
      data_source_id: config.notionTabOverflowDataSourceId,
      filter: {
        or: [
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

    tabOverflowItems = [...tabOverflowItems, ...response.results]
    startCursor = response.next_cursor
    hasNextPage = response.has_more
  }

  return tabOverflowItems
}

export const refreshTabOverflowCache = async (
  config: AppConfig,
  kv: KVNamespace
): Promise<NotionResponse[]> => {
  const tabOverflowItems = await getTabOverflowItems(config)
  await writeTabOverflowToCache(kv, tabOverflowItems)
  return tabOverflowItems
}

export const getBlogPostById = async (config: AppConfig, blockId: string) => {
  const notion = createNotionClient(config)

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
  const blogPost = buffer[blockId]

  return blogPost
}

export const getBlogPosts = async (
  config: AppConfig,
  isDevelopment: boolean
): Promise<NotionResponse[]> => {
  const notion = createNotionClient(config)

  let blogPosts: NotionResponse[] = []
  let hasNextPage = true
  let startCursor = undefined

  while (hasNextPage) {
    const response = await notion.dataSources.query({
      data_source_id: config.notionBlogDataSourceId,
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

const enrichedTabOverflowItemSchema = z.object({
  summary: z.string(),
  categories: z.array(z.string()),
  author: z.string(),
  readingTimeEstimate: z.number()
})

type PageProperties = {
  id: string
  title: string
  created: string
  url: string
}

const PagePropertiesSchema = z.object({
  id: z.string(),
  created_time: z.string(),
  properties: z.object({
    Name: z.object({
      title: z.array(
        z.object({
          text: z.object({
            content: z.string()
          })
        })
      )
    }),
    Link: z.object({
      url: z.string()
    })
  })
})

const getPagePropertiesById = async (config: AppConfig, pageId: string) => {
  const notion = createNotionClient(config)

  const response = await notion.pages.retrieve({
    page_id: pageId
  })

  const parsed = PagePropertiesSchema.parse(response)
  const relevantProperties = {
    id: parsed.id,
    title: parsed.properties.Name.title[0].text.content,
    created: parsed.created_time,
    url: parsed.properties.Link.url
  }

  return relevantProperties
}

const extractCategoriesFromDatabase = async (
  config: AppConfig,
  databaseId: string
) => {
  const notion = createNotionClient(config)
  const response = await notion.databases.retrieve({
    database_id: databaseId
  })

  const parsed = DatabaseResponseSchema.parse(response)
  const categories = parsed.properties.Categories.multi_select.options.map(
    (option) => option.name
  )
  return categories
}

type EnrichInput = {
  props: PageProperties
  categories: string[]
  openai: ReturnType<typeof createOpenAIProvider>
}

const enrich = async ({ props, categories, openai }: EnrichInput) => {
  const { text } = await generateText({
    model: openai.responses("gpt-4o"),
    prompt: `
    Summarize the following article in 3 sentences or less, provide a list of categories, and best guesses for the author and reading time estimate: ${
      props.title
    } ${props.url}. 
    Return 1-3 categories, and they should be from the following list: ${categories.join(
      ", "
    )}. 
    Be as specific as you can about the categories, ideally there would only be 1 category if the other 2 are somewhat redundant. 
    The author should be a single name, and the reading time estimate should be in minutes. 
    If the author is unclear, use "Unknown". 
    If the reading time estimate is unclear, use 0.`,
    tools: {
      web_search_preview: openai.tools.webSearch()
    },
    toolChoice: {
      type: "tool",
      toolName: "web_search_preview"
    }
  })

  const { object } = await generateObject({
    model: openai.responses("gpt-4o"),
    prompt: `Extract the summary, categories, author, and reading time estimate from the following text: ${text}`,
    schema: enrichedTabOverflowItemSchema
  })

  const { success, data, error } =
    enrichedTabOverflowItemSchema.safeParse(object)

  if (success === false) {
    throw new Error(error.message, error)
  }

  return data
}

const updateNotionPage = async (
  config: AppConfig,
  pageId: string,
  enrichedItem: z.infer<typeof enrichedTabOverflowItemSchema>,
  created: string
) => {
  const notion = createNotionClient(config)

  await notion.pages.update({
    page_id: pageId,
    properties: {
      Summary: {
        rich_text: [
          {
            type: "text",
            text: {
              content: enrichedItem.summary
            }
          }
        ]
      },
      Categories: {
        multi_select: enrichedItem.categories.map((category) => ({
          name: category
        }))
      },
      Author: {
        select: {
          name: enrichedItem.author
        }
      },
      "Read Time": {
        number: enrichedItem.readingTimeEstimate
      },
      Added: {
        date: {
          start: created
        }
      },
      Status: {
        select: {
          name: "Shelved"
        }
      }
    }
  })
}

export const enrichTabOverflowItem = async (
  config: AppConfig,
  kv: KVNamespace,
  pageId: string,
  databaseId: string
) => {
  const openai = createOpenAIProvider(config)
  const props = await getPagePropertiesById(config, pageId)
  const categories = await extractCategoriesFromDatabase(config, databaseId)
  const enrichedItem = await enrich({
    props,
    categories,
    openai
  })
  console.log("Enriched item:", enrichedItem)
  await updateNotionPage(config, pageId, enrichedItem, props.created)
  console.log("Updated Notion page with enriched item")
  await refreshTabOverflowCache(config, kv)
  console.log("Updated tab overflow cache")
}

export const enrichAllTabOverflowItems = async (
  config: AppConfig,
  kv: KVNamespace
) => {
  const tabOverflowItems = await getTabOverflowItems(config)
  const filteredTabOverflowItems = tabOverflowItems.filter((item) =>
    isPageObjectResponse(item)
  )

  const categories = await extractCategoriesFromDatabase(
    config,
    config.notionTabOverflowDataSourceId
  )
  const openai = createOpenAIProvider(config)
  const limit = pLimit(5)

  await Promise.all(
    filteredTabOverflowItems.map((item) =>
      limit(async () => {
        const pageName =
          item.properties.Name.type === "title" &&
          item.properties.Name.title.length > 0
            ? item.properties.Name.title[0].plain_text
            : ""
        if (
          item.properties.Summary.type === "rich_text" &&
          item.properties.Summary.rich_text &&
          item.properties.Summary.rich_text.some(
            (rt) => rt.plain_text && rt.plain_text.trim().length > 0
          )
        ) {
          console.log(`Skipping ${pageName} because it already has a summary.`)
          return
        }

        if (
          item.properties.Status.type === "select" &&
          item.properties.Status.select &&
          item.properties.Status.select.name !== "Shelved"
        ) {
          console.log(`Skipping ${pageName} because it is not shelved.`)
          return
        }

        console.log(`Enriching ${pageName}...`)

        try {
          const props = await getPagePropertiesById(config, item.id)
          const enrichedItem = await enrich({
            props,
            categories,
            openai
          })
          await updateNotionPage(
            config,
            item.id,
            enrichedItem,
            item.created_time
          )
        } catch (error) {
          console.error(`Error enriching ${pageName}:`, error)
        }

        console.log(`Updated ${pageName} with enriched item`)
      })
    )
  )

  await refreshTabOverflowCache(config, kv)
}
