import { Hono } from "hono";

import type { AppEnvironment } from "../bindings";
import type { BlogModuleFactory } from "./module";

export const createBlogRoutes = (createBlog: BlogModuleFactory) => {
  const routes = new Hono<AppEnvironment>();

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
