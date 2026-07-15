import { describe, expect, it } from "vitest";

import { createLinksModule } from "./module";

describe("Links module", () => {
  it("treats an already-enriched link as an idempotent success", async () => {
    const links = createLinksModule({
      createEnricher: () => ({
        enrich: async () => {
          throw new Error("AI should not run twice");
        },
      }),
      repository: {
        findPending: async () => [],
        getCategories: async () => [],
        getPage: async () => ({
          created: "2026-07-15",
          hasSummary: true,
          id: "link-1",
          title: "Deep modules",
          url: "https://example.com/deep-modules",
        }),
        update: async () => {},
      },
    });

    await expect(links.enrichOne({ pageId: "link-1" })).resolves.toBeUndefined();
  });
});
