import { createProductionBlogModule, type BlogModuleFactory } from "./blog/module";
import { createProductionLinksModule, type LinksModuleFactory } from "./links/module";
import { createProductionJobDispatcher, type JobDispatcherFactory } from "./jobs/dispatcher";
import {
  createProductionTabOverflowModule,
  type TabOverflowModuleFactory,
} from "./tab-overflow/module";

export type FeatureFactories = {
  blog: BlogModuleFactory;
  jobs: JobDispatcherFactory;
  links: LinksModuleFactory;
  tabOverflow: TabOverflowModuleFactory;
};

export const productionFeatureFactories: FeatureFactories = {
  blog: createProductionBlogModule,
  jobs: createProductionJobDispatcher,
  links: createProductionLinksModule,
  tabOverflow: createProductionTabOverflowModule,
};
