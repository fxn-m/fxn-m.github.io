import { z } from "zod";

export const BlogPostSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  date: z.string().min(1),
  slug: z.string().min(1),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;

export const BlogPostsSchema = z.array(BlogPostSchema);

export const BlogReadCountSchema = z.object({
  reads: z.number().int().nonnegative(),
});

export type BlogReadCount = z.infer<typeof BlogReadCountSchema>;

export const BlogReadCountsSchema = z.record(z.string(), z.number().int().nonnegative());

export type BlogReadCounts = z.infer<typeof BlogReadCountsSchema>;

export const BlogMetadataSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
});

export type BlogMetadata = z.infer<typeof BlogMetadataSchema>;

export type SlugMap = Record<string, string>;
