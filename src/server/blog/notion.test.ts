import { afterEach, describe, expect, it, vi } from "vitest";

import { createNotionBlogRepository } from "./notion";

afterEach(() => vi.restoreAllMocks());

describe("Notion blog slugs", () => {
  it.each([false, true])("reads optional Text slugs (preview: %s)", async (preview) => {
    const properties = [
      { type: "rich_text", rich_text: [{ plain_text: " My " }, { plain_text: "Custom Slug " }] },
      { type: "rich_text", rich_text: [] },
      { type: "rich_text", rich_text: [{ plain_text: "   " }] },
      undefined,
      { type: "rich_text", rich_text: [{ plain_text: "../../" }] },
    ];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      return Response.json(
        url.endsWith("/query")
          ? {
              results: properties.map((Slug, index) => ({
                id: `post-${index}`,
                properties: {
                  Title: { type: "title", title: [{ plain_text: "Title Fallback" }] },
                  Date: { type: "date", date: { start: "2026-09-13" } },
                  ...(Slug ? { Slug } : {}),
                },
              })),
              next_cursor: null,
            }
          : { id: "slug-test-source" },
      );
    });
    const repository = createNotionBlogRepository({
      dataSourceId: "slug-test-source",
      token: "test",
    });
    const posts = await (preview ? repository.listPreviewPosts() : repository.listPublishedPosts());
    expect(posts.map((post) => post.slug)).toEqual([
      "my-custom-slug",
      "title-fallback",
      "title-fallback",
      "title-fallback",
      "title-fallback",
    ]);
  });
});
