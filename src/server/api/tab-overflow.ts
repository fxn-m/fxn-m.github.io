import type { NotionResponse } from "@/shared/types/notion"

import type { AppConfig } from "../config/app-config"
import { refreshTabOverflowCache } from "../services/notion/tab-overflow-service"
import type { KVNamespace } from "../types/cloudflare"
import { readTabOverflowFromCache } from "../utils/tab-overflow-store"

export const getTabOverflowApi = async (
  config: AppConfig,
  kv: KVNamespace
): Promise<NotionResponse[]> => {
  const cached = await readTabOverflowFromCache(kv)

  if (cached) {
    return cached
  }

  return refreshTabOverflowCache(config, kv)
}

export const refreshTabOverflowApi = async (
  config: AppConfig,
  kv: KVNamespace
): Promise<NotionResponse[]> => {
  return refreshTabOverflowCache(config, kv)
}
