import { z } from "zod";

import { createNotionClient, resolveDataSourceId } from "../notion/client";
import { extractPropertyConfig, parseCategoriesProperty } from "../notion/properties";
import type { EnrichedLink, LinkPage } from "./module";

type NotionLinksConfig = {
  dataSourceId: string;
  token: string;
};

const LinkPageSchema = z.object({
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

export const createNotionLinksRepository = ({
  dataSourceId: defaultDataSourceId,
  token,
}: NotionLinksConfig) => {
  const notion = createNotionClient(token);

  const resolveSource = async (dataSourceId?: string) => {
    const candidates = [
      ...new Set([dataSourceId, defaultDataSourceId].filter(Boolean)),
    ] as string[];
    let lastError: unknown;

    for (const candidate of candidates) {
      try {
        return await resolveDataSourceId(notion, candidate, {
          envKey: "NOTION_LINKS_DATA_SOURCE_ID",
          label: "Links",
        });
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("Unable to resolve the Links data source.");
  };

  return {
    async findPending(): Promise<string[]> {
      const ids: string[] = [];
      let cursor: string | undefined;

      do {
        const response = await notion.dataSources.query({
          data_source_id: await resolveSource(),
          filter: { property: "Summary", rich_text: { is_empty: true } },
          start_cursor: cursor,
        });
        ids.push(
          ...response.results.flatMap((item) =>
            typeof item === "object" && item !== null && "id" in item ? [item.id] : [],
          ),
        );
        cursor = response.next_cursor ?? undefined;
      } while (cursor);

      return ids;
    },

    async getCategories(dataSourceId?: string): Promise<string[]> {
      const resolvedId = await resolveSource(dataSourceId);
      const response = await notion.dataSources.retrieve({ data_source_id: resolvedId });
      const properties = extractPropertyConfig(response);
      const categories = properties ? parseCategoriesProperty(properties) : null;
      if (!categories?.length) {
        throw new Error(`Links source ${resolvedId} has no Categories options.`);
      }
      return categories;
    },

    async getPage(pageId: string): Promise<LinkPage> {
      const page = LinkPageSchema.parse(await notion.pages.retrieve({ page_id: pageId }));
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

    async update(pageId: string, enriched: EnrichedLink): Promise<void> {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          Categories: {
            multi_select: enriched.categories.map((name) => ({ name })),
          },
          Summary: {
            rich_text: [{ text: { content: enriched.summary }, type: "text" }],
          },
        },
      });
    },
  };
};
