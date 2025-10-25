import type { NotionResponse } from "@/shared/types/notion"

import type { AppConfig } from "../config/appConfig"
import { refreshReadingListCache } from "../services/notionService"
import type { KVNamespace } from "../types/cloudflare"
import { readReadingListFromCache } from "../utils/readingListStore"

export const getReadingListApi = async (
  config: AppConfig,
  kv: KVNamespace
): Promise<NotionResponse[]> => {
  const cached = await readReadingListFromCache(kv)

  if (cached) {
    return cached
  }

  return refreshReadingListCache(config, kv)
}

export const refreshReadingListApi = async (
  config: AppConfig,
  kv: KVNamespace
): Promise<NotionResponse[]> => {
  return refreshReadingListCache(config, kv)
}
