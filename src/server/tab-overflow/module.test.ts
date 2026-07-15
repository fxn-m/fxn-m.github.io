import { describe, expect, it } from "vitest";

import type { TabOverflowItem } from "@/shared";

import { createTabOverflowModule } from "./module";

describe("Tab Overflow module", () => {
  it("fills an empty cache and serves the cached result thereafter", async () => {
    const sourceItems: TabOverflowItem[] = [
      {
        id: "tab-1",
        properties: {
          Name: { title: [{ plain_text: "Deep modules" }] },
        },
      },
    ];
    let cachedItems: TabOverflowItem[] | null = null;
    let notionItems = sourceItems;
    const tabOverflow = createTabOverflowModule({
      cache: {
        read: async () => cachedItems,
        write: async (items) => {
          cachedItems = items;
        },
      },
      createEnricher: () => ({
        enrich: async () => ({
          author: "Unknown",
          categories: [],
          readingTimeEstimate: 0,
          summary: "",
        }),
      }),
      repository: {
        archive: async () => {},
        findPending: async () => [],
        getCategories: async () => [],
        getPage: async () => ({
          created: "2026-07-15",
          hasSummary: false,
          id: "tab-1",
          title: "Deep modules",
          url: "https://example.com/deep-modules",
        }),
        hasDuplicateUrl: async () => false,
        listPublic: async () => notionItems,
        update: async () => {},
      },
    });

    expect(await tabOverflow.list()).toEqual(sourceItems);

    notionItems = [];
    expect(await tabOverflow.list()).toEqual(sourceItems);
  });

  it("treats an already-enriched page as an idempotent success", async () => {
    let cacheRefreshed = false;
    const tabOverflow = createTabOverflowModule({
      cache: {
        read: async () => [],
        write: async () => {
          cacheRefreshed = true;
        },
      },
      createEnricher: () => ({
        enrich: async () => {
          throw new Error("AI should not run twice");
        },
      }),
      repository: {
        archive: async () => {},
        findPending: async () => [],
        getCategories: async () => [],
        getPage: async () => ({
          created: "2026-07-15",
          hasSummary: true,
          id: "tab-1",
          title: "Deep modules",
          url: "https://example.com/deep-modules",
        }),
        hasDuplicateUrl: async () => false,
        listPublic: async () => [],
        update: async () => {},
      },
    });

    await expect(tabOverflow.enrichOne({ pageId: "tab-1" })).resolves.toBeUndefined();
    expect(cacheRefreshed).toBe(true);
  });
});
