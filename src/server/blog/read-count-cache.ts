import { BlogReadCountsSchema, type BlogReadCounts } from "@/shared";

const cacheKey = "blog-read-counts:v1";

type BlogReadCountKv = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<unknown>;
};

export const createBlogReadCountCache = (kv: BlogReadCountKv) => ({
  async read(): Promise<BlogReadCounts | null> {
    const raw = await kv.get(cacheKey);
    if (!raw) {
      return null;
    }

    try {
      const parsed = BlogReadCountsSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  },

  async write(counts: BlogReadCounts): Promise<void> {
    await kv.put(cacheKey, JSON.stringify(counts));
  },
});
