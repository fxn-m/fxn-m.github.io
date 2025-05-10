import type { PageObjectResponse, PartialPageObjectResponse, PartialDatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints"

export type NotionResponse = PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse

export const isPageObjectResponse = (item: NotionResponse): item is PageObjectResponse => {
  return "properties" in item
}
