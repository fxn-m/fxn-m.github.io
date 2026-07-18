import { describe, expect, it } from "vitest";

import { createWorker } from "./worker";

describe("Worker events", () => {
  it("refreshes public caches on the scheduled event", async () => {
    let readCountsRefreshed = false;
    let tabOverflowRefreshed = false;
    const worker = createWorker({
      blogReadCounts: () => ({
        get: async () => 0,
        refresh: async () => {
          readCountsRefreshed = true;
          return {};
        },
      }),
      tabOverflow: () => ({
        enrichOne: async () => {},
        enrichPending: async () => {},
        list: async () => [],
        refresh: async () => {
          tabOverflowRefreshed = true;
          return [];
        },
      }),
    });

    await worker.scheduled?.(
      { cron: "0 * * * *", scheduledTime: Date.now() } as never,
      {} as never,
      { passThroughOnException: () => {}, props: {}, waitUntil: () => {} } as never,
    );

    expect({ readCountsRefreshed, tabOverflowRefreshed }).toEqual({
      readCountsRefreshed: true,
      tabOverflowRefreshed: true,
    });
  });

  it("acknowledges a successfully processed enrichment job", async () => {
    let acknowledged = false;
    let enrichedPageId: string | undefined;
    let retried = false;
    const worker = createWorker({
      links: () => ({
        enrichOne: async ({ pageId }) => {
          enrichedPageId = pageId;
        },
        enrichPending: async () => {},
      }),
    });

    await worker.queue?.(
      {
        messages: [
          {
            ack: () => {
              acknowledged = true;
            },
            body: { pageId: "link-1", type: "links.enrich-one" },
            retry: () => {
              retried = true;
            },
          },
        ],
      } as never,
      {} as never,
      { passThroughOnException: () => {}, props: {}, waitUntil: () => {} } as never,
    );

    expect({ acknowledged, enrichedPageId, retried }).toEqual({
      acknowledged: true,
      enrichedPageId: "link-1",
      retried: false,
    });
  });

  it("retries a failed enrichment job without acknowledging it", async () => {
    let acknowledged = false;
    let retryOptions: unknown;
    const worker = createWorker({
      links: () => ({
        enrichOne: async () => {
          throw new Error("provider unavailable");
        },
        enrichPending: async () => {},
      }),
    });

    await worker.queue?.(
      {
        messages: [
          {
            ack: () => {
              acknowledged = true;
            },
            body: { pageId: "link-1", type: "links.enrich-one" },
            retry: (options: unknown) => {
              retryOptions = options;
            },
          },
        ],
      } as never,
      {} as never,
      { passThroughOnException: () => {}, props: {}, waitUntil: () => {} } as never,
    );

    expect({ acknowledged, retryOptions }).toEqual({
      acknowledged: false,
      retryOptions: { delaySeconds: 60 },
    });
  });
});
