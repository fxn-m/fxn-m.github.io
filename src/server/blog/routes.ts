import { Hono } from "hono";

import type { AppEnvironment } from "../bindings";
import type { BlogModuleFactory } from "./module";

export const createBlogRoutes = (createBlog: BlogModuleFactory) => {
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

  routes.get("/:id", async (context) => {
    const markdown = await createBlog(context.env).getPostMarkdown(context.req.param("id"));
    return context.json(markdown);
  });

  return routes;
};
