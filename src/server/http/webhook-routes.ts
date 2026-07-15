import { Hono, type Context } from "hono";

import { requireStringBinding, type AppEnvironment, type WorkerBindings } from "../bindings";
import type { FeatureFactories } from "../factories";
import type { EnrichmentJob } from "../jobs/messages";
import { parseNotionWebhook } from "./notion-webhook";

type WebhookConfig = {
  jobType: Extract<EnrichmentJob, { pageId: string }>["type"];
  secretKey: "NOTION_LINKS_WEBHOOK_SECRET" | "NOTION_TAB_OVERFLOW_WEBHOOK_SECRET";
};

export const createWebhookRoutes = (factories: FeatureFactories) => {
  const routes = new Hono<AppEnvironment>();

  const handleWebhook =
    ({ jobType, secretKey }: WebhookConfig) =>
    async (context: Context<AppEnvironment>) => {
      const webhook = await parseNotionWebhook(context.req.raw, () =>
        requireStringBinding(context.env as WorkerBindings, secretKey),
      );

      if (webhook.kind === "verification") {
        return context.json({
          message: "Webhook verification token received",
          verification_token: webhook.token,
        });
      }

      await factories.jobs(context.env).enqueue({
        dataSourceId: webhook.dataSourceId,
        pageId: webhook.pageId,
        type: jobType,
      } as EnrichmentJob);
      return context.json({ message: "Webhook received" }, 202);
    };

  routes.post(
    "/enrich/link",
    handleWebhook({
      jobType: "links.enrich-one",
      secretKey: "NOTION_LINKS_WEBHOOK_SECRET",
    }),
  );
  routes.post(
    "/enrich/tab-overflow",
    handleWebhook({
      jobType: "tab-overflow.enrich-one",
      secretKey: "NOTION_TAB_OVERFLOW_WEBHOOK_SECRET",
    }),
  );

  return routes;
};
