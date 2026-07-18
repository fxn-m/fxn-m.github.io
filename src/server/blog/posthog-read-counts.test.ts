import { BLOG_READ_EVENT } from "@/shared";
import { describe, expect, it } from "vitest";

import { createPostHogReadCountSource } from "./posthog-read-counts";

describe("PostHog blog read counts", () => {
  it("queries grouped read events and maps valid result rows", async () => {
    let request: { body: unknown; headers: Headers; method: string; url: string } | undefined;
    const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
      request = {
        body: JSON.parse(String(init?.body)),
        headers: new Headers(init?.headers),
        method: init?.method ?? "GET",
        url: String(input),
      };

      return Response.json({
        results: [
          ["post-1", 12],
          ["post-2", "3"],
          [null, 9],
          ["post-3", "not-a-count"],
        ],
      });
    }) as typeof fetch;

    const source = createPostHogReadCountSource({
      apiHost: "https://eu.posthog.com/",
      fetcher,
      personalApiKey: "phx_secret",
      projectId: "123",
    });

    expect(await source.list()).toEqual({
      "post-1": 12,
      "post-2": 3,
    });
    expect(request).toMatchObject({
      body: {
        query: {
          kind: "HogQLQuery",
          values: { eventName: BLOG_READ_EVENT },
        },
      },
      method: "POST",
      url: "https://eu.posthog.com/api/projects/123/query/",
    });
    expect(request?.headers.get("Authorization")).toBe("Bearer phx_secret");
  });

  it("fails closed when PostHog rejects the query", async () => {
    const source = createPostHogReadCountSource({
      fetcher: (async () => new Response(null, { status: 401 })) as typeof fetch,
      personalApiKey: "bad-key",
      projectId: "123",
    });

    await expect(source.list()).rejects.toThrow("PostHog rejected the read count query with 401.");
  });
});
