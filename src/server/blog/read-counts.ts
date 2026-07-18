import type { BlogReadCounts } from "@/shared";

import { requireStringBinding, type WorkerBindings } from "../bindings";
import { createBlogReadCountCache } from "./read-count-cache";
import { createPostHogReadCountSource } from "./posthog-read-counts";

type BlogReadCountCache = {
  read(): Promise<BlogReadCounts | null>;
  write(counts: BlogReadCounts): Promise<void>;
};

type BlogReadCountSource = {
  list(): Promise<BlogReadCounts>;
};

type BlogReadCountDependencies = {
  cache: BlogReadCountCache;
  source: BlogReadCountSource;
};

export type BlogReadCountModule = {
  get(postId: string): Promise<number>;
  refresh(): Promise<BlogReadCounts>;
};

export type BlogReadCountModuleFactory = (bindings: WorkerBindings) => BlogReadCountModule;

export const createBlogReadCountModule = ({
  cache,
  source,
}: BlogReadCountDependencies): BlogReadCountModule => {
  const refresh = async () => {
    const counts = await source.list();
    await cache.write(counts);
    return counts;
  };

  return {
    async get(postId) {
      const counts = (await cache.read()) ?? (await refresh());
      return counts[postId] ?? 0;
    },
    refresh,
  };
};

export const createProductionBlogReadCountModule: BlogReadCountModuleFactory = (bindings) =>
  createBlogReadCountModule({
    cache: createBlogReadCountCache(bindings.TAB_OVERFLOW_KV),
    source: createPostHogReadCountSource({
      personalApiKey: requireStringBinding(bindings, "POSTHOG_PERSONAL_API_KEY"),
      projectId: requireStringBinding(bindings, "POSTHOG_PROJECT_ID"),
    }),
  });
