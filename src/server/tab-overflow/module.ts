import type { TabOverflowItem } from "@/shared";
import pLimit from "p-limit";

import { requireStringBinding, type WorkerBindings } from "../bindings";
import { createTabOverflowCache } from "./cache";
import { createTabOverflowEnricher } from "./enrichment";
import { createNotionTabOverflowRepository } from "./notion";

export type TabOverflowEvent = {
  dataSourceId?: string;
  pageId: string;
};

export type TabOverflowPage = {
  created: string;
  hasSummary: boolean;
  id: string;
  title: string;
  url: string;
};

export type EnrichedTabOverflowItem = {
  author: string;
  categories: string[];
  readingTimeEstimate: number;
  summary: string;
};

type TabOverflowRepository = {
  archive(pageId: string): Promise<void>;
  findPending(): Promise<TabOverflowPage[]>;
  getCategories(dataSourceId?: string): Promise<string[]>;
  getPage(pageId: string): Promise<TabOverflowPage>;
  hasDuplicateUrl(pageId: string, url: string, dataSourceId?: string): Promise<boolean>;
  listPublic(): Promise<TabOverflowItem[]>;
  update(page: TabOverflowPage, enriched: EnrichedTabOverflowItem): Promise<void>;
};

type TabOverflowCache = {
  read(): Promise<TabOverflowItem[] | null>;
  write(items: TabOverflowItem[]): Promise<void>;
};

type TabOverflowEnricher = {
  enrich(page: TabOverflowPage, categories: string[]): Promise<EnrichedTabOverflowItem>;
};

type TabOverflowDependencies = {
  cache: TabOverflowCache;
  createEnricher(): TabOverflowEnricher;
  repository: TabOverflowRepository;
};

export type TabOverflowModule = {
  enrichOne(event: TabOverflowEvent): Promise<void>;
  enrichPending(): Promise<void>;
  list(): Promise<TabOverflowItem[]>;
  refresh(): Promise<TabOverflowItem[]>;
};

export type TabOverflowModuleFactory = (bindings: WorkerBindings) => TabOverflowModule;

export const createTabOverflowModule = ({
  cache,
  createEnricher,
  repository,
}: TabOverflowDependencies): TabOverflowModule => {
  const refresh = async () => {
    const items = await repository.listPublic();
    await cache.write(items);
    return items;
  };

  const enrichPage = async (
    page: TabOverflowPage,
    categories: string[],
    enricher: TabOverflowEnricher,
    dataSourceId?: string,
  ) => {
    if (page.hasSummary) {
      return;
    }

    if (await repository.hasDuplicateUrl(page.id, page.url, dataSourceId)) {
      await repository.archive(page.id);
      return;
    }

    await repository.update(page, await enricher.enrich(page, categories));
  };

  return {
    async enrichOne({ dataSourceId, pageId }) {
      const page = await repository.getPage(pageId);
      if (page.hasSummary) {
        await refresh();
        return;
      }

      const categories = await repository.getCategories(dataSourceId);
      await enrichPage(page, categories, createEnricher(), dataSourceId);
      await refresh();
    },
    async enrichPending() {
      const pages = await repository.findPending();
      const categories = await repository.getCategories();
      const enricher = createEnricher();
      const limit = pLimit(5);

      await Promise.all(pages.map((page) => limit(() => enrichPage(page, categories, enricher))));
      await refresh();
    },
    async list() {
      return (await cache.read()) ?? refresh();
    },
    refresh,
  };
};

export const createProductionTabOverflowModule: TabOverflowModuleFactory = (bindings) =>
  createTabOverflowModule({
    cache: createTabOverflowCache(bindings.TAB_OVERFLOW_KV),
    createEnricher: () =>
      createTabOverflowEnricher(requireStringBinding(bindings, "GOOGLE_GENERATIVE_AI_API_KEY")),
    repository: createNotionTabOverflowRepository({
      dataSourceId: requireStringBinding(bindings, "NOTION_TAB_OVERFLOW_DATA_SOURCE_ID"),
      token: requireStringBinding(bindings, "NOTION_TAB_OVERFLOW_SECRET"),
    }),
  });
