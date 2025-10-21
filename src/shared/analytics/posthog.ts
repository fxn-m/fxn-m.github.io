import posthog from "posthog-js"

export function usePostHog() {
  posthog.init("phc_nPxIyELRVcqz4fjHitOUrIxfUSnaw8GP4MT6LRTigPT", {
    api_host: "https://eu.i.posthog.com",
    defaults: "2025-05-24",
    person_profiles: "always"
  })

  return { posthog }
}
