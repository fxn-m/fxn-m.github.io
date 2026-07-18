import { describe, expect, it } from "vitest";

import { createBlogReadCountModule } from "./read-counts";

describe("blog read counts", () => {
  it("serves counts from the cache without querying PostHog", async () => {
    let sourceCalls = 0;
    const module = createBlogReadCountModule({
      cache: {
        read: async () => ({ "post-1": 12 }),
        write: async () => {},
      },
      source: {
        list: async () => {
          sourceCalls += 1;
          return {};
        },
      },
    });

    expect(await module.get("post-1")).toBe(12);
    expect(sourceCalls).toBe(0);
  });

  it("refreshes an empty cache and returns zero for an unread post", async () => {
    let cached: Record<string, number> | null = null;
    const module = createBlogReadCountModule({
      cache: {
        read: async () => cached,
        write: async (counts) => {
          cached = counts;
        },
      },
      source: {
        list: async () => ({ "post-1": 7 }),
      },
    });

    expect(await module.get("post-2")).toBe(0);
    expect(cached).toEqual({ "post-1": 7 });
  });
});
