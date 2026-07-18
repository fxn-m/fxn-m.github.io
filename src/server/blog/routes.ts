import { Hono } from "hono";

import type { AppEnvironment } from "../bindings";
import type { BlogModuleFactory } from "./module";
import type { BlogReadCountModuleFactory } from "./read-counts";

const readCountCacheHeaders = {
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=3600",
} as const;

export const createBlogRoutes = (
  createBlog: BlogModuleFactory,
  createReadCounts: BlogReadCountModuleFactory,
) => {
  const routes = new Hono<AppEnvironment>();

  routes.get("/preview", async (context) => {
    if (context.env?.BLOG_PREVIEW !== "true") {
      return context.notFound();
    }

    const posts = await createBlog(context.env).listPreviewPosts();
    return context.json(posts);
  });

  routes.get("/preview/:id", async (context) => {
    if (context.env?.BLOG_PREVIEW !== "true") {
      return context.notFound();
    }

    const markdown = await createBlog(context.env).getPostMarkdown(context.req.param("id"));
    return context.json(markdown);
  });

  routes.get("/", async (context) => {
    const posts = await createBlog(context.env).listPublishedPosts();
    return context.json(posts);
  });

  routes.get("/:id/reads", async (context) => {
    const reads = await createReadCounts(context.env).get(context.req.param("id"));
    return context.json({ reads }, 200, readCountCacheHeaders);
  });

  routes.get("/:id", async (context) => {
    const markdown = await createBlog(context.env).getPostMarkdown(context.req.param("id"));
    return context.json(markdown);
  });

  return routes;
};
