import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { z } from "zod";

import type { TabOverflowItem } from "@/shared";

import { createNotionClient, resolveDataSourceId } from "../notion/client";
import { extractPropertyConfig, parseCategoriesProperty } from "../notion/properties";
import type { EnrichedTabOverflowItem, TabOverflowPage } from "./module";

type NotionTabOverflowConfig = {
  dataSourceId: string;
  token: string;
};

const PageSchema = z.object({
  created_time: z.string(),
  id: z.string(),
  properties: z.object({
    Name: z.object({
      title: z.array(z.object({ text: z.object({ content: z.string() }) })),
    }),
    Summary: z
      .object({ rich_text: z.array(z.object({ plain_text: z.string().optional() })) })
      .optional(),
    URL: z.object({ url: z.string() }),
  }),
});

const isPageObjectResponse = (value: unknown): value is PageObjectResponse =>
  typeof value === "object" && value !== null && "properties" in value;

const normalizeUrl = (rawUrl: string): { hostname: string; normalized: string } | null => {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return { hostname, normalized: `${hostname}${pathname}` };
  } catch {
    return null;
  }
};

const mapPublicPage = (page: PageObjectResponse): TabOverflowItem => {
  const properties: NonNullable<TabOverflowItem["properties"]> = {};
  const added = page.properties.Added;
  const author = page.properties.Author;
  const categories = page.properties.Categories;
  const name = page.properties.Name;
  const readTime = page.properties["Read Time"];
  const summary = page.properties.Summary;
  const url = page.properties.URL;

  if (added?.type === "date") {
    properties.Added = { date: added.date ? { start: added.date.start } : null };
  }
  if (author?.type === "select") {
    properties.Author = { select: author.select ? { name: author.select.name } : null };
  }
  if (categories?.type === "multi_select") {
    properties.Categories = {
      multi_select: categories.multi_select.map(({ name: category }) => ({ name: category })),
    };
  }
  if (name?.type === "title") {
    properties.Name = {
      title: name.title.map(({ plain_text: plainText }) => ({ plain_text: plainText })),
    };
  }
  if (readTime?.type === "number") {
    properties["Read Time"] = { number: readTime.number };
  }
  if (summary?.type === "rich_text") {
    properties.Summary = {
      rich_text: summary.rich_text.map(({ plain_text: plainText }) => ({ plain_text: plainText })),
    };
  }
  if (url?.type === "url") {
    properties.URL = { url: url.url };
  }

  return { id: page.id, properties };
};

export const createNotionTabOverflowRepository = ({
  dataSourceId: defaultDataSourceId,
  token,
}: NotionTabOverflowConfig) => {
  const notion = createNotionClient(token);

  const resolveSource = async (dataSourceId?: string) => {
    const candidates = [
      ...new Set([dataSourceId, defaultDataSourceId].filter(Boolean)),
    ] as string[];
    let lastError: unknown;

    for (const candidate of candidates) {
      try {
        return await resolveDataSourceId(notion, candidate, {
          envKey: "NOTION_TAB_OVERFLOW_DATA_SOURCE_ID",
          label: "Tab Overflow",
        });
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("Unable to resolve the Tab Overflow data source.");
  };

  const queryAll = async (filter: Parameters<typeof notion.dataSources.query>[0]["filter"]) => {
    const pages: PageObjectResponse[] = [];
    let cursor: string | undefined;

    do {
      const response = await notion.dataSources.query({
        data_source_id: await resolveSource(),
        filter,
        start_cursor: cursor,
      });
      pages.push(...response.results.filter(isPageObjectResponse));
      cursor = response.next_cursor ?? undefined;
    } while (cursor);

    return pages;
  };

  return {
    async archive(pageId: string): Promise<void> {
      await notion.pages.update({ archived: true, page_id: pageId });
    },

    async findPending(): Promise<TabOverflowPage[]> {
      const pages = await queryAll({
        property: "Status",
        select: { is_empty: true },
      });

      return pages.map((page) => {
        const name = page.properties.Name;
        const summary = page.properties.Summary;
        const url = page.properties.URL;
        return {
          created: page.created_time,
          hasSummary:
            summary?.type === "rich_text" &&
            summary.rich_text.some((text) => text.plain_text.trim().length > 0),
          id: page.id,
          title:
            name?.type === "title" && name.title.length > 0 ? name.title[0].plain_text : "Untitled",
          url: url?.type === "url" && url.url ? url.url : "",
        };
      });
    },

    async getCategories(dataSourceId?: string): Promise<string[]> {
      const resolvedId = await resolveSource(dataSourceId);
      const response = await notion.dataSources.retrieve({ data_source_id: resolvedId });
      const properties = extractPropertyConfig(response);
      const categories = properties ? parseCategoriesProperty(properties) : null;
      if (!categories?.length) {
        throw new Error(`Tab Overflow source ${resolvedId} has no Categories options.`);
      }
      return categories;
    },

    async getPage(pageId: string): Promise<TabOverflowPage> {
      const page = PageSchema.parse(await notion.pages.retrieve({ page_id: pageId }));
      return {
        created: page.created_time,
        hasSummary:
          page.properties.Summary?.rich_text.some((text) =>
            Boolean(text.plain_text?.trim().length),
          ) ?? false,
        id: page.id,
        title: page.properties.Name.title[0]?.text.content ?? "Untitled",
        url: page.properties.URL.url,
      };
    },

    async hasDuplicateUrl(pageId: string, rawUrl: string, dataSourceId?: string): Promise<boolean> {
      const target = normalizeUrl(rawUrl);
      if (!target) {
        return false;
      }

      let cursor: string | undefined;
      do {
        const response = await notion.dataSources.query({
          data_source_id: await resolveSource(dataSourceId),
          filter: { property: "URL", url: { contains: target.hostname } },
          start_cursor: cursor,
        });

        for (const result of response.results) {
          if (!isPageObjectResponse(result) || result.id === pageId) {
            continue;
          }
          const url = result.properties.URL;
          if (url?.type !== "url" || !url.url) {
            continue;
          }
          const candidate = normalizeUrl(url.url);
          if (candidate?.hostname === "news.ycombinator.com") {
            continue;
          }
          if (candidate?.normalized === target.normalized) {
            return true;
          }
        }

        cursor = response.next_cursor ?? undefined;
      } while (cursor);

      return false;
    },

    async listPublic(): Promise<TabOverflowItem[]> {
      return (await queryAll({ property: "Status", select: { equals: "Shelved" } })).map(
        mapPublicPage,
      );
    },

    async update(page: TabOverflowPage, enriched: EnrichedTabOverflowItem): Promise<void> {
      await notion.pages.update({
        page_id: page.id,
        properties: {
          Added: { date: { start: page.created } },
          Author: { select: { name: enriched.author } },
          Categories: {
            multi_select: enriched.categories.map((name) => ({ name })),
          },
          Duplicate: { select: { name: "False" } },
          "Read Time": { number: enriched.readingTimeEstimate },
          Status: { select: { name: "Shelved" } },
          Summary: {
            rich_text: [{ text: { content: enriched.summary }, type: "text" }],
          },
        },
      });
    },
  };
};
