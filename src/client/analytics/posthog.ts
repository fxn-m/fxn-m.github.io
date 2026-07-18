import type { PostHog } from "posthog-js";

let clientPromise: Promise<PostHog | null> | null = null;

export function getPostHog() {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  const apiHost = import.meta.env.VITE_POSTHOG_HOST || "https://eu.i.posthog.com";
  const captureInDev = import.meta.env.VITE_POSTHOG_CAPTURE_DEV === "true";

  if (!apiKey || (import.meta.env.DEV && !captureInDev)) {
    return Promise.resolve(null);
  }

  clientPromise ??= import("posthog-js").then(({ default: posthog }) => {
    if (!posthog.__loaded) {
      posthog.init(apiKey, {
        api_host: apiHost,
        capture_pageview: false,
        person_profiles: "identified_only",
      });
    }

    return posthog;
  });

  return clientPromise;
}
