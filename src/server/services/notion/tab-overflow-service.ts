import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import pLimit from "p-limit";
import { z } from "zod";

import { isPageObjectResponse, type NotionResponse } from "@/shared/types/notion";

import type { AppConfig } from "../../config/app-config";
import type { KVNamespace } from "../../types/cloudflare";
import { writeTabOverflowToCache } from "../../utils/tab-overflow-store";
import { createNotionClient, resolveDataSourceId } from "./utils/notion-client";
import { extractPropertyConfig, parseCategoriesProperty } from "./utils/notion-properties";

const boundFetch: typeof fetch = (...args) => {
  return globalThis.fetch(...args);
};

const createGoogleProvider = (config: AppConfig) =>
  createGoogleGenerativeAI({
    apiKey: config.googleGenerativeAiApiKey,
    fetch: boundFetch,
  });

const normalizeUrlForComparison = (
  rawUrl: string,
): { normalized: string; hostname: string } | null => {
  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.toLowerCase();
    let pathname = parsed.pathname || "/";
    pathname = pathname.replace(/\/+$/, "") || "/"; // trim trailing slash, keep root
    if (!pathname.startsWith("/")) {
      pathname = `/${pathname}`;
    }
    return { normalized: `${hostname}${pathname}`, hostname };
  } catch {
    return null;
  }
};

const enrichedTabOverflowItemSchema = z.object({
  summary: z.string(),
  categories: z.array(z.string()),
  author: z.string(),
  readingTimeEstimate: z.number(),
});

type PageProperties = {
  id: string;
  title: string;
  created: string;
  url: string;
};

const PagePropertiesSchema = z.object({
  id: z.string(),
  created_time: z.string(),
  properties: z.object({
    Name: z.object({
      title: z.array(
        z.object({
          text: z.object({
            content: z.string(),
          }),
        }),
      ),
    }),
    URL: z.object({
      url: z.string(),
    }),
  }),
});

const getPagePropertiesById = async (config: AppConfig, pageId: string) => {
  const notion = createNotionClient(config.notionTabOverflowSecret);

  const response = await notion.pages.retrieve({
    page_id: pageId,
  });

  const parsed = PagePropertiesSchema.parse(response);
  const relevantProperties = {
    id: parsed.id,
    title: parsed.properties.Name.title[0].text.content,
    created: parsed.created_time,
    url: parsed.properties.URL.url,
  };

  return relevantProperties;
};

const resolveTabOverflowDataSourceId = async (config: AppConfig, dataSourceId?: string) => {
  const notion = createNotionClient(config.notionTabOverflowSecret);
  const candidates = [dataSourceId, config.notionTabOverflowDataSourceId].filter(
    (value): value is string => Boolean(value),
  );

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return await resolveDataSourceId(notion, candidate, {
        label: "Tab Overflow",
        envKey: "NOTION_TAB_OVERFLOW_DATA_SOURCE_ID",
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to resolve Tab Overflow data source id.");
};

const extractTabOverflowCategoriesFromDataSource = async (
  config: AppConfig,
  dataSourceId: string,
) => {
  const notion = createNotionClient(config.notionTabOverflowSecret);
  const resolvedId = await resolveDataSourceId(notion, dataSourceId, {
    label: "Tab Overflow",
    envKey: "NOTION_TAB_OVERFLOW_DATA_SOURCE_ID",
  });
  const response = await notion.dataSources.retrieve({
    data_source_id: resolvedId,
  });
  const properties = extractPropertyConfig(response);
  const categories = properties ? parseCategoriesProperty(properties) : null;

  if (!categories || categories.length === 0) {
    throw new Error(`Unable to resolve Categories property for Tab Overflow source ${resolvedId}`);
  }

  return categories;
};

const serializeError = (error: unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    const details: Record<string, unknown> = {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };

    if ("cause" in error && error.cause) {
      details.cause = serializeError(error.cause);
    }

    return details;
  }

  return { message: String(error) };
};

type EnrichInput = {
  props: PageProperties;
  categories: string[];
  google: ReturnType<typeof createGoogleProvider>;
};

const hasDuplicateURL = async (
  config: AppConfig,
  pageId: string,
  url: string,
  dataSourceId?: string,
): Promise<boolean> => {
  const normalizedTarget = normalizeUrlForComparison(url);
  if (!normalizedTarget) {
    return false;
  }

  const notion = createNotionClient(config.notionTabOverflowSecret);
  const resolvedDataSourceId = await resolveTabOverflowDataSourceId(config, dataSourceId);
  let startCursor: string | undefined | null = undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await notion.dataSources.query({
      data_source_id: resolvedDataSourceId,
      filter: {
        property: "URL",
        url: {
          contains: normalizedTarget.hostname,
        },
      },
      start_cursor: startCursor ?? undefined,
    });

    for (const result of response.results) {
      if (!isPageObjectResponse(result) || result.id === pageId) {
        continue;
      }
      const URLProperty = result.properties?.URL;
      if (!URLProperty || URLProperty.type !== "url" || !URLProperty.url) {
        continue;
      }

      const normalizedCandidate = normalizeUrlForComparison(URLProperty.url);

      if (normalizedCandidate && normalizedCandidate.hostname === "news.ycombinator.com") {
        continue;
      }

      if (normalizedCandidate && normalizedCandidate.normalized === normalizedTarget.normalized) {
        return true;
      }
    }

    startCursor = response.next_cursor;
    hasMore = response.has_more;
  }

  return false;
};

const extractJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No JSON object found in model response.");
    }
    return JSON.parse(match[0]);
  }
};

const enrich = async ({ props, categories, google }: EnrichInput) => {
  const { text } = await generateText({
    model: google("gemini-3.1-flash-lite"),
    output: Output.text(),
    prompt: `Summarize the article at the URL using URL context for the page content.
Title: ${props.title}
URL: ${props.url}

Return 1-3 categories from this list: ${categories.join(", ")}.
Be as specific as possible; prefer 1 category if extra categories are redundant.
The author should be a single name. If unclear, use "Unknown".
The reading time estimate should be in minutes. If unclear, use 0.

Return ONLY a JSON object that matches this schema:
{
  "summary": string,
  "categories": string[],
  "author": string,
  "readingTimeEstimate": number
}`,
    tools: {
      url_context: google.tools.urlContext({}),
    },
  });

  const { success, data, error } = enrichedTabOverflowItemSchema.safeParse(extractJson(text));

  if (success === false) {
    throw new Error(error.message, error);
  }

  return data;
};

const updateNotionPage = async (
  config: AppConfig,
  pageId: string,
  enrichedItem: z.infer<typeof enrichedTabOverflowItemSchema>,
  created: string,
  isDuplicate: boolean,
) => {
  const notion = createNotionClient(config.notionTabOverflowSecret);

  await notion.pages.update({
    page_id: pageId,
    properties: {
      Summary: {
        rich_text: [
          {
            type: "text",
            text: {
              content: enrichedItem.summary,
            },
          },
        ],
      },
      Categories: {
        multi_select: enrichedItem.categories.map((category) => ({
          name: category,
        })),
      },
      Author: {
        select: {
          name: enrichedItem.author,
        },
      },
      Duplicate: {
        select: {
          name: isDuplicate ? "True" : "False",
        },
      },
      "Read Time": {
        number: enrichedItem.readingTimeEstimate,
      },
      Added: {
        date: {
          start: created,
        },
      },
      Status: {
        select: {
          name: "Shelved",
        },
      },
    },
  });
};

const deleteNotionPage = async (config: AppConfig, pageId: string) => {
  const notion = createNotionClient(config.notionTabOverflowSecret);
  await notion.pages.update({
    page_id: pageId,
    archived: true,
  });
};

export const getTabOverflowItems = async (config: AppConfig): Promise<NotionResponse[]> => {
  console.log("Fetching tab overflow from Notion...");
  const notion = createNotionClient(config.notionTabOverflowSecret);
  const resolvedDataSourceId = await resolveTabOverflowDataSourceId(config);

  let tabOverflowItems: NotionResponse[] = [];
  let hasNextPage = true;
  let startCursor: string | undefined | null = undefined;

  while (hasNextPage) {
    const response = await notion.dataSources.query({
      data_source_id: resolvedDataSourceId,
      filter: {
        or: [
          {
            property: "Status",
            select: {
              equals: "Shelved",
            },
          },
        ],
      },
      start_cursor: startCursor ?? undefined,
    });

    tabOverflowItems = [...tabOverflowItems, ...response.results];
    startCursor = response.next_cursor;
    hasNextPage = response.has_more;
  }

  return tabOverflowItems;
};

