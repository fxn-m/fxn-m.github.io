import type { AppConfig } from "../config/app-config"

export const triggerRebuild = async (config: AppConfig) => {
  console.log("Triggering rebuild...")
  const ghResp = await fetch(
    "https://api.github.com/repos/fxn-m/fxn-m.github.io/actions/workflows/build-blog.yml/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `token ${config.githubRepoDispatchToken}`,
        Accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        ref: "main"
      })
    }
  )

  if (!ghResp.ok) {
    console.error("Failed to trigger rebuild:", ghResp.statusText)
    throw new Error("Failed to trigger rebuild")
  }

  return ghResp
}
