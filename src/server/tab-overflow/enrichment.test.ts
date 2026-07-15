import { describe, expect, it } from "vitest";

import { EnrichedTabOverflowItemSchema } from "./enrichment";

describe("EnrichedTabOverflowItemSchema", () => {
  const validItem = {
    author: "Ada Lovelace",
    categories: ["Engineering"],
    readingTimeEstimate: 4,
    summary: "A useful summary.",
  };

  it("enforces usable text, category bounds, and whole nonnegative minutes", () => {
    expect(EnrichedTabOverflowItemSchema.safeParse(validItem).success).toBe(true);
    expect(EnrichedTabOverflowItemSchema.safeParse({ ...validItem, categories: [] }).success).toBe(
      false,
    );
    expect(
      EnrichedTabOverflowItemSchema.safeParse({ ...validItem, readingTimeEstimate: -1 }).success,
    ).toBe(false);
    expect(
      EnrichedTabOverflowItemSchema.safeParse({ ...validItem, readingTimeEstimate: 1.5 }).success,
    ).toBe(false);
    expect(EnrichedTabOverflowItemSchema.safeParse({ ...validItem, summary: "  " }).success).toBe(
      false,
    );
  });
});
