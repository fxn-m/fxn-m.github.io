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
  referenceId: string
): Promise<string> => {
  if (!referenceId) {
    throw new Error("Missing Notion data source or database id.")
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
    if (
      APIResponseError.isAPIResponseError(error) &&
      (error.code === APIErrorCode.ObjectNotFound ||
        error.code === APIErrorCode.ValidationError)
    ) {
      const databaseResponse = (await notion.databases.retrieve({
        database_id: referenceId
      })) as { data_sources?: { id: string; name?: string }[] }

      const dataSources = databaseResponse.data_sources ?? []
      if (dataSources.length === 0) {
        throw new Error(
          `No data sources found for database ${referenceId}.`
        )
      }

      const resolvedId = dataSources[0].id
      if (dataSources.length > 1) {
        console.warn(
          `Multiple data sources found for database ${referenceId}; using ${resolvedId}.`
        )
      }

      dataSourceIdCache.set(referenceId, resolvedId)
      dataSourceIdCache.set(resolvedId, resolvedId)
      return resolvedId
    }
    throw error
  }
}
