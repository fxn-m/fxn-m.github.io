import { createApp } from "./app";
import type { WorkerBindings } from "./bindings";
import { type FeatureFactories, productionFeatureFactories } from "./factories";
import { consumeEnrichmentJobs } from "./jobs/consumer";
import type { EnrichmentJob } from "./jobs/messages";

export const createWorker = (
  overrides: Partial<FeatureFactories> = {},
): ExportedHandler<WorkerBindings, EnrichmentJob> => {
  const factories = { ...productionFeatureFactories, ...overrides };
  const app = createApp(factories);

  return {
    async fetch(request, env, context) {
      return await app.fetch(request, env, context);
    },

    queue: (batch, env) => consumeEnrichmentJobs(batch, env, factories),

    async scheduled(controller, env) {
      const items = await factories.tabOverflow(env).refresh();
      console.log("Tab Overflow cache refreshed", {
        count: items.length,
        cron: controller.cron,
      });
    },
  };
};

export default createWorker();
