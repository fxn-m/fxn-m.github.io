import { TabOverflowItemsSchema, type TabOverflowItem } from "@/shared";

const cacheKey = "tab-overflow";

type TabOverflowKv = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<unknown>;
};

export const createTabOverflowCache = (kv: TabOverflowKv) => ({
  async read(): Promise<TabOverflowItem[] | null> {
    const raw = await kv.get(cacheKey);
    if (!raw) {
      return null;
    }

    try {
      const parsed = TabOverflowItemsSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  },

  async write(items: TabOverflowItem[]): Promise<void> {
    await kv.put(cacheKey, JSON.stringify(items));
  },
});
