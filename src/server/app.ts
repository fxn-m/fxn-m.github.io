import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

import type { AppEnvironment } from "./bindings";
import { createBlogRoutes } from "./blog/routes";
import { type FeatureFactories, productionFeatureFactories } from "./factories";
import { createAdminRoutes } from "./http/admin-routes";
import { createWebhookRoutes } from "./http/webhook-routes";
import { createTabOverflowRoutes } from "./tab-overflow/routes";

export const createApp = (overrides: Partial<FeatureFactories> = {}) => {
  const factories = { ...productionFeatureFactories, ...overrides };
  const app = new Hono<AppEnvironment>();
  const publicCors = cors({
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "HEAD", "OPTIONS"],
    origin: "*",
  });

  app.use("/", publicCors);
  app.use("/ping", publicCors);
  app.use("/blog", publicCors);
  app.use("/blog/*", publicCors);
  app.use("/tab-overflow", publicCors);

  app.get("/", (context) =>
    context.json({
      message: "Hey... whatcha doin' there?",
    }),
  );
  app.get("/ping", (context) => context.json({ message: "pong" }));
  app.route("/blog", createBlogRoutes(factories.blog));
  app.route("/tab-overflow", createTabOverflowRoutes(factories.tabOverflow));
  app.route("/admin", createAdminRoutes(factories));
  app.route("/notion/webhooks", createWebhookRoutes(factories));

  app.notFound((context) => context.json({ message: "Not Found" }, 404));
  app.onError((error, context) => {
    if (error instanceof HTTPException) {
      return context.json({ message: error.message }, error.status);
    }

    console.error("Request failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      method: context.req.method,
      path: context.req.path,
    });
    return context.json({ message: "Internal Server Error" }, 500);
  });

  return app;
};
