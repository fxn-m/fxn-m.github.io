import type { WorkerBindings } from "../bindings";
import type { FeatureFactories } from "../factories";
import { EnrichmentJobSchema } from "./messages";

export const consumeEnrichmentJobs = async (
  batch: MessageBatch,
  bindings: WorkerBindings,
  factories: FeatureFactories,
): Promise<void> => {
  await Promise.all(
    batch.messages.map(async (message) => {
      const parsed = EnrichmentJobSchema.safeParse(message.body);
      if (!parsed.success) {
        console.error("Discarding invalid enrichment job", {
          issues: parsed.error.issues.map(({ message: issue }) => issue),
        });
        message.ack();
        return;
      }

      const job = parsed.data;
      try {
        switch (job.type) {
          case "links.enrich-one":
            await factories.links(bindings).enrichOne(job);
            break;
          case "links.enrich-pending":
            await factories.links(bindings).enrichPending();
            break;
          case "tab-overflow.enrich-one":
            await factories.tabOverflow(bindings).enrichOne(job);
            break;
          case "tab-overflow.enrich-pending":
            await factories.tabOverflow(bindings).enrichPending();
            break;
        }
        message.ack();
      } catch (error) {
        console.error("Enrichment job failed", {
          errorName: error instanceof Error ? error.name : "UnknownError",
          jobType: job.type,
        });
        message.retry({ delaySeconds: 60 });
      }
    }),
  );
};
