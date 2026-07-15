import { Hono } from "hono";

import type { AppEnvironment } from "../bindings";
import type { TabOverflowModuleFactory } from "./module";

const cacheHeaders = {
  "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
} as const;

export const createTabOverflowRoutes = (createTabOverflow: TabOverflowModuleFactory) => {
  const routes = new Hono<AppEnvironment>();

  routes.get("/", async (context) => {
    const items = await createTabOverflow(context.env).list();
    return context.json(items, 200, cacheHeaders);
  });

  return routes;
};
