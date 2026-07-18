import { queryOptions } from "@tanstack/react-query";

import type { BlogPost, BlogReadCount } from "@/shared";

import { fetchResource } from "./fetch-resource";

const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:8787").replace(/\/$/, "");
const READ_COUNT_STALE_TIME = 1000 * 60 * 5;

export const blogIndexQueryOptions = () =>
  queryOptions({
    queryKey: ["blog-index", import.meta.env.DEV ? "preview" : "published"],
    queryFn: async ({ signal }) => {
      const url = import.meta.env.DEV ? `${backendUrl}/blog/preview` : "/html/index.json";
      const response = await fetchResource(url, { signal });
      const posts = (await response.json()) as BlogPost[];
      return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  });

export const blogPostQueryOptions = (slug: string, id?: string) =>
  queryOptions({
    enabled: Boolean(slug) && (!import.meta.env.DEV || Boolean(id)),
    queryKey: ["blog-post", import.meta.env.DEV ? "preview" : "published", slug, id],
    queryFn: async ({ signal }) => {
      if (import.meta.env.DEV) {
        const response = await fetchResource(
          `${backendUrl}/blog/preview/${encodeURIComponent(id ?? "")}`,
          { signal },
        );
        const markdown = (await response.json()) as string;
        const { renderBlogPreview } = await import("../lib/blog-preview");
        return renderBlogPreview(markdown);
      }

      const response = await fetchResource(`/html/${slug}.html`, { signal });
      return response.text();
    },
  });

export const blogReadCountQueryOptions = (postId?: string) =>
  queryOptions({
    enabled: Boolean(postId),
    queryKey: ["blog-read-count", postId],
    queryFn: async ({ signal }) => {
      const response = await fetchResource(
        `${backendUrl}/blog/${encodeURIComponent(postId ?? "")}/reads`,
        { signal },
      );
      return (await response.json()) as BlogReadCount;
    },
    staleTime: READ_COUNT_STALE_TIME,
  });
