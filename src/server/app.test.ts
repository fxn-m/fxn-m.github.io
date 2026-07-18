import { describe, expect, it } from "vitest";

import { createApp } from "./app";

describe("system routes", () => {
  it("answers health checks without integration bindings", async () => {
    const response = await createApp().request("/ping");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: "pong" });
  });

  it("returns a generic JSON error without exposing integration details", async () => {
    const app = createApp({
      blog: () => ({
        getPostMarkdown: async () => "",
        listPublishedPosts: async () => {
          throw new Error("super-secret-provider-detail");
        },
        listPreviewPosts: async () => [],
        triggerBuild: async () => {},
      }),
    });

    const response = await app.request("/blog");

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ message: "Internal Server Error" });
  });

  it("does not route the retired Spotify or Strava integrations", async () => {
    const app = createApp();
    const [spotify, strava] = await Promise.all([
      app.request("/spotify/current-track"),
      app.request("/strava/activities"),
    ]);

    expect([spotify.status, strava.status]).toEqual([404, 404]);
  });
});

describe("blog routes", () => {
  it("returns the published blog index", async () => {
    const app = createApp({
      blog: () => ({
        getPostMarkdown: async () => "",
        listPublishedPosts: async () => [
          {
            date: "2026-07-15",
            id: "post-1",
            slug: "deep-modules",
            title: "Deep Modules",
          },
        ],
        listPreviewPosts: async () => [],
        triggerBuild: async () => {},
      }),
    });

    const response = await app.request("/blog");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      {
        date: "2026-07-15",
        id: "post-1",
        slug: "deep-modules",
        title: "Deep Modules",
      },
    ]);
  });

  it("returns markdown for a URL-encoded post id", async () => {
    const app = createApp({
      blog: () => ({
        getPostMarkdown: async (id) => `# ${id}`,
        listPublishedPosts: async () => [],
        listPreviewPosts: async () => [],
        triggerBuild: async () => {},
      }),
    });

    const response = await app.request("/blog/post%20one");

    expect(response.status).toBe(200);
    expect(await response.json()).toBe("# post one");
  });

  it("returns a cached read count for a blog post", async () => {
    const app = createApp({
      blogReadCounts: () => ({
        get: async (postId) => (postId === "post one" ? 42 : 0),
        refresh: async () => ({}),
      }),
    });

    const response = await app.request("/blog/post%20one/reads");

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=300, s-maxage=3600, stale-while-revalidate=3600",
    );
    expect(await response.json()).toEqual({ reads: 42 });
  });

  it("does not expose drafts through the public development query", async () => {
    const app = createApp({
      blog: () => ({
        getPostMarkdown: async () => "",
        listPublishedPosts: async () => [
          {
            date: "2026-07-15",
            id: "post-1",
            slug: "published",
            title: "Published",
          },
        ],
        listPreviewPosts: async () => [],
        triggerBuild: async () => {},
      }),
    });

    const response = await app.request("/blog?development=true");

    expect(await response.json()).toEqual([
      {
        date: "2026-07-15",
        id: "post-1",
        slug: "published",
        title: "Published",
      },
    ]);
  });

  it("does not expose the preview index unless local preview mode is enabled", async () => {
    const app = createApp({
      blog: () => ({
        getPostMarkdown: async () => "",
        listPublishedPosts: async () => [],
        listPreviewPosts: async () => {
          throw new Error("Disabled preview routes must not query Notion");
        },
        triggerBuild: async () => {},
      }),
    });

    const response = await app.request("/blog/preview");

    expect(response.status).toBe(404);
  });

  it("returns published posts and drafts from the local preview index", async () => {
    const app = createApp({
      blog: () => ({
        getPostMarkdown: async () => "",
        listPublishedPosts: async () => [],
        listPreviewPosts: async () => [
          {
            date: "2026-07-15",
            id: "post-1",
            slug: "published",
            title: "Published",
          },
          {
            date: "2026-07-17",
            id: "post-2",
            slug: "draft",
            title: "Draft",
          },
        ],
        triggerBuild: async () => {},
      }),
    });

    const response = await app.request("/blog/preview", undefined, {
      BLOG_PREVIEW: "true",
    } as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      {
        date: "2026-07-15",
        id: "post-1",
        slug: "published",
        title: "Published",
      },
      {
        date: "2026-07-17",
        id: "post-2",
        slug: "draft",
        title: "Draft",
      },
    ]);
  });

  it("returns draft markdown through the local preview route", async () => {
    const app = createApp({
      blog: () => ({
        getPostMarkdown: async (id) => `# ${id}`,
        listPublishedPosts: async () => [],
        listPreviewPosts: async () => [],
        triggerBuild: async () => {},
      }),
    });

    const response = await app.request("/blog/preview/post%20two", undefined, {
      BLOG_PREVIEW: "true",
    } as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toBe("# post two");
  });
});

