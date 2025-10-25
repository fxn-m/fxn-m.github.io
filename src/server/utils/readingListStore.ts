import type { NotionResponse } from "@/shared/types/notion"

import type { KVNamespace } from "../types/cloudflare"

const READING_LIST_CACHE_KEY = "reading-list"

export const readReadingListFromCache = async (
  kv: KVNamespace
): Promise<NotionResponse[] | null> => {
  const raw = await kv.get(READING_LIST_CACHE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as NotionResponse[]
    return parsed
  } catch (error) {
    console.error("Failed to parse cached reading list:", error)
    return null
  }
}

export const writeReadingListToCache = async (
  kv: KVNamespace,
  readingList: NotionResponse[]
): Promise<void> => {
  await kv.put(READING_LIST_CACHE_KEY, JSON.stringify(readingList))
}

export const clearReadingListCache = async (kv: KVNamespace): Promise<void> => {
  await kv.delete(READING_LIST_CACHE_KEY)
}
