import type { BlogPost } from "../../shared";

import { requireStringBinding, type WorkerBindings } from "../bindings";
import { createGithubBuildTrigger } from "./github";
import { createNotionBlogRepository } from "./notion";

export type BlogModule = {
  getPostMarkdown(id: string): Promise<string>;
  listPublishedPosts(): Promise<BlogPost[]>;
  listPreviewPosts(): Promise<BlogPost[]>;
  triggerBuild(): Promise<void>;
};

export type BlogModuleFactory = (bindings: WorkerBindings) => BlogModule;

export const createProductionBlogModule: BlogModuleFactory = (bindings) => ({
  getPostMarkdown(id) {
    return createNotionBlogRepository({
      dataSourceId: requireStringBinding(bindings, "NOTION_BLOG_DATA_SOURCE_ID"),
      token: requireStringBinding(bindings, "NOTION_BLOG_SECRET"),
    }).getPostMarkdown(id);
  },

  listPublishedPosts() {
    return createNotionBlogRepository({
      dataSourceId: requireStringBinding(bindings, "NOTION_BLOG_DATA_SOURCE_ID"),
      token: requireStringBinding(bindings, "NOTION_BLOG_SECRET"),
    }).listPublishedPosts();
  },

  listPreviewPosts() {
    return createNotionBlogRepository({
      dataSourceId: requireStringBinding(bindings, "NOTION_BLOG_DATA_SOURCE_ID"),
      token: requireStringBinding(bindings, "NOTION_BLOG_SECRET"),
    }).listPreviewPosts();
  },

  triggerBuild() {
    return createGithubBuildTrigger({
      token: requireStringBinding(bindings, "GITHUB_REPO_DISPATCH_TOKEN"),
    }).trigger();
  },
});
