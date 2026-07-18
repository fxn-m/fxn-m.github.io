import { NotionConverter } from "notion-to-md";
import { DefaultExporter } from "notion-to-md/plugins/exporter";
import { MDXRenderer } from "notion-to-md/plugins/renderer";
import slugify from "slugify";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import type { BlogPost } from "../../shared";

import { createNotionClient, resolveDataSourceId } from "../notion/client";

type NotionBlogRepositoryConfig = {
  dataSourceId: string;
  token: string;
};

const isPageObjectResponse = (page: unknown): page is PageObjectResponse =>
  typeof page === "object" && page !== null && "properties" in page;

export const createNotionBlogRepository = ({ dataSourceId, token }: NotionBlogRepositoryConfig) => {
  const notion = createNotionClient(token);

  const listPosts = async (includeDrafts: boolean): Promise<BlogPost[]> => {
    const resolvedDataSourceId = await resolveDataSourceId(notion, dataSourceId, {
      envKey: "NOTION_BLOG_DATA_SOURCE_ID",
      label: "Blog",
    });
    const pages: BlogPost[] = [];
    let cursor: string | undefined;

    do {
      const response = await notion.dataSources.query({
        data_source_id: resolvedDataSourceId,
        filter: includeDrafts
          ? {
              or: [
                { property: "Status", status: { equals: "Published" } },
                { property: "Status", status: { equals: "Draft" } },
              ],
            }
          : { property: "Status", status: { equals: "Published" } },
        start_cursor: cursor,
      });

      for (const page of response.results) {
        if (!isPageObjectResponse(page)) {
          continue;
        }
        const titleProperty = page.properties.Title;
        const title =
          titleProperty?.type === "title" && titleProperty.title.length > 0
            ? (titleProperty.title[0].plain_text ?? "Untitled")
            : "Untitled";
        const dateProperty = page.properties.Date;
        const date =
          dateProperty?.type === "date" && dateProperty.date?.start
            ? dateProperty.date.start
            : "Unknown";

        pages.push({
          date,
          id: page.id,
          slug: slugify(title, {
            locale: "en",
            lower: true,
            replacement: "-",
            strict: true,
          }),
          title,
        });
      }

      cursor = response.next_cursor ?? undefined;
    } while (cursor);

    return pages;
  };

  return {
    async getPostMarkdown(blockId: string): Promise<string> {
      const buffer: Record<string, string> = {};
      const exporter = new DefaultExporter({ outputType: "buffer", buffer });
      const renderer = new MDXRenderer({
        frontmatter: {
          include: ["Title", "Date", "Tags"],
        },
      });
      const converter = new NotionConverter(notion)
        .configureFetcher({ fetchPageProperties: true })
        .withExporter(exporter)
        .withRenderer(renderer);

      await converter.convert(blockId);

      const markdown = buffer[blockId];
      if (typeof markdown !== "string") {
        throw new Error(`Notion did not return markdown for blog post ${blockId}.`);
      }
      return markdown;
    },

    listPreviewPosts(): Promise<BlogPost[]> {
      return listPosts(true);
    },

    listPublishedPosts(): Promise<BlogPost[]> {
      return listPosts(false);
    },
  };
};
