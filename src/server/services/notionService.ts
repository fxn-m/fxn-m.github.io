import { createOpenAI } from "@ai-sdk/openai"
import { APIErrorCode, APIResponseError, Client } from "@notionhq/client"
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

const createNotionClient = (token: string) =>
  new Client({
    auth: token,
    fetch: boundFetch
  })

const createOpenAIProvider = (config: AppConfig) =>
  createOpenAI({
    apiKey: config.openaiApiKey,
    fetch: boundFetch
  })

const CategoryOptionSchema = z.object({
  name: z.string()
})

const CategoriesPropertySchema = z
  .object({
    multi_select: z.object({
      options: z.array(CategoryOptionSchema)
    })
  })
  .loose()

const CategoriesPropertiesSchema = z
  .object({
    Categories: CategoriesPropertySchema
  })
  .loose()

const parseCategoriesProperty = (properties: unknown): string[] | null => {
  const result = CategoriesPropertiesSchema.safeParse(properties)
  if (!result.success) {
    return null
  }

  return result.data.Categories.multi_select.options.map(
    (option) => option.name
  )
}

const extractPropertyConfig = (
  response: unknown
): Record<string, unknown> | null => {
  if (
    typeof response === "object" &&
    response !== null &&
    "properties" in response
  ) {
    const candidate = (response as { properties: unknown }).properties
    if (candidate && typeof candidate === "object") {
      return candidate as Record<string, unknown>
    }
  }

  return null
}

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

const normalizeUrlForComparison = (
  rawUrl: string
): { normalized: string; hostname: string } | null => {
  try {
    const parsed = new URL(rawUrl)
    const hostname = parsed.hostname.toLowerCase()
    let pathname = parsed.pathname || "/"
    pathname = pathname.replace(/\/+$/, "") || "/" // trim trailing slash, keep root
    if (!pathname.startsWith("/")) {
      pathname = `/${pathname}`
    }
    return { normalized: `${hostname}${pathname}`, hostname }
  } catch {
    return null
  }
}

export const getTabOverflowItems = async (
  config: AppConfig
): Promise<NotionResponse[]> => {
  console.log("Fetching tab overflow from Notion...")
  const notion = createNotionClient(config.notionTabOverflowToken)

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
  const notion = createNotionClient(config.notionBlogToken)

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
  const notion = createNotionClient(config.notionBlogToken)

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
  const notion = createNotionClient(config.notionTabOverflowToken)

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
  parentId: string
) => {
  const notion = createNotionClient(config.notionTabOverflowToken)

  const getCategoriesFromDatabaseId = async (
    databaseId: string
  ): Promise<string[] | null> => {
    try {
      const response = await notion.databases.retrieve({
        database_id: databaseId
      })
      const properties = extractPropertyConfig(response)
      if (!properties) {
        return null
      }
      return parseCategoriesProperty(properties)
    } catch (error) {
      if (
        APIResponseError.isAPIResponseError(error) &&
        (error.code === APIErrorCode.ObjectNotFound ||
          error.code === APIErrorCode.ValidationError)
      ) {
        console.warn(
          `Unable to retrieve database ${databaseId} for categories: ${error.message}`
        )
        return null
      }
      throw error
    }
  }

  const getCategoriesFromDataSourceId = async (
    dataSourceId: string
  ): Promise<string[] | null> => {
    try {
      const response = await notion.dataSources.retrieve({
        data_source_id: dataSourceId
      })
      const properties = extractPropertyConfig(response)
      const categories = properties ? parseCategoriesProperty(properties) : null
      if (categories && categories.length > 0) {
        return categories
      }

      if (
        typeof response === "object" &&
        response !== null &&
        "parent" in response
      ) {
        const parent = (
          response as {
            parent:
              | { type: "database_id"; database_id: string }
              | { type: "data_source_id"; data_source_id: string }
          }
        ).parent

        if (parent.type === "database_id") {
          return getCategoriesFromDatabaseId(parent.database_id)
        }

        if (
          parent.type === "data_source_id" &&
          parent.data_source_id !== dataSourceId
        ) {
          return getCategoriesFromDataSourceId(parent.data_source_id)
        }
      }

      if (
        typeof response === "object" &&
        response !== null &&
        "database_parent" in response
      ) {
        const databaseParent = (
          response as {
            database_parent:
              | { type: "database_id"; database_id: string }
              | { type: "data_source_id"; data_source_id: string }
              | { type: "page_id"; page_id: string }
              | { type: "workspace"; workspace: true }
              | { type: "block_id"; block_id: string }
              | null
          }
        ).database_parent

        if (
          databaseParent &&
          databaseParent.type === "database_id" &&
          databaseParent.database_id
        ) {
          const parentCategories = await getCategoriesFromDatabaseId(
            databaseParent.database_id
          )
          if (parentCategories && parentCategories.length > 0) {
            return parentCategories
          }
        }

        if (
          databaseParent &&
          databaseParent.type === "data_source_id" &&
          databaseParent.data_source_id &&
          databaseParent.data_source_id !== dataSourceId
        ) {
          return getCategoriesFromDataSourceId(databaseParent.data_source_id)
        }
      }

      return categories
    } catch (error) {
      if (
        APIResponseError.isAPIResponseError(error) &&
        (error.code === APIErrorCode.ObjectNotFound ||
          error.code === APIErrorCode.ValidationError)
      ) {
        console.warn(
          `Unable to retrieve data source ${dataSourceId} for categories: ${error.message}`
        )
        return null
      }
      throw error
    }
  }

  const visited = new Set<string>()

  const resolveCategories = async (
    referenceId: string | null | undefined
  ): Promise<string[] | null> => {
    if (!referenceId || visited.has(referenceId)) {
      return null
    }
    visited.add(referenceId)

    const fromDatabase = await getCategoriesFromDatabaseId(referenceId)
    if (fromDatabase && fromDatabase.length > 0) {
      return fromDatabase
    }

    const fromDataSource = await getCategoriesFromDataSourceId(referenceId)
    if (fromDataSource && fromDataSource.length > 0) {
      return fromDataSource
    }

    return null
  }

  const categories =
    (await resolveCategories(parentId)) ??
    (await resolveCategories(config.notionTabOverflowDataSourceId))

  if (!categories || categories.length === 0) {
    throw new Error(
      `Unable to resolve Categories property for Tab Overflow source ${parentId}`
    )
  }

  return categories
}

