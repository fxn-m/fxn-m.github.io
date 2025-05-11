import env from "@/server/config/env"

export const triggerRebuild = async () => {
  const ghResp = await fetch(
    "https://api.github.com/repos/fxn-m/fxn-m.github.io/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `token ${env.githubRepoDispatchToken}`,
        Accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        event_type: "rebuild_from_notion"
      })
    }
  )

  return ghResp
}
