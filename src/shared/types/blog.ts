import { z } from "zod"

export const BlogPostSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  date: z.string().min(1),
  slug: z.string().min(1)
})

export type BlogPost = z.infer<typeof BlogPostSchema>

export const BlogPostsSchema = z.array(BlogPostSchema)

export const BlogMetadataSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1)
})

export type BlogMetadata = z.infer<
  typeof BlogMetadataSchema
>

export type SlugMap = Record<string, string>
