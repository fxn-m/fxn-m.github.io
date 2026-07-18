import { BLOG_READ_EVENT, type BlogPost } from "@/shared";

import { getPostHog } from "./posthog";

const trackedPosts = new Set<string>();

const storageKey = (postId: string) => `blog-read:${postId}`;

const wasTracked = (postId: string) => {
  if (trackedPosts.has(postId)) {
    return true;
  }

  try {
    return window.sessionStorage.getItem(storageKey(postId)) === "true";
  } catch {
    return false;
  }
};

const markTracked = (postId: string) => {
  trackedPosts.add(postId);

  try {
    window.sessionStorage.setItem(storageKey(postId), "true");
  } catch {
    // In-memory deduplication still works when browser storage is unavailable.
  }
};

export async function captureBlogReadOnce(post: BlogPost): Promise<void> {
  if (wasTracked(post.id)) {
    return;
  }

  try {
    const posthog = await getPostHog();
    if (!posthog || wasTracked(post.id)) {
      return;
    }

    markTracked(post.id);
    posthog.capture(BLOG_READ_EVENT, {
      post_id: post.id,
      post_slug: post.slug,
      post_title: post.title,
    });
  } catch {
    // Analytics must never affect the reading experience.
  }
}
