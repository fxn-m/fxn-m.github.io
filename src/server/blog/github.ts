type GithubBuildTriggerConfig = {
  fetcher?: typeof fetch;
  token: string;
};

const workflowDispatchUrl =
  "https://api.github.com/repos/fxn-m/fxn-m.github.io/actions/workflows/build-blog.yml/dispatches";

export const createGithubBuildTrigger = ({
  fetcher = globalThis.fetch,
  token,
}: GithubBuildTriggerConfig) => ({
  async trigger(): Promise<void> {
    const response = await fetcher(workflowDispatchUrl, {
      body: JSON.stringify({ ref: "main" }),
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`GitHub rejected the blog workflow dispatch with ${response.status}.`);
    }
  },
});