describe("Tab Overflow routes", () => {
  it("returns cached items with the public cache policy", async () => {
    const app = createApp({
      tabOverflow: () => ({
        enrichOne: async () => {},
        enrichPending: async () => {},
        list: async () => [
          {
            id: "tab-1",
            properties: {
              Name: { title: [{ plain_text: "Readable systems" }] },
              URL: { url: "https://example.com/readable-systems" },
            },
          },
        ],
        refresh: async () => [],
      }),
    });

    const response = await app.request("/tab-overflow");

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
    );
    expect(await response.json()).toEqual([
      {
        id: "tab-1",
        properties: {
          Name: { title: [{ plain_text: "Readable systems" }] },
          URL: { url: "https://example.com/readable-systems" },
        },
      },
    ]);
  });
});

describe("admin routes", () => {
  it("rejects requests without the configured bearer token", async () => {
    const response = await createApp().request("/admin/tab-overflow/enrich", { method: "POST" }, {
      ADMIN_API_TOKEN: "admin-secret",
    } as never);

    expect(response.status).toBe(401);
  });

  it("queues authenticated batch enrichment requests", async () => {
    let queuedJob: unknown;
    const app = createApp({
      jobs: () => ({
        enqueue: async (job) => {
          queuedJob = job;
        },
      }),
    });

    const response = await app.request(
      "/admin/links/enrich",
      {
        headers: { Authorization: "Bearer admin-secret" },
        method: "POST",
      },
      { ADMIN_API_TOKEN: "admin-secret" } as never,
    );

    expect(response.status).toBe(202);
    expect(queuedJob).toEqual({ type: "links.enrich-pending" });
  });
});

describe("Notion webhooks", () => {
  it("verifies a signed Tab Overflow event and queues enrichment", async () => {
    const body = JSON.stringify({
      data: { parent: { data_source_id: "source-1" } },
      entity: { id: "page-1" },
    });
    const secret = "notion-webhook-secret";
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { hash: "SHA-256", name: "HMAC" },
      false,
      ["sign"],
    );
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    const signature = `sha256=${[...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")}`;
    let queuedJob: unknown;
    const app = createApp({
      jobs: () => ({
        enqueue: async (job) => {
          queuedJob = job;
        },
      }),
    });

    const response = await app.request(
      "/notion/webhooks/enrich/tab-overflow",
      {
        body,
        headers: {
          "Content-Type": "application/json",
          "X-Notion-Signature": signature,
        },
        method: "POST",
      },
      { NOTION_TAB_OVERFLOW_WEBHOOK_SECRET: secret } as never,
    );

    expect(response.status).toBe(202);
    expect(queuedJob).toEqual({
      dataSourceId: "source-1",
      pageId: "page-1",
      type: "tab-overflow.enrich-one",
    });
  });

  it("rejects an invalid event signature", async () => {
    const app = createApp({
      jobs: () => ({
        enqueue: async () => {
          throw new Error("An invalid webhook must not queue work");
        },
      }),
    });
    const response = await app.request(
      "/notion/webhooks/enrich/link",
      {
        body: JSON.stringify({ entity: { id: "page-1" } }),
        headers: {
          "Content-Type": "application/json",
          "X-Notion-Signature": "sha256=invalid",
        },
        method: "POST",
      },
      { NOTION_LINKS_WEBHOOK_SECRET: "notion-webhook-secret" } as never,
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: "Invalid webhook signature" });
  });

  it("accepts the one-time verification payload before a secret is configured", async () => {
    const app = createApp();
    const response = await app.request("/notion/webhooks/enrich/link", {
      body: JSON.stringify({ verification_token: "verification-secret" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Webhook verification token received",
      verification_token: "verification-secret",
    });
  });
});