const getPendingTabOverflowItems = async (config: AppConfig): Promise<NotionResponse[]> => {
  console.log("Fetching pending Tab Overflow items from Notion...");
  const notion = createNotionClient(config.notionTabOverflowSecret);
  const resolvedDataSourceId = await resolveTabOverflowDataSourceId(config);

  let tabOverflowItems: NotionResponse[] = [];
  let hasNextPage = true;
  let startCursor: string | undefined | null = undefined;

  while (hasNextPage) {
    const response = await notion.dataSources.query({
      data_source_id: resolvedDataSourceId,
      filter: {
        property: "Status",
        select: {
          is_empty: true,
        },
      },
      start_cursor: startCursor ?? undefined,
    });

    tabOverflowItems = [...tabOverflowItems, ...response.results];
    startCursor = response.next_cursor;
    hasNextPage = response.has_more;
  }

  return tabOverflowItems;
};

export const refreshTabOverflowCache = async (
  config: AppConfig,
  kv: KVNamespace,
): Promise<NotionResponse[]> => {
  const tabOverflowItems = await getTabOverflowItems(config);
  await writeTabOverflowToCache(kv, tabOverflowItems);
  return tabOverflowItems;
};

export const enrichTabOverflowItem = async (
  config: AppConfig,
  kv: KVNamespace,
  pageId: string,
  dataSourceId: string,
) => {
  const google = createGoogleProvider(config);
  const props = await getPagePropertiesById(config, pageId);
  const resolvedDataSourceId = await resolveTabOverflowDataSourceId(config, dataSourceId);
  const categories = await extractTabOverflowCategoriesFromDataSource(config, resolvedDataSourceId);
  const isDuplicate = await hasDuplicateURL(config, pageId, props.url, resolvedDataSourceId);
  if (isDuplicate) {
    console.warn(`Duplicate Tab Overflow URL detected for ${props.url}; deleting page ${pageId}`);
    await deleteNotionPage(config, pageId);
    console.log("Deleted duplicate Notion page");
    await refreshTabOverflowCache(config, kv);
    console.log("Refreshed tab overflow cache after duplicate deletion");
    return;
  }

  try {
    const enrichedItem = await enrich({
      props,
      categories,
      google,
    });
    console.log("Enriched item:", enrichedItem);
    await updateNotionPage(config, pageId, enrichedItem, props.created, isDuplicate);
  } catch (error) {
    console.error("Tab Overflow item enrichment failed:", {
      error: serializeError(error),
      pageId,
      title: props.title,
      url: props.url,
    });
    throw error;
  }

  console.log(`Updated Notion page with enriched item (duplicate: ${isDuplicate})`);
  await refreshTabOverflowCache(config, kv);
  console.log("Updated tab overflow cache");
};

export const enrichAllTabOverflowItems = async (config: AppConfig, kv: KVNamespace) => {
  const tabOverflowItems = await getPendingTabOverflowItems(config);
  const filteredTabOverflowItems = tabOverflowItems.filter((item) => isPageObjectResponse(item));

  const resolvedDataSourceId = await resolveTabOverflowDataSourceId(config);
  const categories = await extractTabOverflowCategoriesFromDataSource(config, resolvedDataSourceId);
  const google = createGoogleProvider(config);
  const limit = pLimit(5);

  await Promise.all(
    filteredTabOverflowItems.map((item) =>
      limit(async () => {
        const pageName =
          item.properties.Name.type === "title" && item.properties.Name.title.length > 0
            ? item.properties.Name.title[0].plain_text
            : "";
        if (
          item.properties.Summary.type === "rich_text" &&
          item.properties.Summary.rich_text &&
          item.properties.Summary.rich_text.some(
            (rt) => rt.plain_text && rt.plain_text.trim().length > 0,
          )
        ) {
          console.log(`Skipping ${pageName} because it already has a summary.`);
          return;
        }

        console.log(`Enriching ${pageName}...`);

        try {
          const props = await getPagePropertiesById(config, item.id);
          const isDuplicate = await hasDuplicateURL(
            config,
            item.id,
            props.url,
            resolvedDataSourceId,
          );
          const enrichedItem = await enrich({
            props,
            categories,
            google,
          });
          await updateNotionPage(config, item.id, enrichedItem, item.created_time, isDuplicate);
          console.log(`Updated ${pageName} with enriched item`);
        } catch (error) {
          console.error("Tab Overflow batch item enrichment failed:", {
            error: serializeError(error),
            pageId: item.id,
            pageName,
          });
        }
      }),
    ),
  );

  await refreshTabOverflowCache(config, kv);
};
