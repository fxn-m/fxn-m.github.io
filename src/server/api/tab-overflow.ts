import type { TabOverflowItem } from "@/shared/types/tab-overflow";

import type { AppConfig } from "../config/app-config";
import { refreshTabOverflowCache } from "../services/notion";
import type { KVNamespace } from "../types/cloudflare";
import { readTabOverflowFromCache } from "../utils/tab-overflow-store";

export const getTabOverflowApi = async (
  config: AppConfig,
  kv: KVNamespace,
): Promise<TabOverflowItem[]> => {
  const cached = await readTabOverflowFromCache(kv);

  if (cached) {
    return cached as TabOverflowItem[];
  }

  return (await refreshTabOverflowCache(config, kv)) as TabOverflowItem[];
};

export const refreshTabOverflowApi = async (
  config: AppConfig,
  kv: KVNamespace,
): Promise<TabOverflowItem[]> => {
  return (await refreshTabOverflowCache(config, kv)) as TabOverflowItem[];
};
