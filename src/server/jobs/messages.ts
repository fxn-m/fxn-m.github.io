import { z } from "zod";

const itemJobFields = {
  dataSourceId: z.string().optional(),
  pageId: z.string().min(1),
};

export const EnrichmentJobSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("links.enrich-pending") }),
  z.object({ type: z.literal("links.enrich-one"), ...itemJobFields }),
  z.object({ type: z.literal("tab-overflow.enrich-pending") }),
  z.object({ type: z.literal("tab-overflow.enrich-one"), ...itemJobFields }),
]);

export type EnrichmentJob = z.infer<typeof EnrichmentJobSchema>;
