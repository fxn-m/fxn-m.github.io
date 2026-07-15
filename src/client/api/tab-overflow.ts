import { queryOptions } from "@tanstack/react-query";

import type { TabOverflowItem } from "@/shared";

import { fetchResource } from "./fetch-resource";

export type TabSuggestion = {
  added: string | null;
  author: string | null;
  categories: string[];
  id: string;
  name: string;
  readingTime: number | null;
  summary: string;
  url: string | null;
};

const DEFAULT_BACKEND_URL = "https://fxn-m-api.fxn-m.workers.dev";
const TAB_OVERFLOW_STALE_TIME = 1000 * 60 * 5;
const backendUrl = (import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, "");

function mapTabOverflowItem(item: TabOverflowItem): TabSuggestion {
  const properties = item.properties ?? {};

  return {
    added: properties.Added?.date?.start ?? null,
    author: properties.Author?.select?.name ?? null,
    categories:
      properties.Categories?.multi_select
        ?.map((category) => category.name)
        .filter((category): category is string => Boolean(category)) ?? [],
    id: item.id,
    name: properties.Name?.title?.[0]?.plain_text || "Untitled",
    readingTime: properties["Read Time"]?.number ?? null,
    summary:
      properties.Summary?.rich_text
        ?.map((text) => text.plain_text)
        .filter((text): text is string => Boolean(text))
        .join(" ") ?? "",
    url: properties.URL?.url ?? null,
  };
}

export const tabOverflowQueryOptions = () =>
  queryOptions({
    queryKey: ["tab-overflow"],
    queryFn: async ({ signal }) => {
      const response = await fetchResource(`${backendUrl}/tab-overflow`, { signal });

      return ((await response.json()) as TabOverflowItem[]).map(mapTabOverflowItem);
    },
    staleTime: TAB_OVERFLOW_STALE_TIME,
  });
