import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { APIErrorCode, APIResponseError, Client } from "@notionhq/client"
import { generateText, Output } from "ai"
import pLimit from "p-limit"
import { z } from "zod"

import type { AppConfig } from "../config/app-config"

const boundFetch: typeof fetch = (...args) => {
  return globalThis.fetch(...args)
}

const createNotionClient = (token: string) =>
  new Client({
    auth: token,
    fetch: boundFetch
  })

const createGoogleProvider = (config: AppConfig) =>
  createGoogleGenerativeAI({
    apiKey: config.googleGenerativeAiApiKey,
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

const extractCategoriesFromDataSource = async (
  config: AppConfig,
  dataSourceId: string
) => {
  const notion = createNotionClient(config.notionLinksToken)

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
    currentDataSourceId: string
  ): Promise<string[] | null> => {
    try {
      const response = await notion.dataSources.retrieve({
        data_source_id: currentDataSourceId
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
          parent.data_source_id !== currentDataSourceId
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
          databaseParent.data_source_id !== currentDataSourceId
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
          `Unable to retrieve data source ${currentDataSourceId} for categories: ${error.message}`
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
    (await resolveCategories(dataSourceId)) ??
    (await resolveCategories(config.notionLinksDataSourceId))

  if (!categories || categories.length === 0) {
    throw new Error(
      `Unable to resolve Categories property for Links source ${dataSourceId}`
    )
  }

  return categories
}

const LinkPageSchema = z.object({
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
    URL: z.object({
      url: z.string()
    }),
    Summary: z
      .object({
        rich_text: z.array(
          z.object({
            plain_text: z.string().optional()
          })
        )
      })
      .optional()
  })
})

type LinkPageProperties = {
  id: string
  title: string
  created: string
  url: string
  hasSummary: boolean
}

const getLinkPagePropertiesById = async (
  config: AppConfig,
  pageId: string
): Promise<LinkPageProperties> => {
  const notion = createNotionClient(config.notionLinksToken)
  const response = await notion.pages.retrieve({
    page_id: pageId
  })

  const parsed = LinkPageSchema.parse(response)
  const summaryItems = parsed.properties.Summary?.rich_text ?? []
  const hasSummary = summaryItems.some(
    (item) => item.plain_text && item.plain_text.trim().length > 0
  )

  return {
    id: parsed.id,
    title: parsed.properties.Name.title[0]?.text.content ?? "",
    created: parsed.created_time,
    url: parsed.properties.URL.url,
    hasSummary
  }
}

const enrichedLinkSchema = z.object({
  summary: z.string(),
  categories: z.array(z.string())
})

const enrichLink = async (
  props: LinkPageProperties,
  categories: string[],
  google: ReturnType<typeof createGoogleProvider>
) => {
  const { content } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    output: Output.object({ schema: enrichedLinkSchema }),
    prompt: `Summarize the link in 1-2 short sentences (ideally 1) and choose 1-3 categories. Use the URL context tool for the page content.
Title: ${props.title}
URL: ${props.url}
Existing categories: ${categories.join(", ")}
If none are a great fit, create a short new category (1-2 words, title case).`,
    tools: {
      url_context: google.tools.urlContext({})
    }
  })

  const { success, data, error } = enrichedLinkSchema.safeParse(content)
  if (!success) {
    throw new Error(error.message, error)
  }

  return data
}

const updateLinkPage = async (
  config: AppConfig,
  pageId: string,
  enriched: z.infer<typeof enrichedLinkSchema>
) => {
  const notion = createNotionClient(config.notionLinksToken)

  await notion.pages.update({
    page_id: pageId,
    properties: {
      Summary: {
        rich_text: [
          {
            type: "text",
            text: {
              content: enriched.summary
            }
          }
        ]
      },
      Categories: {
        multi_select: enriched.categories.map((category) => ({
          name: category
        }))
      }
    }
  })
}

const getLinksMissingSummary = async (
  config: AppConfig
): Promise<{ id: string }[]> => {
  const notion = createNotionClient(config.notionLinksToken)
  let results: { id: string }[] = []
  let hasNextPage = true
  let startCursor: string | undefined | null = undefined

  while (hasNextPage) {
    const response = await notion.dataSources.query({
      data_source_id: config.notionLinksDataSourceId,
      filter: {
        property: "Summary",
        rich_text: {
          is_empty: true
        }
      },
      start_cursor: startCursor ?? undefined
    })

    results = [
      ...results,
      ...response.results
        .filter((item) => typeof item === "object" && item && "id" in item)
        .map((item) => ({ id: (item as { id: string }).id }))
    ]
    startCursor = response.next_cursor
    hasNextPage = response.has_more
  }

  return results
}

export const enrichLinkItem = async (
  config: AppConfig,
  pageId: string,
  dataSourceId: string
) => {
  const google = createGoogleProvider(config)
  const props = await getLinkPagePropertiesById(config, pageId)
  if (props.hasSummary) {
    console.log(`Skipping ${props.title} because it already has a summary.`)
    return
  }

  const categories = await extractCategoriesFromDataSource(config, dataSourceId)
  const enriched = await enrichLink(props, categories, google)
  await updateLinkPage(config, pageId, enriched)
  console.log(`Updated link ${props.title} with summary + categories`)
}

export const enrichAllLinks = async (config: AppConfig) => {
  const google = createGoogleProvider(config)
  const links = await getLinksMissingSummary(config)
  const categories = await extractCategoriesFromDataSource(
    config,
    config.notionLinksDataSourceId
  )
  const limit = pLimit(5)

  await Promise.all(
    links.map((link) =>
      limit(async () => {
        try {
          const props = await getLinkPagePropertiesById(config, link.id)
          if (props.hasSummary) {
            return
          }
          const enriched = await enrichLink(props, categories, google)
          await updateLinkPage(config, link.id, enriched)
        } catch (error) {
          console.error(`Error enriching link ${link.id}:`, error)
        }
      })
    )
  )
}
