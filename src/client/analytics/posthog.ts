import posthog from "posthog-js"

export function usePostHog() {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY
  const apiHost =
    import.meta.env.VITE_POSTHOG_HOST ?? "https://eu.i.posthog.com"
  const captureInDev = import.meta.env.VITE_POSTHOG_CAPTURE_DEV === "true"

  if (!apiKey || (import.meta.env.DEV && !captureInDev)) {
    posthog.opt_out_capturing()
    return { posthog }
  }

  posthog.init(apiKey, {
    api_host: apiHost,
    defaults: "2025-05-24",
    person_profiles: "always"
  })

  return { posthog }
}
