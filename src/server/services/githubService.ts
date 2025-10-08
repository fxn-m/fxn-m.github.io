import env from "@/server/config/env"

export const triggerRebuild = async () => {
  console.log("Triggering rebuild...")
  const ghResp = await fetch(
    "https://api.github.com/repos/fxn-m/fxn-m.github.io/actions/workflows/build-blog.yml/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `token ${env.githubRepoDispatchToken}`,
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
