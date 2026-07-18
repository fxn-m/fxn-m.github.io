import type { EnrichmentJob } from "./jobs/messages";

export type WorkerBindings = {
  ADMIN_API_TOKEN: string;
  BLOG_PREVIEW?: string;
  ENRICHMENT_QUEUE: Queue<EnrichmentJob>;
  GITHUB_REPO_DISPATCH_TOKEN: string;
  GOOGLE_GENERATIVE_AI_API_KEY: string;
  NOTION_BLOG_DATA_SOURCE_ID: string;
  NOTION_BLOG_SECRET: string;
  NOTION_LINKS_DATA_SOURCE_ID: string;
  NOTION_LINKS_SECRET: string;
  NOTION_LINKS_WEBHOOK_SECRET: string;
  NOTION_TAB_OVERFLOW_DATA_SOURCE_ID: string;
  NOTION_TAB_OVERFLOW_SECRET: string;
  NOTION_TAB_OVERFLOW_WEBHOOK_SECRET: string;
  TAB_OVERFLOW_KV: KVNamespace;
};

export type AppEnvironment = {
  Bindings: WorkerBindings;
};

export const requireStringBinding = <Key extends keyof WorkerBindings>(
  bindings: WorkerBindings,
  key: Key,
): string => {
  const value = bindings[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required Worker binding: ${String(key)}`);
  }
  return value;
};
