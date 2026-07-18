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
      const readCountRefresh = Promise.resolve()
        .then(() => factories.blogReadCounts(env).refresh())
        .catch((error: unknown) => {
          console.error("Blog read count refresh failed", {
            errorName: error instanceof Error ? error.name : "UnknownError",
          });
          return null;
        });
      const [items, readCounts] = await Promise.all([
        factories.tabOverflow(env).refresh(),
        readCountRefresh,
      ]);
      console.log("Tab Overflow cache refreshed", {
        count: items.length,
        cron: controller.cron,
      });
      if (readCounts) {
        console.log("Blog read count cache refreshed", {
          count: Object.keys(readCounts).length,
          cron: controller.cron,
        });
      }
    },
  };
};

export default createWorker();
