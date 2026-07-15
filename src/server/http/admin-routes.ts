import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";

import { requireStringBinding, type AppEnvironment } from "../bindings";
import type { FeatureFactories } from "../factories";

export const createAdminRoutes = (factories: FeatureFactories) => {
  const routes = new Hono<AppEnvironment>();

  routes.use("*", async (context, next) =>
    bearerAuth<AppEnvironment>({
      token: requireStringBinding(context.env, "ADMIN_API_TOKEN"),
    })(context, next),
  );

  routes.post("/blog/build", async (context) => {
    await factories.blog(context.env).triggerBuild();
    return context.json({ message: "Blog build triggered" }, 202);
  });

  routes.post("/links/enrich", async (context) => {
    await factories.jobs(context.env).enqueue({ type: "links.enrich-pending" });
    return context.json({ message: "Links enrichment queued" }, 202);
  });

  routes.post("/tab-overflow/enrich", async (context) => {
    await factories.jobs(context.env).enqueue({ type: "tab-overflow.enrich-pending" });
    return context.json({ message: "Tab Overflow enrichment queued" }, 202);
  });

  routes.post("/tab-overflow/refresh", async (context) => {
    const items = await factories.tabOverflow(context.env).refresh();
    return context.json({ count: items.length, message: "Tab Overflow cache refreshed" });
  });

  return routes;
};
