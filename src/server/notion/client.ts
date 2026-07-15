import { APIErrorCode, APIResponseError, Client } from "@notionhq/client";

const notionVersion = "2025-09-03";
const dataSourceIdCache = new Map<string, string>();

export const createNotionClient = (token: string) =>
  new Client({
    auth: token,
    fetch: (...args) => globalThis.fetch(...args),
    notionVersion,
  });

export const resolveDataSourceId = async (
  notion: Client,
  referenceId: string,
  context: { envKey: string; label: string },
): Promise<string> => {
  const cached = dataSourceIdCache.get(referenceId);
  if (cached) {
    return cached;
  }

  try {
    await notion.dataSources.retrieve({ data_source_id: referenceId });
    dataSourceIdCache.set(referenceId, referenceId);
    return referenceId;
  } catch (error) {
    if (
      APIResponseError.isAPIResponseError(error) &&
      (error.code === APIErrorCode.ObjectNotFound || error.code === APIErrorCode.ValidationError)
    ) {
      console.error(`${context.label} data source lookup failed`, {
        envKey: context.envKey,
        notionErrorCode: error.code,
        referenceId,
      });
      throw new Error(
        `${context.label} data source lookup failed. Check ${context.envKey} and Notion sharing.`,
      );
    }
    throw error;
  }
};