type EnrichInput = {
  props: PageProperties
  categories: string[]
  openai: ReturnType<typeof createOpenAIProvider>
}

const hasDuplicateLink = async (
  config: AppConfig,
  pageId: string,
  url: string
): Promise<boolean> => {
  const normalizedTarget = normalizeUrlForComparison(url)
  if (!normalizedTarget) {
    return false
  }

  const notion = createNotionClient(config.notionTabOverflowToken)
  let startCursor: string | undefined | null = undefined
  let hasMore = true

  while (hasMore) {
    const response = await notion.dataSources.query({
      data_source_id: config.notionTabOverflowDataSourceId,
      filter: {
        property: "Link",
        url: {
          contains: normalizedTarget.hostname
        }
      },
      start_cursor: startCursor ?? undefined
    })

    for (const result of response.results) {
      if (!isPageObjectResponse(result) || result.id === pageId) {
        continue
      }
      const linkProperty = result.properties?.Link
      if (!linkProperty || linkProperty.type !== "url" || !linkProperty.url) {
        continue
      }

      const normalizedCandidate = normalizeUrlForComparison(linkProperty.url)

      // if domain is news.ycombinator.com, skip
      if (
        normalizedCandidate &&
        normalizedCandidate.hostname === "news.ycombinator.com"
      ) {
        continue
      }

      if (
        normalizedCandidate &&
        normalizedCandidate.normalized === normalizedTarget.normalized
      ) {
        return true
      }
    }

    startCursor = response.next_cursor
    hasMore = response.has_more
  }

  return false
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
  created: string,
  isDuplicate: boolean
) => {
  const notion = createNotionClient(config.notionTabOverflowToken)

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
      Duplicate: {
        select: {
          name: isDuplicate ? "True" : "False"
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

const deleteNotionPage = async (config: AppConfig, pageId: string) => {
  const notion = createNotionClient(config.notionTabOverflowToken)
  await notion.pages.update({
    page_id: pageId,
    archived: true
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
  const isDuplicate = await hasDuplicateLink(config, pageId, props.url)
  if (isDuplicate) {
    console.warn(
      `Duplicate Tab Overflow link detected for ${props.url}; deleting page ${pageId}`
    )
    await deleteNotionPage(config, pageId)
    console.log("Deleted duplicate Notion page")
    await refreshTabOverflowCache(config, kv)
    console.log("Refreshed tab overflow cache after duplicate deletion")
    return
  }
  const enrichedItem = await enrich({
    props,
    categories,
    openai
  })
  console.log("Enriched item:", enrichedItem)
  await updateNotionPage(
    config,
    pageId,
    enrichedItem,
    props.created,
    isDuplicate
  )
  console.log(
    `Updated Notion page with enriched item (duplicate: ${isDuplicate})`
  )
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
          const isDuplicate = await hasDuplicateLink(config, item.id, props.url)
          const enrichedItem = await enrich({
            props,
            categories,
            openai
          })
          await updateNotionPage(
            config,
            item.id,
            enrichedItem,
            item.created_time,
            isDuplicate
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
