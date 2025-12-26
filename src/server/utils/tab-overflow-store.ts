import type { NotionResponse } from "@/shared/types/notion"

import type { KVNamespace } from "../types/cloudflare"

const TAB_OVERFLOW_CACHE_KEY = "tab-overflow"

export const readTabOverflowFromCache = async (
  kv: KVNamespace
): Promise<NotionResponse[] | null> => {
  const raw = await kv.get(TAB_OVERFLOW_CACHE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as NotionResponse[]
    return parsed
  } catch (error) {
    console.error("Failed to parse cached tab overflow:", error)
    return null
  }
}

export const writeTabOverflowToCache = async (
  kv: KVNamespace,
  tabOverflow: NotionResponse[]
): Promise<void> => {
  await kv.put(TAB_OVERFLOW_CACHE_KEY, JSON.stringify(tabOverflow))
}

export const clearTabOverflowCache = async (kv: KVNamespace): Promise<void> => {
  await kv.delete(TAB_OVERFLOW_CACHE_KEY)
}
