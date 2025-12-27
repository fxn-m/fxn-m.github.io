import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText, Output } from "ai"
import pLimit from "p-limit"
import { z } from "zod"

import type { AppConfig } from "../config/app-config"
import env from "../config/env"
import { createNotionClient, resolveDataSourceId } from "../utils/notion-client"

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

const resolveLinksDataSourceId = async (
  config: AppConfig,
  dataSourceId?: string
) => {
  const notion = createNotionClient(config.notionLinksSecret)
  const candidates = [dataSourceId, config.notionLinksDataSourceId].filter(
    (value): value is string => Boolean(value)
  )

  let lastError: unknown
  for (const candidate of candidates) {
    try {
      return await resolveDataSourceId(notion, candidate, {
        label: "Links",
        envKey: "NOTION_LINKS_DATA_SOURCE_ID"
      })
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error("Unable to resolve Links data source id.")
}

const extractCategoriesFromDataSource = async (
  config: AppConfig,
  dataSourceId: string
) => {
  const notion = createNotionClient(config.notionLinksSecret)
  const resolvedId = await resolveDataSourceId(notion, dataSourceId, {
    label: "Links",
    envKey: "NOTION_LINKS_DATA_SOURCE_ID"
  })
  const response = await notion.dataSources.retrieve({
    data_source_id: resolvedId
  })
  const properties = extractPropertyConfig(response)
  const categories = properties ? parseCategoriesProperty(properties) : null

  if (!categories || categories.length === 0) {
    throw new Error(
      `Unable to resolve Categories property for Links source ${resolvedId}`
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
  const notion = createNotionClient(config.notionLinksSecret)
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
  google: ReturnType<typeof createGoogleGenerativeAI>
) => {
  const prompt = `Summarize the link in 1-2 short sentences (ideally 1, less than 20 words!) and choose 1-3 categories. Use the URL context tool for the page content.
Title: ${props.title}
URL: ${props.url}
Existing categories: ${categories.join(", ")}
If none are a great fit, create a short new category (1-2 words, title case).
Return ONLY a JSON object that matches this schema:
{
  "summary": string,
  "categories": string[]
}`

  // log the prompt
  console.log("prompt", prompt)

  // enrich the link
  const response = await generateText({
    model: google("gemini-3-flash-preview"),
    output: Output.text(),
    prompt,
    tools: {
      url_context: google.tools.urlContext({})
    }
  })

  // log the full response
  console.log("gemini response", response)

  // parse the response
  const extractJson = (value: string): unknown => {
    try {
      return JSON.parse(value)
    } catch {
      const match = value.match(/\{[\s\S]*\}/)
      if (!match) {
        throw new Error("No JSON object found in model response.")
      }
      return JSON.parse(match[0])
    }
  }

  const parsed = enrichedLinkSchema.safeParse(extractJson(response.text))
  if (!parsed.success) {
    throw new Error(parsed.error.message, parsed.error)
  }

  return parsed.data
}

const updateLinkPage = async (
  config: AppConfig,
  pageId: string,
  enriched: z.infer<typeof enrichedLinkSchema>
) => {
  const notion = createNotionClient(config.notionLinksSecret)

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
  config: AppConfig,
  dataSourceId: string
): Promise<{ id: string }[]> => {
  const notion = createNotionClient(config.notionLinksSecret)
  const resolvedId = await resolveDataSourceId(notion, dataSourceId, {
    label: "Links",
    envKey: "NOTION_LINKS_DATA_SOURCE_ID"
  })
  let results: { id: string }[] = []
  let hasNextPage = true
  let startCursor: string | undefined | null = undefined
  const hasId = (item: unknown): item is { id: string } =>
    typeof item === "object" && item !== null && "id" in item

  while (hasNextPage) {
    const query: {
      filter: {
        property: "Summary"
        rich_text: {
          is_empty: true
        }
      }
      start_cursor?: string
    } = {
      filter: {
        property: "Summary",
        rich_text: {
          is_empty: true
        }
      },
      start_cursor: startCursor ?? undefined
    }

    const response: {
      results: unknown[]
      next_cursor: string | null
      has_more: boolean
    } = await notion.dataSources.query({
      data_source_id: resolvedId,
      ...query
    })

    results = [
      ...results,
      ...response.results.filter(hasId).map((item) => ({ id: item.id }))
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
  const google = createGoogleGenerativeAI({
    apiKey: env.googleGenerativeAiApiKey
  })
  const props = await getLinkPagePropertiesById(config, pageId)
  if (props.hasSummary) {
    console.log(`Skipping ${props.title} because it already has a summary.`)
    return
  }

  const resolvedDataSourceId = await resolveLinksDataSourceId(
    config,
    dataSourceId
  )
  const categories = await extractCategoriesFromDataSource(
    config,
    resolvedDataSourceId
  )
  const enriched = await enrichLink(props, categories, google)
  await updateLinkPage(config, pageId, enriched)
  console.log(`Updated link ${props.title} with summary + categories`)
}

export const enrichAllLinks = async (
  config: AppConfig,
  dataSourceId = config.notionLinksDataSourceId
) => {
  console.log("google generative api key:", env.googleGenerativeAiApiKey)
  const google = createGoogleGenerativeAI({
    apiKey: env.googleGenerativeAiApiKey
  })
  const resolvedDataSourceId = await resolveLinksDataSourceId(
    config,
    dataSourceId
  )
  const links = await getLinksMissingSummary(config, resolvedDataSourceId)
  const categories = await extractCategoriesFromDataSource(
    config,
    resolvedDataSourceId
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
