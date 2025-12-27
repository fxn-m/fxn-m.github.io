import { APIErrorCode, APIResponseError, Client } from "@notionhq/client"

const NOTION_VERSION = "2025-09-03"

const boundFetch: typeof fetch = (...args) => {
  return globalThis.fetch(...args)
}

const dataSourceIdCache = new Map<string, string>()

export const createNotionClient = (token: string) =>
  new Client({
    auth: token,
    fetch: boundFetch,
    notionVersion: NOTION_VERSION
  })

export const resolveDataSourceId = async (
  notion: Client,
  referenceId: string,
  context?: { label?: string; envKey?: string }
): Promise<string> => {
  if (!referenceId) {
    throw new Error("Missing Notion data source id.")
  }

  const cached = dataSourceIdCache.get(referenceId)
  if (cached) {
    return cached
  }

  try {
    await notion.dataSources.retrieve({ data_source_id: referenceId })
    dataSourceIdCache.set(referenceId, referenceId)
    return referenceId
  } catch (error) {
    const label = context?.label ?? "Notion"
    const envKey = context?.envKey ?? "UNKNOWN_ENV_VAR"
    if (
      APIResponseError.isAPIResponseError(error) &&
      (error.code === APIErrorCode.ObjectNotFound ||
        error.code === APIErrorCode.ValidationError)
    ) {
      console.error(
        `${label} data source lookup failed.`,
        {
          envKey,
          referenceId,
          notionErrorCode: error.code,
          notionMessage: error.message,
          hint:
            "Ensure the env var is a data_source_id (not a database_id) and that the integration is shared with the data source."
        }
      )
      throw new Error(
        `${label} data source lookup failed for ${referenceId}. Check ${envKey} and Notion sharing.`
      )
    }
    throw error
  }
}
