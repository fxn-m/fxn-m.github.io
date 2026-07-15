import { describe, expect, it } from "vitest";

import { EnrichedLinkSchema } from "./enrichment";

describe("EnrichedLinkSchema", () => {
  it("enforces usable summaries and one to three non-empty categories", () => {
    expect(
      EnrichedLinkSchema.safeParse({ categories: ["Engineering"], summary: "A useful summary." })
        .success,
    ).toBe(true);
    expect(
      EnrichedLinkSchema.safeParse({ categories: [], summary: "A useful summary." }).success,
    ).toBe(false);
    expect(
      EnrichedLinkSchema.safeParse({
        categories: ["One", "Two", "Three", "Four"],
        summary: "Valid",
      }).success,
    ).toBe(false);
    expect(EnrichedLinkSchema.safeParse({ categories: ["  "], summary: "  " }).success).toBe(false);
  });
});
