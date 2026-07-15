import pLimit from "p-limit";

import { requireStringBinding, type WorkerBindings } from "../bindings";
import { createLinkEnricher } from "./enrichment";
import { createNotionLinksRepository } from "./notion";

export type LinkEvent = {
  dataSourceId?: string;
  pageId: string;
};

export type LinkPage = {
  created: string;
  hasSummary: boolean;
  id: string;
  title: string;
  url: string;
};

export type EnrichedLink = {
  categories: string[];
  summary: string;
};

export type LinksModule = {
  enrichOne(event: LinkEvent): Promise<void>;
  enrichPending(): Promise<void>;
};

type LinksRepository = {
  findPending(): Promise<string[]>;
  getCategories(dataSourceId?: string): Promise<string[]>;
  getPage(pageId: string): Promise<LinkPage>;
  update(pageId: string, enriched: EnrichedLink): Promise<void>;
};

type LinkEnricher = {
  enrich(page: LinkPage, categories: string[]): Promise<EnrichedLink>;
};

type LinksDependencies = {
  createEnricher(): LinkEnricher;
  repository: LinksRepository;
};

export type LinksModuleFactory = (bindings: WorkerBindings) => LinksModule;

export const createLinksModule = ({
  createEnricher,
  repository,
}: LinksDependencies): LinksModule => {
  const enrichPage = async (page: LinkPage, categories: string[], enricher: LinkEnricher) => {
    if (page.hasSummary) {
      return;
    }
    await repository.update(page.id, await enricher.enrich(page, categories));
  };

  return {
    async enrichOne({ dataSourceId, pageId }) {
      const page = await repository.getPage(pageId);
      if (page.hasSummary) {
        return;
      }
      await enrichPage(page, await repository.getCategories(dataSourceId), createEnricher());
    },

    async enrichPending() {
      const pageIds = await repository.findPending();
      const categories = await repository.getCategories();
      const enricher = createEnricher();
      const limit = pLimit(5);

      await Promise.all(
        pageIds.map((pageId) =>
          limit(async () => enrichPage(await repository.getPage(pageId), categories, enricher)),
        ),
      );
    },
  };
};

export const createProductionLinksModule: LinksModuleFactory = (bindings) =>
  createLinksModule({
    createEnricher: () =>
      createLinkEnricher(requireStringBinding(bindings, "GOOGLE_GENERATIVE_AI_API_KEY")),
    repository: createNotionLinksRepository({
      dataSourceId: requireStringBinding(bindings, "NOTION_LINKS_DATA_SOURCE_ID"),
      token: requireStringBinding(bindings, "NOTION_LINKS_SECRET"),
    }),
  });
