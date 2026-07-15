import type { WorkerBindings } from "../bindings";
import type { EnrichmentJob } from "./messages";

export type JobDispatcher = {
  enqueue(job: EnrichmentJob): Promise<void>;
};

export type JobDispatcherFactory = (bindings: WorkerBindings) => JobDispatcher;

export const createProductionJobDispatcher: JobDispatcherFactory = (bindings) => ({
  async enqueue(job) {
    await bindings.ENRICHMENT_QUEUE.send(job);
  },
});
