import { createProductionBlogModule, type BlogModuleFactory } from "./blog/module";
import {
  createProductionBlogReadCountModule,
  type BlogReadCountModuleFactory,
} from "./blog/read-counts";
import { createProductionLinksModule, type LinksModuleFactory } from "./links/module";
import { createProductionJobDispatcher, type JobDispatcherFactory } from "./jobs/dispatcher";
import {
  createProductionTabOverflowModule,
  type TabOverflowModuleFactory,
} from "./tab-overflow/module";

export type FeatureFactories = {
  blog: BlogModuleFactory;
  blogReadCounts: BlogReadCountModuleFactory;
  jobs: JobDispatcherFactory;
  links: LinksModuleFactory;
  tabOverflow: TabOverflowModuleFactory;
};

export const productionFeatureFactories: FeatureFactories = {
  blog: createProductionBlogModule,
  blogReadCounts: createProductionBlogReadCountModule,
  jobs: createProductionJobDispatcher,
  links: createProductionLinksModule,
  tabOverflow: createProductionTabOverflowModule,
};
