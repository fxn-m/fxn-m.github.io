import { Client } from "@notionhq/client"
import { NotionConverter } from "notion-to-md"
import { DefaultExporter } from "notion-to-md/plugins/exporter"
import { MDXRenderer } from "notion-to-md/plugins/renderer"
import { z } from "zod"
import { generateObject, generateText } from "ai"

import env from "../config/env"

import type { NotionResponse } from "@/shared/types/notion"
import { openai } from "@ai-sdk/openai"

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

const enrichedReadingListItemSchema = z.object({
  summary: z.string(),
  categories: z.array(z.string()),
  author: z.string(),
  readingTimeEstimate: z.string()
})

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

type PagePropertiesSchema = {
  id: string
  title: string
  created: string
  url: string
}

const getPagePropertiesById = async (pageId: string) => {
  const notion = new Client({
    auth: env.notionApiKey
  })

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

const extractCategoriesFromDatabase = async (databaseId: string) => {
  const notion = new Client({
    auth: env.notionApiKey
  })
  const response = await notion.databases.retrieve({
    database_id: databaseId
  })

  const parsed = DatabaseResponseSchema.parse(response)
  const categories = parsed.properties.Categories.multi_select.options.map((option) => option.name)
  return categories
}

const enrich = async ({ props, categories }: { props: PagePropertiesSchema; categories: string[] }) => {
  const { text } = await generateText({
    model: openai.responses("gpt-4o"),
    prompt: `Summarize the following article in 3 sentences or less, provide a list of categories, and best guesses for the author and reading time estimate: ${
      props.title
    } ${props.url}. Return 1-3 categories, and they should be from the following list: ${categories.join(
      ", "
    )}. The author should be a single name, and the reading time estimate should be in minutes.`,
    tools: {
      web_search_preview: openai.tools.webSearchPreview()
    },
    toolChoice: { type: "tool", toolName: "web_search_preview" }
  })

  const { object } = await generateObject({
    model: openai.responses("gpt-4o"),
    prompt: `Extract the summary, categories, author, and reading time estimate from the following text: ${text}`,
    schema: enrichedReadingListItemSchema
  })

  return object
}

const updateNotionPage = async (pageId: string, enrichedItem: z.infer<typeof enrichedReadingListItemSchema>, created: string) => {
  const notion = new Client({
    auth: env.notionApiKey
  })

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
        number: parseInt(enrichedItem.readingTimeEstimate, 10)
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

export const enrichReadingListItem = async (pageId: string, databaseId: string) => {
  const props = await getPagePropertiesById(pageId)
  const categories = await extractCategoriesFromDatabase(databaseId)
  const enrichedItem = await enrich({ props, categories })
  console.log("Enriched item:", enrichedItem)
  await updateNotionPage(pageId, enrichedItem, props.created)
  console.log("Updated Notion page with enriched item")
}
