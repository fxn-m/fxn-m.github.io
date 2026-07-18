import { BLOG_READ_EVENT, type BlogReadCounts } from "@/shared";

type PostHogReadCountConfig = {
  apiHost?: string;
  fetcher?: typeof fetch;
  personalApiKey: string;
  projectId: string;
};

type PostHogQueryResponse = {
  results?: unknown;
};

const isCount = (value: unknown): value is number | string =>
  (typeof value === "number" && Number.isFinite(value)) ||
  (typeof value === "string" && value.length > 0);

export const createPostHogReadCountSource = ({
  apiHost = "https://eu.posthog.com",
  fetcher = fetch,
  personalApiKey,
  projectId,
}: PostHogReadCountConfig) => ({
  async list(): Promise<BlogReadCounts> {
    const response = await fetcher(
      `${apiHost.replace(/\/$/, "")}/api/projects/${encodeURIComponent(projectId)}/query/`,
      {
        body: JSON.stringify({
          query: {
            kind: "HogQLQuery",
            query: `
              SELECT properties.post_id AS post_id, count() AS reads
              FROM events
              WHERE event = {eventName}
                AND properties.post_id IS NOT NULL
              GROUP BY post_id
            `,
            values: {
              eventName: BLOG_READ_EVENT,
            },
          },
        }),
        headers: {
          Authorization: `Bearer ${personalApiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      throw new Error(`PostHog rejected the read count query with ${response.status}.`);
    }

    const payload = (await response.json()) as PostHogQueryResponse;
    if (!Array.isArray(payload.results)) {
      throw new Error("PostHog returned an invalid read count response.");
    }

    const counts: BlogReadCounts = {};
    for (const row of payload.results) {
      if (!Array.isArray(row) || typeof row[0] !== "string" || !isCount(row[1])) {
        continue;
      }

      const reads = Number(row[1]);
      if (Number.isSafeInteger(reads) && reads >= 0) {
        counts[row[0]] = reads;
      }
    }

    return counts;
  },
});
