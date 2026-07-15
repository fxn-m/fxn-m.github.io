import { queryOptions } from "@tanstack/react-query";

import type { BlogPost } from "@/shared";

import { fetchResource } from "./fetch-resource";

export const blogIndexQueryOptions = () =>
  queryOptions({
    queryKey: ["blog-index"],
    queryFn: async ({ signal }) => {
      const response = await fetchResource("/html/index.json", { signal });
      const posts = (await response.json()) as BlogPost[];
      return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  });

export const blogPostQueryOptions = (slug: string) =>
  queryOptions({
    enabled: Boolean(slug),
    queryKey: ["blog-post", slug],
    queryFn: async ({ signal }) => {
      const response = await fetchResource(`/html/${slug}.html`, { signal });
      return response.text();
    },
  });
