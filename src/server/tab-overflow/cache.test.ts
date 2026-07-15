import { describe, expect, it } from "vitest";

import { createTabOverflowCache } from "./cache";

describe("Tab Overflow cache", () => {
  it("treats malformed cached data as a cache miss", async () => {
    const cache = createTabOverflowCache({
      get: async () => "not-json",
      put: async () => {},
    });

    expect(await cache.read()).toBeNull();
  });
});
